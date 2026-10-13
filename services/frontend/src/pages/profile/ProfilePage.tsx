import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Tabs, Tab, CircularProgress, Divider, Chip, Stack, Alert, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { OrderService } from '../../services/OrderService';
import type { OrderResponse } from '../../types/order';
import { formatINR } from '../../utils/currency';
import { AddressBookSection } from '../../components/profile/AddressBookSection';
import { OrderTrackingModal } from '../../components/order/OrderTrackingModal';
import { 
  CheckCircle, 
  Inventory2Outlined, 
  LocalShippingOutlined, 
  HomeOutlined, 
  CancelOutlined, 
  AccountCircleOutlined,
  ShoppingBagOutlined,
  VerifiedUserOutlined,
  TimelineOutlined,
  LocationCityOutlined
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: { xs: 2.5, md: 4 } }}>{children}</Box>}
    </div>
  );
}

// Stage mapping strictly backed by real OrderStatus enum
const STAGES = [
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PROCESSING', label: 'In Atelier', icon: Inventory2Outlined },
  { key: 'SHIPPED', label: 'Dispatched', icon: LocalShippingOutlined },
  { key: 'DELIVERED', label: 'Delivered', icon: HomeOutlined },
];

const getStageIndex = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return 0;
    case 'CONFIRMED': return 1;
    case 'PROCESSING': return 2;
    case 'SHIPPED': return 3;
    case 'DELIVERED': return 4;
    default: return -1;
  }
};

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<{ id: string; number: string } | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await OrderService.getUserOrders();
      setOrders(data.content || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (tabValue === 2) {
      fetchOrders();
    }
  }, [tabValue]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Dossier Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
            PRIVATE CLIENT DOSSIER
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: 'secondary.main' }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maison Account & Order Portfolio
          </Typography>
        </Box>

        <Chip 
          icon={<VerifiedUserOutlined sx={{ color: '#B89758 !important' }} />}
          label="LUMIÈRE CONNOISSEUR"
          sx={{ 
            bgcolor: '#181816', 
            color: '#B89758', 
            fontWeight: 700, 
            letterSpacing: '0.12em',
            py: 2.2,
            px: 1,
            borderRadius: 1,
            border: '1px solid #B89758'
          }}
        />
      </Box>
      
      <Paper 
        elevation={0}
        className="lumiere-card"
        sx={{ 
          width: '100%', 
          bgcolor: '#FFFFFF', 
          border: '1px solid #EAE5DC', 
          borderRadius: 2, 
          overflow: 'hidden' 
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: '#EAE5DC', bgcolor: '#FAF8F5' }}>
          <Tabs 
            value={tabValue} 
            onChange={(_e, newValue) => setTabValue(newValue)} 
            aria-label="profile tabs"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                py: 2
              }
            }}
          >
            <Tab icon={<AccountCircleOutlined />} iconPosition="start" label="Client Profile" />
            <Tab icon={<LocationCityOutlined />} iconPosition="start" label="Address Dossier" />
            <Tab icon={<ShoppingBagOutlined />} iconPosition="start" label={`Order History ${orders.length > 0 ? `(${orders.length})` : ''}`} />
          </Tabs>
        </Box>

        {/* Tab 1: Profile Info */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 3, bgcolor: '#FAF8F5', border: '1px solid #EAE5DC', borderRadius: 1.5, height: '100%' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.15em' }}>
                  IDENTITY & CONTACT
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#EAE5DC' }} />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Client Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#EAE5DC' }} />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      System Identifier
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {user.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 3, bgcolor: '#FAF8F5', border: '1px solid #EAE5DC', borderRadius: 1.5, height: '100%' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.15em' }}>
                  MEMBERSHIP & PRIVILEGES
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Assigned Roles
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {user.roles.map(role => (
                        <Chip 
                          key={role} 
                          label={role} 
                          size="small" 
                          sx={{ 
                            bgcolor: role.includes('ADMIN') ? '#181816' : '#B89758', 
                            color: '#FFFFFF',
                            fontWeight: 600,
                            fontSize: '0.75rem' 
                          }} 
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Divider sx={{ borderColor: '#EAE5DC' }} />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Account Standing
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Active • In Good Standing
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#EAE5DC' }} />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Data Isolation & Security
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Protected by JWT bearer verification and isolated tenant boundary. Password hashed with cryptographic salt.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Address Dossier */}
        <TabPanel value={tabValue} index={1}>
          <AddressBookSection />
        </TabPanel>

        {/* Tab 3: Order History */}
        <TabPanel value={tabValue} index={2}>
          {loadingOrders ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
              <Typography variant="caption" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Retrieving your order records...
              </Typography>
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
                NO ARCHIVED TRANSACTIONS
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', mt: 1, mb: 2 }}>
                Your Order Ledger is Empty
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 4 }}>
                When you acquire pieces from LUMIÈRE, your serialized orders and real-time fulfillment timeline will appear here.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={4}>
              {orders.map((order) => {
                const orderNum = order.orderNumber || order.id || order.orderId;
                const status = (order.status || 'PENDING').toUpperCase();
                const stageIdx = getStageIndex(status);
                const isTerminated = ['CANCELLED', 'PAYMENT_FAILED', 'REFUNDED'].includes(status);

                return (
                  <Paper 
                    key={orderNum} 
                    elevation={0}
                    sx={{ 
                      p: { xs: 2.5, md: 3.5 }, 
                      bgcolor: '#FFFFFF', 
                      border: '1px solid #EAE5DC', 
                      borderRadius: 1.5,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Order Metadata Row */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.1em' }}>
                          ORDER REFERENCE
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                          #{orderNum}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          TOTAL INVESTMENT
                        </Typography>
                        <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'primary.main' }}>
                          {formatINR(order.totalAmount ?? 0)}
                        </Typography>
                        <Chip 
                          label={status} 
                          size="small" 
                          sx={{ 
                            mt: 0.5,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            fontSize: '0.7rem',
                            bgcolor: isTerminated ? '#C0392B' : status === 'DELIVERED' ? '#27AE60' : '#181816',
                            color: isTerminated ? '#FFFFFF' : status === 'DELIVERED' ? '#FFFFFF' : '#B89758'
                          }} 
                        />
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<TimelineOutlined sx={{ fontSize: '15px !important' }} />}
                            onClick={() => setTrackingOrder({ id: order.id || order.orderId || '', number: orderNum || 'N/A' })}
                            sx={{
                              color: '#8C6D2B',
                              borderColor: '#B89758',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              letterSpacing: '0.06em',
                              py: 0.3,
                              px: 1,
                              '&:hover': { borderColor: '#8C6D2B', bgcolor: 'rgba(184, 151, 88, 0.08)' }
                            }}
                          >
                            Live Tracking Dossier
                          </Button>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2.5, borderColor: '#EAE5DC' }} />

                    {/* Real Order Timeline (Backed strictly by backend status) */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 2 }}>
                        Fulfillment Trajectory (Real Persisted Status)
                      </Typography>

                      {isTerminated ? (
                        <Alert 
                          severity="warning" 
                          icon={<CancelOutlined />}
                          sx={{ bgcolor: '#FAF8F5', border: '1px solid #EAE5DC' }}
                        >
                          Order state is permanently marked as <strong>{status}</strong>. No further delivery stages will occur.
                        </Alert>
                      ) : (
                        <Grid container spacing={1} sx={{ pt: 1, pb: 2 }}>
                          {STAGES.map((stg, idx) => {
                            const isCompleted = stageIdx > idx + 1;
                            const isCurrent = stageIdx === idx + 1;
                            const IconComponent = stg.icon;

                            return (
                              <Grid key={stg.key} size={{ xs: 6, sm: 3 }}>
                                <Box 
                                  sx={{ 
                                    p: 1.5, 
                                    borderRadius: 1, 
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: isCurrent ? '#B89758' : isCompleted ? '#27AE60' : '#EAE5DC',
                                    bgcolor: isCurrent ? 'rgba(184, 151, 88, 0.08)' : isCompleted ? 'rgba(39, 174, 96, 0.05)' : '#FAFAFA',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <IconComponent 
                                    sx={{ 
                                      fontSize: 24, 
                                      color: isCurrent ? '#B89758' : isCompleted ? '#27AE60' : '#B0A89C',
                                      mb: 0.5 
                                    }} 
                                  />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      display: 'block', 
                                      fontWeight: isCurrent ? 700 : 500,
                                      color: isCurrent ? 'secondary.main' : isCompleted ? 'text.primary' : 'text.secondary',
                                      letterSpacing: '0.05em'
                                    }}
                                  >
                                    {stg.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isCurrent ? 'primary.main' : 'text.secondary' }}>
                                    {isCompleted ? '✓ Completed' : isCurrent ? '● In Progress' : 'Pending'}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </Box>

                    {/* Items Purchased Breakdown */}
                    <Box sx={{ p: 2, bgcolor: '#FAF8F5', borderRadius: 1, border: '1px solid #EAE5DC' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1.5 }}>
                        Acquired Atelier Pieces ({order.items?.length || 0})
                      </Typography>
                      <Stack spacing={1}>
                        {order.items?.map((item, idx) => (
                          <Box key={item.productId || idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.quantity}x {item.name || item.productName || 'LUMIÈRE Selected Item'}
                              </Typography>
                              {item.sku && (
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                  SKU: {item.sku}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                              {formatINR((item.price ?? 0) * (item.quantity ?? 1))}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </TabPanel>
      </Paper>

      <OrderTrackingModal
        open={!!trackingOrder}
        orderId={trackingOrder?.id || null}
        orderNumber={trackingOrder?.number || null}
        onClose={() => setTrackingOrder(null)}
        onStatusChanged={fetchOrders}
      />
    </Container>
  );
};

export default ProfilePage;




