import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress } from '@mui/material';
import { OrderService } from '../../services/OrderService';
import type { OrderResponse } from '../../types/order';
import { formatINR } from '../../utils/currency';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getAllOrders();
        setOrders(data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      
      <Grid container spacing={4}>
        <Grid size={{xs: 12}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Global Recent Orders</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : orders.length === 0 ? (
              <Typography>No recent orders found.</Typography>
            ) : (
              orders.slice(0, 5).map(order => (
                <Box key={order.orderNumber || order.id || order.orderId} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', py: 2 }}>
                  <Typography>Order #{order.orderNumber || (order.id ? order.id.substring(0, 8) : 'N/A')}</Typography>
                  <Typography>{order.status}</Typography>
                  <Typography color="primary">{formatINR(order.totalAmount)}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;


