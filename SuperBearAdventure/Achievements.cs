namespace SuperBearAdventure
{
    public static class Achievements
    {
        public const string FirstCoin   = "first_coin";
        public const string BossSlayer  = "boss_slayer";
        public const string NoDamage    = "no_damage";
        public const string SpeedRun    = "speed_run";
        public const string Collector   = "collector";
        public const string Shopper     = "shopper";
        public const string AllWorlds   = "all_worlds";
        public const string FirstShop   = "first_shop";

        public static readonly (string Id, string Name, string Desc)[] All =
        {
            (FirstCoin,  "Primera moneda",     "Recoge tu primera moneda"),
            (BossSlayer, "Cazajefes",          "Derrota a un jefe de mundo"),
            (NoDamage,   "Sin rasguños",       "Completa un nivel sin daño"),
            (SpeedRun,   "Veloz",              "Termina un nivel en menos de 20 s"),
            (Collector,  "Ahorrador",          "Acumula 500 monedas en la tienda"),
            (Shopper,    "Comprador",          "Compra algo en la tienda"),
            (AllWorlds,  "Leyenda",            "Completa los 6 mundos"),
            (FirstShop,  "Explorador",         "Visita la tienda"),
        };
    }
}
