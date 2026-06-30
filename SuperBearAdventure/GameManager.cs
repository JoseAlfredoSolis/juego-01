using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace SuperBearAdventure
{
    public sealed class GameManager
    {
        public static GameManager Instance { get; } = new GameManager();

        private static string SavePath =>
            Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "SuperBearAdventure",
                "save.json");

        public int Lives      { get; set; } = 3;
        public int Score      { get; set; } = 0;
        public int Coins      { get; set; } = 0;
        public int HighScore  { get; set; } = 0;
        public int Wallet     { get; set; } = 0;
        public int BonusLives { get; set; } = 0;
        public bool Magnet    { get; set; } = false;

        public int CurrentWorld { get; set; } = 0;
        public int CurrentLevel { get; set; } = 0;
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Normal;

        private readonly bool[][] _completed;
        private readonly bool[]   _worldUnlocked;
        private readonly Dictionary<string, bool> _achievements = new();

        private GameManager()
        {
            _completed = Enumerable.Range(0, GameConstants.WorldCount)
                .Select(_ => new bool[GameConstants.LevelsPerWorld]).ToArray();
            _worldUnlocked = new bool[GameConstants.WorldCount];
            _worldUnlocked[0] = true;
            Load();
        }

        public bool IsLevelCompleted(int world, int level) => _completed[world][level];
        public bool IsWorldUnlocked(int world) => _worldUnlocked[world];
        public bool HasAchievement(string id) => _achievements.TryGetValue(id, out var v) && v;

        public void UnlockAchievement(string id)
        {
            if (string.IsNullOrEmpty(id)) return;
            if (_achievements.TryGetValue(id, out var got) && got) return;
            _achievements[id] = true;
            Save();
        }

        public int StartingLives() =>
            (Difficulty switch
            {
                DifficultyLevel.Easy   => 5,
                DifficultyLevel.Hard   => 2,
                _                      => 3
            }) + BonusLives;

        public float EnemySpeedMultiplier() =>
            Difficulty switch
            {
                DifficultyLevel.Easy   => 0.80f,
                DifficultyLevel.Hard   => 1.35f,
                _                      => 1.00f
            };

        public float ScoreMultiplier() =>
            Difficulty switch
            {
                DifficultyLevel.Easy   => 0.8f,
                DifficultyLevel.Hard   => 1.6f,
                _                      => 1.0f
            };

        public void AddScore(int amount)
        {
            int pts = (int)(amount * ScoreMultiplier());
            Score += pts;
            if (Score > HighScore)
            {
                HighScore = Score;
                Save();
            }
        }

        public void AddWalletCoins(int amount)
        {
            if (amount <= 0) return;
            Wallet += amount;
            if (Wallet >= 500) UnlockAchievement(Achievements.Collector);
            Save();
        }

        public void Save()
        {
            try
            {
                var dir = Path.GetDirectoryName(SavePath)!;
                Directory.CreateDirectory(dir);
                var data = new SaveData
                {
                    HighScore     = HighScore,
                    Wallet        = Wallet,
                    BonusLives    = BonusLives,
                    Magnet        = Magnet,
                    Difficulty    = (int)Difficulty,
                    WorldUnlocked = (bool[])_worldUnlocked.Clone(),
                    Completed     = _completed.Select(r => (bool[])r.Clone()).ToArray(),
                    Achievements  = new Dictionary<string, bool>(_achievements)
                };
                File.WriteAllText(SavePath, JsonSerializer.Serialize(data));
            }
            catch { }
        }

        public void Load()
        {
            try
            {
                if (!File.Exists(SavePath)) return;
                var data = JsonSerializer.Deserialize<SaveData>(File.ReadAllText(SavePath));
                if (data == null) return;
                HighScore  = data.HighScore;
                Wallet     = data.Wallet;
                BonusLives = Math.Clamp(data.BonusLives, 0, 3);
                Magnet     = data.Magnet;
                if (data.Difficulty is >= 0 and <= 2)
                    Difficulty = (DifficultyLevel)data.Difficulty;
                if (data.WorldUnlocked?.Length == GameConstants.WorldCount)
                    Array.Copy(data.WorldUnlocked, _worldUnlocked, GameConstants.WorldCount);
                if (data.Completed?.Length == GameConstants.WorldCount)
                    for (int w = 0; w < GameConstants.WorldCount; w++)
                        if (data.Completed[w]?.Length == GameConstants.LevelsPerWorld)
                            Array.Copy(data.Completed[w], _completed[w], GameConstants.LevelsPerWorld);
                _achievements.Clear();
                if (data.Achievements != null)
                    foreach (var kv in data.Achievements)
                        _achievements[kv.Key] = kv.Value;
                MigrateProgress();
            }
            catch { }
        }

        private void MigrateProgress()
        {
            for (int w = 0; w < GameConstants.WorldCount - 1; w++)
            {
                if (_completed[w].All(c => c))
                    _worldUnlocked[w + 1] = true;
            }
        }

        public void NewGame()
        {
            Lives = StartingLives();
            Score = 0;
            Coins = 0;
            CurrentWorld = 0;
            CurrentLevel = 0;
            for (int w = 0; w < GameConstants.WorldCount; w++)
                for (int l = 0; l < GameConstants.LevelsPerWorld; l++)
                    _completed[w][l] = false;
            _worldUnlocked[0] = true;
            for (int w = 1; w < GameConstants.WorldCount; w++)
                _worldUnlocked[w] = false;
            Save();
        }

        public void MarkLevelCompleted(int world, int level)
        {
            _completed[world][level] = true;
            if (_completed[world].All(c => c) && world + 1 < GameConstants.WorldCount)
                _worldUnlocked[world + 1] = true;
            if (_completed.All(w => w.All(c => c)))
                UnlockAchievement(Achievements.AllWorlds);
            Save();
        }

        public bool AllWorldsCompleted() =>
            _completed.All(w => w.All(c => c));
    }
}
