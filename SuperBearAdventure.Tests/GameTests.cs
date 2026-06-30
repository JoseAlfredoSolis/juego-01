using SuperBearAdventure;
using SuperBearAdventure.World;
using Xunit;

namespace SuperBearAdventure.Tests;

public class GameManagerTests
{
    [Fact]
    public void MarkLevelCompleted_UnlocksNextWorld()
    {
        var gm = GameManager.Instance;
        gm.NewGame();
        gm.MarkLevelCompleted(0, 0);
        gm.MarkLevelCompleted(0, 1);
        gm.MarkLevelCompleted(0, 2);
        Assert.True(gm.IsWorldUnlocked(1));
    }

    [Fact]
    public void StartingLives_RespectsDifficultyAndBonus()
    {
        var gm = GameManager.Instance;
        gm.Difficulty = DifficultyLevel.Easy;
        gm.BonusLives = 1;
        Assert.Equal(6, gm.StartingLives());
    }
}

public class LevelDataTests
{
    [Fact]
    public void Get_LavaWorld_ReturnsData()
    {
        var data = LevelData.Get(3, 0);
        Assert.Equal(WorldTheme.Lava, data.Theme);
        Assert.True(data.Hazards.Count > 0);
    }

    [Fact]
    public void Get_ValleWorld_IsLarge()
    {
        var data = LevelData.Get(5, 0);
        Assert.True(data.LevelWidth >= 6800);
    }

    [Fact]
    public void Get_InvalidLevel_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => LevelData.Get(9, 0));
    }
}
