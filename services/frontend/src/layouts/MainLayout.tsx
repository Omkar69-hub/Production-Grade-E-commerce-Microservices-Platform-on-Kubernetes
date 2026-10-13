import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Badge, 
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider, InputBase, 
  Menu, MenuItem, Tooltip, useTheme, useMediaQuery 
} from '@mui/material';
import { 
  ShoppingBagOutlined, Menu as MenuIcon, Search as SearchIcon, 
  PersonOutlined, AutoAwesomeOutlined, AutoAwesome, LogoutOutlined, 
  DashboardOutlined, FavoriteBorderOutlined 
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { AuthService } from '../services/AuthService';
import { useEffects } from '../context/EffectsContext';

const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const { effectsEnabled, toggleEffects } = useEffects();

  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Keep wishlist count reactive to localStorage changes
  useEffect(() => {
    const updateWishlist = () => {
      try {
        const saved = localStorage.getItem('lumiere_wishlist');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) setWishlistCount(list.length);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setWishlistCount(0);
      }
    };
    updateWishlist();
    window.addEventListener('storage', updateWishlist);
    window.addEventListener('lumiere-wishlist-updated', updateWishlist);
    return () => {
      window.removeEventListener('storage', updateWishlist);
      window.removeEventListener('lumiere-wishlist-updated', updateWishlist);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    }
    newParams.set('page', '1');
    navigate(`/products?${newParams.toString()}`);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    setUserMenuAnchor(null);
    await AuthService.logout();
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Women', path: '/products?gender=women' },
    { label: 'Men', path: '/products?gender=men' },
    { label: 'Kids', path: '/products?gender=kids' },
    { label: 'Brands Directory', path: '/brands' },
    { label: 'Collections', path: '/products' },
  ];

  const drawer = (
    <Box sx={{ width: 300, bgcolor: '#FAFAFA', height: '100%', p: 2.5 }} role="presentation">
      <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          onClick={handleDrawerToggle}
          sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.18em', fontWeight: 800, color: '#0A0A0A' }}
        >
          LUMIÈRE
        </Typography>
      </Box>
      <Divider sx={{ borderColor: '#E8E4DC' }} />
      
      {/* Mobile Search */}
      <Box component="form" onSubmit={handleSearch} sx={{ my: 2.5 }}>
        <Box sx={{ 
          display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF', 
          borderRadius: '30px', px: 2, py: 1, border: '1px solid #E8E4DC' 
        }}>
          <SearchIcon sx={{ color: '#E50914', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search fashion houses & styles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            fullWidth
            sx={{ fontSize: '0.88rem' }}
          />
        </Box>
      </Box>
      <Divider sx={{ borderColor: '#E8E4DC' }} />

      <List sx={{ py: 1.5 }}>
        {navLinks.map((link) => (
          <ListItem disablePadding key={link.path}>
            <ListItemButton 
              component={Link} 
              to={link.path} 
              onClick={handleDrawerToggle}
              sx={{ py: 1.2, borderRadius: 1 }}
            >
              <ListItemText 
                primary={
                  <Typography sx={{ fontWeight: 600, letterSpacing: '0.04em', fontSize: '0.92rem', color: '#0A0A0A' }}>
                    {link.label}
                  </Typography>
                } 
              />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/wishlist" 
            onClick={handleDrawerToggle}
            sx={{ py: 1.2, borderRadius: 1 }}
          >
            <ListItemText 
              primary={
                <Typography sx={{ fontWeight: 600, letterSpacing: '0.04em', fontSize: '0.92rem', color: '#E50914' }}>
                  Private Wishlist ({wishlistCount})
                </Typography>
              } 
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ borderColor: '#E8E4DC' }} />

      <List sx={{ pt: 2.5 }}>
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <ListItemButton 
                component={Link} 
                to="/login" 
                onClick={handleDrawerToggle}
                className="lumiere-pill-btn"
                sx={{ bgcolor: '#0A0A0A', color: '#FFFFFF', '&:hover': { bgcolor: '#222' } }}
              >
                <ListItemText primary={<Typography sx={{ textAlign: 'center', fontWeight: 600 }}>Sign In</Typography>} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                to="/register" 
                onClick={handleDrawerToggle}
                className="lumiere-pill-btn"
                sx={{ border: '1.5px solid #0A0A0A' }}
              >
                <ListItemText primary={<Typography sx={{ textAlign: 'center', fontWeight: 600, color: '#0A0A0A' }}>Create Account</Typography>} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile" onClick={handleDrawerToggle}>
                <ListItemText primary="Client Dossier" />
              </ListItemButton>
            </ListItem>
            {user?.roles?.includes('ADMIN') && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin" onClick={handleDrawerToggle}>
                  <ListItemText primary="Admin Atelier" />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Sign Out" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      
      {/* Editorial Announcement Bar */}
      <Box sx={{ 
        bgcolor: '#0A0A0A', color: '#FAF8F5', py: 0.9, px: 2, 
        textAlign: 'center', borderBottom: '1px solid rgba(229, 9, 20, 0.35)' 
      }}>
        <Typography variant="body2" sx={{ 
          fontFamily: '"Cinzel", serif', letterSpacing: '0.14em', 
          fontSize: { xs: '0.70rem', sm: '0.78rem' }, color: '#FAF8F5' 
        }}>
          LUMIÈRE ATELIER • DISCOVER 55+ VERIFIED COUTURE & SARTORIAL HOUSES • COMPLIMENTARY INSURED WHITE-GLOVE SHIPPING
        </Typography>
      </Box>

      {/* Main Sticky Header */}
      <AppBar position="sticky" elevation={0} sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.96)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid #E8E4DC' 
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: { xs: 1.4, md: 1.8 }, gap: 2 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 0.5, color: '#0A0A0A' }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Brand Logo & Subtitle */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mr: { xs: 'auto', md: 4 } }}>
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  color: '#0A0A0A',
                  textDecoration: 'none',
                  fontSize: { xs: '1.35rem', md: '1.75rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                LUMIÈRE
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: '"Cinzel", serif', 
                  fontSize: '0.56rem', 
                  letterSpacing: '0.22em', 
                  color: '#E50914', 
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                HAUTE COUTURE & MAISON ATELIER
              </Typography>
            </Box>

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3.2 }}>
                {navLinks.map((link) => (
                  <Button 
                    key={link.path}
                    component={Link} 
                    to={link.path} 
                    color="inherit" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#0A0A0A', 
                      letterSpacing: '0.04em',
                      fontSize: '0.88rem',
                      px: 1.2,
                      '&:hover': { color: '#E50914', bgcolor: 'transparent' } 
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Desktop Search Bar */}
            {!isMobile && (
              <Box component="form" onSubmit={handleSearch} sx={{ 
                display: 'flex', alignItems: 'center', bgcolor: '#F5F3EF', 
                borderRadius: '30px', px: 2, py: 0.6, width: 250,
                border: '1px solid #E8E4DC',
                transition: 'all 0.25s ease',
                '&:focus-within': { borderColor: '#E50914', bgcolor: '#FFFFFF', boxShadow: '0 0 0 3px rgba(229, 9, 20, 0.12)' }
              }}>
                <SearchIcon sx={{ color: '#E50914', fontSize: 18, mr: 1 }} />
                <InputBase
                  placeholder="Search collections..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.84rem' }}
                />
              </Box>
            )}

            {/* Actions & Utilities */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              
              {/* Visual Effects Toggle */}
              <Tooltip title={effectsEnabled ? "Visual Atmosphere: Active (Click to reduce)" : "Visual Atmosphere: Reduced (Click to activate)"}>
                <IconButton 
                  onClick={toggleEffects}
                  sx={{ 
                    color: effectsEnabled ? '#E50914' : '#888', 
                    border: '1px solid',
                    borderColor: effectsEnabled ? 'rgba(229, 9, 20, 0.35)' : '#E8E4DC',
                    bgcolor: effectsEnabled ? 'rgba(229, 9, 20, 0.06)' : 'transparent',
                    p: 1
                  }}
                >
                  {effectsEnabled ? <AutoAwesome fontSize="small" /> : <AutoAwesomeOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>

              {/* Curated Wishlist Button */}
              <Tooltip title="Curated Wishlist">
                <IconButton
                  component={Link}
                  to="/wishlist"
                  sx={{
                    color: '#0A0A0A',
                    border: '1px solid #E8E4DC',
                    p: 1,
                    '&:hover': { borderColor: '#E50914', color: '#E50914' }
                  }}
                >
                  <Badge 
                    badgeContent={wishlistCount} 
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        bgcolor: '#E50914', 
                        color: '#FFFFFF', 
                        fontWeight: 700,
                        fontSize: '0.68rem'
                      } 
                    }}
                  >
                    <FavoriteBorderOutlined fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Shopping Bag Button */}
              <Tooltip title="Shopping Bag">
                <IconButton 
                  component={Link}
                  to="/cart"
                  sx={{ 
                    color: '#0A0A0A',
                    border: '1px solid #E8E4DC',
                    p: 1,
                    '&:hover': { borderColor: '#E50914', color: '#E50914' }
                  }}
                >
                  <Badge 
                    badgeContent={cartItemsCount} 
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        bgcolor: '#0A0A0A', 
                        color: '#FFFFFF', 
                        fontWeight: 700,
                        fontSize: '0.68rem'
                      } 
                    }}
                  >
                    <ShoppingBagOutlined fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* User Account Menu */}
              {isAuthenticated ? (
                <>
                  <IconButton 
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    sx={{ 
                      color: '#0A0A0A', 
                      border: '1px solid #E8E4DC',
                      p: 1,
                      '&:hover': { borderColor: '#E50914', bgcolor: 'rgba(229, 9, 20, 0.05)' }
                    }}
                  >
                    <PersonOutlined fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                      paper: {
                        sx: { 
                          mt: 1.5, minWidth: 210, borderRadius: 2, 
                          border: '1px solid #E8E4DC', boxShadow: '0 10px 30px rgba(10,10,10,0.08)' 
                        }
                      }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0A0A0A' }}>
                        {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#E50914', fontWeight: 600, letterSpacing: '0.05em' }}>
                        {user?.roles?.includes('ADMIN') ? 'Maison Curator (Admin)' : 'Verified Client'}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} to="/profile" onClick={() => setUserMenuAnchor(null)} sx={{ py: 1 }}>
                      <PersonOutlined fontSize="small" sx={{ mr: 1.5, color: '#888' }} />
                      Client Dossier
                    </MenuItem>
                    <MenuItem component={Link} to="/wishlist" onClick={() => setUserMenuAnchor(null)} sx={{ py: 1 }}>
                      <FavoriteBorderOutlined fontSize="small" sx={{ mr: 1.5, color: '#888' }} />
                      Private Wishlist
                    </MenuItem>
                    {user?.roles?.includes('ADMIN') && (
                      <MenuItem component={Link} to="/admin" onClick={() => setUserMenuAnchor(null)} sx={{ py: 1 }}>
                        <DashboardOutlined fontSize="small" sx={{ mr: 1.5, color: '#888' }} />
                        Admin Atelier
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'error.main' }}>
                      <LogoutOutlined fontSize="small" sx={{ mr: 1.5 }} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  className="lumiere-pill-btn"
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    borderColor: '#0A0A0A',
                    color: '#0A0A0A',
                    px: 2.2,
                    py: 0.8,
                    fontSize: '0.8rem',
                    '&:hover': { borderColor: '#E50914', color: '#E50914' }
                  }}
                >
                  Sign In
                </Button>
              )}

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
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Outlet */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      
      {/* Luxury Editorial Footer */}
      <Box component="footer" sx={{ bgcolor: '#0A0A0A', color: '#FAF8F5', pt: 10, pb: 6, borderTop: '1px solid rgba(229, 9, 20, 0.3)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2.2fr 1fr 1fr 1fr' }, gap: 5, mb: 8 }}>
            
            <Box>
              <Typography variant="h5" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.16em', fontWeight: 800, mb: 1.2, color: '#FFFFFF' }}>
                LUMIÈRE
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.2em', color: '#E50914', display: 'block', mb: 2, fontWeight: 700 }}>
                MAISON DE LUXE • EST. 2026
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0988E', maxWidth: 360, lineHeight: 1.8 }}>
                Curating the intersection of historic Indian artisanal heritage and avant-garde global fashion. 
                Every maison in our directory is verified for authentic direct provenance.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.12em', fontWeight: 700, mb: 2.5, color: '#FFFFFF' }}>
                Couture Portfolios
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products?gender=women" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>Women’s Atelier</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products?gender=men" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>Men’s Sartorial</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products?gender=kids" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>Kids’ Heritage</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/brands" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>58 Brand Directory</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>All Garment Capsules</Typography>
                  </Link>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.12em', fontWeight: 700, mb: 2.5, color: '#FFFFFF' }}>
                Client Services
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/wishlist" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>Private Wishlist Vault</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Typography variant="body2" sx={{ color: '#A0988E' }}>Verified Domain Security</Typography>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Typography variant="body2" sx={{ color: '#A0988E' }}>Insured White-Glove Transit</Typography>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <a href="mailto:concierge@lumiere.fashion" style={{ color: '#A0988E', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: '#E50914' } }}>Atelier Concierge</Typography>
                  </a>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.12em', fontWeight: 700, mb: 2.5, color: '#FFFFFF' }}>
                Heritage Salons
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0988E', mb: 1 }}>
                • 12 Place Vendôme, Paris
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0988E', mb: 1 }}>
                • 18 Mehrauli Heritage, New Delhi
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0988E', mb: 1 }}>
                • 740 Fifth Avenue, New York
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0988E' }}>
                • Kala Ghoda Arts Precinct, Mumbai
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 4 }} />
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#7E766D', letterSpacing: '0.04em' }}>
              © {new Date().getFullYear()} LUMIÈRE MAISON DE LUXE. ALL RIGHTS RESERVED.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                size="small" 
                onClick={toggleEffects}
                sx={{ color: '#E50914', fontSize: '0.78rem', p: 0, textDecoration: 'underline' }}
              >
                {effectsEnabled ? "Visual Atmosphere: Active" : "Visual Atmosphere: Reduced"}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
