using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    /// <summary>Shown when the player clears the final world.</summary>
    public sealed class VictoryScene : IScene
    {
        public event Action? OnContinue;

        private KeyboardState _prevKeys;
        private float         _timer = 0f;

        private readonly int _screenW;
        private readonly int _screenH;

        public VictoryScene(int screenW, int screenH)
        {
            _screenW  = screenW;
            _screenH  = screenH;
            _prevKeys = Keyboard.GetState();
        }

        public void Update(GameTime gameTime)
        {
            _timer += (float)gameTime.ElapsedGameTime.TotalSeconds;
            var kb = Keyboard.GetState();

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
                OnContinue?.Invoke();

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;

            // Festive gradient backdrop
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH / 2, new Color(20, 30, 90));
            DrawHelper.DrawRect(sb, 0, _screenH / 2, _screenW, _screenH / 2, new Color(60, 30, 90));

            // Confetti-ish twinkles
            var rng = new Random(12345);
            for (int i = 0; i < 60; i++)
            {
                int cx = rng.Next(_screenW);
                int baseY = rng.Next(_screenH);
                int cy = (baseY + (int)(_timer * 60)) % _screenH;
                Color[] palette = { Color.Gold, Color.Cyan, Color.LimeGreen, Color.HotPink, Color.White };
                DrawHelper.DrawRect(sb, cx, cy, 6, 6, palette[i % palette.Length]);
            }

            float pulse = 1.6f + MathF.Sin(_timer * 3f) * 0.1f;
            CenterText(sb, font, "YOU WIN!", _screenW / 2 + 4, 134, Color.Black, pulse);
            CenterText(sb, font, "YOU WIN!", _screenW / 2,     130, Color.Gold,  pulse);

            CenterText(sb, font, "You cleared all 3 worlds!", _screenW / 2, 250, Color.White, 1f);

            int sy = 330;
            CenterText(sb, font, $"Final Score: {gm.Score}",   _screenW / 2, sy,      Color.Gold,   1.1f);
            CenterText(sb, font, $"Coins:       {gm.Coins}",   _screenW / 2, sy + 45, Color.Yellow, 1f);
            CenterText(sb, font, $"High Score:  {gm.HighScore}", _screenW / 2, sy + 90, Color.Cyan,  1f);

            CenterText(sb, font, "Press Enter to continue",
                _screenW / 2, _screenH - 60, new Color(200, 200, 200), 0.8f);
        }

        private static void CenterText(SpriteBatch sb, SpriteFont font,
            string text, int cx, int y, Color color, float scale)
        {
            sb.DrawString(font, text, new Vector2(cx, y), color, 0f,
                new Vector2(font.MeasureString(text).X / 2f, 0f),
                scale, SpriteEffects.None, 0f);
        }

        private static bool IsPressed(KeyboardState c, KeyboardState p, Keys k)
            => c.IsKeyDown(k) && !p.IsKeyDown(k);
    }
}
