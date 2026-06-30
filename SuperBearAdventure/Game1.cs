using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SuperBearAdventure.Scenes;

namespace SuperBearAdventure
{
    public sealed class Game1 : Game
    {
        private readonly GraphicsDeviceManager _graphics;
        private SpriteBatch?  _sb;
        private SpriteFont?   _font;

        private const int ScreenW = 1280;
        private const int ScreenH = 720;

        private IScene?   _activeScene;
        private IScene?   _pausedGameplay;
        private GameState _state = GameState.MainMenu;

        public Game1()
        {
            _graphics = new GraphicsDeviceManager(this)
            {
                PreferredBackBufferWidth  = ScreenW,
                PreferredBackBufferHeight = ScreenH,
                IsFullScreen             = false
            };
            Content.RootDirectory = "Content";
            IsMouseVisible         = false;
            Window.Title           = "Super Bear Adventure";
        }

        protected override void LoadContent()
        {
            _sb   = new SpriteBatch(GraphicsDevice);
            _font = Content.Load<SpriteFont>("Fonts/DefaultFont");
            DrawHelper.Initialize(GraphicsDevice);
            GoToMainMenu();
        }

        protected override void Update(GameTime gameTime)
        {
            if (Keyboard.GetState().IsKeyDown(Keys.F4))
                Exit();
            _activeScene?.Update(gameTime);
            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.Black);
            _sb!.Begin(samplerState: SamplerState.PointClamp);
            if (_pausedGameplay != null && _activeScene is PauseScene)
                _pausedGameplay.Draw(_sb, _font!);
            _activeScene?.Draw(_sb, _font!);
            _sb.End();
            base.Draw(gameTime);
        }

        private void GoToMainMenu()
        {
            var scene = new MainMenuScene(ScreenW, ScreenH);
            scene.OnPlay         += GoToWorldMap;
            scene.OnShop         += GoToShop;
            scene.OnAchievements += GoToAchievements;
            scene.OnSettings     += GoToSettings;
            scene.OnQuit         += Exit;
            _activeScene    = scene;
            _state          = GameState.MainMenu;
            _pausedGameplay = null;
        }

        private void GoToWorldMap()
        {
            var gm = GameManager.Instance;
            if (gm.Lives <= 0)
                gm.Lives = gm.StartingLives();
            var scene = new WorldMapScene(ScreenW, ScreenH);
            scene.OnLevelSelected += (world, level) =>
            {
                gm.CurrentWorld = world;
                gm.CurrentLevel = level;
                StartGameplay(world, level);
            };
            _activeScene = scene;
            _state       = GameState.WorldMap;
        }

        private void GoToShop()
        {
            var scene = new ShopScene(ScreenW, ScreenH);
            scene.OnBack += GoToMainMenu;
            _activeScene = scene;
            _state       = GameState.Shop;
        }

        private void GoToSettings()
        {
            var scene = new SettingsScene(ScreenW, ScreenH);
            scene.OnBack += GoToMainMenu;
            _activeScene = scene;
            _state       = GameState.Settings;
        }

        private void GoToAchievements()
        {
            var scene = new AchievementsScene(ScreenW, ScreenH);
            scene.OnBack += GoToMainMenu;
            _activeScene = scene;
            _state       = GameState.Achievements;
        }

        private void StartGameplay(int world, int level)
        {
            var scene = new GameplayScene(ScreenW, ScreenH, world, level);
            scene.OnPause         += PauseGame;
            scene.OnLevelComplete += LevelComplete;
            scene.OnGameOver      += TriggerGameOver;
            _activeScene    = scene;
            _pausedGameplay = null;
            _state          = GameState.Playing;
        }

        private void PauseGame()
        {
            _pausedGameplay = _activeScene;
            var pause = new PauseScene(ScreenW, ScreenH);
            pause.OnResume   += ResumeGame;
            pause.OnRestart  += () => StartGameplay(GameManager.Instance.CurrentWorld, GameManager.Instance.CurrentLevel);
            pause.OnMainMenu += GoToMainMenu;
            _activeScene = pause;
            _state       = GameState.Paused;
        }

        private void ResumeGame()
        {
            _activeScene    = _pausedGameplay;
            _pausedGameplay = null;
            _state          = GameState.Playing;
        }

        private void LevelComplete()
        {
            var gm = GameManager.Instance;
            if (gm.CurrentLevel < GameConstants.LevelsPerWorld - 1)
            {
                gm.CurrentLevel++;
                StartGameplay(gm.CurrentWorld, gm.CurrentLevel);
            }
            else if (gm.CurrentWorld < GameConstants.WorldCount - 1)
            {
                gm.CurrentWorld++;
                gm.CurrentLevel = 0;
                GoToWorldMap();
            }
            else
                GoToVictory();
        }

        private void GoToVictory()
        {
            var scene = new VictoryScene(ScreenW, ScreenH);
            scene.OnContinue += GoToMainMenu;
            _activeScene    = scene;
            _state          = GameState.Victory;
            _pausedGameplay = null;
        }

        private void TriggerGameOver()
        {
            var scene = new GameOverScene(ScreenW, ScreenH);
            scene.OnRetry    += () =>
            {
                var gm = GameManager.Instance;
                gm.Lives = gm.StartingLives();
                StartGameplay(gm.CurrentWorld, gm.CurrentLevel);
            };
            scene.OnMainMenu += GoToMainMenu;
            _activeScene = scene;
            _state       = GameState.GameOver;
        }
    }
}
