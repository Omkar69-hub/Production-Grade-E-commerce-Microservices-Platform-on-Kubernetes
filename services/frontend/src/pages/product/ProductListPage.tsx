import React, { useState, useEffect } from 'react';
import { Grid, Typography, Container, Box, Pagination, Skeleton, Button, alpha, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, IconButton, FormControl, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { SearchOffOutlined, ArrowForwardOutlined, FilterList as FilterListIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '../../hooks/useProducts';
import { ProductService } from '../../services/ProductService';
import ProductCard from '../../components/product/ProductCard';

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 0);
  
  const search = searchParams.get('search') || undefined;
  const categoryId = searchParams.get('categoryId') || undefined;
  const sort = searchParams.get('sort') || 'desc'; // desc = Newest, asc = Oldest

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    setPage(urlPage > 0 ? urlPage : 0);
  }, [searchParams]);
  
  const { data, isLoading, isError, error } = useProducts({ 
    page, 
    size: 12,
    search,
    categoryId,
    sort
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', value.toString());
    navigate(`/?${newParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', event.target.value);
    newParams.set('page', '1');
    navigate(`/?${newParams.toString()}`);
  };

  const handleCategorySelect = (id?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) {
      newParams.set('categoryId', id);
    } else {
      newParams.delete('categoryId');
    }
    newParams.set('page', '1');
    navigate(`/?${newParams.toString()}`);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    navigate('/');
    setMobileFiltersOpen(false);
  };

  const isFiltering = !!search || !!categoryId;
  const currentCategoryName = categories?.find(c => c.id === categoryId)?.name;

  const FilterPanel = (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Filters</Typography>
        {isFiltering && (
          <Button size="small" onClick={clearFilters} color="inherit" sx={{ textDecoration: 'underline' }}>
            Clear All
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Categories
      </Typography>
      <List disablePadding>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            selected={!categoryId} 
            onClick={() => handleCategorySelect()}
            sx={{ borderRadius: 1, '&.Mui-selected': { bgcolor: alpha('#4F46E5', 0.08), color: 'primary.main' } }}
          >
            <ListItemText primary={<Typography sx={{ fontWeight: !categoryId ? 600 : 400 }}>All Products</Typography>} />
            {!categoryId && <CheckIcon fontSize="small" color="primary" />}
          </ListItemButton>
        </ListItem>
        {categories?.map((cat) => (
          <ListItem disablePadding key={cat.id} sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={categoryId === cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              sx={{ borderRadius: 1, '&.Mui-selected': { bgcolor: alpha('#4F46E5', 0.08), color: 'primary.main' } }}
            >
              <ListItemText primary={<Typography sx={{ fontWeight: categoryId === cat.id ? 600 : 400 }}>{cat.name}</Typography>} />
              {categoryId === cat.id && <CheckIcon fontSize="small" color="primary" />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ pb: 8, pt: 0 }}>
      {/* Editorial Hero Section (Only show on first page when not filtering) */}
      {!isFiltering && page === 0 && (
        <Box 
          sx={{ 
            position: 'relative',
            height: { xs: '60vh', md: '75vh' },
            minHeight: 500,
            width: '100%',
            mb: { xs: 6, md: 8 },
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)',
            }
          }}
        >
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ maxWidth: 600, color: 'white' }}>
              <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: '0.1em', mb: 2, display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                NEW ARRIVALS
              </Typography>
              <Typography variant="h1" sx={{ color: 'white', mb: 3, fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.1 }}>
                Elevate Your Everyday.
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, fontWeight: 400, maxWidth: 480, lineHeight: 1.6 }}>
                Discover our meticulously curated collection of premium essentials designed for modern living.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                endIcon={<ArrowForwardOutlined />}
                sx={{ 
                  borderRadius: 0, 
                  px: 4, 
                  py: 1.5, 
                  bgcolor: 'white', 
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                }}
                onClick={() => {
                  window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'smooth' });
                }}
              >
                Shop Collection
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* Category / Search Header */}
      {isFiltering && (
        <Box sx={{ bgcolor: '#fafafa', py: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="xl">
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {search ? `Search: "${search}"` : (currentCategoryName || 'Collection')}
            </Typography>
            <Typography color="text.secondary">
              {data ? `Showing ${data.totalElements} products` : 'Loading...'}
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="xl" sx={{ mt: (!isFiltering && page !== 0) ? 8 : 0 }}>
        {/* Sorting and Mobile Filter Toggle Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
            {!isFiltering && page === 0 ? 'Trending Now' : 'Products'}
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={() => setMobileFiltersOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, borderRadius: 8, borderColor: 'divider', color: 'text.primary' }}
          >
            Filters
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Sort by:</Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={sort}
                onChange={handleSortChange}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: 'background.paper', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Grid container spacing={6}>
          {/* Desktop Sidebar */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            {FilterPanel}
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, md: 9 }}>
            {isLoading ? (
              <Grid container spacing={3}>
                {Array.from(new Array(9)).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Box sx={{ pt: '120%', position: 'relative', mb: 2, borderRadius: 4, overflow: 'hidden' }}>
                      <Skeleton variant="rectangular" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                    </Box>
                    <Skeleton variant="text" height={32} width="80%" />
                    <Skeleton variant="text" height={24} width="40%" />
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2, borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            ) : isError ? (
              <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                  {(error as any)?.response?.data?.message || 'Failed to load products.'}
                </Typography>
                <Button variant="outlined" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </Box>
            ) : (
              <>
                {data?.content.length === 0 ? (
                  <Box sx={{ py: 12, textAlign: 'center', bgcolor: 'white', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                    <SearchOffOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h5" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>No products found</Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                      We couldn't find any products matching your criteria.
                    </Typography>
                    <Button variant="outlined" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {data?.content.map((product) => (
                      <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                )}
                
                {data && data.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 8, md: 10 } }}>
                    <Pagination 
                      count={data.totalPages} 
                      page={page + 1} 
                      onChange={handlePageChange} 
                      color="primary" 
                      size="large"
                      sx={{ 
                        '& .MuiPaginationItem-root': { fontWeight: 600 },
                        '& .Mui-selected': { boxShadow: `0 4px 12px ${alpha('#4F46E5', 0.2)}` }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: '85%', maxWidth: 360, p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setMobileFiltersOpen(false)} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        {FilterPanel}
      </Drawer>
    </Box>
  );
};

export default ProductListPage;
