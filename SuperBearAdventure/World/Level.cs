using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System.Collections.Generic;
using SuperBearAdventure.Entities;

namespace SuperBearAdventure.World
{
    public sealed class Level
    {
        public int         Width  { get; }
        public int         Height { get; }
        public WorldTheme  Theme  { get; }
        public Vector2     PlayerStart { get; }
        public Vector2     RespawnPoint { get; set; }
        public GoalFlag    Goal        { get; }

        public List<Platform>    Platforms    { get; } = new();
        public List<Enemy>       Enemies      { get; } = new();
        public List<Collectible> Collectibles { get; } = new();
        public List<PowerUpItem> PowerUps     { get; } = new();
        public List<Hazard>      Hazards      { get; } = new();
        public List<Checkpoint>  Checkpoints  { get; } = new();

        public Color BackgroundColor { get; }
        public Color PlatformColor   { get; }

        private static readonly Dictionary<WorldTheme,(Color bg,Color plat,Color enemy)> _themeColors = new()
        {
            [WorldTheme.Forest] = (new Color(34,  85,  34),  new Color(101, 67,  33),  new Color(190,100, 20)),
            [WorldTheme.Cave]   = (new Color(18,  18,  40),  new Color(70,  70,  80),  new Color(120, 20, 160)),
            [WorldTheme.Snow]   = (new Color(160, 210, 235), new Color(200, 230, 255), new Color(70, 130, 180)),
            [WorldTheme.Lava]   = (new Color(42,  13,  8),   new Color(120, 40,  20),  new Color(220, 80,  30)),
            [WorldTheme.Sky]    = (new Color(43,  79, 122),  new Color(127, 176, 224), new Color(80,  140, 200)),
            [WorldTheme.Valle]  = (new Color(196, 160, 80),  new Color(210, 190, 130), new Color(160, 120, 40)),
        };

        public Level(int worldIndex, int levelIndex)
        {
            var data    = LevelData.Get(worldIndex, levelIndex);
            Width       = data.LevelWidth;
            Height      = data.LevelHeight;
            Theme       = data.Theme;
            PlayerStart = data.PlayerStart;
            RespawnPoint = data.PlayerStart;
            Goal        = new GoalFlag(data.GoalPos);

            var (bg, plat, enemyCol) = _themeColors[Theme];
            BackgroundColor = bg;
            PlatformColor   = plat;

            foreach (var pd in data.Platforms)
                Platforms.Add(new Platform(pd.X, pd.Y, pd.W, pd.H, plat));

            foreach (var ed in data.Enemies)
            {
                Enemy entity = ed.Type == EnemyType.Boss
                    ? new Boss(ed.Position, enemyCol)
                    : new Enemy(ed.Position, ed.Type, ed.PatrolRange, enemyCol);
                Enemies.Add(entity);
            }

            foreach (var cd in data.Collectibles)
                Collectibles.Add(new Collectible(cd.Position, cd.Type));

            foreach (var pu in data.PowerUps)
                PowerUps.Add(new PowerUpItem(pu.Position, pu.Type));

            foreach (var hd in data.Hazards)
            {
                Hazard h = hd.Type == HazardType.Spikes
                    ? new SpikeHazard(hd.X, hd.Y, hd.Param)
                    : new SawHazard(hd.X, hd.Y, hd.Param);
                Hazards.Add(h);
            }

            Checkpoints.AddRange(CheckpointHelper.Compute(data));
        }

        public void DrawBackground(SpriteBatch sb, Vector2 camPos, int screenW, int screenH)
        {
            DrawHelper.DrawRect(sb, 0, 0, screenW, screenH, BackgroundColor);
            switch (Theme)
            {
                case WorldTheme.Forest: DrawForestBg(sb, camPos); break;
                case WorldTheme.Cave:   DrawCaveBg(sb, camPos);   break;
                case WorldTheme.Snow:   DrawSnowBg(sb, camPos);   break;
                case WorldTheme.Lava:   DrawLavaBg(sb, camPos);   break;
                case WorldTheme.Sky:    DrawSkyBg(sb, camPos);    break;
                case WorldTheme.Valle:  DrawValleBg(sb, camPos);  break;
            }
        }

        private void DrawForestBg(SpriteBatch sb, Vector2 cam)
        {
            for (int tx = 0; tx < Width; tx += 200)
            {
                int sx = tx - (int)cam.X;
                if (sx < -60 || sx > 1340) continue;
                DrawHelper.DrawRect(sb, sx + 20, 480, 20, 160, new Color(80, 50, 20));
                DrawHelper.DrawRect(sb, sx, 390, 60, 90, new Color(20, 100, 20));
                DrawHelper.DrawRect(sb, sx + 10, 350, 40, 60, new Color(10, 120, 10));
            }
        }

        private void DrawCaveBg(SpriteBatch sb, Vector2 cam)
        {
            for (int tx = 80; tx < Width; tx += 160)
            {
                int sx = tx - (int)cam.X;
                if (sx < -40 || sx > 1320) continue;
                int h = 30 + (tx % 3) * 20;
                DrawHelper.DrawRect(sb, sx, 0, 20, h, new Color(50, 50, 70));
            }
        }

        private void DrawSnowBg(SpriteBatch sb, Vector2 cam)
        {
            for (int tx = 0; tx < Width; tx += 300)
            {
                int sx = tx - (int)cam.X;
                if (sx < -100 || sx > 1380) continue;
                for (int i = 0; i < 8; i++)
                    DrawHelper.DrawRect(sb, sx + i * 10, 400 + i * 30, 200 - i * 20, 30, new Color(220, 230, 240));
                DrawHelper.DrawRect(sb, sx + 40, 390, 80, 40, Color.White);
            }
        }

        private void DrawLavaBg(SpriteBatch sb, Vector2 cam)
        {
            for (int tx = 0; tx < Width; tx += 180)
            {
                int sx = tx - (int)cam.X;
                if (sx < -40 || sx > 1320) continue;
                DrawHelper.DrawRect(sb, sx, 600, 60, 20, new Color(255, 100, 20));
                DrawHelper.DrawRect(sb, sx + 10, 580, 40, 24, new Color(200, 60, 10));
            }
        }

        private void DrawSkyBg(SpriteBatch sb, Vector2 cam)
        {
            for (int tx = 60; tx < Width; tx += 220)
            {
                int sx = tx - (int)cam.X;
                if (sx < -80 || sx > 1360) continue;
                DrawHelper.DrawRect(sb, sx + 30, 120, 80, 40, Color.White);
                DrawHelper.DrawRect(sb, sx + 50, 130, 50, 24, new Color(230, 240, 255));
            }
        }

        private void DrawValleBg(SpriteBatch sb, Vector2 cam)
        {
            for (int tx = 0; tx < Width; tx += 400)
            {
                int sx = tx - (int)cam.X;
                if (sx < -120 || sx > 1400) continue;
                for (int i = 0; i < 6; i++)
                    DrawHelper.DrawRect(sb, sx + i * 12, 420 + i * 24, 180 - i * 18, 24, new Color(180, 150, 80));
            }
        }
    }
}
