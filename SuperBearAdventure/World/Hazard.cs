using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure.World
{
    public abstract class Hazard
    {
        public Rectangle Bounds { get; protected set; }
        public abstract void Update(float dt, float speedMult);
        public abstract void Draw(SpriteBatch sb);
    }

    public sealed class SpikeHazard : Hazard
    {
        public SpikeHazard(int x, int y, int width)
        {
            Bounds = new Rectangle(x, y, width, 24);
        }

        public override void Update(float dt, float speedMult) { }

        public override void Draw(SpriteBatch sb)
        {
            int n = Math.Max(1, Bounds.Width / 14);
            for (int i = 0; i < n; i++)
            {
                int sx = Bounds.X + i * (Bounds.Width / n);
                int w = Bounds.Width / n;
                DrawHelper.DrawRect(sb, sx + w / 4, Bounds.Y + 8, w / 2, Bounds.Height - 8, new Color(170, 179, 189));
                DrawHelper.DrawRect(sb, sx, Bounds.Y + Bounds.Height - 6, w, 6, new Color(91, 100, 112));
            }
        }
    }

    public sealed class SawHazard : Hazard
    {
        private readonly float _startX;
        private readonly float _range;
        private float _x;
        private int   _dir = 1;
        private float _rot;

        public SawHazard(int x, int y, int range)
        {
            _startX = x;
            _range  = range;
            _x      = x;
            Bounds  = new Rectangle(x, y, 40, 40);
        }

        public override void Update(float dt, float speedMult)
        {
            float spd = 150f * speedMult;
            if (_x <= _startX - _range / 2f) _dir = 1;
            if (_x >= _startX + _range / 2f) _dir = -1;
            _x  += _dir * spd * dt;
            _rot += dt * 14f;
            Bounds = new Rectangle((int)_x, Bounds.Y, 40, 40);
        }

        public override void Draw(SpriteBatch sb)
        {
            int cx = Bounds.X + 20;
            int cy = Bounds.Y + 20;
            int r  = 18;
            for (int i = 0; i < 8; i++)
            {
                float a = _rot + i * MathF.PI / 4f;
                int tx = cx + (int)(MathF.Cos(a) * r);
                int ty = cy + (int)(MathF.Sin(a) * r);
                DrawHelper.DrawRect(sb, tx - 3, ty - 5, 6, 9, new Color(200, 204, 210));
            }
            DrawHelper.DrawRect(sb, cx - r, cy - r, r * 2, r * 2, new Color(154, 163, 173));
            DrawHelper.DrawRect(sb, cx - 5, cy - 5, 10, 10, new Color(91, 100, 112));
        }
    }
}
