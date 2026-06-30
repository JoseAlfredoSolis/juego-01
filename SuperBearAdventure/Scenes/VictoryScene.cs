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
        private readonly Random _confettiRng = new(12345);

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

            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Enter) ||
                SceneHelpers.IsPressed(kb, _prevKeys, Keys.Space))
                OnContinue?.Invoke();

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;

            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH / 2, new Color(20, 30, 90));
            DrawHelper.DrawRect(sb, 0, _screenH / 2, _screenW, _screenH / 2, new Color(60, 30, 90));

            for (int i = 0; i < 60; i++)
            {
                int cx = _confettiRng.Next(_screenW);
                int baseY = _confettiRng.Next(_screenH);
                int cy = (baseY + (int)(_timer * 60)) % _screenH;
                Color[] palette = { Color.Gold, Color.Cyan, Color.LimeGreen, Color.HotPink, Color.White };
                DrawHelper.DrawRect(sb, cx, cy, 6, 6, palette[i % palette.Length]);
            }

            float pulse = 1.6f + MathF.Sin(_timer * 3f) * 0.1f;
            SceneHelpers.CenterText(sb, font, "YOU WIN!", _screenW / 2 + 4, 134, Color.Black, pulse);
            SceneHelpers.CenterText(sb, font, "YOU WIN!", _screenW / 2,     130, Color.Gold,  pulse);
            SceneHelpers.CenterText(sb, font, "You cleared all 3 worlds!", _screenW / 2, 250, Color.White, 1f);

            int sy = 330;
            SceneHelpers.CenterText(sb, font, $"Final Score: {gm.Score}",    _screenW / 2, sy,      Color.Gold,   1.1f);
            SceneHelpers.CenterText(sb, font, $"Coins:       {gm.Coins}",    _screenW / 2, sy + 45, Color.Yellow, 1f);
            SceneHelpers.CenterText(sb, font, $"High Score:  {gm.HighScore}", _screenW / 2, sy + 90, Color.Cyan,  1f);
            SceneHelpers.CenterText(sb, font, "Press Enter to continue",
                _screenW / 2, _screenH - 60, new Color(200, 200, 200), 0.8f);
        }
    }
}
