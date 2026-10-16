import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Snackbar,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  RefreshOutlined,
  Inventory2Outlined,
} from '@mui/icons-material';
import { ProductService } from '../../services/ProductService';
import AdminProductForm from './AdminProductForm';
import type { Product } from '../../types/product';
import { formatINR } from '../../utils/currency';
import { lumierePalette } from '../../styles/theme';
import { BACKEND_UUID_TO_CATEGORY_SLUG } from '../../utils/categoryMapping';

export const ATELIER_PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" fill="#141414" rx="8"/>
  <rect x="2" y="2" width="96" height="96" stroke="#2C2C2C" stroke-width="1.5" rx="8"/>
  <text x="50%" y="45%" text-anchor="middle" fill="#E50914" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="700" letter-spacing="1.5">LUMIÈRE</text>
  <text x="50%" y="64%" text-anchor="middle" fill="#999999" font-family="'Outfit', sans-serif" font-size="8.5" letter-spacing="0.5">CREATION</text>
</svg>
`)}`;

const getStatusBadgeProps = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return {
        label: 'Active',
        bg: '#E6F4EA',
        color: '#137333',
        border: '#CEEAD6',
      };
    case 'OUT_OF_STOCK':
      return {
        label: 'Out of Stock',
        bg: '#FEE2E2',
        color: '#B91C1C',
        border: '#FECACA',
      };
    case 'INACTIVE':
    default:
      return {
        label: 'Inactive',
        bg: '#F3F4F6',
        color: '#4B5563',
        border: '#E5E7EB',
      };
  }
};

const AdminProductList: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // Fetch categories to resolve human-readable names for backend UUIDs
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
  });

  const categoryLookup = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => {
      if (c.id && c.name) map.set(c.id.toLowerCase(), c.name);
    });
    return map;
  }, [categories]);

  // Fetch products with search and pagination
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['adminProducts', page, pageSize, searchQuery],
    queryFn: () =>
      ProductService.getProducts({
        page,
        size: pageSize,
        search: searchQuery.trim() || undefined,
        includeAll: true,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardOrders'] });
      showNotification('Product deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      showNotification('Failed to delete product', 'error');
    },
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
  };

  const handleAddClick = () => {
    setEditingProduct(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const handleFormClose = (success?: boolean) => {
    setFormOpen(false);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      showNotification(`Product ${editingProduct ? 'updated' : 'created'} successfully`, 'success');
    }
  };

  const resolveCategoryName = (product: Product): string => {
    if (product.categoryName) return product.categoryName;
    if (product.categoryId) {
      const lower = product.categoryId.toLowerCase();
      if (categoryLookup.has(lower)) return categoryLookup.get(lower)!;
      if (BACKEND_UUID_TO_CATEGORY_SLUG[lower]) {
        const slug = BACKEND_UUID_TO_CATEGORY_SLUG[lower];
        return slug.charAt(0).toUpperCase() + slug.slice(1);
      }
    }
    return 'Apparel';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
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
            Catalog Creations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage LUMIÈRE runway garments, atelier editions, and brand referral destinations ({data?.totalElements ?? 0} total creations)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={isFetching ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={handleAddClick}
            sx={{
              borderRadius: 8,
              bgcolor: lumierePalette.noir,
              '&:hover': { bgcolor: '#1E1E1E' },
            }}
          >
            Add Creation
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${lumierePalette.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search creations by name or keyword..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { xs: '100%', sm: 360 } }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, ml: 'auto' }}>
          Showing honest status labels. Inventory levels are maintained per creation ledger.
        </Typography>
      </Paper>

      {/* Main Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress sx={{ color: lumierePalette.crimson }} />
          <Typography variant="body2" color="text.secondary">
            Loading atelier catalog...
          </Typography>
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          Failed to load products: {(error as Error).message}
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: 3,
            border: `1px solid ${lumierePalette.border}`,
          }}
        >
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
            <Table stickyHeader aria-label="admin products table">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: lumierePalette.alabaster, fontWeight: 600, fontSize: '0.85rem' } }}>
                  <TableCell sx={{ width: 80 }}>Image</TableCell>
                  <TableCell>Creation & SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Maison / Brand</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Inventory2Outlined sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        No creations found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No catalog items matched "${searchQuery}".`
                          : 'The product catalog is currently empty.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.content.map((product) => {
                    const badge = getStatusBadgeProps(product.status);
                    const categoryDisplayName = resolveCategoryName(product);

                    return (
                      <TableRow hover key={product.id}>
                        <TableCell>
                          <Box
                            component="img"
                            src={product.imageUrl || ATELIER_PLACEHOLDER_IMAGE}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = ATELIER_PLACEHOLDER_IMAGE;
                            }}
                            alt={product.name}
                            sx={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 2,
                              border: `1px solid ${lumierePalette.border}`,
                              display: 'block',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: lumierePalette.noir }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            {product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categoryDisplayName}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.5,
                              borderColor: lumierePalette.border,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {product.brand || 'LUMIÈRE Atelier'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: lumierePalette.noir }}>
                          {formatINR(product.price)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`Authoritative catalog lifecycle state: ${product.status}`}>
                            <Chip
                              label={badge.label}
                              size="small"
                              sx={{
                                bgcolor: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                letterSpacing: '0.04em',
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Edit Creation">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditClick(product)}
                                aria-label={`Edit ${product.name}`}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Creation">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(product.id)}
                                aria-label={`Delete ${product.name}`}
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Footer */}
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
              Showing page {page + 1} of {data?.totalPages || 1} ({data?.totalElements || 0} total items)
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you wish to delete this creation from the catalog? This operation cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ bgcolor: lumierePalette.crimson, '&:hover': { bgcolor: lumierePalette.crimsonDark } }}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Delete Creation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Form Dialog */}
      <AdminProductForm
        open={formOpen}
        onClose={handleFormClose}
        product={editingProduct}
      />

      {/* Notification Toast */}
      <Snackbar
        open={notification.show}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProductList;
