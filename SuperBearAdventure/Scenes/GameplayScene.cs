using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SuperBearAdventure.Entities;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Scenes
{
    public sealed class GameplayScene : IScene
    {
        public event Action? OnPause;
        public event Action? OnLevelComplete;
        public event Action? OnGameOver;

        private Level        _level;
        private Player       _player;
        private Camera2D     _camera;

        private readonly int _screenW;
        private readonly int _screenH;
        private readonly int _worldIndex;
        private readonly int _levelIndex;

        private KeyboardState _prevKeys;
        private float _respawnTimer = 0f;
        private float _levelTimer   = 0f;
        private float _drawTime     = 0f;
        private bool  _tookDamage;

        private const float StompThreshold = 6f;
        private const float MagnetRadius   = 140f;

        public GameplayScene(int screenW, int screenH, int world, int level)
        {
            _screenW    = screenW;
            _screenH    = screenH;
            _worldIndex = world;
            _levelIndex = level;
            LoadLevel();
            _prevKeys = Keyboard.GetState();
        }

        private void LoadLevel()
        {
            _level  = new Level(_worldIndex, _levelIndex);
            _player = new Player(_level.PlayerStart);
            _camera = new Camera2D(_screenW, _screenH);
            _camera.Snap(_level.PlayerStart, _level.Width, _level.Height);
            _levelTimer = 0f;
            _tookDamage = false;
        }

        public void Update(GameTime gameTime)
        {
            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;
            _drawTime += dt;
            _levelTimer += dt;
            var kb = Keyboard.GetState();
            var gm = GameManager.Instance;
            float enemyMult = gm.EnemySpeedMultiplier();

            if (IsPressed(kb, _prevKeys, Keys.Escape))
            {
                OnPause?.Invoke();
                _prevKeys = kb;
                return;
            }
            _prevKeys = kb;

            if (_respawnTimer > 0f) _respawnTimer -= dt;

            foreach (var h in _level.Hazards)
                h.Update(dt, enemyMult);

            if (gm.Magnet)
                ApplyMagnet(dt);

            _player.Update(gameTime, _level.Platforms);

            float maxX = _level.Width - _player.Bounds.Width;
            if (_player.Position.X > maxX)
                _player.Position = new Vector2(maxX, _player.Position.Y);

            if (_player.Position.Y > _level.Height + 50 && !_player.IsDead)
            {
                DamagePlayer();
                if (!_player.IsDead) RespawnPlayer();
            }

            if (_player.IsDead && _player.DeathAnimationDone)
            {
                gm.Save();
                OnGameOver?.Invoke();
                return;
            }

            foreach (var enemy in _level.Enemies)
            {
                if (!enemy.IsActive) continue;
                enemy.SpeedMult = enemyMult;
                if (enemy is Boss boss)
                {
                    boss.SetTarget(_player.Position);
                    boss.Update(gameTime, _level.Platforms);
                }
                else
                {
                    enemy.ChasePlayer(_player.Position, gameTime);
                    enemy.Update(gameTime, _level.Platforms);
                }
            }

            if (_respawnTimer <= 0f && !_player.IsDead)
            {
                CheckCheckpoints();
                CheckEnemyCollisions();
                CheckHazards();
                CheckCollectibles();
                CheckPowerUps();
                CheckGoal();
            }

            _camera.Follow(
                _player.Position + new Vector2(_player.Bounds.Width / 2f, _player.Bounds.Height / 2f),
                _level.Width, _level.Height);
        }

        private void ApplyMagnet(float dt)
        {
            var center = _player.Position + new Vector2(_player.Bounds.Width / 2f, _player.Bounds.Height / 2f);
            foreach (var c in _level.Collectibles)
            {
                if (c.IsCollected || c.Type != CollectibleType.Coin) continue;
                var cp = c.Position + new Vector2(12, 12);
                float dx = center.X - cp.X, dy = center.Y - cp.Y;
                float dist = MathF.Sqrt(dx * dx + dy * dy);
                if (dist > MagnetRadius || dist < 4f) continue;
                float pull = 420f * dt;
                c.Nudge(new Vector2(dx / dist * pull, dy / dist * pull));
            }
        }

        private void CheckCheckpoints()
        {
            var pb = _player.Bounds;
            foreach (var cp in _level.Checkpoints)
            {
                if (cp.Reached) continue;
                if (!pb.Intersects(cp.Bounds)) continue;
                cp.Reached = true;
                _level.RespawnPoint = new Vector2(cp.Position.X - _player.Bounds.Width / 2f, cp.Position.Y - 10);
            }
        }

        private void CheckEnemyCollisions()
        {
            var pb = _player.Bounds;
            foreach (var enemy in _level.Enemies)
            {
                if (!enemy.IsActive) continue;
                var eb = enemy.Bounds;
                if (!pb.Intersects(eb)) continue;

                bool stomp = _player.Velocity.Y >= StompThreshold &&
                             pb.Bottom <= eb.Top + eb.Height / 2 + 12;

                if (stomp)
                {
                    bool wasBoss = enemy.Type == EnemyType.Boss;
                    enemy.Defeat();
                    _player.Velocity = new Vector2(_player.Velocity.X, -420f);
                    GameManager.Instance.AddScore(wasBoss ? 1000 : 100);
                    if (wasBoss) GameManager.Instance.UnlockAchievement(Achievements.BossSlayer);
                }
                else
                {
                    DamagePlayer();
                    if (!_player.IsDead) RespawnPlayer();
                }
                break;
            }
        }

        private void CheckHazards()
        {
            if (_player.IsInvincible) return;
            var pb = _player.Bounds;
            foreach (var h in _level.Hazards)
            {
                if (!pb.Intersects(h.Bounds)) continue;
                DamagePlayer();
                if (!_player.IsDead) RespawnPlayer();
                break;
            }
        }

        private void DamagePlayer()
        {
            _tookDamage = true;
            _player.TakeDamage();
            GameManager.Instance.Save();
        }

        private void CheckCollectibles()
        {
            var pb = _player.Bounds;
            var gm = GameManager.Instance;
            foreach (var c in _level.Collectibles)
            {
                if (c.IsCollected) continue;
                if (!pb.Intersects(c.Bounds)) continue;
                c.Collect();
                gm.AddScore(c.ScoreValue);
                if (c.Type == CollectibleType.Coin)
                {
                    gm.Coins++;
                    gm.AddWalletCoins(1);
                    gm.UnlockAchievement(Achievements.FirstCoin);
                }
            }
        }

        private void CheckPowerUps()
        {
            var pb = _player.Bounds;
            foreach (var pu in _level.PowerUps)
            {
                if (pu.IsCollected) continue;
                if (!pb.Intersects(pu.Bounds)) continue;
                pu.Collect();
                _player.ApplyPowerUp(pu.Type);
            }
        }

        private void CheckGoal()
        {
            if (IsBossBlockingGoal()) return;
            if (!_player.Bounds.Intersects(_level.Goal.Bounds)) return;

            var gm = GameManager.Instance;
            gm.AddScore(500);
            gm.MarkLevelCompleted(_worldIndex, _levelIndex);
            if (!_tookDamage) gm.UnlockAchievement(Achievements.NoDamage);
            if (_levelTimer < 20f) gm.UnlockAchievement(Achievements.SpeedRun);
            OnLevelComplete?.Invoke();
        }

        private bool IsBossBlockingGoal()
        {
            foreach (var enemy in _level.Enemies)
                if (enemy.Type == EnemyType.Boss && enemy.IsActive) return true;
            return false;
        }

        private void RespawnPlayer()
        {
            _player.Reset(_level.RespawnPoint);
            _camera.Snap(_level.RespawnPoint, _level.Width, _level.Height);
            _respawnTimer = 1.5f;
            GameManager.Instance.Save();
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            float camLeft  = _camera.Position.X;
            float camRight = camLeft + _screenW;

            _level.DrawBackground(sb, _camera.Position, _screenW, _screenH);

            sb.End();
            sb.Begin(transformMatrix: _camera.GetTransform(), samplerState: SamplerState.PointClamp);

            foreach (var p in _level.Platforms)
            {
                if (p.Bounds.Right < camLeft || p.Bounds.X > camRight) continue;
                p.Draw(sb);
            }

            foreach (var h in _level.Hazards)
                h.Draw(sb);

            foreach (var cp in _level.Checkpoints)
                cp.Draw(sb, _drawTime);

            _level.Goal.Draw(sb, Vector2.Zero);

            foreach (var c in _level.Collectibles)
            {
                if (c.IsCollected) continue;
                if (c.Position.X < camLeft - 30 || c.Position.X > camRight + 30) continue;
                c.Draw(sb);
            }

            foreach (var pu in _level.PowerUps)
            {
                if (pu.IsCollected) continue;
                if (pu.Position.X < camLeft - 50 || pu.Position.X > camRight + 50) continue;
                pu.Draw(sb);
            }

            foreach (var e in _level.Enemies)
            {
                if (!e.IsActive) continue;
                e.Draw(sb, Vector2.Zero);
            }

            _player.Draw(sb, Vector2.Zero);

            sb.End();
            sb.Begin(samplerState: SamplerState.PointClamp);

            DrawHUD(sb, font);

            if (_respawnTimer > 0.8f)
            {
                int alpha = (int)((_respawnTimer - 0.8f) / 0.7f * 200);
                DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(0, 0, 0, alpha));
                SceneHelpers.CenterText(sb, font, "RESPAWNING...", _screenW / 2, _screenH / 2 - 20, Color.White, 1f);
            }
        }

        private void DrawHUD(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;
            DrawHelper.DrawRect(sb, 0, 0, _screenW, 50, new Color(0, 0, 0, 160));

            sb.DrawString(font, "Lives:", new Vector2(20, 12), Color.LightCoral, 0f,
                Vector2.Zero, 0.9f, SpriteEffects.None, 0f);
            for (int i = 0; i < _player.Lives; i++)
                DrawHeart(sb, 110 + i * 26, 16);

            CenterText(sb, font, $"Score: {gm.Score}", _screenW / 2, 12, Color.Gold, 0.9f);
            sb.DrawString(font, $"Coins: {gm.Coins}", new Vector2(_screenW - 200, 12),
                Color.Yellow, 0f, Vector2.Zero, 0.9f, SpriteEffects.None, 0f);

            string diff = gm.Difficulty switch
            {
                DifficultyLevel.Easy => "FACIL",
                DifficultyLevel.Hard => "DIFICIL",
                _ => "NORMAL"
            };
            sb.DrawString(font, diff, new Vector2(_screenW - 100, _screenH - 35),
                Color.LightGray, 0f, Vector2.Zero, 0.7f, SpriteEffects.None, 0f);

            sb.DrawString(font, $"W{_worldIndex + 1}-{_levelIndex + 1}", new Vector2(20, _screenH - 35),
                Color.White, 0f, Vector2.Zero, 0.8f, SpriteEffects.None, 0f);

            if (_player.CurrentPowerUp != PowerUpType.None)
            {
                Color puCol = _player.CurrentPowerUp switch
                {
                    PowerUpType.DoubleJump    => Color.Cyan,
                    PowerUpType.Speed         => Color.LimeGreen,
                    PowerUpType.Invincibility => Color.Gold,
                    _                          => Color.White
                };
                sb.DrawString(font, _player.CurrentPowerUp.ToString().ToUpper(),
                    new Vector2(_screenW - 200, _screenH - 50), puCol, 0f, Vector2.Zero, 0.8f, SpriteEffects.None, 0f);
                int barW = 180;
                float frac = MathHelper.Clamp(_player.PowerUpTimer / 10f, 0f, 1f);
                DrawHelper.DrawRect(sb, _screenW - 200, _screenH - 26, barW, 12, Color.DarkGray);
                DrawHelper.DrawRect(sb, _screenW - 200, _screenH - 26, (int)(barW * frac), 12, puCol);
                DrawHelper.DrawOutline(sb, new Rectangle(_screenW - 200, _screenH - 26, barW, 12), Color.Black, 1);
            }
        }

        private static void DrawHeart(SpriteBatch sb, int x, int y)
        {
            Color c = Color.Crimson;
            DrawHelper.DrawRect(sb, x, y, 6, 6, c);
            DrawHelper.DrawRect(sb, x + 8, y, 6, 6, c);
            DrawHelper.DrawRect(sb, x, y + 4, 14, 6, c);
            DrawHelper.DrawRect(sb, x + 2, y + 9, 10, 4, c);
            DrawHelper.DrawRect(sb, x + 5, y + 12, 4, 3, c);
        }

        private static void CenterText(SpriteBatch sb, SpriteFont font,
            string text, int cx, int y, Color color, float scale)
            => SceneHelpers.CenterText(sb, font, text, cx, y, color, scale);

        private static bool IsPressed(KeyboardState c, KeyboardState p, Keys k)
            => SceneHelpers.IsPressed(c, p, k);
    }
}
