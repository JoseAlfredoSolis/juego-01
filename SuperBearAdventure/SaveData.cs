using System.Collections.Generic;

namespace SuperBearAdventure
{
    public sealed class SaveData
    {
        public int    HighScore       { get; set; }
        public int    Wallet          { get; set; }
        public int    BonusLives      { get; set; }
        public bool   Magnet          { get; set; }
        public int    Difficulty      { get; set; } = 1;
        public bool[] WorldUnlocked   { get; set; } = { true, false, false, false, false, false };
        public bool[][] Completed     { get; set; } =
        {
            new bool[3], new bool[3], new bool[3],
            new bool[3], new bool[3], new bool[3]
        };
        public Dictionary<string, bool> Achievements { get; set; } = new();
    }
}
