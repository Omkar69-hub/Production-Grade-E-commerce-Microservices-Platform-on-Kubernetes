import React, { useEffect } from 'react';
import { Box, Typography, Container, Button, IconButton, Grid, Paper, Divider } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCart, removeFromCart, addToCart } from '../../store/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cart, cartId, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if (cartId) {
      dispatch(fetchCart(cartId));
    }
  }, [dispatch, cartId]);

  const handleUpdateQuantity = (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      dispatch(removeFromCart({ cartId: cartId!, productId }));
    } else {
      dispatch(addToCart({ cartId: cartId!, item: { productId, quantity: change } }));
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart({ cartId: cartId!, productId }));
  };

  if (loading && !cart) {
    return <Typography sx={{ mt: 4 }} align="center">Loading cart...</Typography>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Your Cart is Empty</Typography>
        <Button variant="contained" color="primary" component={Link} to="/" sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <Paper key={item.productId} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.productName}</Typography>
                <Typography color="text.secondary">SKU: {item.sku}</Typography>
                <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                  ${item.price.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                <IconButton onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}>
                  <Remove />
                </IconButton>
                <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                <IconButton onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}>
                  <Add />
                </IconButton>
              </Box>
              <IconButton color="error" onClick={() => handleRemove(item.productId)}>
                <Delete />
              </IconButton>
            </Paper>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Subtotal</Typography>
              <Typography>${cart.totalPrice.toFixed(2)}</Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
