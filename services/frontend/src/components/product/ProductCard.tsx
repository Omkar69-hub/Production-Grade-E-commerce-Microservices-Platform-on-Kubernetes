import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Button } from '@mui/material';
import { ShoppingCartOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import type { RootState, AppDispatch } from '../../store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cartId } = useSelector((state: RootState) => state.cart);

  const [imgError, setImgError] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering the Link wrapper if any
    if (cartId) {
      dispatch(addToCart({ item: { productId: product.id, quantity: 1 } }));
    }
  };

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const fallbackImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        textDecoration: 'none',
        overflow: 'hidden'
      }}
      component={Link}
      to={`/products/${product.id}`}
    >
      <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden', bgcolor: 'white' }}>
        <CardMedia
          component="img"
          image={imgError ? fallbackImg : (product.imageUrl || fallbackImg)}
          alt={product.name}
          onError={() => setImgError(true)}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'scale(1.08)'
            }
          }}
        />
        {isOutOfStock && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
              Out of Stock
            </Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0, mr: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
            ${product.price.toFixed(2)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description || 'Premium quality product designed to exceed your expectations.'}
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Button 
            fullWidth
            variant={isOutOfStock ? "outlined" : "contained"} 
            color={isOutOfStock ? "inherit" : "primary"}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            startIcon={<ShoppingCartOutlined />}
            sx={{ py: 1.5, fontWeight: 700, borderRadius: '8px' }}
          >
            {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

