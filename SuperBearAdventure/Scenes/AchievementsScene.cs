using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    public sealed class AchievementsScene : IScene
    {
        public event Action? OnBack;

        private KeyboardState _prevKeys;
        private readonly int _screenW;
        private readonly int _screenH;

        public AchievementsScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
            _prevKeys = Keyboard.GetState();
        }

        public void Update(GameTime gameTime)
        {
            var kb = Keyboard.GetState();
            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Enter) ||
                SceneHelpers.IsPressed(kb, _prevKeys, Keys.Escape))
                OnBack?.Invoke();
            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;
            int got = 0;
            foreach (var a in Achievements.All)
                if (gm.HasAchievement(a.Id)) got++;

            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(10, 16, 24));
            SceneHelpers.CenterText(sb, font, "LOGROS", _screenW / 2, 60, Color.Gold, 1.3f);
            SceneHelpers.CenterText(sb, font, $"{got} / {Achievements.All.Length} desbloqueados",
                _screenW / 2, 100, Color.LimeGreen, 0.9f);

            int y = 150;
            foreach (var (id, name, desc) in Achievements.All)
            {
                bool on = gm.HasAchievement(id);
                Color col = on ? Color.LimeGreen : Color.Gray;
                SceneHelpers.CenterText(sb, font, (on ? "* " : "  ") + name, _screenW / 2, y, col, 0.95f);
                SceneHelpers.CenterText(sb, font, desc, _screenW / 2, y + 26, on ? Color.LightGray : Color.DarkGray, 0.72f);
                y += 58;
            }

            SceneHelpers.CenterText(sb, font, "Enter / Esc para volver", _screenW / 2, _screenH - 40, Color.Gray, 0.75f);
        }
    }
}
