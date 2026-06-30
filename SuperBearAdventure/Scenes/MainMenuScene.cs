using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    public sealed class MainMenuScene : IScene
    {
        public event Action? OnPlay;
        public event Action? OnShop;
        public event Action? OnAchievements;
        public event Action? OnSettings;
        public event Action? OnQuit;

        private int           _selected   = 0;
        private bool          _showInstructions;
        private KeyboardState _prevKeys;
        private float         _titleBob   = 0f;
        private float         _timer      = 0f;

        private readonly string[] _options =
        {
            "PLAY", "TIENDA", "LOGROS", "AJUSTES", "INSTRUCTIONS", "QUIT"
        };
        private readonly int _screenW;
        private readonly int _screenH;

        public MainMenuScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
            _prevKeys = Keyboard.GetState();
        }

        public void Update(GameTime gameTime)
        {
            _timer   += (float)gameTime.ElapsedGameTime.TotalSeconds;
            _titleBob = MathF.Sin(_timer * 2f) * 6f;

            var kb = Keyboard.GetState();

            if (_showInstructions)
            {
                if (IsPressed(kb, _prevKeys, Keys.Escape) ||
                    IsPressed(kb, _prevKeys, Keys.Enter) ||
                    IsPressed(kb, _prevKeys, Keys.Space))
                    _showInstructions = false;
                _prevKeys = kb;
                return;
            }

            if (IsPressed(kb, _prevKeys, Keys.Down) || IsPressed(kb, _prevKeys, Keys.S))
                _selected = (_selected + 1) % _options.Length;

            if (IsPressed(kb, _prevKeys, Keys.Up) || IsPressed(kb, _prevKeys, Keys.W))
                _selected = (_selected - 1 + _options.Length) % _options.Length;

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
            {
                switch (_selected)
                {
                    case 0: OnPlay?.Invoke(); break;
                    case 1: OnShop?.Invoke(); break;
                    case 2: OnAchievements?.Invoke(); break;
                    case 3: OnSettings?.Invoke(); break;
                    case 4: _showInstructions = true; break;
                    case 5: OnQuit?.Invoke(); break;
                }
            }

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            if (_showInstructions)
            {
                DrawInstructions(sb, font);
                return;
            }

            var gm = GameManager.Instance;
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH / 2, new Color(10, 40, 80));
            DrawHelper.DrawRect(sb, 0, _screenH / 2, _screenW, _screenH / 2, new Color(30, 100, 50));

            DrawText(sb, font, "SUPER BEAR ADVENTURE",
                _screenW / 2 - 6, 90 + (int)_titleBob + 4, Color.Black, 1.5f);
            DrawText(sb, font, "SUPER BEAR ADVENTURE",
                _screenW / 2, 90 + (int)_titleBob, Color.Gold, 1.5f);
            DrawText(sb, font, "6 Mundos  ·  Checkpoints  ·  Tienda  ·  Logros",
                _screenW / 2, 160, new Color(200, 230, 200), 0.8f);

            int menuY = 230;
            for (int i = 0; i < _options.Length; i++)
            {
                bool sel = i == _selected;
                DrawText(sb, font, sel ? "> " + _options[i] + " <" : _options[i],
                    _screenW / 2, menuY, sel ? Color.Yellow : Color.White, sel ? 1.05f : 0.92f);
                menuY += 48;
            }

            DrawText(sb, font, $"Monedero: {gm.Wallet}  |  Best: {gm.HighScore}",
                _screenW / 2, _screenH - 70, Color.Cyan, 0.8f);
            DrawText(sb, font, "WASD/Arrows  Space  Esc",
                _screenW / 2, _screenH - 40, new Color(180, 180, 180), 0.7f);
        }

        private void DrawInstructions(SpriteBatch sb, SpriteFont font)
        {
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(10, 30, 60));
            int px = (_screenW - 760) / 2, py = 50;
            DrawHelper.DrawRect(sb, px, py, 760, 580, new Color(20, 20, 60, 230));
            DrawHelper.DrawOutline(sb, new Rectangle(px, py, 760, 580), Color.Gold, 3);
            SceneHelpers.CenterText(sb, font, "INSTRUCTIONS", _screenW / 2, py + 30, Color.Gold, 1.2f);
            string[] lines =
            {
                "Move: Arrow keys / WASD    Jump: Space / W",
                "Pause: Esc    Stomp enemies from above",
                "Green flags = checkpoints (respawn there)",
                "Avoid spikes and spinning saws",
                "Defeat the boss before the goal flag",
                "Coins go to your wallet for the TIENDA",
                "AJUSTES: Easy / Normal / Hard difficulty",
                "", "Enter or Esc to return"
            };
            int ly = py + 80;
            foreach (var line in lines)
            {
                SceneHelpers.CenterText(sb, font, line, _screenW / 2, ly, Color.White, 0.82f);
                ly += 36;
            }
        }

        private static void DrawText(SpriteBatch sb, SpriteFont font, string text,
            int cx, int y, Color color, float scale = 1f)
        {
            sb.DrawString(font, text, new Vector2(cx, y), color, 0f,
                new Vector2(font.MeasureString(text).X / 2f, 0f),
                scale, SpriteEffects.None, 0f);
        }

        private static bool IsPressed(KeyboardState curr, KeyboardState prev, Keys key)
            => SceneHelpers.IsPressed(curr, prev, key);
    }
}
