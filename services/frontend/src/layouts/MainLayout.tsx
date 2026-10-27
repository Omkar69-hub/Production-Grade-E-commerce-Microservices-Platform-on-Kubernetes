import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
import { env } from '../config/env';
import { SilkPreloader } from '../components/common/SilkPreloader';
import { CustomAtmosphereCursor } from '../components/common/CustomAtmosphereCursor';

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
  const location = useLocation();
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
    <Box sx={{ width: 300, bgcolor: 'var(--bg, #fbf6ec)', height: '100%', p: 2.5 }} role="presentation">
      <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          onClick={handleDrawerToggle}
          sx={{ fontFamily: '"Fraunces", serif', letterSpacing: '0.04em', fontWeight: 600, color: '#1a1420' }}
        >
          LUMIÈRE
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'var(--line, #e5dccb)' }} />

      {/* Mobile Search */}
      <Box component="form" onSubmit={handleSearch} sx={{ my: 2.5 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF',
          borderRadius: '30px', px: 2, py: 1, border: '1px solid var(--line, #e5dccb)'
        }}>
          <SearchIcon sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search fashion houses & styles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            fullWidth
            sx={{ fontSize: '0.88rem' }}
          />
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'var(--line, #e5dccb)' }} />

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
                <Typography sx={{ fontWeight: 600, letterSpacing: '0.04em', fontSize: '0.92rem', color: 'var(--ink, #1a1420)' }}>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg, #fbf6ec)' }}>
      {/* Skip to Content for Keyboard and Screen Reader Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Silk Curtain Opening Preloader */}
      <SilkPreloader />

      {/* Interactive Atmosphere Custom Cursor */}
      <CustomAtmosphereCursor />

      {/* Editorial Announcement Bar */}
      <Box sx={{
        bgcolor: 'var(--ink, #1a1420)', color: 'var(--bg, #fbf6ec)', py: 0.9, px: 2,
        textAlign: 'center', borderBottom: '1px solid var(--line, #e5dccb)'
      }}>
        <Typography variant="body2" sx={{
          fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.08em',
          fontSize: { xs: '0.72rem', sm: '0.80rem' }, color: 'var(--bg, #fbf6ec)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 0.8, sm: 1.5 }, flexWrap: 'wrap'
        }}>
          <Box component="span" sx={{ color: 'var(--lime, #d8f25a)' }}>✦</Box>
          LUMIÈRE ATELIER • DISCOVER 55+ VERIFIED COUTURE & SARTORIAL HOUSES •
          <Box component="span" sx={{
            bgcolor: 'var(--lime, #d8f25a)', color: '#1a1420', px: 1.2, py: 0.2,
            borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700,
            fontFamily: '"Instrument Sans", sans-serif', letterSpacing: '0.06em'
          }}>
            DIRECT ATELIER REFERRALS
          </Box>
          <Box component="span" sx={{ color: 'var(--lime, #d8f25a)' }}>✦</Box>
        </Typography>
      </Box>

      {/* Main Sticky Header */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: 'rgba(251, 246, 236, 0.96)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line, #e5dccb)'
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: { xs: 1.4, md: 1.8 }, gap: 2 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 0.5, color: 'var(--ink, #1a1420)' }}>
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
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: 'var(--ink, #1a1420)',
                  textDecoration: 'none',
                  fontSize: { xs: '1.45rem', md: '1.85rem' },
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
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.62rem',
                  letterSpacing: '0.14em',
                  color: 'var(--cobalt, #3a3ce0)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                HAUTE COUTURE & MAISON ATELIER
              </Typography>
            </Box>

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3.2 }}>
                {navLinks.map((link) => {
                  const isActive = link.path === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(link.path);

                  return (
                    <Box key={link.path} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {isActive && (
                        <Box sx={{
                          position: 'absolute', top: -3, width: 5, height: 5,
                          borderRadius: '50%', bgcolor: 'var(--tang, #e8572b)'
                        }} />
                      )}
                      <Button
                        component={Link}
                        to={link.path}
                        color="inherit"
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          color: 'var(--ink, #1a1420)',
                          letterSpacing: '0.02em',
                          fontSize: '0.90rem',
                          px: 1.2,
                          '&:hover': { color: 'var(--cobalt, #3a3ce0)', bgcolor: 'transparent' }
                        }}
                      >
                        {link.label}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Desktop Search Bar */}
            {!isMobile && (
              <Box component="form" onSubmit={handleSearch} sx={{
                display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF',
                borderRadius: '30px', px: 2, py: 0.6, width: 250,
                border: '1px solid var(--line, #e5dccb)',
                transition: 'all 0.25s ease',
                '&:focus-within': { borderColor: 'var(--cobalt, #3a3ce0)', bgcolor: '#FFFFFF', boxShadow: '0 0 0 3px rgba(58, 60, 224, 0.12)' }
              }}>
                <SearchIcon sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 18, mr: 1 }} />
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
                    color: effectsEnabled ? 'var(--cobalt, #3a3ce0)' : 'var(--mute, #6b6173)',
                    border: '1px solid',
                    borderColor: effectsEnabled ? 'rgba(58, 60, 224, 0.35)' : 'var(--line, #e5dccb)',
                    bgcolor: effectsEnabled ? 'rgba(58, 60, 224, 0.08)' : 'transparent',
                    p: 1
                  }}
                >
                  {effectsEnabled ? <AutoAwesome fontSize="small" /> : <AutoAwesomeOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>

              {/* Curated Wishlist Button (Prototype-Aligned Pill) */}
              <Tooltip title="Curated Wishlist">
                <Button
                  component={Link}
                  to="/wishlist"
                  aria-label="Curated Wishlist"
                  id="wl"
                  sx={{
                    border: '1px solid var(--ink, #1a1420)',
                    bgcolor: 'transparent',
                    color: 'var(--ink, #1a1420)',
                    borderRadius: '99px',
                    px: 2,
                    py: 0.7,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    fontFamily: '"Instrument Sans", sans-serif',
                    textTransform: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'var(--ink, #1a1420)',
                      color: 'var(--bg, #fbf6ec)',
                      borderColor: 'var(--ink, #1a1420)'
                    }
                  }}
                >
                  <span>♡</span>
                  <span>Saved</span>
                  <Box
                    component="span"
                    id="wc"
                    sx={{
                      bgcolor: wishlistCount > 0 ? 'var(--tang, #e8572b)' : 'var(--line, #e5dccb)',
                      color: wishlistCount > 0 ? '#FFFFFF' : 'var(--ink, #1a1420)',
                      borderRadius: '99px',
                      px: 0.8,
                      py: 0.1,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      lineHeight: 1.2
                    }}
                  >
                    {wishlistCount}
                  </Box>
                </Button>
              </Tooltip>

              {/* Shopping Bag Button (rendered only when internal checkout is enabled) */}
              {env.ENABLE_INTERNAL_CHECKOUT && (
                <Tooltip title="Shopping Bag">
                  <IconButton
                    component={Link}
                    to="/cart"
                    sx={{
                      color: 'var(--ink, #1a1420)',
                      border: '1px solid var(--line, #e5dccb)',
                      p: 1,
                      '&:hover': { borderColor: 'var(--cobalt, #3a3ce0)', color: 'var(--cobalt, #3a3ce0)' }
                    }}
                  >
                    <Badge
                      badgeContent={cartItemsCount}
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: 'var(--ink, #1a1420)',
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
              )}

              {/* User Account Menu */}
              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    sx={{
                      color: 'var(--ink, #1a1420)',
                      border: '1px solid var(--line, #e5dccb)',
                      p: 1,
                      '&:hover': { borderColor: 'var(--cobalt, #3a3ce0)', bgcolor: 'rgba(58, 60, 224, 0.05)' }
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
                          border: '1px solid var(--line, #e5dccb)', boxShadow: '0 10px 30px rgba(26,20,32,0.08)'
                        }
                      }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--ink, #1a1420)' }}>
                        {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 600, letterSpacing: '0.05em' }}>
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
                    borderColor: 'var(--ink, #1a1420)',
                    color: 'var(--ink, #1a1420)',
                    px: 2.2,
                    py: 0.8,
                    fontSize: '0.8rem',
                    borderRadius: '99px',
                    '&:hover': { borderColor: 'var(--cobalt, #3a3ce0)', color: 'var(--cobalt, #3a3ce0)' }
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
      <Box id="main-content" component="main" tabIndex={-1} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', outline: 'none' }}>
        <Outlet />
      </Box>

      {/* Luxury Editorial Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'var(--bg, #fbf6ec)',
          color: 'var(--ink, #1a1420)',
          pt: { xs: 8, md: 12 },
          pb: 6,
          borderTop: '1px solid var(--line, #e5dccb)'
        }}
      >
        <Container maxWidth="xl">
          {/* Monumental Prototype Typography */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: 'clamp(54px, 15vw, 110px)', md: 'clamp(70px, 18vw, 240px)' },
              lineHeight: 0.88,
              letterSpacing: '-0.04em',
              color: 'var(--ink, #1a1420)',
              mb: 3
            }}
          >
            LUMIÈRE
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              color: 'var(--mute, #6b6173)',
              maxWidth: 720,
              fontSize: { xs: '0.92rem', md: '1.02rem' },
              lineHeight: 1.7,
              mb: 6
            }}
          >
            LUMIÈRE is an independent clothing discovery and brand-referral platform. We curate exquisite apparel and direct you to each brand&apos;s official flagship website for direct purchase. All customer-facing prices are presented in INR (₹) or marked upon atelier inquiry. LUMIÈRE holds no inventory, fulfills no shipments, and never processes customer checkout payments.
          </Typography>

          <Divider sx={{ borderColor: 'var(--line, #e5dccb)', mb: 6 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2.2fr 1fr 1fr 1fr' }, gap: 5, mb: 8 }}>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.04em', fontWeight: 600, mb: 1.2, color: 'var(--ink, #1a1420)' }}>
                ATELIER DOSSIER
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: '"Instrument Sans", sans-serif', letterSpacing: '0.14em', color: 'var(--cobalt, #3a3ce0)', display: 'block', mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
                MAISON DE LUXE • REFERRAL DIRECTORY
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', maxWidth: 360, lineHeight: 1.8 }}>
                Curating the intersection of historic Indian artisanal heritage and avant-garde global fashion.
                Every maison in our directory is verified for authentic direct provenance.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.04em', fontWeight: 600, mb: 2.5, color: 'var(--ink, #1a1420)' }}>
                Couture Portfolios
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products?gender=women" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>Women’s Atelier</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products?gender=men" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>Men’s Sartorial</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products?gender=kids" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>Kids’ Heritage</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/brands" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>58 Brand Directory</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/products" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>All Garment Capsules</Typography>
                  </Link>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.04em', fontWeight: 600, mb: 2.5, color: 'var(--ink, #1a1420)' }}>
                Client Services
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Link to="/wishlist" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>Private Wishlist Vault</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)' }}>Verified Domain Security</Typography>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)' }}>Official Brand Checkout</Typography>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.2 }}>
                  <a href="mailto:concierge@lumiere.fashion" style={{ color: 'var(--mute, #6b6173)', textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}>Atelier Concierge</Typography>
                  </a>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.04em', fontWeight: 600, mb: 2.5, color: 'var(--ink, #1a1420)' }}>
                Heritage Salons
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', mb: 1 }}>
                • 12 Place Vendôme, Paris
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', mb: 1 }}>
                • 18 Mehrauli Heritage, New Delhi
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', mb: 1 }}>
                • 740 Fifth Avenue, New York
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)' }}>
                • Kala Ghoda Arts Precinct, Mumbai
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'var(--line, #e5dccb)', mb: 4 }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: 'var(--mute, #6b6173)', letterSpacing: '0.04em' }}>
              © {new Date().getFullYear()} LUMIÈRE MAISON DE LUXE. ALL RIGHTS RESERVED.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                size="small"
                onClick={toggleEffects}
                sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: '0.78rem', p: 0, textDecoration: 'underline' }}
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
