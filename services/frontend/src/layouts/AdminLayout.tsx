import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Button
} from '@mui/material';
import {
  DashboardOutlined,
  Inventory2Outlined,
  StorefrontOutlined,
  LogoutOutlined,
  ShoppingBagOutlined
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardOutlined />, path: '/admin' },
    { text: 'Products', icon: <Inventory2Outlined />, path: '/admin/products' },
    { text: 'Orders', icon: <ShoppingBagOutlined />, path: '/admin/orders' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Button component={Link} to="/" color="primary" sx={{ mr: 2 }}>
            View Storefront
          </Button>
          <Button onClick={handleLogout} color="error" startIcon={<LogoutOutlined />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'primary.dark',
            color: 'white',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ my: 1 }}>
          <StorefrontOutlined sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            LUMIÈRE ADMIN
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ mt: 2, px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={<Typography sx={{ fontWeight: isActive ? 600 : 400 }}>{item.text}</Typography>} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh', pt: 10 }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
