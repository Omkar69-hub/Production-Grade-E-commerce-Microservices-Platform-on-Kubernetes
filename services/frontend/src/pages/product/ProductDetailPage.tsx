import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Grid, Typography, Button, Box, CircularProgress, Breadcrumbs, Divider } from '@mui/material';
import { useProductDetails } from '../../hooks/useProducts';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { RootState, AppDispatch } from '../../store';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductDetails(id!);
  const dispatch = useDispatch<AppDispatch>();
  const { cartId } = useSelector((state: RootState) => state.cart);

  const handleAddToCart = () => {
    if (cartId && product) {
      dispatch(addToCart({ cartId, item: { productId: product.id, quantity: 1 } }));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !product) {
    return (
      <Typography color="error" variant="h6" align="center" sx={{ mt: 4 }}>
        Product not found or failed to load.
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
        <Link color="inherit" to="/">Home</Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 2,
            }}
            src={product.imageUrl || 'https://via.placeholder.com/500?text=No+Image'}
            alt={product.name}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            SKU: {product.sku}
          </Typography>
          <Typography variant="body1" color={product.status === 'OUT_OF_STOCK' ? 'error' : 'success.main'} sx={{ mb: 3 }}>
            {product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={product.status === 'OUT_OF_STOCK'}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;
