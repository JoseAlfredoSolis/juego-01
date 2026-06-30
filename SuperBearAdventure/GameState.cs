namespace SuperBearAdventure
{
    public enum GameState
    {
        MainMenu,
        WorldMap,
        Playing,
        Paused,
        GameOver,
        Victory,
        Settings,
        Shop,
        Achievements
    }

    public enum PowerUpType
    {
        None,
        DoubleJump,
        Speed,
        Invincibility
    }

    public enum EnemyType
    {
        Patrol,
        Chaser,
        Flyer,
        Jumper,
        Boss
    }

    public enum CollectibleType
    {
        Coin,
        Star
    }

    public enum WorldTheme
    {
        Forest,
        Cave,
        Snow,
        Lava,
        Sky,
        Valle
    }

    public enum DifficultyLevel
    {
        Easy   = 0,
        Normal = 1,
        Hard   = 2
    }

    public enum HazardType
    {
        Spikes,
        Saw
    }
}
