import React, { useEffect } from 'react';
import { Box, Typography, Container, Button, IconButton, Grid, Paper, Divider, Stack } from '@mui/material';
import { Add, Remove, DeleteOutlined, ShoppingBagOutlined, LockOutlined, LocalShippingOutlined } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCart, removeFromCart, updateCartQuantity } from '../../store/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR, isDemoPrice } from '../../utils/currency';
import { Chip } from '@mui/material';

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cart, cartId, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if (cartId) {
      dispatch(fetchCart());
    }
  }, [dispatch, cartId]);

  const handleUpdateQuantity = (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      dispatch(removeFromCart({ productId }));
    } else {
      dispatch(updateCartQuantity({ productId, quantity: newQty }));
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart({ productId }));
  };

  if (loading && !cart) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.2em', color: 'primary.main' }}>
          ATELIER BAG
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, fontFamily: '"Playfair Display", Georgia, serif' }}>
          Retrieving Reserved Pieces...
        </Typography>
      </Container>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Box 
          sx={{ 
            width: 72, 
            height: 72, 
            mx: 'auto', 
            mb: 3, 
            borderRadius: '50%', 
            border: '1px solid #B89758', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(184, 151, 88, 0.08)'
          }}
        >
          <ShoppingBagOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
        </Box>
        <Typography variant="overline" sx={{ letterSpacing: '0.25em', color: 'primary.main', fontWeight: 600 }}>
          CURATED RESERVATIONS
        </Typography>
        <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mt: 1, mb: 2 }}>
          Your Bag is Empty
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 4, lineHeight: 1.8 }}>
          Explore our seasonal haute couture and verified designer collections to reserve your coveted pieces.
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/products" 
          className="btn-shimmer"
          sx={{ py: 1.8, px: 4, fontSize: '0.85rem', letterSpacing: '0.12em' }}
        >
          Explore Collections
        </Button>
      </Container>
    );
  }

  const subtotal = cart.subtotal ?? cart.totalPrice ?? 0;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
          SHOPPING BAG
        </Typography>
        <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: 'secondary.main' }}>
          Reserved Atelier Pieces ({cart.items.reduce((acc, i) => acc + i.quantity, 0)})
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Items List */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            {cart.items.map((item) => (
              <Paper 
                key={item.productId} 
                elevation={0}
                className="lumiere-card"
                sx={{ 
                  p: { xs: 2.5, sm: 3 }, 
                  bgcolor: '#FFFFFF', 
                  border: '1px solid #EAE5DC', 
                  borderRadius: 1.5,
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' },
                  gap: 3
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    VAULT ITEM
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: 'secondary.main' }}>
                    {item.name || item.productName}
                  </Typography>
                  {item.sku && (
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      REF: {item.sku}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'primary.main' }}>
                      {formatINR(item.price)}
                    </Typography>
                    {isDemoPrice(item.sku) && (
                      <Chip 
                        label="Unverified Demo Feed" 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem', 
                          bgcolor: 'rgba(184, 151, 88, 0.12)', 
                          color: '#8C6D2B', 
                          fontWeight: 600,
                          border: '1px solid rgba(184, 151, 88, 0.3)'
                        }} 
                      />
                    )}
                  </Box>
                </Box>

                {/* Quantity Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1px solid #D5C9B3', 
                      borderRadius: 1,
                      bgcolor: '#FAF8F5'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                      sx={{ p: 0.8 }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography sx={{ width: 36, textAlign: 'center', fontWeight: 600, fontFamily: '"Outfit", sans-serif' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                      sx={{ p: 0.8 }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                    {formatINR(item.price * item.quantity)}
                  </Typography>

                  <IconButton 
                    onClick={() => handleRemove(item.productId)}
                    sx={{ 
                      color: 'text.secondary', 
                      '&:hover': { color: '#C0392B', bgcolor: 'rgba(192, 57, 43, 0.08)' } 
                    }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* Order Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            elevation={0}
            className="lumiere-card"
            sx={{ 
              p: 3.5, 
              bgcolor: '#FFFFFF', 
              border: '1px solid #EAE5DC', 
              borderRadius: 1.5,
              position: 'sticky',
              top: 120
            }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
              INVESTMENT SUMMARY
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 3 }}>
              Order Dossier
            </Typography>

            <Divider sx={{ mb: 2.5, borderColor: '#EAE5DC' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Pieces Subtotal</Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                {formatINR(subtotal)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">White-Glove Courier</Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                Complimentary
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#EAE5DC' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'baseline' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Investment</Typography>
              <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'primary.main' }}>
                {formatINR(subtotal)}
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => navigate('/checkout')}
              className="btn-shimmer"
              startIcon={<LockOutlined />}
              sx={{ py: 1.8, fontSize: '0.9rem', letterSpacing: '0.12em', mb: 2.5 }}
            >
              Proceed to Secure Checkout
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <LocalShippingOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                Insured express delivery within 24-48 business hours
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;


