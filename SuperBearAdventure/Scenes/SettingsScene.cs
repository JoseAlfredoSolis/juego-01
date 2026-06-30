using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    public sealed class SettingsScene : IScene
    {
        public event Action? OnBack;

        private KeyboardState _prevKeys;
        private readonly int _screenW;
        private readonly int _screenH;

        public SettingsScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
            _prevKeys = Keyboard.GetState();
        }

        public void Update(GameTime gameTime)
        {
            var kb = Keyboard.GetState();
            var gm = GameManager.Instance;

            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Left) ||
                SceneHelpers.IsPressed(kb, _prevKeys, Keys.A))
                gm.Difficulty = (DifficultyLevel)(((int)gm.Difficulty + 2) % 3);

            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Right) ||
                SceneHelpers.IsPressed(kb, _prevKeys, Keys.D))
                gm.Difficulty = (DifficultyLevel)(((int)gm.Difficulty + 1) % 3);

            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Escape) ||
                SceneHelpers.IsPressed(kb, _prevKeys, Keys.Enter))
            {
                gm.Save();
                OnBack?.Invoke();
            }

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(10, 20, 40));
            SceneHelpers.CenterText(sb, font, "AJUSTES", _screenW / 2, 80, Color.Gold, 1.4f);

            string diffName = gm.Difficulty switch
            {
                DifficultyLevel.Easy   => "FACIL (5 vidas, enemigos lentos)",
                DifficultyLevel.Hard   => "DIFICIL (2 vidas, enemigos rapidos)",
                _                      => "NORMAL (3 vidas)"
            };

            SceneHelpers.CenterText(sb, font, "Dificultad:", _screenW / 2, 220, Color.White, 1f);
            SceneHelpers.CenterText(sb, font, "< " + diffName + " >", _screenW / 2, 270, Color.Cyan, 0.9f);
            SceneHelpers.CenterText(sb, font, "Izq/Der para cambiar", _screenW / 2, 320, Color.Gray, 0.75f);
            SceneHelpers.CenterText(sb, font, $"Vidas al empezar: {gm.StartingLives()}", _screenW / 2, 380, Color.LightYellow, 0.85f);
            SceneHelpers.CenterText(sb, font, "Enter / Esc para volver", _screenW / 2, _screenH - 60, Color.Gray, 0.8f);
        }
    }
}
