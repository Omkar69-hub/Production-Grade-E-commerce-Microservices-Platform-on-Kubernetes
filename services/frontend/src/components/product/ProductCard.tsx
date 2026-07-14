import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { RootState, AppDispatch } from '../../store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cartId } = useSelector((state: RootState) => state.cart);

  const handleAddToCart = () => {
    if (cartId) {
      dispatch(addToCart({ cartId, item: { productId: product.id, quantity: 1 } }));
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || 'https://via.placeholder.com/200?text=No+Image'}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'}
        </Typography>
        <Typography variant="h6" color="primary">
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/products/${product.id}`}>
          View Details
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          color="primary" 
          onClick={handleAddToCart}
          disabled={product.status === 'OUT_OF_STOCK'}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
