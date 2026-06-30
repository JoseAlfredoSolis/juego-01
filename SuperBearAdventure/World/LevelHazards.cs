using System.Collections.Generic;

namespace SuperBearAdventure.World
{
    /// <summary>Static hazard placements per world/level (from the web version).</summary>
    public static class LevelHazards
    {
        public static List<HazardDef> Get(int world, int level)
        {
            var row = world switch
            {
                0 => Forest[level],
                1 => Cave[level],
                2 => Snow[level],
                3 => Lava[level],
                4 => Sky[level],
                5 => Valle[level],
                _ => System.Array.Empty<HazardDef>()
            };
            return new List<HazardDef>(row);
        }

        private static HazardDef S(int x, int y, int w) => new(x, y, HazardType.Spikes, w);
        private static HazardDef W(int x, int y, int range) => new(x, y, HazardType.Saw, range);

        private static readonly HazardDef[][] Forest =
        {
            new[] { S(560,620,84), S(1300,620,90), W(2120,540,180), S(3000,620,90) },
            new[] { S(450,620,84), W(1150,540,170), S(2050,620,96), W(2900,540,200) },
            new[] { S(600,620,96), W(1500,540,180), S(2300,620,96) },
        };

        private static readonly HazardDef[][] Cave =
        {
            new[] { S(500,620,96), W(1300,540,180), S(2050,620,96), W(3050,540,210) },
            new[] { S(450,620,96), W(1200,540,210), S(2150,620,110), W(3000,540,220) },
            new[] { S(650,620,110), W(1500,540,210), S(2350,620,110) },
        };

        private static readonly HazardDef[][] Snow =
        {
            new[] { S(500,620,110), W(1300,540,210), S(2150,620,110), W(3050,540,230) },
            new[] { S(450,620,110), W(1250,540,230), S(2150,620,120), W(3000,540,240) },
            new[] { S(650,620,120), W(1500,540,230), S(2350,620,120) },
        };

        private static readonly HazardDef[][] Lava =
        {
            new[] { S(480,620,120), W(1100,540,230), S(1900,620,120), W(2600,540,240), S(3250,620,120) },
            new[] { S(420,620,120), W(1150,540,240), S(1950,620,130), W(2700,540,250), S(3350,620,120) },
            new[] { S(600,620,130), W(1300,540,240), S(2000,620,130), W(2750,540,250) },
        };

        private static readonly HazardDef[][] Sky =
        {
            new[] { W(640,560,220), W(1340,560,230), W(1980,560,240), W(2640,560,240) },
            new[] { W(600,540,230), W(1240,540,240), W(1880,540,250), W(2520,540,250) },
            new[] { S(450,610,120), W(1300,540,250), S(2150,610,130), W(2900,540,260) },
        };

        private static readonly HazardDef[][] Valle =
        {
            new[] { S(3200,620,96) },
            new[] { W(4500,540,200) },
            new[] { S(4000,620,96) },
        };
    }
}
