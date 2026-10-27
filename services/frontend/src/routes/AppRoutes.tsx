import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { env } from '../config/env';

// Lazy Loaded Pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const BrandDirectoryPage = lazy(() => import('../pages/brands/BrandDirectoryPage'));
const BrandDetailPage = lazy(() => import('../pages/brands/BrandDetailPage'));
const WishlistPage = lazy(() => import('../pages/wishlist/WishlistPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ProductListPage = lazy(() => import('../pages/product/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProductList = lazy(() => import('../pages/admin/AdminProductList'));
const AdminOrderList = lazy(() => import('../pages/admin/AdminOrderList'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));

const NotFound = () => (
  <Box sx={{ py: 14, textAlign: 'center' }}>
    <h2>404 — Atelier Page Not Found</h2>
    <p>The requested runway page or collection dossier does not exist.</p>
  </Box>
);

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', my: 12 }}>
    <CircularProgress sx={{ color: '#3a3ce0' }} />
  </Box>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="collection" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="brands" element={<BrandDirectoryPage />} />
          <Route path="brands/:brandSlug" element={<BrandDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route
            path="cart"
            element={env.ENABLE_INTERNAL_CHECKOUT ? <CartPage /> : <Navigate to="/collection" replace />}
          />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="checkout"
              element={env.ENABLE_INTERNAL_CHECKOUT ? <CheckoutPage /> : <Navigate to="/collection" replace />}
            />
            <Route
              path="orders/success/:id"
              element={env.ENABLE_INTERNAL_CHECKOUT ? <OrderSuccessPage /> : <Navigate to="/collection" replace />}
            />
          </Route>
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="orders" element={<AdminOrderList />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
