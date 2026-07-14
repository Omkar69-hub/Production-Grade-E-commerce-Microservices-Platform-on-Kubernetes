import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { OrderService } from '../../services/OrderService';
import { OrderResponse } from '../../types/order';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  useEffect(() => {
    // In a real app, this would be an admin-specific API endpoint (e.g. /api/v1/admin/orders)
    // For demo purposes, we fetch user orders or mock it.
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [1200, 1900, 3000, 5000, 2400, 3200],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const pieData = {
    labels: ['Electronics', 'Clothing', 'Books', 'Home'],
    datasets: [
      {
        label: '# of Sales',
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>Sales by Category</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Orders</Typography>
            {orders.length === 0 ? (
              <Typography>No recent orders found.</Typography>
            ) : (
              orders.slice(0, 5).map(order => (
                <Box key={order.orderId} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', py: 2 }}>
                  <Typography>Order #{order.orderId.substring(0, 8)}...</Typography>
                  <Typography>{order.status}</Typography>
                  <Typography color="primary">${order.totalAmount.toFixed(2)}</Typography>
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
