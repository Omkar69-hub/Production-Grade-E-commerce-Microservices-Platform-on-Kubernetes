import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy Loaded Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ProductListPage = lazy(() => import('../pages/product/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));

const NotFound = () => <div>404 - Not Found</div>;

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
    <CircularProgress />
  </Box>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders/success/:id" element={<OrderSuccessPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
