namespace SuperBearAdventure
{
    /// <summary>Persisted player progress (high score, world unlocks).</summary>
    public sealed class SaveData
    {
        public int   HighScore  { get; set; }
        public bool[] WorldUnlocked { get; set; } = { true, false, false };
        public bool[][] Completed   { get; set; } =
        {
            new bool[3], new bool[3], new bool[3]
        };
    }
}
