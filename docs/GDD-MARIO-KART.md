# GDD — Super Bear Kart (estilo Mario Kart 8 Deluxe)

> Documento de diseño inicial · Motor actual: **HTML5 Canvas 2D** (PWA)  
> Versión GDD: 1.0 · Juego: v34

---

## 1. Visión y objetivo

| Campo | Descripción |
|-------|-------------|
| **Género** | Carreras arcade de karts |
| **Referencia** | Mario Kart 8 Deluxe |
| **Objetivo** | Juego de carreras frenético, multijugador, con pistas temáticas y objetos tácticos |
| **Público** | Casual y competitivo (8+ años) |
| **Plataformas** | Web (PWA), móvil y escritorio |

### Loop principal
1. Elegir modo (Copa / Carrera rápida / Online)
2. Personalizar piloto y kart
3. Carrera de 8 corredores (3 vueltas)
4. Usar drift, rebufo y objetos
5. Sumar puntos (modo Copa) o repetir

---

## 2. Estilo visual

| Aspecto | Especificación |
|---------|----------------|
| **Estética** | 3D caricaturesco en producción final; **prototipo 2D** vibrante y colorido |
| **Paleta** | Colores saturados por bioma (costa, montaña, ciudad, espacio) |
| **Pistas** | Decoración temática, cercas, césped, asfalto con flechas de dirección |
| **UI** | HUD arcade: posición, vuelta, objeto, minimapa, clasificación |

### Zonas de transición

| Zona | Efecto gameplay | Implementado |
|------|-----------------|--------------|
| **Tierra / asfalto** | Grip normal | ✅ |
| **Agua** | −45 % velocidad, grip bajo | ✅ |
| **Off-road** | −28 % velocidad | ✅ |
| **Antigravedad** | +12 % velocidad, grip alto, cámara inclinada | ✅ |
| **Rampas de salto** | Arco parabólico, aterrizaje con polvo | ✅ |

---

## 3. Física y controles

### Sensación arcade
- Velocidad máxima ~580 u/s (escalable por stats)
- Aceleración y frenado independientes del grip
- Fricción variable según superficie

### Drift y miniturbos

| Nivel carga | Efecto |
|-------------|--------|
| Naranja (~50 %) | Mini-turbo |
| Naranja+ (~75 %) | Turbo medio |
| Morado (~95 %) | Super drift (+320 boost) |

**Controles:** ↑↓/WASD acelerar/frenar · ←→ girar · Espacio drift · J objeto

### Física ligera adicional
- **Saltos** en rampas (eje Z simulado)
- **Colisiones kart-kart** por peso (empuje + intercambio de velocidad)
- **Rebufo** detrás de rivales → mini boost

### Salida con boost
- Semáforo 3-2-1-GO
- Timing perfecto → boost máximo; demasiado pronto → penalización

---

## 4. Mecánicas de objetos

| Objeto | Tipo GDD | Rol táctico |
|--------|----------|-------------|
| **Caparazón** | Proyectil | Disparo frontal |
| **Caparazón azul** | Proyectil buscador | Castiga al líder |
| **Escudo** | Protector | Bloquea 1 golpe (8 s) |
| **Champiñón** | Potenciador velocidad | Boost instantáneo |
| **Estrella** | Potenciador área personal | Invencibilidad + velocidad |
| **Banana** | Trampa desplegable | Resbala rivales |
| **Rayo** | Potenciador de área | Ralentiza rivales delante |
| **Turbo / Moneda** | Soporte | Boost menor |

### Rubber-banding de ítems
- **1.º lugar:** escudo, banana, moneda
- **Último lugar:** rayo, caparazón azul, estrella, turbo
- **Medio:** mix equilibrado

---

## 5. Personajes y karts

### Arquetipos de piloto

| Arquetipo | Aceleración | Vel. máx. | Peso | Manejo |
|-----------|-------------|-----------|------|--------|
| **Ligero** | ★★★★ | ★★ | ★ | ★★★★ |
| **Medio** | ★★★ | ★★★ | ★★★ | ★★★ |
| **Pesado** | ★★ | ★★★★ | ★★★★ | ★★ |
| **Equilibrado** | ★★★ | ★★★ | ★★ | ★★★ |

### Partes modificables del kart

| Parte | Afecta principalmente |
|-------|----------------------|
| **Chasis** | Aceleración, velocidad máx., manejo |
| **Ruedas** | Agarre, aceleración |
| **Planeador** | Velocidad máx., manejo en curvas |

---

## 6. IA de rivales (goma elástica)

| Dificultad | Comportamiento líder | Comportamiento rezagado |
|------------|---------------------|-------------------------|
| **Fácil** | IA al 82 %, errores frecuentes | Boost +18 % para CPU |
| **Normal** | IA al 90 % | Boost +14 % |
| **Difícil** | IA al 96 %, pocos errores | Boost +10 % |
| **Experto** | IA al 100 % | Boost +6 %, línea perfecta |

Principio: el jugador siempre tiene rivales cerca sin sentir trampas obvias.

---

## 7. Modos de juego

| Modo | Descripción |
|------|-------------|
| **Copa Kart** | 3 pistas, puntos MK (15-12-10-8-6-4-2-1) |
| **Carrera rápida** | 1 pista, 8 CPU |
| **Online** | 2 humanos + 6 CPU vía PeerJS |

### Pistas (5)

1. Autopista Costa — agua, atajos  
2. Paso Montaña — off-road, curvas  
3. Circuito Urbano — técnica urbana  
4. Gran Circuito GT — pista enorme, 2 vueltas  
5. Nebula Antigrav — antigravedad + saltos  

---

## 8. Multijugador

- PeerJS P2P (host/guest)
- Sincronización de karts a 25 Hz
- Reintentos automáticos de conexión
- Heartbeat ping/pong

---

## 9. Plan de desarrollo

### Fase 1 — Prototipo 2D ✅ (actual)
- [x] Física arcade + drift + miniturbos  
- [x] 8 corredores + IA rubber-banding  
- [x] 9 objetos + cajas de ítems  
- [x] Personalización piloto/kart  
- [x] Modo Copa + online básico  
- [x] Zonas agua/off-road/antigrav + saltos  

### Fase 2 — Pulido 2D
- [ ] Más pistas temáticas (8–16)  
- [ ] Espectador / replay corto  
- [ ] Logros de kart  
- [ ] Balanceo de stats por telemetría  

### Fase 3 — Migración 3D (opcional)
- [ ] Modelos Blender caricaturescos  
- [ ] Pistas con splines 3D y zonas antigrav reales  
- [ ] Shaders toon + bloom  

---

## 10. Recomendación de motor

| Motor | Cuándo usarlo | Pros | Contras |
|-------|---------------|------|---------|
| **Unity** ⭐ Recomendado | Producción 3D estilo MK8 | Asset Store, C#, multiplataforma, Netcode | Curva de aprendizaje |
| **Godot 4** | Alternativa open-source | Gratis, GDScript/C#, ligero | Menos assets de carreras |
| **Unreal Engine** | AAA visual | Gráficos top | Excesivo para arcade móvil |
| **HTML5 Canvas** ✅ Actual | PWA, prototipo, itch.io | Cero instalación, ya desplegado | Sin 3D nativo |

**Recomendación:** mantener el **prototipo HTML5** para jugar ya; migrar a **Unity** cuando se necesiten modelos 3D, antigravedad real y 12+ pistas.

### Stack Unity sugerido
- **Input System** + controles mando/táctil  
- **Cinemachine** para cámara de persecución  
- **Splines** (Unity Splines o Dreamteck) para pistas  
- **Netcode for GameObjects** o **Photon** para multijugador  

---

## 11. Métricas de éxito

- Tiempo medio de vuelta estable entre dificultades  
- ≥ 70 % de carreras con margen de victoria < 5 s  
- Sesión móvil > 8 min sin abandonos por controles  

---

*Documento generado para Super Bear Adventure · Kart Mode*
