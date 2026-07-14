import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
            E-Commerce Platform
          </Typography>
          <IconButton color="inherit" component={Link} to="/cart" sx={{ mr: 2 }}>
            <Badge badgeContent={cartItemsCount} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {!isAuthenticated ? (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          ) : (
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Production-Grade E-Commerce. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
