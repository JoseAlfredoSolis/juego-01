using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure
{
    /// <summary>Shared UI/input helpers for menu scenes.</summary>
    public static class SceneHelpers
    {
        public static void CenterText(SpriteBatch sb, SpriteFont font,
            string text, int cx, int y, Color color, float scale)
        {
            sb.DrawString(font, text, new Vector2(cx, y), color, 0f,
                new Vector2(font.MeasureString(text).X / 2f, 0f),
                scale, SpriteEffects.None, 0f);
        }

        public static bool IsPressed(KeyboardState current, KeyboardState previous, Keys key)
            => current.IsKeyDown(key) && !previous.IsKeyDown(key);
    }
}
