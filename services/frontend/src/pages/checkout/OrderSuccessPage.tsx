import React from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
        <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Order Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Thank you for your purchase. Your order has been placed successfully.
        </Typography>
        <Box sx={{ my: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="subtitle1">
            Order Number: <strong>{id}</strong>
          </Typography>
        </Box>
        <Button variant="contained" color="primary" component={Link} to="/profile" sx={{ mr: 2 }}>
          View Orders
        </Button>
        <Button variant="outlined" component={Link} to="/">
          Continue Shopping
        </Button>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;
