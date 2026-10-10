import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Grid, CircularProgress, Alert
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ProductService } from '../../services/ProductService';
import type { Product } from '../../types/product';

interface AdminProductFormProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  product?: Product;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ open, onClose, product }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    name: '',
    description: '',
    price: 0,
    brand: '',
    categoryId: '',
    status: 'ACTIVE',
    imageUrl: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories()
  });

  useEffect(() => {
    if (product && open) {
      setFormData(product);
      setFormError(null);
    } else if (!product && open) {
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: 0,
        brand: '',
        categoryId: '',
        status: 'ACTIVE',
        imageUrl: '',
      });
      setFormError(null);
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => ProductService.createProduct(data),
    onSuccess: () => {
      onClose(true);
    },
    onError: (error: any) => {
      console.error('Failed to create product:', error);
      setFormError(error?.response?.data?.detail || error?.response?.data?.message || 'Failed to create product. Please try again.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Product>) => ProductService.updateProduct(product!.id, data),
    onSuccess: () => {
      onClose(true);
    },
    onError: (error: any) => {
      console.error('Failed to update product:', error);
      setFormError(error?.response?.data?.detail || error?.response?.data?.message || 'Failed to update product. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                name="sku"
                label="SKU"
                fullWidth
                required
                value={formData.sku}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                name="brand"
                label="Brand"
                fullWidth
                value={formData.brand}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
              <TextField
                name="price"
                label="Price"
                type="number"
                fullWidth
                required
                slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                value={formData.price}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
              <TextField
                name="status"
                label="Status"
                select
                fullWidth
                required
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
              <TextField
                name="categoryId"
                label="Category"
                select
                fullWidth
                required
                value={formData.categoryId}
                onChange={handleChange}
                disabled={loadingCategories}
              >
                {categories?.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
                {!loadingCategories && categories?.length === 0 && (
                  <MenuItem value="" disabled>No categories available</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField
                name="imageUrl"
                label="Image URL"
                fullWidth
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()} color="inherit" disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminProductForm;
