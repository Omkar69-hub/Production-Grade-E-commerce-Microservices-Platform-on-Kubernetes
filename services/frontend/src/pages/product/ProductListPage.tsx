import React, { useState } from 'react';
import { Grid, Typography, Container, Box, Pagination, TextField, InputAdornment, Skeleton } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 }, mb: 6, borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <Container maxWidth="xl">
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
            Discover Our Collection
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
            Explore the latest premium products tailored just for you.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <TextField
              sx={{ width: '100%', maxWidth: 500 }}
              placeholder="Search for products..."
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '24px', bgcolor: 'var(--bg-color)' }
                }
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {isLoading ? (
          <Grid container spacing={4}>
            {Array.from(new Array(8)).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box sx={{ pt: '100%', position: 'relative', mb: 2, borderRadius: 4, overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                </Box>
                <Skeleton variant="text" height={32} width="80%" />
                <Skeleton variant="text" height={24} width="40%" />
                <Skeleton variant="rounded" height={48} sx={{ mt: 2, borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : isError ? (
          <Typography color="error" variant="h6" align="center" sx={{ py: 10 }}>
            {(error as any)?.response?.data?.message || 'Failed to load products. Please try again later.'}
          </Typography>
        ) : (
          <>
            {data?.content.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <SearchOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" color="text.secondary">No products found matching your search.</Typography>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {data?.content.map((product) => (
                  <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {data && data.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <Pagination 
                  count={data.totalPages} 
                  page={page + 1} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  sx={{ '& .MuiPaginationItem-root': { fontWeight: 600 } }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProductListPage;




