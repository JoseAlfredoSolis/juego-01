using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SuperBearAdventure.Entities;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Scenes
{
    /// <summary>
    /// Core gameplay scene.
    /// Orchestrates the player, level objects, camera, HUD, and win/lose transitions.
    /// </summary>
    public sealed class GameplayScene : IScene
    {
        // ── Events ─────────────────────────────────────────────────────────
        public event Action? OnPause;
        public event Action? OnLevelComplete;
        public event Action? OnGameOver;

        // ── Scene state ────────────────────────────────────────────────────
        private Level        _level;
        private Player       _player;
        private Camera2D     _camera;

        private readonly int _screenW;
        private readonly int _screenH;
        private readonly int _worldIndex;
        private readonly int _levelIndex;

        private KeyboardState _prevKeys;

        // Stomp detection constants
        private const float StompThreshold = 6f; // min downward velocity to stomp

        // Brief invulnerability after respawn
        private float _respawnTimer = 0f;

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
        }

        // ── Update ─────────────────────────────────────────────────────────

        public void Update(GameTime gameTime)
        {
            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;
            var   kb = Keyboard.GetState();
            var   gm = GameManager.Instance;

            // Pause
            if (IsPressed(kb, _prevKeys, Keys.Escape))
            {
                OnPause?.Invoke();
                _prevKeys = kb;
                return;
            }
            _prevKeys = kb;

            if (_respawnTimer > 0f) _respawnTimer -= dt;

            // Update player
            _player.Update(gameTime, _level.Platforms);

            float maxX = _level.Width - _player.Bounds.Width;
            if (_player.Position.X > maxX)
                _player.Position = new Vector2(maxX, _player.Position.Y);

            // Fell into a pit?
            if (_player.Position.Y > _level.Height + 50 && !_player.IsDead)
            {
                _player.TakeDamage();
                if (!_player.IsDead)
                    RespawnPlayer();
            }

            // Death animation done → game over
            if (_player.IsDead && _player.DeathAnimationDone)
            {
                GameManager.Instance.Save();
                OnGameOver?.Invoke();
                return;
            }

            // Update enemies (patrol, chasing, boss phases)
            foreach (var enemy in _level.Enemies)
            {
                if (!enemy.IsActive) continue;
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

            // ── Collisions ─────────────────────────────────────────────────

            if (_respawnTimer <= 0f && !_player.IsDead)
            {
                CheckEnemyCollisions();
                CheckCollectibles();
                CheckPowerUps();
                CheckGoal();
            }

            // Camera
            _camera.Follow(
                _player.Position + new Vector2(_player.Bounds.Width / 2f, _player.Bounds.Height / 2f),
                _level.Width, _level.Height);
        }

        // ── Collision helpers ──────────────────────────────────────────────

        private void CheckEnemyCollisions()
        {
            var pb = _player.Bounds;
            foreach (var enemy in _level.Enemies)
            {
                if (!enemy.IsActive) continue;
                var eb = enemy.Bounds;
                if (!pb.Intersects(eb)) continue;

                // Stomp: player's bottom edge overlaps enemy's top portion
                bool stomp = _player.Velocity.Y >= StompThreshold &&
                             pb.Bottom <= eb.Top + eb.Height / 2 + 12;

                if (stomp)
                {
                    enemy.Defeat();
                    _player.Velocity = new Vector2(_player.Velocity.X, -420f);
                    GameManager.Instance.AddScore(enemy.Type == EnemyType.Boss ? 1000 : 100);
                }
                else
                {
                    _player.TakeDamage();
                    GameManager.Instance.Save();
                    if (!_player.IsDead) RespawnPlayer();
                }
                break;
            }
        }

        private void CheckCollectibles()
        {
            var pb = _player.Bounds;
            foreach (var c in _level.Collectibles)
            {
                if (c.IsCollected) continue;
                if (!pb.Intersects(c.Bounds)) continue;
                c.Collect();
                int pts = c.ScoreValue;
                GameManager.Instance.AddScore(pts);
                if (c.Type == CollectibleType.Coin)
                    GameManager.Instance.Coins++;
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

            int bonus = 500;
            GameManager.Instance.AddScore(bonus);
            GameManager.Instance.MarkLevelCompleted(_worldIndex, _levelIndex);
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
            _player.Reset(_level.PlayerStart);
            _camera.Snap(_level.PlayerStart, _level.Width, _level.Height);
            _respawnTimer = 1.5f;
            GameManager.Instance.Save();
        }

        // ── Draw ──────────────────────────────────────────────────────────

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var camPos = _camera.Position;
            float camLeft  = camPos.X;
            float camRight = camPos.X + _screenW;

            // Background (screen-space sky + world decorations)
            _level.DrawBackground(sb, camPos, _screenW, _screenH);

            // World objects with camera transform matrix
            sb.End();
            sb.Begin(transformMatrix: _camera.GetTransform(),
                     samplerState: SamplerState.PointClamp);

            foreach (var p in _level.Platforms)
            {
                if (p.Bounds.Right < camLeft || p.Bounds.X > camRight) continue;
                p.Draw(sb);
            }

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
            // Semi-transparent bar at top
            DrawHelper.DrawRect(sb, 0, 0, _screenW, 50, new Color(0, 0, 0, 160));

            // Lives: label + little heart icons
            sb.DrawString(font, "Lives:", new Vector2(20, 12), Color.LightCoral, 0f,
                Vector2.Zero, 0.9f, SpriteEffects.None, 0f);
            for (int i = 0; i < _player.Lives; i++)
                DrawHeart(sb, 110 + i * 26, 16);

            // Score
            CenterText(sb, font, $"Score: {GameManager.Instance.Score}", _screenW / 2, 12, Color.Gold, 0.9f);

            // Coins
            sb.DrawString(font, $"Coins: {GameManager.Instance.Coins}", new Vector2(_screenW - 200, 12),
                Color.Yellow, 0f, Vector2.Zero, 0.9f, SpriteEffects.None, 0f);

            // World/Level
            sb.DrawString(font, $"W{_worldIndex + 1}-{_levelIndex + 1}", new Vector2(20, _screenH - 35),
                Color.White, 0f, Vector2.Zero, 0.8f, SpriteEffects.None, 0f);

            // Power-up timer bar
            if (_player.CurrentPowerUp != PowerUpType.None)
            {
                string puName = _player.CurrentPowerUp.ToString().ToUpper();
                Color  puCol  = _player.CurrentPowerUp switch
                {
                    PowerUpType.DoubleJump    => Color.Cyan,
                    PowerUpType.Speed         => Color.LimeGreen,
                    PowerUpType.Invincibility => Color.Gold,
                    _                          => Color.White
                };
                sb.DrawString(font, puName, new Vector2(_screenW - 200, _screenH - 50),
                    puCol, 0f, Vector2.Zero, 0.8f, SpriteEffects.None, 0f);
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
            DrawHelper.DrawRect(sb, x,     y,     6, 6, c);
            DrawHelper.DrawRect(sb, x + 8, y,     6, 6, c);
            DrawHelper.DrawRect(sb, x,     y + 4, 14, 6, c);
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
