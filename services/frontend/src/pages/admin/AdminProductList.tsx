import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Pagination, Snackbar, Alert
} from '@mui/material';
import { AddOutlined, EditOutlined, DeleteOutlined } from '@mui/icons-material';
import { ProductService } from '../../services/ProductService';
import AdminProductForm from './AdminProductForm';
import type { Product } from '../../types/product';
import { formatINR } from '../../utils/currency';

const AdminProductList: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0); // backend is 0-indexed usually, need to check
  const [pageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: '', type: 'success' });

  // Wait, backend pagination usually takes size and page (0-indexed). Let's use 0-indexed for state, 1-indexed for UI.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminProducts', page, pageSize],
    queryFn: () => ProductService.getProducts({ page, size: pageSize, includeAll: true })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      showNotification('Product deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      showNotification('Failed to delete product', 'error');
    }
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Products</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddOutlined />}
          onClick={handleAddClick}
          sx={{ borderRadius: '20px' }}
        >
          Add Product
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">Failed to load products: {(error as Error).message}</Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader aria-label="products table">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.content.map((product) => (
                    <TableRow hover key={product.id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={product.imageUrl || 'https://placehold.co/100x100?text=No+Image'}
                          alt={product.name}
                          sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                      <TableCell>{product.categoryId}</TableCell>
                      <TableCell align="right">{formatINR(product.price)}</TableCell>
                      <TableCell align="right">{product.status}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleEditClick(product)}>
                          <EditOutlined />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(product.id)}>
                          <DeleteOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
            <Pagination 
              count={data?.totalPages || 1} 
              page={page + 1} 
              onChange={(_, value) => setPage(value - 1)} 
              color="primary" 
            />
          </Box>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Form Dialog */}
      <AdminProductForm 
        open={formOpen} 
        onClose={handleFormClose} 
        product={editingProduct} 
      />

      <Snackbar 
        open={notification.show} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotification({ ...notification, show: false })} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProductList;
