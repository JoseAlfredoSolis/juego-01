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

        gm.MarkLevelCompleted(0, 2);

        Assert.True(gm.IsWorldUnlocked(1));
        Assert.True(gm.IsLevelCompleted(0, 2));
    }
}

public class LevelDataTests
{
    [Fact]
    public void Get_ValidLevel_ReturnsData()
    {
        var data = LevelData.Get(1, 1);
        Assert.Equal(WorldTheme.Cave, data.Theme);
    }

    [Fact]
    public void Get_InvalidLevel_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => LevelData.Get(9, 0));
    }
}
