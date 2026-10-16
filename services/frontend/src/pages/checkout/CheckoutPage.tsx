import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper, Alert, Divider, Chip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearCartLocal } from '../../store/slices/cartSlice';
import { OrderService } from '../../services/OrderService';
import { AddressService } from '../../services/AddressService';
import type { Address } from '../../types/address';
import { useNavigate, Link } from 'react-router-dom';
import { LockOutlined, SecurityOutlined, LocalShippingOutlined, DiamondOutlined, Add } from '@mui/icons-material';
import { formatINR } from '../../utils/currency';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full client name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  zipCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid international phone format required (e.g. +1234567890)'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const CheckoutPage: React.FC = () => {
  const { cart, cartId } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phoneNumber: '',
    }
  });

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const list = await AddressService.getAddresses();
        setSavedAddresses(list || []);
        if (list && list.length > 0) {
          const defaultAddr = list.find(a => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr.id);
          setValue('fullName', defaultAddr.fullName);
          setValue('street', defaultAddr.street);
          setValue('city', defaultAddr.city);
          setValue('state', defaultAddr.state);
          setValue('zipCode', defaultAddr.zipCode);
          setValue('country', defaultAddr.country);
          setValue('phoneNumber', defaultAddr.phoneNumber);
        }
      } catch {
        // Guest or not authenticated
      }
    };
    loadSaved();
  }, [setValue]);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setValue('fullName', addr.fullName);
    setValue('street', addr.street);
    setValue('city', addr.city);
    setValue('state', addr.state);
    setValue('zipCode', addr.zipCode);
    setValue('country', addr.country);
    setValue('phoneNumber', addr.phoneNumber);
  };

  const handleSelectNew = () => {
    setSelectedAddressId('new');
    setValue('fullName', '');
    setValue('street', '');
    setValue('city', '');
    setValue('state', '');
    setValue('zipCode', '');
    setValue('country', 'India');
    setValue('phoneNumber', '');
  };

  const onSubmit = async (data: ShippingFormValues) => {
    if (!cartId || !cart || cart.items.length === 0) {
      setError('Your shopping bag is unoccupied');
      return;
    }

    try {
      setError(null);
      const response = await OrderService.createOrder({
        shippingAddress: data,
        paymentMethod: 'CREDIT_CARD',
      });
      dispatch(clearCartLocal());
      navigate(`/orders/success/${response.orderNumber || response.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order authorization could not be completed. Please review details.');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.2em' }}>
          CHECKOUT ATELIER
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mt: 1, mb: 2 }}>
          Your Bag is Empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Please select pieces from our catalog before proceeding to checkout.
        </Typography>
        <Button variant="contained" component={Link} to="/products" className="btn-shimmer">
          Return to Collections
        </Button>
      </Container>
    );
  }

  const subtotal = cart.subtotal ?? cart.totalPrice ?? 0;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
          DISPATCH & DESTINATION
        </Typography>
        <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: 'secondary.main' }}>
          Secure Checkout
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            bgcolor: 'rgba(192, 57, 43, 0.05)', 
            border: '1px solid rgba(192, 57, 43, 0.3)' 
          }}
        >
          {error}
        </Alert>
      )}
      
      <Grid container spacing={5}>
        {/* Shipping Information Form */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Paper 
            elevation={0}
            className="lumiere-card"
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              bgcolor: '#FFFFFF', 
              border: '1px solid #EAE5DC', 
              borderRadius: 1.5 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <LocalShippingOutlined sx={{ color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }}>
                Delivery Destination
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Specify the private residential or office address for insured courier dispatch.
            </Typography>

            {savedAddresses.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.12em', display: 'block', mb: 1.5 }}>
                  SELECT SAVED RESIDENCE FROM DOSSIER
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <Grid key={addr.id} size={{ xs: 12, sm: 6 }}>
                        <Paper
                          elevation={0}
                          onClick={() => handleSelectAddress(addr)}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? '#FFFDF9' : '#FAF8F5',
                            border: isSelected ? '2px solid #B89758' : '1px solid #EAE5DC',
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: '#B89758' }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {addr.fullName}
                            </Typography>
                            {addr.isDefault && (
                              <Chip
                                label="DEFAULT"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  bgcolor: '#181816',
                                  color: '#B89758',
                                  fontWeight: 700
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                            {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#888', mt: 0.5, display: 'block', fontFamily: 'monospace' }}>
                            {addr.phoneNumber}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      elevation={0}
                      onClick={handleSelectNew}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 92,
                        bgcolor: selectedAddressId === 'new' ? '#FFFDF9' : '#FAF8F5',
                        border: selectedAddressId === 'new' ? '2px solid #B89758' : '1px dashed #D5C9B3',
                        borderRadius: 1.5,
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: '#B89758' }
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Add sx={{ color: '#B89758', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          Custom Destination
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3, borderColor: '#EAE5DC' }} />
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} id="checkout-form">
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Recipient Full Name" 
                    placeholder="Lord / Lady / Full Name"
                    {...register('fullName')} 
                    error={!!errors.fullName} 
                    helperText={errors.fullName?.message} 
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Street Address / Residence" 
                    placeholder="123 Luxury Boulevard, Suite 400"
                    {...register('street')} 
                    error={!!errors.street} 
                    helperText={errors.street?.message} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="City" 
                    {...register('city')} 
                    error={!!errors.city} 
                    helperText={errors.city?.message} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="State / Province / Region" 
                    {...register('state')} 
                    error={!!errors.state} 
                    helperText={errors.state?.message} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Postal Code / ZIP" 
                    {...register('zipCode')} 
                    error={!!errors.zipCode} 
                    helperText={errors.zipCode?.message} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Country" 
                    placeholder="United States"
                    {...register('country')} 
                    error={!!errors.country} 
                    helperText={errors.country?.message} 
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Contact Telephone (for Courier Verification)" 
                    placeholder="+1234567890" 
                    {...register('phoneNumber')} 
                    error={!!errors.phoneNumber} 
                    helperText={errors.phoneNumber?.message} 
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Guarantees Strip */}
            <Box 
              sx={{ 
                mt: 4, 
                p: 2.5, 
                bgcolor: '#FAF8F5', 
                border: '1px solid #EAE5DC', 
                borderRadius: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityOutlined sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  256-Bit Encrypted
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DiamondOutlined sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Certified Authenticity
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingOutlined sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Insured Delivery
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Order Summary Sidebar */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
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
              RESERVED PIECES
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 2.5 }}>
              Portfolio Summary
            </Typography>

            <Box sx={{ maxHeight: 240, overflowY: 'auto', pr: 1, mb: 2 }}>
              {cart.items.map(item => (
                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F0ECE4' }}>
                  <Box sx={{ pr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.name || item.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity} × {formatINR(item.price)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                    {formatINR(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2, borderColor: '#EAE5DC' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                {formatINR(subtotal)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Courier & Handling</Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                Complimentary
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#EAE5DC' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'baseline' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'primary.main' }}>
                {formatINR(subtotal)}
              </Typography>
            </Box>

            <Button 
              type="submit" 
              form="checkout-form"
              variant="contained" 
              fullWidth 
              size="large"
              className="btn-shimmer"
              startIcon={<LockOutlined />}
              sx={{ py: 1.8, fontSize: '0.9rem', letterSpacing: '0.12em' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Securing Acquisition...' : 'Authorize Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;


