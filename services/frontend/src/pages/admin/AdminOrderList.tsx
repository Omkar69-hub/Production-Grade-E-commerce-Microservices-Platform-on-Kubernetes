import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  SearchOutlined,
  VisibilityOutlined,
  LocalShippingOutlined,
  InfoOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import { OrderService } from '../../services/OrderService';
import type { OrderResponse } from '../../types/order';
import { formatINR } from '../../utils/currency';
import { lumierePalette } from '../../styles/theme';

const getStatusColor = (status: string) => {
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

const AdminOrderList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminAllOrders', page, pageSize],
    queryFn: () => OrderService.getAllOrders(page, pageSize),
  });

  const orders = useMemo(() => data?.content || [], [data]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        order.status?.toUpperCase() === statusFilter.toUpperCase();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesStatus;

      const orderNumberMatch = (order.orderNumber || '').toLowerCase().includes(query);
      const idMatch = (order.id || '').toLowerCase().includes(query);
      const nameMatch = (order.shippingAddress?.fullName || '').toLowerCase().includes(query);
      const cityMatch = (order.shippingAddress?.city || '').toLowerCase().includes(query);

      return matchesStatus && (orderNumberMatch || idMatch || nameMatch || cityMatch);
    });
  }, [orders, statusFilter, searchQuery]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
            Client Orders & Dispatches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Authoritative order telemetry across all client acquisitions ({data?.totalElements ?? 0} total records)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={isFetching ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
          onClick={() => refetch()}
          disabled={isFetching}
          sx={{ borderRadius: 8, px: 2.5 }}
        >
          Refresh Telemetry
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${lumierePalette.border}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder="Filter by Order #, Client, or Destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { xs: '100%', sm: 320 } }}
        />

        <TextField
          select
          size="small"
          label="Order Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          <MenuItem value="PENDING">Pending Verification</MenuItem>
          <MenuItem value="CONFIRMED">Confirmed / Dispatched</MenuItem>
          <MenuItem value="PROCESSING">Atelier Crafting</MenuItem>
          <MenuItem value="SHIPPED">In Transit</MenuItem>
          <MenuItem value="DELIVERED">Delivered to Client</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </TextField>
      </Paper>

      {/* Main Order Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress sx={{ color: lumierePalette.crimson }} />
          <Typography variant="body2" color="text.secondary">
            Retrieving secure order dossier...
          </Typography>
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          Failed to load administrative orders: {(error as Error)?.message || 'Unauthorized or service unavailable'}
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${lumierePalette.border}`,
            overflow: 'hidden',
          }}
        >
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader aria-label="admin client orders table">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: lumierePalette.alabaster, fontWeight: 600, fontSize: '0.85rem' } }}>
                  <TableCell>Order Reference</TableCell>
                  <TableCell>Acquisition Date</TableCell>
                  <TableCell>Client Details</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <LocalShippingOutlined sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        No matching orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'Try adjusting your search criteria or status filter.'
                          : 'No client orders have been recorded in the platform.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusStyle = getStatusColor(order.status);
                    const clientName =
                      order.shippingAddress?.fullName ||
                      (order.userId ? `Client ${order.userId.substring(0, 8)}` : 'Guest Client');
                    const destination = [order.shippingAddress?.city, order.shippingAddress?.country]
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <TableRow hover key={order.id || order.orderNumber}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem' }}>
                          {order.orderNumber || (order.id ? order.id.substring(0, 10) : 'N/A')}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {clientName}
                          </Typography>
                          {destination && (
                            <Typography variant="caption" color="text.secondary">
                              {destination}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: lumierePalette.noir }}>
                          {formatINR(order.totalAmount)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={order.status || 'UNKNOWN'}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1px solid ${statusStyle.border}`,
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              letterSpacing: '0.04em',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Order Dossier">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedOrder(order)}
                              aria-label={`Inspect order ${order.orderNumber || order.id}`}
                              sx={{
                                color: lumierePalette.noir,
                                '&:hover': { bgcolor: lumierePalette.crimsonSubtle, color: lumierePalette.crimson },
                              }}
                            >
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${lumierePalette.border}`,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing page {page + 1} of {data?.totalPages || 1} ({data?.totalElements || 0} total orders)
            </Typography>
            <Pagination
              count={data?.totalPages || 1}
              page={page + 1}
              onChange={(_, value) => setPage(value - 1)}
              color="primary"
              size="small"
            />
          </Box>
        </Paper>
      )}

      {/* Order Detail Modal */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="secondary">
                    ORDER DOSSIER
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedOrder.orderNumber || selectedOrder.id}
                  </Typography>
                </Box>
                <Chip
                  label={selectedOrder.status}
                  size="small"
                  sx={{
                    ...getStatusColor(selectedOrder.status),
                    fontWeight: 700,
                    px: 1,
                  }}
                />
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              {/* Informational Banner on Status Pipeline */}
              <Alert
                icon={<InfoOutlined fontSize="inherit" />}
                severity="info"
                sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem' }}
              >
                <strong>Status Governance:</strong> Order lifecycle state transitions are governed automatically via payment confirmation and atelier dispatch sagas. Manual administrative override endpoints are not exposed by the current backend API contract.
              </Alert>

              <Stack spacing={3}>
                {/* Meta details */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Client & Shipping Address
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.shippingAddress?.fullName || 'Client ' + selectedOrder.userId}
                    </Typography>
                    {selectedOrder.shippingAddress?.street && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.shippingAddress.street}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {[
                        selectedOrder.shippingAddress?.city,
                        selectedOrder.shippingAddress?.state,
                        selectedOrder.shippingAddress?.zipCode,
                        selectedOrder.shippingAddress?.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                    {selectedOrder.shippingAddress?.phoneNumber && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Contact: {selectedOrder.shippingAddress.phoneNumber}
                      </Typography>
                    )}
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Transaction & Settlement
                    </Typography>
                    <Typography variant="body2">
                      <strong>Method:</strong> {selectedOrder.paymentMethod || 'Credit / Luxury Settlement'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Recorded At:</strong> {formatDate(selectedOrder.createdAt)}
                    </Typography>
                    {selectedOrder.notes && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        <strong>Notes:</strong> {selectedOrder.notes}
                      </Typography>
                    )}
                    <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 700, color: lumierePalette.noir }}>
                      Total: {formatINR(selectedOrder.totalAmount)}
                    </Typography>
                  </Paper>
                </Box>

                <Divider />

                {/* Line items table */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Acquired Creations ({selectedOrder.items?.length || 0})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: lumierePalette.alabaster }}>
                        <TableRow>
                          <TableCell>SKU</TableCell>
                          <TableCell>Creation Name</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                              No line items specified.
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedOrder.items.map((item, idx) => (
                            <TableRow key={item.sku || idx}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                {item.sku}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {item.name || item.productName || 'Bespoke Item'}
                              </TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">
                                {formatINR(item.unitPrice ?? item.price ?? 0)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {formatINR(item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1))}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedOrder(null)} variant="contained" color="primary">
                Close Dossier
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminOrderList;
