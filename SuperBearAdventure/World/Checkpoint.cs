using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Xna.Framework;

namespace SuperBearAdventure.World
{
    public sealed class Checkpoint
    {
        public Vector2 Position { get; }
        public bool    Reached  { get; set; }

        public Rectangle Bounds => new((int)Position.X - 18, (int)Position.Y, 36, 64);

        public Checkpoint(Vector2 position) => Position = position;

        public void Draw(Microsoft.Xna.Framework.Graphics.SpriteBatch sb, float time)
        {
            int x = (int)Position.X;
            int y = (int)Position.Y;
            DrawHelper.DrawRect(sb, x - 2, y, 5, 64, new Color(90, 70, 50));
            DrawHelper.DrawRect(sb, x, y, 2, 64, new Color(106, 86, 64));
            float wave = Reached ? MathF.Sin(time * 8f) * 5f : MathF.Sin(time * 3f + x) * 1.5f;
            Color flag = Reached ? Color.LimeGreen : new Color(60, 180, 80);
            DrawHelper.DrawRect(sb, x + 2, (int)(y + 8 + wave), 28, 18, flag);
            DrawHelper.DrawRect(sb, x + 2, (int)(y + 24 + wave), 22, 4, Color.DarkGreen);
        }
    }

    public static class CheckpointHelper
    {
        public static List<Checkpoint> Compute(LevelData data)
        {
            var ground = data.Platforms
                .Where(p => p.Y >= 595 && p.W >= 200)
                .ToList();
            var result = new List<Checkpoint>();
            foreach (float frac in new[] { 0.35f, 0.65f })
            {
                float tx = data.LevelWidth * frac;
                if (tx < 500 || tx > data.GoalPos.X - 400) continue;
                PlatformDef? best = null;
                float bestD = float.MaxValue;
                foreach (var p in ground)
                {
                    float cx = p.X + p.W / 2f;
                    bool inside = tx >= p.X + 60 && tx <= p.X + p.W - 60;
                    float d = inside ? 0 : MathF.Abs(cx - tx);
                    if (d < bestD) { bestD = d; best = p; }
                }
                if (best == null) continue;
                float cx2 = MathHelper.Clamp(tx, best.X + 40, best.X + best.W - 40);
                result.Add(new Checkpoint(new Vector2(cx2, best.Y - 64)));
            }
            return result;
        }
    }
}
