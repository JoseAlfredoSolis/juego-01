# Publicar el juego en GitHub Pages

Si ves **404**, GitHub Pages no esta activado todavia. Sigue estos pasos **en orden**:

## Paso 1 — Permisos de Actions

1. Abre: https://github.com/JoseAlfredoSolis/juego-01/settings/actions
2. En **Workflow permissions**, elige **Read and write permissions**
3. Pulsa **Save**

## Paso 2 — Esperar el despliegue

1. Abre: https://github.com/JoseAlfredoSolis/juego-01/actions
2. El workflow **Deploy GitHub Pages** debe terminar en **verde**
3. Eso crea la rama `gh-pages` con el juego

Si fallo, pulsa **Re-run all jobs**.

## Paso 3 — Activar GitHub Pages

1. Abre: https://github.com/JoseAlfredoSolis/juego-01/settings/pages
2. **Build and deployment** → **Source:** Deploy from a branch
3. **Branch:** `gh-pages` → carpeta **`/ (root)`**
4. Pulsa **Save**

## Paso 4 — Abrir el juego

Espera 2–5 minutos y abre:

**https://josealfredosolis.github.io/juego-01/**

> La URL debe incluir `/juego-01/` al final.

## Instalar en el celular

1. Abre la URL en **Chrome** (Android)
2. Menu **⋮** → **Anadir a la pantalla de inicio**
