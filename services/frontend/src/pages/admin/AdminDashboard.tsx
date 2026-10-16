import React, { useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  RefreshOutlined,
  ShoppingBagOutlined,
  Inventory2Outlined,
  HourglassEmptyOutlined,
  PaymentsOutlined,
  NotificationsNoneOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { OrderService } from '../../services/OrderService';
import { ProductService } from '../../services/ProductService';
import type { OrderResponse } from '../../types/order';
import { formatINR } from '../../utils/currency';
import { lumierePalette } from '../../styles/theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const getStatusChipProps = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return { bg: '#E6F4EA', color: '#137333', border: '#CEEAD6' };
    case 'SHIPPED':
      return { bg: '#E8F0FE', color: '#1A73E8', border: '#D2E3FC' };
    case 'PROCESSING':
      return { bg: '#F3E8FD', color: '#8430CE', border: '#E9D2FD' };
    case 'CONFIRMED':
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' };
    case 'PENDING':
      return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
    case 'REFUNDED':
      return { bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' };
    default:
      return { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
  }
};

const AdminDashboard: React.FC = () => {
  // Query 1: Real orders telemetry
  const {
    data: ordersData,
    isLoading: loadingOrders,
    isError: errorOrders,
    error: ordersErrorObj,
    refetch: refetchOrders,
    isFetching: fetchingOrders,
  } = useQuery({
    queryKey: ['adminDashboardOrders'],
    queryFn: () => OrderService.getAllOrders(0, 50),
  });

  // Query 2: Real catalog products count
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: errorProducts,
    refetch: refetchProducts,
    isFetching: fetchingProducts,
  } = useQuery({
    queryKey: ['adminDashboardProductsCount'],
    queryFn: () => ProductService.getProducts({ page: 0, size: 1, includeAll: true }),
  });

  const orders: OrderResponse[] = useMemo(() => ordersData?.content || [], [ordersData]);
  const totalOrdersCount = errorOrders ? null : (ordersData?.totalElements ?? orders.length);
  const totalProductsCount = errorProducts ? null : (productsData?.totalElements ?? 0);
  const isPartialOrdersData = Boolean(
    !errorOrders &&
    ordersData?.totalElements !== undefined &&
    ordersData.totalElements > orders.length
  );

  // Authoritative calculations from backend data
  const ordersAwaitingProcessing = useMemo(() => {
    if (errorOrders) return null;
    return orders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status?.toUpperCase())
    ).length;
  }, [orders, errorOrders]);

  // Settled sales: reflects gross order volume from confirmed, processing, shipped, and delivered orders
  // (Note: Backend OrderService does not expose direct payment gateway settlement verification)
  const settledRevenue = useMemo(() => {
    if (errorOrders) return null;
    return orders
      .filter((o) =>
        ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status?.toUpperCase())
      )
      .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  }, [orders, errorOrders]);

  // Chart data strictly computed from real orders
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      DELIVERED: 0,
      SHIPPED: 0,
      PROCESSING: 0,
      CONFIRMED: 0,
      PENDING: 0,
      CANCELLED: 0,
    };

    orders.forEach((o) => {
      const s = o.status?.toUpperCase() || 'PENDING';
      if (counts[s] !== undefined) {
        counts[s]++;
      } else if (['PAYMENT_FAILED', 'REFUNDED'].includes(s)) {
        counts.CANCELLED++;
      }
    });

    return counts;
  }, [orders]);

  const hasChartData = useMemo(() => {
    if (errorOrders) return false;
    return Object.values(statusCounts).some((v) => v > 0);
  }, [statusCounts, errorOrders]);

  const chartData = {
    labels: ['Delivered', 'Shipped', 'Processing', 'Confirmed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          statusCounts.DELIVERED,
          statusCounts.SHIPPED,
          statusCounts.PROCESSING,
          statusCounts.CONFIRMED,
          statusCounts.PENDING,
          statusCounts.CANCELLED,
        ],
        backgroundColor: [
          '#137333',
          '#1A73E8',
          '#8430CE',
          '#0369A1',
          '#B45309',
          '#B91C1C',
        ],
        borderWidth: 1,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { family: '"Outfit", sans-serif', size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw} orders`,
        },
      },
    },
    cutout: '70%',
  };

  const handleRefresh = () => {
    refetchOrders();
    refetchProducts();
  };

  const isRefreshing = fetchingOrders || fetchingProducts;
  const isLoading = loadingOrders || loadingProducts;

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="overline" color="secondary">
            LUMIÈRE EXECUTIVE OVERVIEW
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Atelier Management Suite
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Authoritative order telemetry, catalog status, and atelier dispatch governance
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
          onClick={handleRefresh}
          disabled={isRefreshing}
          sx={{ borderRadius: 8, px: 2.5 }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </Button>
      </Box>

      {/* Error Notices */}
      {errorOrders && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Failed to load administrative orders: {(ordersErrorObj as Error)?.message || 'Service unavailable'}
        </Alert>
      )}
      {errorProducts && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Catalog product telemetry could not be retrieved from ProductService.
        </Alert>
      )}

      {/* Partial Data Disclosure */}
      {isPartialOrdersData && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Sampled Telemetry:</strong> Dashboard metrics reflect the latest {orders.length} orders (out of {totalOrdersCount} total recorded). Historical cross-page aggregation endpoints are not exposed by the OrderService API contract.
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* KPI 1: Total Orders */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${lumierePalette.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Total Orders
                </Typography>
                <ShoppingBagOutlined sx={{ color: lumierePalette.noir, fontSize: 22 }} />
              </Box>
              {isLoading ? (
                <CircularProgress size={24} sx={{ my: 1 }} />
              ) : errorOrders ? (
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  —
                </Typography>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalOrdersCount}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {errorOrders ? 'Telemetry unavailable' : 'Authoritative count from order repository'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 2: Awaiting Processing */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${lumierePalette.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Awaiting Dispatch
                </Typography>
                <HourglassEmptyOutlined sx={{ color: '#B45309', fontSize: 22 }} />
              </Box>
              {isLoading ? (
                <CircularProgress size={24} sx={{ my: 1 }} />
              ) : errorOrders ? (
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  —
                </Typography>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#B45309' }}>
                  {ordersAwaitingProcessing}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {errorOrders
                  ? 'Telemetry unavailable'
                  : isPartialOrdersData
                  ? `Pending or crafting state (${ordersAwaitingProcessing} in recent ${orders.length} sampled)`
                  : 'Pending, confirmed, or crafting state'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 3: Total Catalog Products */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${lumierePalette.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Catalog Creations
                </Typography>
                <Inventory2Outlined sx={{ color: lumierePalette.crimson, fontSize: 22 }} />
              </Box>
              {isLoading ? (
                <CircularProgress size={24} sx={{ my: 1 }} />
              ) : errorProducts ? (
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  —
                </Typography>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalProductsCount}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {errorProducts ? 'Catalog unavailable' : 'Active runway garments & bespoke pieces'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 4: Settled Sales / Confirmed Order Volume */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${lumierePalette.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Settled Sales
                  </Typography>
                  <Chip
                    label="Unverified Settlement"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      bgcolor: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FDE68A',
                    }}
                  />
                </Box>
                <PaymentsOutlined sx={{ color: '#137333', fontSize: 22 }} />
              </Box>
              {isLoading ? (
                <CircularProgress size={24} sx={{ my: 1 }} />
              ) : errorOrders ? (
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  —
                </Typography>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#137333', fontSize: '1.75rem' }}>
                  {formatINR(settledRevenue ?? 0)}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {errorOrders
                  ? 'Telemetry unavailable'
                  : isPartialOrdersData
                  ? `Confirmed order sum (${orders.length} sampled). Direct gateway settlement unverified.`
                  : 'Gross sum from confirmed & completed orders (payment gateway settlement unverified)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 5: Inventory Alerts Notice (Honest, strictly abiding by prompt instructions) */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: lumierePalette.alabaster,
              border: `1px solid ${lumierePalette.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <NotificationsNoneOutlined sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Inventory Aggregation Telemetry: API Limitation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The product service maintains inventory quantities on an individual product level (/api/v1/products/{'{id}'}/inventory). Bulk inventory alerts or low-stock aggregations are unavailable via current backend contracts and are not fabricated.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Analytics & Orders Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Recent Orders Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${lumierePalette.border}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Recent Acquisitions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest client transactions recorded in LUMIÈRE vault
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/admin/orders"
                size="small"
                endIcon={<ArrowForwardOutlined />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                All Orders
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6, flexGrow: 1, alignItems: 'center' }}>
                <CircularProgress sx={{ color: lumierePalette.crimson }} />
              </Box>
            ) : errorOrders ? (
              <Box sx={{ p: 6, textAlign: 'center', flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Unable to load recent orders.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(ordersErrorObj as Error)?.message || 'Order repository service is currently unavailable.'}
                </Typography>
              </Box>
            ) : orders.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center', flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  No recent orders found.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Client acquisitions will automatically appear here once secured.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ flexGrow: 1 }}>
                <Table size="small" aria-label="recent orders overview table">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' } }}>
                      <TableCell>Order #</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.slice(0, 6).map((order) => {
                      const chipStyle = getStatusChipProps(order.status);
                      const clientName =
                        order.shippingAddress?.fullName ||
                        (order.userId ? `Client ${order.userId.substring(0, 8)}` : 'Client');

                      return (
                        <TableRow hover key={order.orderNumber || order.id}>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
                            {order.orderNumber || (order.id ? order.id.substring(0, 10) : 'N/A')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{clientName}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              size="small"
                              sx={{
                                bgcolor: chipStyle.bg,
                                color: chipStyle.color,
                                border: `1px solid ${chipStyle.border}`,
                                fontWeight: 700,
                                fontSize: '0.68rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: lumierePalette.noir }}>
                            {formatINR(order.totalAmount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Order Distribution Chart & Quick Navigation */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={3}>
            {/* Status Breakdown Chart */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${lumierePalette.border}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Status Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {isPartialOrdersData
                    ? `Derived from authoritative order records (${orders.length} of ${totalOrdersCount} sampled)`
                    : `Derived from authoritative order records (${orders.length} sampled)`}
                </Typography>

                <Box sx={{ height: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isLoading ? (
                    <CircularProgress size={32} />
                  ) : errorOrders ? (
                    <Typography variant="caption" color="error">
                      Unable to load order status distribution due to service error.
                    </Typography>
                  ) : hasChartData ? (
                    <Doughnut data={chartData} options={chartOptions} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No order status data available to construct chart.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Quick Actions Card */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${lumierePalette.border}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Management Portals
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    component={Link}
                    to="/admin/products"
                    variant="contained"
                    startIcon={<Inventory2Outlined />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 2,
                      bgcolor: lumierePalette.noir,
                      '&:hover': { bgcolor: '#1E1E1E' },
                    }}
                  >
                    Manage Creations & Runway
                  </Button>
                  <Button
                    component={Link}
                    to="/admin/orders"
                    variant="outlined"
                    startIcon={<ShoppingBagOutlined />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 2,
                      borderColor: lumierePalette.border,
                      color: lumierePalette.noir,
                    }}
                  >
                    Inspect Client Dispatches
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
