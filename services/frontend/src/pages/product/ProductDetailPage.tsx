import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Grid, Typography, Button, Box, CircularProgress, Breadcrumbs, Divider, IconButton, Snackbar, Alert, Drawer, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { AddOutlined, RemoveOutlined, ShoppingCartOutlined, StraightenOutlined, ExpandMoreOutlined, NavigateNextOutlined } from '@mui/icons-material';
import { useProductDetails, useProducts } from '../../hooks/useProducts';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import type { RootState, AppDispatch } from '../../store';
import ProductCard from '../../components/product/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductDetails(id!);
  
  // Fetch related products from the same category
  const { data: relatedProductsData } = useProducts({ 
    categoryId: product?.categoryId,
    size: 5 // fetch 5, one might be the current product
  });
  
  const relatedProducts = relatedProductsData?.content.filter(p => p.id !== id).slice(0, 4) || [];

  const dispatch = useDispatch<AppDispatch>();
  const { cartId } = useSelector((state: RootState) => state.cart);
  
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async () => {
    if (cartId && product && !adding) {
      setAdding(true);
      try {
        await dispatch(addToCart({ cartId, item: { productId: product.id, quantity } })).unwrap();
        setSnackbar({ open: true, message: 'Added to cart successfully', severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err || 'Failed to add to cart', severity: 'error' });
      } finally {
        setAdding(false);
      }
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Typography color="error" variant="h5" gutterBottom>
          Product not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          We couldn't find the product you're looking for. It may have been removed or the URL is incorrect.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Return to Products
        </Button>
      </Container>
    );
  }

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const fallbackImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  return (
    <Box sx={{ pb: 10 }}>
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: '#fafafa', py: 2, borderBottom: '1px solid', borderColor: 'divider', mb: 6 }}>
        <Container maxWidth="xl">
          <Breadcrumbs separator={<NavigateNextOutlined fontSize="small" />} aria-label="breadcrumb">
            <Link color="inherit" to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>Home</Typography>
            </Link>
            {product.categoryName && (
              <Link color="inherit" to={`/?categoryId=${product.categoryId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>{product.categoryName}</Typography>
              </Link>
            )}
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>{product.name}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={8}>
          {/* Image Section */}
          <Grid size={{ xs: 12, md: 6, lg: 7 }}>
            <Box sx={{ position: 'relative', pt: '100%', bgcolor: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
              <Box
                component="img"
                src={imgError ? fallbackImg : (product.imageUrl || fallbackImg)}
                alt={product.name}
                onError={() => setImgError(true)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {isOutOfStock && (
                <Box sx={{ position: 'absolute', top: 24, right: 24, bgcolor: 'error.main', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontWeight: 700, letterSpacing: '0.05em' }}>
                  OUT OF STOCK
                </Box>
              )}
            </Box>
          </Grid>

          {/* Product Details Section */}
          <Grid size={{ xs: 12, md: 6, lg: 5 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.1em' }}>
                {product.categoryName || 'Product'}
              </Typography>
              
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mt: 1, mb: 2, lineHeight: 1.1 }}>
                {product.name}
              </Typography>
              
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, mb: 3 }}>
                ${product.price.toFixed(2)}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                {product.description || 'Premium quality product designed to exceed your expectations.'}
              </Typography>
              
              <Divider sx={{ mb: 4 }} />

              {/* Variants / Sizing (Limited by backend) */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quantity
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock || quantity <= 1}>
                      <RemoveOutlined />
                    </IconButton>
                    <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 600 }}>
                      {quantity}
                    </Typography>
                    <IconButton onClick={() => setQuantity(Math.min(10, quantity + 1))} disabled={isOutOfStock || quantity >= 10}>
                      <AddOutlined />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              <Button 
                fullWidth
                variant="contained" 
                color="primary" 
                size="large"
                disabled={isOutOfStock || adding}
                onClick={handleAddToCart}
                startIcon={<ShoppingCartOutlined />}
                sx={{ py: 2, fontWeight: 700, borderRadius: 2, mb: 2 }}
              >
                {isOutOfStock ? 'Unavailable' : adding ? 'Adding...' : 'Add to Cart'}
              </Button>

              <Button 
                fullWidth
                variant="outlined" 
                color="inherit" 
                startIcon={<StraightenOutlined />}
                onClick={() => setSizeGuideOpen(true)}
                sx={{ py: 1.5, borderRadius: 2, mb: 4 }}
              >
                Size Guide
              </Button>

              {/* Specifications Accordion */}
              <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ px: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>Specifications & Details</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pb: 3, pt: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    SKU: {product.sku}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detailed specifications are not available for this product at this time.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 10, bgcolor: '#fafafa', py: 8 }}>
          <Container maxWidth="xl">
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 6 }}>
              You May Also Like
            </Typography>
            <Grid container spacing={4}>
              {relatedProducts.map((rp) => (
                <Grid key={rp.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCard product={rp} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Size Guide Drawer */}
      <Drawer
        anchor="right"
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '100%', maxWidth: 400, p: 4 } }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Size Guide</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Official brand size charts are currently unavailable. Please refer to general sizing guidelines below.
        </Typography>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>General Clothing Sizing</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>• Small: 34-36" Chest</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>• Medium: 38-40" Chest</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>• Large: 42-44" Chest</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>• X-Large: 46-48" Chest</Typography>

        <Button variant="outlined" fullWidth onClick={() => setSizeGuideOpen(false)} sx={{ mt: 'auto' }}>
          Close
        </Button>
      </Drawer>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetailPage;
