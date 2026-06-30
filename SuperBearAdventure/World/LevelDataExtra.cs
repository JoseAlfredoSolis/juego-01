using Microsoft.Xna.Framework;
using System.Collections.Generic;

namespace SuperBearAdventure.World
{
    public sealed partial class LevelData
    {
        // ====================================================================
        //  WORLD 4 – LAVA
        // ====================================================================

        private static LevelData Lava1() => new()
        {
            LevelWidth = 3800, LevelHeight = 720, Theme = WorldTheme.Lava,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(3660, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,640,800,80), P(900,640,600,80), P(1600,640,500,80), P(2200,640,600,80), P(2900,640,900,80),
                P(200,510,130,18), P(420,460,110,18), P(650,510,130,18), P(900,460,100,18),
                P(1100,510,130,18), P(1350,460,110,18), P(1600,500,130,18), P(1850,460,110,18),
                P(2100,500,130,18), P(2350,460,100,18), P(2600,510,130,18), P(2850,460,120,18),
                P(3100,500,140,18), P(3350,450,130,18),
            },
            Enemies = Merge(ExtraEnemies(3, 0), new List<EnemyDef>
            {
                new(new Vector2(300, 615), EnemyType.Patrol, 160),
                new(new Vector2(700, 615), EnemyType.Chaser, 200),
                new(new Vector2(1100,615), EnemyType.Patrol, 180),
                new(new Vector2(1700,615), EnemyType.Chaser, 220),
                new(new Vector2(2200,615), EnemyType.Patrol, 200),
                new(new Vector2(2700,615), EnemyType.Chaser, 240),
                new(new Vector2(3200,615), EnemyType.Patrol, 180),
            }),
            Collectibles = Stars(Coins(
                (250,480),(500,430),(750,480),(1000,430),(1250,480),(1500,430),
                (1750,470),(2000,430),(2250,470),(2500,420),(2750,460),(3000,420),(3250,470),(3450,420)
            ), (1200,430),(2700,420)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(650, 460), PowerUpType.DoubleJump),
                new(new Vector2(2100,430), PowerUpType.Speed),
            }
        };

        private static LevelData Lava2() => new()
        {
            LevelWidth = 3800, LevelHeight = 720, Theme = WorldTheme.Lava,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(3560, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,640,700,80), P(800,640,500,80), P(1400,640,400,80), P(1900,640,500,80),
                P(2500,640,600,80), P(3200,640,500,80),
                P(150,510,120,18), P(380,460,110,18), P(600,510,130,18), P(850,460,100,18),
                P(1050,510,130,18), P(1300,450,120,18), P(1550,500,130,18), P(1800,450,110,18),
                P(2050,510,140,18), P(2300,460,100,18), P(2600,510,130,18), P(2850,460,120,18),
                P(3100,500,140,18), P(3350,450,130,18),
            },
            Enemies = Merge(ExtraEnemies(3, 1), new List<EnemyDef>
            {
                new(new Vector2(300,615), EnemyType.Chaser, 200),
                new(new Vector2(700,615), EnemyType.Patrol, 180),
                new(new Vector2(1100,615), EnemyType.Chaser, 220),
                new(new Vector2(1600,615), EnemyType.Patrol, 200),
                new(new Vector2(2100,615), EnemyType.Chaser, 240),
                new(new Vector2(2700,615), EnemyType.Patrol, 200),
                new(new Vector2(3200,615), EnemyType.Chaser, 220),
            }),
            Collectibles = Stars(Coins(
                (200,480),(430,430),(650,480),(850,430),(1050,480),(1300,420),
                (1550,470),(1800,420),(2050,480),(2250,430),(2500,470),(2750,420),(2950,480),(3150,430),(3350,470)
            ), (1250,420),(2700,420)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(700, 480), PowerUpType.Invincibility),
                new(new Vector2(2200,430), PowerUpType.DoubleJump),
            }
        };

        private static LevelData Lava3() => new()
        {
            LevelWidth = 3900, LevelHeight = 720, Theme = WorldTheme.Lava,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(3780, 540),
            Platforms = new List<PlatformDef>
            {
                P(0,640,900,80), P(980,640,620,80), P(1700,640,600,80), P(2400,640,700,80), P(3200,630,700,10),
                P(200,510,130,18), P(450,460,110,18), P(700,510,120,18), P(950,460,110,18),
                P(1200,510,130,18), P(1450,460,110,18), P(1700,500,130,18), P(1950,460,110,18),
                P(2200,500,130,18), P(2450,450,110,18), P(2700,490,130,18), P(2900,450,120,18),
            },
            Enemies = Merge(ExtraEnemies(3, 2), new List<EnemyDef>
            {
                new(new Vector2(350,615), EnemyType.Chaser, 200),
                new(new Vector2(750,615), EnemyType.Chaser, 220),
                new(new Vector2(1250,615), EnemyType.Patrol, 200),
                new(new Vector2(1750,615), EnemyType.Chaser, 240),
                new(new Vector2(2200,615), EnemyType.Chaser, 220),
                new(new Vector2(3520,555), EnemyType.Boss,   340),
            }),
            Collectibles = Stars(Coins(
                (250,480),(500,430),(750,480),(1000,430),(1250,480),(1500,430),
                (1750,470),(2000,430),(2250,470),(2500,420),(2750,460),(2950,420)
            ), (1450,430),(2900,420)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(800, 480), PowerUpType.Invincibility),
                new(new Vector2(2450,420), PowerUpType.Speed),
            }
        };

        // ====================================================================
        //  WORLD 5 – SKY
        // ====================================================================

        private static LevelData Sky1() => new()
        {
            LevelWidth = 3800, LevelHeight = 720, Theme = WorldTheme.Sky,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(3660, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,640,520,80), P(640,600,260,18), P(1000,560,240,18), P(1340,600,240,18),
                P(1660,560,240,18), P(1980,600,240,18), P(2300,560,260,18), P(2640,600,260,18),
                P(2980,560,280,18), P(3320,640,480,80),
                P(220,500,120,18), P(760,470,110,18), P(1120,440,110,18), P(1460,470,110,18),
                P(1800,440,110,18), P(2120,470,110,18), P(2440,440,120,18), P(2780,470,110,18), P(3100,440,130,18),
            },
            Enemies = Merge(ExtraEnemies(4, 0), new List<EnemyDef>
            {
                new(new Vector2(300,615), EnemyType.Patrol, 160),
                new(new Vector2(700,575), EnemyType.Flyer,  240),
                new(new Vector2(1340,575),EnemyType.Patrol, 160),
                new(new Vector2(1980,575),EnemyType.Flyer,  260),
                new(new Vector2(2640,575),EnemyType.Patrol, 180),
                new(new Vector2(3400,615),EnemyType.Chaser, 200),
            }),
            Collectibles = Stars(Coins(
                (250,470),(680,540),(1040,500),(1380,540),(1700,500),(2020,540),
                (2340,500),(2680,540),(3020,500),(3360,470),(1120,410),(1800,410),(2440,410)
            ), (1660,500),(2980,500)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(640, 560), PowerUpType.DoubleJump),
                new(new Vector2(2300,520), PowerUpType.Speed),
            }
        };

        private static LevelData Sky2() => new()
        {
            LevelWidth = 3800, LevelHeight = 720, Theme = WorldTheme.Sky,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(3500, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,640,480,80), P(600,580,220,18), P(920,540,220,18), P(1240,580,220,18),
                P(1560,520,220,18), P(1880,580,220,18), P(2200,540,240,18), P(2520,580,240,18),
                P(2840,540,260,18), P(3160,640,640,80),
                P(200,500,120,18), P(700,460,110,18), P(1040,430,110,18), P(1380,460,110,18),
                P(1700,430,110,18), P(2020,460,110,18), P(2340,430,120,18), P(2680,460,110,18), P(3000,430,130,18),
            },
            Enemies = Merge(ExtraEnemies(4, 1), new List<EnemyDef>
            {
                new(new Vector2(300,615), EnemyType.Chaser, 200),
                new(new Vector2(920,515), EnemyType.Flyer,  260),
                new(new Vector2(1560,495),EnemyType.Flyer,  260),
                new(new Vector2(2200,515),EnemyType.Patrol, 160),
                new(new Vector2(2840,515),EnemyType.Flyer,  280),
                new(new Vector2(3300,615), EnemyType.Chaser, 220),
            }),
            Collectibles = Stars(Coins(
                (230,470),(640,540),(960,500),(1280,540),(1600,480),(1920,540),
                (2240,500),(2560,540),(2880,500),(3220,470),(1040,400),(1700,400),(2340,400)
            ), (1560,480),(2840,500)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(600, 540), PowerUpType.Invincibility),
                new(new Vector2(2200,500), PowerUpType.DoubleJump),
            }
        };

        private static LevelData Sky3() => new()
        {
            LevelWidth = 4000, LevelHeight = 720, Theme = WorldTheme.Sky,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(3880, 540),
            Platforms = new List<PlatformDef>
            {
                P(0,640,900,80), P(980,640,620,80), P(1700,640,600,80), P(2400,640,720,80), P(3220,630,780,10),
                P(200,500,130,18), P(450,450,110,18), P(720,500,120,18), P(980,450,110,18),
                P(1240,500,130,18), P(1500,450,110,18), P(1760,490,130,18), P(2020,450,110,18),
                P(2280,490,130,18), P(2540,440,110,18), P(2800,480,130,18), P(3020,440,120,18),
            },
            Enemies = Merge(ExtraEnemies(4, 2), new List<EnemyDef>
            {
                new(new Vector2(350,615), EnemyType.Chaser, 220),
                new(new Vector2(780,575), EnemyType.Flyer,  260),
                new(new Vector2(1280,615),EnemyType.Chaser, 220),
                new(new Vector2(1780,575),EnemyType.Flyer,  280),
                new(new Vector2(2280,615),EnemyType.Chaser, 240),
                new(new Vector2(3600,555), EnemyType.Boss,   360),
            }),
            Collectibles = Stars(Coins(
                (250,470),(500,420),(760,470),(1020,420),(1280,470),(1540,420),
                (1800,460),(2060,420),(2320,460),(2580,410),(2840,450),(3040,410)
            ), (1500,420),(2900,410)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(820, 470), PowerUpType.Speed),
                new(new Vector2(2540,410), PowerUpType.Invincibility),
            }
        };

        // ====================================================================
        //  WORLD 6 – VALLE (large exploration world)
        // ====================================================================

        private static LevelData Valle1() => new()
        {
            LevelWidth = 6800, LevelHeight = 720, Theme = WorldTheme.Valle,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(6660, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,640,1400,80), P(1500,640,1100,80), P(2700,640,1000,80), P(3800,640,1200,80),
                P(5100,640,900,80), P(6100,640,700,80),
                P(350,520,150,18), P(1100,480,130,18), P(2100,510,140,18), P(3200,470,130,18),
                P(4300,500,140,18), P(5400,460,130,18), P(6200,490,150,18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(1800,615), EnemyType.Patrol, 200),
                new(new Vector2(4800,615), EnemyType.Patrol, 180),
            },
            Collectibles = Stars(Coins(
                (300,490),(650,450),(1100,490),(1550,450),(2100,480),(2600,450),
                (3100,440),(3600,480),(4100,450),(4600,470),(5100,430),(5600,460),(6100,450),(6500,440)
            ), (2100,440),(4300,430),(5600,420)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(1100,450), PowerUpType.DoubleJump),
                new(new Vector2(4300,470), PowerUpType.Speed),
            }
        };

        private static LevelData Valle2() => new()
        {
            LevelWidth = 7500, LevelHeight = 720, Theme = WorldTheme.Valle,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(7360, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,640,1200,80), P(1300,640,1000,80), P(2400,640,1100,80), P(3600,640,900,80),
                P(4600,640,1100,80), P(5800,640,900,80), P(6800,640,700,80),
                P(300,510,140,18), P(1000,470,120,18), P(2000,500,130,18), P(3100,460,120,18),
                P(4200,490,140,18), P(5300,450,130,18), P(6400,480,150,18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(2500,615), EnemyType.Patrol, 200),
                new(new Vector2(5500,615), EnemyType.Chaser, 180),
            },
            Collectibles = Stars(Coins(
                (280,480),(750,430),(1300,480),(1850,430),(2400,470),(2950,430),
                (3500,450),(4050,420),(4600,460),(5150,430),(5700,450),(6250,420),(6900,440)
            ), (3100,420),(5700,410)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(2000,470), PowerUpType.Invincibility),
                new(new Vector2(5300,420), PowerUpType.DoubleJump),
            }
        };

        private static LevelData Valle3() => new()
        {
            LevelWidth = 8200, LevelHeight = 720, Theme = WorldTheme.Valle,
            PlayerStart = new Vector2(80, 570), GoalPos = new Vector2(8060, 540),
            Platforms = new List<PlatformDef>
            {
                P(0,640,1300,80), P(1400,640,1100,80), P(2600,640,1000,80), P(3700,640,1100,80),
                P(4900,640,900,80), P(5900,640,1000,80), P(7000,640,800,80), P(7900,630,300,10),
                P(250,500,130,18), P(700,460,110,18), P(1200,500,120,18), P(1700,460,110,18),
                P(2200,490,130,18), P(2700,450,110,18), P(3200,480,130,18), P(3700,440,120,18),
                P(4200,470,130,18), P(4700,440,110,18), P(5200,470,130,18), P(5700,440,120,18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(2000,615), EnemyType.Patrol, 200),
                new(new Vector2(8020,555), EnemyType.Boss,   380),
            },
            Collectibles = Stars(Coins(
                (300,470),(700,430),(1150,470),(1650,430),(2150,460),(2650,420),
                (3150,450),(3650,410),(4150,440),(4650,410),(5150,440),(5650,410)
            ), (1700,420),(3700,410)),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(1200,470), PowerUpType.Speed),
                new(new Vector2(4700,410), PowerUpType.Invincibility),
            }
        };

        private static List<EnemyDef> ExtraEnemies(int world, int level)
        {
            var list = new List<EnemyDef>();
            void Add(float x, float y, EnemyType t, float r = 160) =>
                list.Add(new(new Vector2(x, y), t, r));

            switch (world)
            {
                case 0:
                    if (level == 0) { Add(900,500,EnemyType.Flyer,260); Add(2400,600,EnemyType.Jumper); }
                    if (level == 1) Add(700,480,EnemyType.Flyer,240);
                    if (level == 2) Add(1300,500,EnemyType.Flyer,280);
                    break;
                case 1:
                    if (level == 0) { Add(850,490,EnemyType.Flyer,260); Add(1620,600,EnemyType.Jumper); }
                    if (level == 1) Add(650,480,EnemyType.Flyer,260);
                    if (level == 2) Add(1250,500,EnemyType.Flyer,280);
                    break;
                case 2:
                    if (level == 0) { Add(850,490,EnemyType.Flyer,280); Add(1620,600,EnemyType.Jumper); }
                    if (level == 1) Add(700,480,EnemyType.Flyer,280);
                    if (level == 2) Add(1250,500,EnemyType.Flyer,300);
                    break;
                case 3:
                    if (level == 0) { Add(900,490,EnemyType.Flyer,300); Add(1700,600,EnemyType.Jumper); }
                    if (level == 1) Add(700,480,EnemyType.Flyer,300);
                    if (level == 2) Add(1300,500,EnemyType.Flyer,320);
                    break;
                case 4:
                    if (level == 0) { Add(760,520,EnemyType.Flyer,320); Add(1340,520,EnemyType.Flyer,320); }
                    if (level == 1) Add(700,500,EnemyType.Flyer,320);
                    if (level == 2) { Add(780,520,EnemyType.Flyer,340); Add(1280,560,EnemyType.Flyer,340); }
                    break;
            }
            return list;
        }

        private static List<EnemyDef> Merge(List<EnemyDef> a, List<EnemyDef> b)
        {
            a.AddRange(b);
            return a;
        }
    }
}
