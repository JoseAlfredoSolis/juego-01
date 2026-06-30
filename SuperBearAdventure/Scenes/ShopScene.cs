using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    public sealed class ShopScene : IScene
    {
        public event Action? OnBack;

        private int _selected;
        private KeyboardState _prevKeys;
        private readonly int _screenW;
        private readonly int _screenH;

        private sealed record ShopItem(string Label, string Desc, int Cost, Action Buy, bool Available);

        public ShopScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
            _prevKeys = Keyboard.GetState();
            GameManager.Instance.UnlockAchievement(Achievements.FirstShop);
        }

        public void Update(GameTime gameTime)
        {
            var items = BuildItems();
            int n = Math.Max(1, items.Count);
            if (_selected >= n) _selected = n - 1;
            if (_selected < 0) _selected = 0;

            var kb = Keyboard.GetState();
            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Up) || SceneHelpers.IsPressed(kb, _prevKeys, Keys.W))
                _selected = (_selected - 1 + n) % n;
            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Down) || SceneHelpers.IsPressed(kb, _prevKeys, Keys.S))
                _selected = (_selected + 1) % n;

            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Escape))
                OnBack?.Invoke();

            if (SceneHelpers.IsPressed(kb, _prevKeys, Keys.Enter) || SceneHelpers.IsPressed(kb, _prevKeys, Keys.Space))
            {
                if (items.Count > 0 && items[_selected].Available)
                    TryBuy(items[_selected]);
            }

            _prevKeys = kb;
        }

        private List<ShopItem> BuildItems()
        {
            var gm = GameManager.Instance;
            var list = new List<ShopItem>();
            if (!gm.Magnet)
                list.Add(new ShopItem("Iman de monedas", "Atrae monedas cercanas", 300, () => gm.Magnet = true, true));
            if (gm.BonusLives < 3)
            {
                int cost = 200 * (gm.BonusLives + 1);
                list.Add(new ShopItem("Vida extra inicial", $"+1 vida al empezar ({gm.BonusLives}/3)", cost,
                    () => gm.BonusLives = Math.Min(3, gm.BonusLives + 1), true));
            }
            return list;
        }

        private void TryBuy(ShopItem item)
        {
            var gm = GameManager.Instance;
            if (gm.Wallet < item.Cost) return;
            gm.Wallet -= item.Cost;
            item.Buy();
            gm.UnlockAchievement(Achievements.Shopper);
            gm.Save();
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;
            var items = BuildItems();

            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(16, 8, 24));
            SceneHelpers.CenterText(sb, font, "TIENDA", _screenW / 2, 70, Color.Gold, 1.3f);
            SceneHelpers.CenterText(sb, font, $"{gm.Wallet} monedas", _screenW / 2, 120, Color.Yellow, 1f);

            if (items.Count == 0)
            {
                SceneHelpers.CenterText(sb, font, "Todo comprado!", _screenW / 2, _screenH / 2, Color.LimeGreen, 1.1f);
            }
            else
            {
                int y = 200;
                for (int i = 0; i < items.Count; i++)
                {
                    var it = items[i];
                    bool sel = i == _selected;
                    bool afford = gm.Wallet >= it.Cost;
                    Color col = sel ? Color.Yellow : Color.White;
                    SceneHelpers.CenterText(sb, font,
                        (sel ? "> " : "  ") + it.Label + $"  ({it.Cost})",
                        _screenW / 2, y, col, sel ? 1f : 0.9f);
                    SceneHelpers.CenterText(sb, font, it.Desc, _screenW / 2, y + 28,
                        afford ? Color.Gray : Color.Red, 0.75f);
                    y += 70;
                }
            }

            SceneHelpers.CenterText(sb, font, "Enter=Comprar  Esc=Volver", _screenW / 2, _screenH - 50, Color.Gray, 0.75f);
        }
    }
}
