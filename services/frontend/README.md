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
Create a `.env` file in the root directory:
```
VITE_API_GATEWAY_URL=http://localhost:8080
```

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
