import React, { useState } from 'react';
import { Grid, Typography, Container, Box, CircularProgress, Pagination, TextField } from '@mui/material';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';

const ProductListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, isError, error } = useProducts({ 
    page, 
    size: 12,
    search: search || undefined
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Latest Products
        </Typography>
        <TextField
          size="small"
          label="Search products..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" variant="h6" align="center">
          {(error as any)?.response?.data?.message || 'Failed to load products'}
        </Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {data?.content.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          
          {data && data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={data.totalPages} 
                page={page + 1} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductListPage;
