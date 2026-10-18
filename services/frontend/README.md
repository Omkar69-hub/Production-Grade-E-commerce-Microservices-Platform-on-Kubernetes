# E-Commerce Platform Frontend

This is the React + Vite frontend for the Production-Grade E-Commerce Platform.

## Technology Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **State Management:** Redux Toolkit (Global), Redux Persist, TanStack Query (Server State)
- **Routing:** React Router v6
- **Styling:** Material UI (MUI)
- **Forms:** React Hook Form + Zod
- **Networking:** Axios
- **Charts:** Chart.js + react-chartjs-2
- **Testing:** Vitest + React Testing Library

## Folder Structure
```
src/
 ├── api/          # Axios configurations and interceptors
 ├── components/   # Reusable UI components (ProductCard, ErrorBoundary)
 ├── config/       # Environment configs
 ├── hooks/        # React Query custom hooks (useProducts)
 ├── layouts/      # Main layout wrappers
 ├── pages/        # Route components (Home, Cart, Checkout, Admin)
 ├── routes/       # React Router setup, Lazy Loading, Protected Routes
 ├── services/     # API service classes (AuthService, CartService)
 ├── store/        # Redux store, slices, and persistence config
 ├── styles/       # MUI Theme configuration
 └── types/        # TypeScript interfaces (Product, Cart, Order, User)
```

## Running Locally

### Prerequisites
- Node.js (v18+)
- Backend API Gateway running on port `8080` (or update `.env`)

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Environment Variables
Configure the frontend API target using `VITE_API_GATEWAY_URL`:

- **Development Default:** Defaults to `http://localhost:8080` or the Vite dev proxy target.
- **Production Requirement:** During `npm run build`, `VITE_API_GATEWAY_URL` is strictly validated:
  - **Option 1 (Relative Proxy — Recommended):** Set `VITE_API_GATEWAY_URL=/api`. Frontend Axios requests use same-origin paths, and Nginx reverse-proxies `/api/` directly to `http://api-gateway:8080/api/`. This avoids cross-origin requests, cookie third-party restrictions, and CORS overhead.
  - **Option 2 (Direct HTTPS):** Set to an absolute HTTPS URL (e.g., `https://api.lumiere.com`).
  - **Security Rule:** Missing, empty, or localhost/loopback addresses (`http://localhost:*`, `http://127.0.0.1:*`) are rejected fail-closed during production builds.

Feature flag `VITE_ENABLE_INTERNAL_CHECKOUT`:
- **Default:** `false` (disabled by default).
- **Behavior:** When `false`, customer access to `/cart`, `/checkout`, and `/orders/success` is redirected to `/collection`; header shopping bag icon and checkout actions are disabled. Public catalog exploration, brand pages, product details, wishlist, and admin portals remain fully functional.
- **Security Rule:** Must remain `false` for LUMIÈRE production deployments. Only explicit string `'true'` enables internal checkout.

## Architecture Notes
- **Authentication:** Uses JWT tokens. The token is stored in `localStorage` via Redux Persist and automatically attached to outgoing requests by the Axios interceptor.
- **Performance:** Implements route-level lazy loading (`React.lazy`) and React Query caching.
- **Error Handling:** Global `ErrorBoundary` catches rendering issues. Axios interceptors handle global 401s.
- **Responsive Design:** Fully responsive layouts using MUI Grid.

## Testing
Run unit and integration tests using Vitest:
```bash
npm run test
```

## Build Process
```bash
npm run build
```
Generates a highly optimized production bundle in the `dist` directory.
