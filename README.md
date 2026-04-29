# La Pequeña Isla Frontend

Frontend Vue 3 + TypeScript para consumir la API Laravel ubicada en `../backend`.

## Stack

- Vue 3 con Composition API.
- TypeScript, Vite, Vue Router y Pinia.
- API REST con token Bearer de Laravel Sanctum.
- Flujo de catálogo, carrito autenticado, checkout PayPal, pedidos, direcciones, perfil y panel admin.

## Arranque local

```bash
npm install
cp .env.example .env
npm run dev
```

URL local: `http://localhost:5173`

La API por defecto apunta a:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Build

```bash
npm run build
```

La carpeta `dist/` queda lista para hosting estático. Para producción, configura `VITE_API_BASE_URL` con el dominio real del backend.
