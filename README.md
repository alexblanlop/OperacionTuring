# Operación Turing

Juego educativo interactivo sobre Alan Turing, la máquina Enigma y Bletchley Park.

**Demo en vivo:** https://alexblanlop.github.io/OperacionTuring/

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Build de producción

```bash
npm run build
npm run preview
```

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` construye y despliega automáticamente cada push a `main`.

### Pasos iniciales (solo una vez)

1. Sube este proyecto al repo `alexblanlop/OperacionTuring` (rama `main`).
2. En GitHub, ve a **Settings → Pages**.
3. En **Source** selecciona **GitHub Actions**.
4. Haz push (o ejecuta el workflow manualmente desde la pestaña **Actions**).
5. Espera ~1 minuto. La URL final será https://alexblanlop.github.io/OperacionTuring/

## Estructura

```
.
├── .github/workflows/deploy.yml   # CI/CD a GitHub Pages
├── src/
│   ├── OperacionTuring.jsx        # El juego
│   └── main.jsx                   # Punto de entrada React
├── index.html
├── package.json
└── vite.config.js                 # base: '/OperacionTuring/'
```
