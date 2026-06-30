using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    public sealed class WorldMapScene : IScene
    {
        public event Action<int, int>? OnLevelSelected;

        private int           _worldSel  = 0;
        private int           _levelSel  = 0;
        private KeyboardState _prevKeys;
        private float         _timer     = 0f;

        private readonly int _screenW;
        private readonly int _screenH;

        private static readonly string[] WorldNames =
        {
            "FOREST", "CAVE", "SNOW", "LAVA", "SKY", "VALLE"
        };

        private static readonly Color[] WorldColors =
        {
            new Color(34, 120, 34),
            new Color(30, 30, 80),
            new Color(140, 190, 220),
            new Color(180, 60, 20),
            new Color(80, 140, 200),
            new Color(196, 160, 80),
        };

        public WorldMapScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
            _worldSel = GameManager.Instance.CurrentWorld;
            _levelSel = GameManager.Instance.CurrentLevel;
            _prevKeys = Keyboard.GetState();
        }

        public void Update(GameTime gameTime)
        {
            _timer += (float)gameTime.ElapsedGameTime.TotalSeconds;
            var gm = GameManager.Instance;
            var kb = Keyboard.GetState();

            if (IsPressed(kb, _prevKeys, Keys.Left) || IsPressed(kb, _prevKeys, Keys.A))
                _levelSel = Math.Max(0, _levelSel - 1);

            if (IsPressed(kb, _prevKeys, Keys.Right) || IsPressed(kb, _prevKeys, Keys.D))
                _levelSel = Math.Min(GameConstants.LevelsPerWorld - 1, _levelSel + 1);

            if (IsPressed(kb, _prevKeys, Keys.Up) || IsPressed(kb, _prevKeys, Keys.W))
            {
                int next = _worldSel - 3;
                if (next >= 0 && gm.IsWorldUnlocked(next))
                { _worldSel = next; _levelSel = 0; }
                else if (_worldSel >= 3)
                {
                    int col = _worldSel % 3;
                    if (col > 0 && gm.IsWorldUnlocked(_worldSel - 1))
                    { _worldSel--; _levelSel = 0; }
                }
                else if (_worldSel > 0 && gm.IsWorldUnlocked(_worldSel - 1))
                { _worldSel--; _levelSel = 0; }
            }

            if (IsPressed(kb, _prevKeys, Keys.Down) || IsPressed(kb, _prevKeys, Keys.S))
            {
                int next = _worldSel + 3;
                if (next < GameConstants.WorldCount && gm.IsWorldUnlocked(next))
                { _worldSel = next; _levelSel = 0; }
                else if (_worldSel < 3)
                {
                    int below = _worldSel + 3;
                    if (below < GameConstants.WorldCount && gm.IsWorldUnlocked(below))
                    { _worldSel = below; _levelSel = 0; }
                    else if (_worldSel + 1 < GameConstants.WorldCount && gm.IsWorldUnlocked(_worldSel + 1))
                    { _worldSel++; _levelSel = 0; }
                }
                else if (_worldSel + 1 < GameConstants.WorldCount && gm.IsWorldUnlocked(_worldSel + 1))
                { _worldSel++; _levelSel = 0; }
            }

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
            {
                if (gm.IsWorldUnlocked(_worldSel))
                    OnLevelSelected?.Invoke(_worldSel, _levelSel);
            }

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(10, 20, 60));
            SceneHelpers.CenterText(sb, font, "SELECT LEVEL", _screenW / 2, 36, Color.Gold, 1.2f);
            SceneHelpers.CenterText(sb, font, "6 Mundos  ·  3 Niveles c/u", _screenW / 2, 68, Color.LightGray, 0.75f);

            int cardW = 360, cardH = 220, gapX = 24, gapY = 28;
            int cols = 3;
            int gridW = cols * cardW + (cols - 1) * gapX;
            int startX = (_screenW - gridW) / 2;
            int startY = 110;

            for (int w = 0; w < GameConstants.WorldCount; w++)
            {
                int col = w % 3;
                int row = w / 3;
                int cx = startX + col * (cardW + gapX);
                int cy = startY + row * (cardH + gapY);
                bool locked = !gm.IsWorldUnlocked(w);
                bool selected = w == _worldSel;

                Color cardCol = locked ? new Color(40, 40, 40) : WorldColors[w];
                DrawHelper.DrawRect(sb, cx, cy, cardW, cardH, cardCol);
                if (selected)
                    DrawHelper.DrawOutline(sb, new Rectangle(cx - 3, cy - 3, cardW + 6, cardH + 6), Color.Yellow, 4);

                string title = locked ? "LOCKED" : $"W{w + 1}: {WorldNames[w]}";
                SceneHelpers.CenterText(sb, font, title, cx + cardW / 2, cy + 16, locked ? Color.Gray : Color.White, 0.8f);

                if (!locked)
                {
                    int dotY = cy + 90;
                    int dotSpacing = 70;
                    int dotsX = cx + (cardW - 2 * dotSpacing) / 2;
                    for (int l = 0; l < GameConstants.LevelsPerWorld; l++)
                    {
                        int dx = dotsX + l * dotSpacing;
                        bool completed = gm.IsLevelCompleted(w, l);
                        bool levSel = selected && l == _levelSel;
                        float bob = levSel ? MathF.Sin(_timer * 4f) * 4f : 0f;
                        int dotR = levSel ? 24 : 18;
                        Color dotC = completed ? Color.Gold : levSel ? Color.LimeGreen : Color.White;
                        DrawHelper.DrawRect(sb, dx - dotR / 2, (int)(dotY - dotR / 2 + bob), dotR, dotR, dotC);
                        SceneHelpers.CenterText(sb, font, $"{l + 1}", dx, (int)(dotY + 22 + bob), Color.White, 0.65f);
                    }
                }
            }

            SceneHelpers.CenterText(sb, font,
                $"Lives: {gm.Lives}  Wallet: {gm.Wallet}  Score: {gm.Score}",
                _screenW / 2, _screenH - 50, Color.LightYellow, 0.8f);
        }

        private static bool IsPressed(KeyboardState c, KeyboardState p, Keys k)
            => SceneHelpers.IsPressed(c, p, k);
    }
}
