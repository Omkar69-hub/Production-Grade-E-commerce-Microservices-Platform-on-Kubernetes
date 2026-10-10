import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Badge, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, InputBase, alpha, useTheme, useMediaQuery } from '@mui/material';
import { ShoppingBagOutlined, StorefrontOutlined, Menu as MenuIcon, Search as SearchIcon, PersonOutlined } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/ProductService';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    navigate(`/?${newParams.toString()}`);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorefrontOutlined color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>LUMIÈRE</Typography>
      </Box>
      <Divider />
      
      {/* Mobile Search */}
      <Box component="form" onSubmit={handleSearch} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.default', borderRadius: 2, px: 2, py: 1 }}>
          <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <InputBase
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            fullWidth
          />
        </Box>
      </Box>
      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to={(() => {
            const params = new URLSearchParams(searchParams);
            params.delete('categoryId');
            params.set('page', '1');
            return `/?${params.toString()}`;
          })()} onClick={handleDrawerToggle}>
            <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>All Products</Typography>} />
          </ListItemButton>
        </ListItem>
        {categories?.map((cat) => {
          const params = new URLSearchParams(searchParams);
          params.set('categoryId', cat.id);
          params.set('page', '1');
          return (
            <ListItem disablePadding key={cat.id}>
              <ListItemButton component={Link} to={`/?${params.toString()}`} onClick={handleDrawerToggle}>
                <ListItemText primary={cat.name} color="text.secondary" />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}>
                <ListItemText primary="Sign In" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register" onClick={handleDrawerToggle}>
                <ListItemText primary="Create Account" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile" onClick={handleDrawerToggle}>
                <ListItemText primary="My Account" />
              </ListItemButton>
            </ListItem>
            {user?.roles?.includes('ADMIN') && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin" onClick={handleDrawerToggle}>
                  <ListItemText primary="Admin Dashboard" />
                </ListItemButton>
              </ListItem>
            )}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Announcement Bar */}
      <Box sx={{ bgcolor: 'text.primary', color: 'white', py: 1, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, letterSpacing: '0.02em', fontSize: '0.8125rem' }}>
          Complimentary shipping on all premium orders. Discover the collection.
        </Typography>
      </Box>

      {/* Main Header */}
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: { xs: 1, md: 2 }, gap: 2 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                mr: { xs: 'auto', md: 4 },
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

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Button component={Link} to={(() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('categoryId');
                  params.set('page', '1');
                  return `/?${params.toString()}`;
                })()} color="inherit" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Shop All
                </Button>
                {categories?.slice(0, 4).map(cat => {
                  const params = new URLSearchParams(searchParams);
                  params.set('categoryId', cat.id);
                  params.set('page', '1');
                  return (
                    <Button key={cat.id} component={Link} to={`/?${params.toString()}`} color="inherit" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary' } }}>
                      {cat.name}
                    </Button>
                  );
                })}
              </Box>
            )}

            {/* Desktop Search */}
            {!isMobile && (
              <Box component="form" onSubmit={handleSearch} sx={{ 
                display: 'flex', alignItems: 'center', bgcolor: 'background.default', 
                borderRadius: '24px', px: 2, py: 0.5, width: 250,
                border: '1px solid', borderColor: 'divider',
                transition: 'all 0.2s',
                '&:focus-within': { borderColor: 'primary.main', boxShadow: `0 0 0 3px ${alpha('#4F46E5', 0.1)}` }
              }}>
                <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                <InputBase
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
                />
              </Box>
            )}

            {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <IconButton component={Link} to={isAuthenticated ? "/profile" : "/login"} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha('#4F46E5', 0.08) } }}>
                  <PersonOutlined />
                </IconButton>
              )}
              <IconButton component={Link} to="/cart" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha('#4F46E5', 0.08) } }}>
                <Badge badgeContent={cartItemsCount} color="secondary" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                  <ShoppingBagOutlined />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      
      <Box component="footer" sx={{ bgcolor: 'white', pt: 8, pb: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: 4, mb: 8 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, background: 'linear-gradient(45deg, #4F46E5 30%, #10B981 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                LUMIÈRE
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.7 }}>
                Elevate your everyday with our curated collection of premium essentials. Crafted with precision, designed for life.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Shop</Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>All Products</Typography>
                  </Link>
                </ListItem>
                {categories?.slice(0,4).map(cat => (
                  <ListItem disablePadding sx={{ mb: 1 }} key={cat.id}>
                    <Link to={`/?categoryId=${cat.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>{cat.name}</Typography>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Support</Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <a href="mailto:support@lumiere.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Contact Support</Typography>
                  </a>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Account</Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>My Profile</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Link to="/cart" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Shopping Cart</Typography>
                  </Link>
                </ListItem>
                {user?.roles?.includes('ADMIN') && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Admin Dashboard</Typography>
                    </Link>
                  </ListItem>
                )}
              </List>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 4 }} />
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Lumière E-Commerce. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
