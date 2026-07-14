import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearCartLocal } from '../../store/slices/cartSlice';
import { OrderService } from '../../services/OrderService';
import { useNavigate } from 'react-router-dom';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const CheckoutPage: React.FC = () => {
  const { cart, cartId } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });

  const onSubmit = async (data: ShippingFormValues) => {
    if (!cartId || !cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setError(null);
      const response = await OrderService.createOrder({
        cartId: cartId,
        shippingAddress: data
      });
      dispatch(clearCartLocal());
      navigate(`/orders/success/${response.orderId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5">Your cart is empty.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Return to Shop</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>Shipping Address</Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} id="checkout-form">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Full Name" {...register('fullName')} error={!!errors.fullName} helperText={errors.fullName?.message} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Street Address" {...register('street')} error={!!errors.street} helperText={errors.street?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="City" {...register('city')} error={!!errors.city} helperText={errors.city?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="State/Province" {...register('state')} error={!!errors.state} helperText={errors.state?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="ZIP / Postal Code" {...register('zipCode')} error={!!errors.zipCode} helperText={errors.zipCode?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Country" {...register('country')} error={!!errors.country} helperText={errors.country?.message} />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            {cart.items.map(item => (
              <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.productName} x {item.quantity}</Typography>
                <Typography variant="body2">${(item.price * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, pt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">${cart.totalPrice.toFixed(2)}</Typography>
            </Box>
            <Button 
              type="submit" 
              form="checkout-form"
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              sx={{ mt: 3 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
