import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Tabs, Tab, CircularProgress, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { OrderService } from '../../services/OrderService';
import { OrderResponse } from '../../types/order';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (tabValue === 1) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const data = await OrderService.getUserOrders();
          setOrders(data);
        } catch (err) {
          console.error('Failed to fetch orders', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [tabValue]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Account</Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="profile tabs">
          <Tab label="Profile Info" />
          <Tab label="Order History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
              <Typography variant="body1" gutterBottom>{user.firstName}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
              <Typography variant="body1" gutterBottom>{user.lastName}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
              <Typography variant="body1" gutterBottom>{user.email}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Roles</Typography>
              <Typography variant="body1" gutterBottom>{user.roles.join(', ')}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loadingOrders ? (
            <CircularProgress />
          ) : orders.length === 0 ? (
            <Typography>You have no past orders.</Typography>
          ) : (
            orders.map(order => (
              <Paper key={order.orderId} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">Order #{order.orderId}</Typography>
                  <Typography variant="subtitle1" color="primary">${order.totalAmount.toFixed(2)}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Status: {order.status}</Typography>
                <Typography variant="body2" color="text.secondary">Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
                <Box sx={{ mt: 2 }}>
                  {order.items.map(item => (
                    <Typography key={item.productId} variant="body2">
                      {item.quantity}x {item.productName}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            ))
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
