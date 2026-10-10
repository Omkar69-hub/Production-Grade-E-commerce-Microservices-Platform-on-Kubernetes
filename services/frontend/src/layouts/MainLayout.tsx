import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Badge } from '@mui/material';
import { ShoppingBagOutlined, StorefrontOutlined } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <StorefrontOutlined sx={{ display: 'flex', mr: 1, color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                textDecoration: 'none',
                background: 'linear-gradient(45deg, #4F46E5 30%, #10B981 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              LUMIÈRE
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton component={Link} to="/cart" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(79, 70, 229, 0.08)' } }}>
                <Badge badgeContent={cartItemsCount} color="secondary" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                  <ShoppingBagOutlined />
                </Badge>
              </IconButton>
              {!isAuthenticated ? (
                <Button variant="contained" color="primary" component={Link} to="/login" sx={{ borderRadius: '20px', px: 3 }}>
                  Sign In
                </Button>
              ) : (
                <Button variant="outlined" color="primary" component={Link} to="/profile" sx={{ borderRadius: '20px', px: 3, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}>
                  My Account
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 4, md: 8 } }}>
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ py: 6, textAlign: 'center', bgcolor: 'white', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <StorefrontOutlined sx={{ color: 'primary.light', fontSize: 40, mb: 2 }} />
        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
          Lumière E-Commerce
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          © {new Date().getFullYear()} All rights reserved. Crafted with precision.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;

