# 🐻 Super Bear Adventure

Un juego de plataformas 2D estilo retro, creado en **C#** con **MonoGame**.

---

## 🎮 Características del juego

| Característica | Descripción |
|---|---|
| 🐻 **Jugador oso** | Movimiento izquierda/derecha y salto con física real |
| 🌍 **6 Mundos** | Bosque, Cueva, Nieve, Lava, Cielo y **Valle** (mundo grande) |
| 🗺️ **18 Niveles** | 3 niveles por mundo; el Valle es ~2× más largo y con pocos enemigos |
| 🚩 **Checkpoints** | Banderas verdes a mitad de nivel: reapareces ahí al morir |
| 🛒 **Tienda** | Gasta monedas en imán de monedas, vidas extra y personajes |
| 🏅 **Logros** | 8 medallas por hazañas (sin daño, veloz, cazajefes, etc.) |
| 👾 **Enemigos** | Tipo Patrulla (va y viene) y Tipo Perseguidor (te sigue) |
| 👹 **Jefes finales** | Enemigo grande de 3 HP con fases de ataque (patrulla → cargar → descansar) |
| ⭐ **Coleccionables** | Monedas (50 pts) y Estrellas (200 pts) dispersas en los niveles |
| 🔮 **Power-ups** | Doble salto (cian), Velocidad (verde), Invencibilidad (dorado) |
| ❤️ **Vidas** | Sistema de 3 vidas; reapareces al morir |
| 🏆 **Puntuación** | Score, high score, contador de monedas |
| 📷 **Cámara** | Sigue al jugador suavemente (smooth follow) |
| ⏸️ **Pausa** | Menú de pausa con reanudar / reiniciar / salir |
| 💀 **Game Over** | Pantalla de fin con estadísticas y opción de reintentar |
| 🗺️ **Mapa de mundos** | Selección visual de nivel con progreso marcado |

---

## 🕹️ Controles

| Tecla | Acción |
|---|---|
| `←` / `A` | Mover izquierda |
| `→` / `D` | Mover derecha |
| `Space` / `↑` / `W` | Saltar (doble salto con power-up) |
| `Esc` | Pausar |
| `F4` | Salir del juego |
| `Enter` | Confirmar en menús |
| `↑↓` | Navegar menús |

### Combate
- **Pisotón**: Salta encima del enemigo para derrotarlo (+100 pts, +1000 pts jefe)
- **Contacto lateral**: Pierdes una vida

---

## 📱 Jugar en Android (app móvil / PWA)

Además de la versión de escritorio en C#, el juego incluye una versión web completa
en `index.html` que funciona en el navegador y se puede **instalar como app** en el
móvil (PWA), con **controles táctiles** en pantalla (cruceta + botón de salto + pausa).

### Controles táctiles
| Botón | Acción |
|---|---|
| Cruceta `◀ ▶` | Mover |
| Cruceta `▲ ▼` | Navegar menús |
| `JUMP` (verde) | Saltar / Confirmar en menús |
| `SP` (amarillo) | Habilidad especial del personaje (también tecla `J` / `Shift`) |
| `II` (arriba dcha.) | Pausa / Atrás |

### Personajes y habilidades
Hay **11 personajes**, algunos se **desbloquean** al completar mundos (todos los niveles de un mundo). Cada uno tiene estadísticas (velocidad/salto) y una **habilidad especial** con `J` / `Shift` (o botón `SP`):

- **BEAR** / **CAT** — disponibles desde el inicio.
- **NINJA** / **ROBOT** / **NARUTO** — al completar 1 mundo.
- **DEKU** / **ALL MIGHT** / **GOKU** / **ERI** — al completar 2 mundos.
- **SUPERHERO** / **SAITAMA** — al completar los 3 mundos.

Tipos de habilidad: *golpe* (derriba enemigos al frente, p. ej. `DETROIT SMASH`, `KAMEHAMEHA`, `SERIOUS PUNCH`), *dash* (impulso veloz que atraviesa enemigos), *impulso* (salto/empuje vertical extra) y *rebobinar* (`REWIND` de **Eri**: escudo de invulnerabilidad temporal y recupera una vida). Durante el especial eres brevemente invulnerable.

Cada habilidad lanza **efectos visuales**: ondas expansivas (shockwave), chispas, estela de movimiento al hacer dash y una breve **sacudida de cámara** en los golpes fuertes.

### Dificultad
En **SETTINGS → Dificultad** (Izq/Der para cambiar) eliges:

| Nivel | Vidas | Enemigos | Puntos |
|---|---|---|---|
| **FACIL** | 5 | x0.80 (más lentos) | x0.8 |
| **NORMAL** | 3 | x1.00 | x1.0 |
| **DIFICIL** | 2 | x1.35 (más rápidos) | x1.6 |

La dificultad ajusta las vidas iniciales, la velocidad de enemigos y jefes, y el multiplicador de puntos al completar niveles. Se guarda automáticamente.

### Obstáculos
Además de los enemigos, cada nivel tiene **peligros del escenario**:

- **Pinchos** (estáticos en el suelo): te quitan una vida al tocarlos.
- **Sierras** (giran y patrullan): se mueven de un lado a otro; más rápidas en dificultades altas.

Hay más obstáculos según avanzas de mundo (bosque → cueva → nieve). El *dash*, el power-up de invencibilidad y el escudo `REWIND` de Eri te protegen brevemente de ellos.

### Tipos de enemigos
- **Patrulla:** camina de un lado a otro (sin caerse de los bordes).
- **Perseguidor:** te sigue cuando te acercas.
- **Volador:** vuela por el aire ondulando arriba y abajo.
- **Saltarín:** salta hacia ti por el suelo.
- **Escupidor:** torreta fija que dispara **proyectiles**; esquívalos o protégete.
- **Cazador volador:** te persigue por el aire cuando te acercas.
- **Blindado:** acorazado; **no se puede pisar** (rebotas con un "CLANC"), solo cae con tu **habilidad especial**. **Embiste** cuando te ve.
- **Mini-jefe:** aparece en varios mundos; patrulla, **embiste**, **dispara proyectiles** e **invoca minions** (máx. 3; voladores/cazadores en mundos avanzados). Tiene **2 de vida** (3 en Difícil) y ataca más rápido en dificultades altas. Se vence pisándolo o con la habilidad especial (+500 pts) y al caer **suelta una recompensa** que **mejora con la dificultad**: corazón de **vida extra** + power-up (en Normal/Difícil además una estrella; en Difícil dos power-ups).
- **Jefe:** al final de cada mundo, con varias fases y barra de vida. Al vencerlo suelta una **gran recompensa** (varias vidas, power-ups y estrellas, mejor cuanto mayor la dificultad).

A casi todos los puedes derrotar **pisándolos** o con tu **habilidad especial**. Los proyectiles del escupidor se absorben sin daño si estás protegido (dash / invencible / escudo).

### Mundos
Hay **6 mundos** de 3 niveles cada uno (18 en total). El nivel 3 de cada mundo termina con un **jefe**:

1. 🌳 **Bosque** · 2. 🕸️ **Cueva** · 3. ❄️ **Nieve** · 4. 🌋 **Lava** · 5. ☁️ **Cielo** · 6. 🏜️ **Valle**

El mundo **Valle** es el más grande (~6800–8200 px por nivel): plataformas largas, **solo 2 enemigos** en los niveles 1 y 2, **sin mini-jefes ni enemigos extra**, pocos obstáculos y **muchas monedas** para explorar con calma. Se desbloquea al completar Cielo.

### Checkpoints
Cada nivel coloca **banderas verdes** (a ~1/3 y ~2/3 del recorrido). Al pasar por una se activa; si pierdes una vida, **reapareces en la última bandera** en vez de volver al inicio.

### Tienda (monedas)
Las monedas que recoges se guardan en un **monedero permanente** (visible en el menú). En **TIENDA** puedes gastarlas en:

| Mejora | Efecto |
|---|---|
| 🧲 **Imán de monedas** | Atrae las monedas cercanas hacia ti |
| ❤️ **Vida extra inicial** | Empiezas cada partida con +1 vida (hasta +3) |
| 🦸 **Personajes** | Desbloquea personajes bloqueados sin tener que completar mundos |

### Logros
En **LOGROS** ves **8 medallas** que se desbloquean jugando: primera moneda, cazajefes, completar un nivel **sin recibir daño**, terminar un nivel en **menos de 20s**, juntar **500 monedas**, comprar en la tienda, desbloquear **todos los personajes** y completar **los 6 mundos**.

### Instalarla en el teléfono (recomendado: GitHub Pages)
1. Sube el repositorio a GitHub y activa **Settings → Pages → Deploy from branch** (rama `main`, carpeta `/root`).
2. Abre la URL que te da GitHub Pages (`https://<usuario>.github.io/<repo>/`) en **Chrome en tu Android**.
3. Menú `⋮` → **Añadir a la pantalla de inicio** (o aparecerá el aviso de instalación).
4. Se instala como app a pantalla completa y funciona **sin conexión** (gracias al service worker).

> La instalación como PWA requiere servir los archivos por **HTTPS** (GitHub Pages ya lo hace).
> Abrir el `index.html` directamente desde el sistema de archivos del móvil permite jugar,
> pero no instalarlo como app.

### Probar en el PC antes de subirlo
Desde la carpeta del proyecto, levanta un servidor local y ábrelo en el navegador:

```bash
# con Python instalado
python -m http.server 8080
# luego abre http://localhost:8080/index.html
```

Para probarlo en el móvil por Wi-Fi, usa la IP local del PC (p. ej. `http://192.168.1.50:8080/index.html`).

Archivos de la versión móvil: `index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`.

---

## 🛠️ Cómo compilar y ejecutar

### Requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [MonoGame templates](https://docs.monogame.net/articles/getting_started/1_setting_up_your_os.html) (para que el Content Pipeline compile la fuente)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/JoseAlfredoSolis/Juego-super-bear-aventure-

# 2. Entra al proyecto
cd Juego-super-bear-aventure-/SuperBearAdventure

# 3. Instala las herramientas de MonoGame (solo la primera vez)
dotnet tool install -g dotnet-mgcb
dotnet tool install -g dotnet-mgcb-editor

# 4. Compila y ejecuta
dotnet run
```

---

## 📂 Estructura del proyecto

```
SuperBearAdventure/
├── Content/
│   └── Fonts/DefaultFont.spritefont   # Fuente del juego
├── Entities/
│   ├── Entity.cs      # Clase base con física AABB
│   ├── Player.cs      # Jugador: movimiento, salto, power-ups
│   ├── Enemy.cs       # Enemigo: patrulla / perseguidor
│   └── Boss.cs        # Jefe final: fases de ataque, barra de vida
├── World/
│   ├── Platform.cs    # Plataforma sólida
│   ├── Collectible.cs # Monedas y estrellas
│   ├── PowerUpItem.cs # Cajas de power-up
│   ├── GoalFlag.cs    # Bandera de fin de nivel
│   ├── LevelData.cs   # Datos de los 9 niveles (3 mundos × 3)
│   └── Level.cs       # Instancia activa del nivel + fondos
├── Scenes/
│   ├── MainMenuScene.cs   # Menú principal
│   ├── WorldMapScene.cs   # Selección de nivel
│   ├── GameplayScene.cs   # Juego principal + HUD
│   ├── PauseScene.cs      # Menú de pausa
│   └── GameOverScene.cs   # Pantalla de fin
├── Camera2D.cs        # Cámara con seguimiento suave
├── DrawHelper.cs      # Helpers de dibujo con rectángulos
├── GameManager.cs     # Estado global (vidas, score, progreso)
├── GameState.cs       # Enums del juego
├── Game1.cs           # Clase principal MonoGame
└── Program.cs         # Punto de entrada
```

---

## 🌍 Mundos

| # | Nombre | Colores | Enemigos | Jefe |
|---|---|---|---|---|
| 1 | 🌳 Bosque | Verde/Marrón | Naranja | Sí |
| 2 | 🦇 Cueva | Gris oscuro/Azul | Violeta | Sí |
| 3 | 🐧 Nieve | Blanco/Celeste | Azul acero | Sí |
| 4 | 🌋 Lava | Rojo/Naranja | Variado | Sí |
| 5 | ☁️ Cielo | Azul/Blanco | Voladores | Sí |
| 6 | 🏜️ Valle | Dorado/Amarillo | Muy pocos | Sí (final) |

> Nota: la versión **HTML5/PWA** (`index.html`) es la más completa con los 6 mundos, checkpoints, tienda y logros. La versión C#/MonoGame conserva los 3 mundos originales.

---

## 💡 Tecnología

- **Lenguaje**: C# 12 / .NET 8
- **Framework**: [MonoGame 3.8](https://monogame.net/) (DesktopGL)
- **Gráficos**: Renderizado procedural con rectángulos (sin sprites externos)
- **Física**: AABB en dos pasadas (X primero, luego Y)
