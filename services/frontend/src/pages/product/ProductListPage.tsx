import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, Typography, Container, Box, Pagination, Button, 
  Drawer, Divider, IconButton, FormControl, Select, MenuItem, 
  TextField, Chip, Tabs, Tab 
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { 
  FilterList as FilterListIcon, 
  Close as CloseIcon, DiamondOutlined, VerifiedUserOutlined,
  LocalShippingOutlined, SupportAgentOutlined, CheckroomOutlined,
  StraightenOutlined, Search as SearchIcon, RestartAlt as ResetIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';
import { CLOTHING_CATALOG, toCatalogProduct } from '../../data/clothingCatalogData';
import SizingMatrixModal from '../../components/sizing/SizingMatrixModal';

export const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL Params
  const searchParam = searchParams.get('search') || '';
  const genderParam = searchParams.get('gender') || 'all';
  const brandParam = searchParams.get('brand') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const priceRangeParam = searchParams.get('priceRange') || '';
  const sortParam = searchParams.get('sort') || 'curated';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) - 1;
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 0);

  // Search input state
  const [searchInput, setSearchInput] = useState(searchParam);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sizingModalOpen, setSizingModalOpen] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    setPage(urlPage > 0 ? urlPage : 0);
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch optional backend catalog products
  const { data: apiData } = useProducts({ 
    page: 0, 
    size: 20,
    search: searchParam || undefined,
    brand: brandParam || undefined,
  });

  // Clothing-only API items (excluding electronics)
  const apiClothingProducts = useMemo(() => {
    return (apiData?.content || []).filter((p) => {
      const name = p.name.toLowerCase();
      const cat = (p.categoryName || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const isElectronic = name.includes('phone') || name.includes('electronic') || 
                           cat.includes('electronic') || desc.includes('electronic');
      return !isElectronic;
    });
  }, [apiData]);

  // Verified Atelier Pieces from CLOTHING_CATALOG
  const verifiedProducts = useMemo(() => {
    return CLOTHING_CATALOG.map(toCatalogProduct);
  }, []);

  // Supported Real Filter Options derived from actual catalog data
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(CLOTHING_CATALOG.map((p) => p.brandName)));
    return brands.sort();
  }, []);

  const availableSubcategories = useMemo(() => {
    const subcats = Array.from(new Set(CLOTHING_CATALOG.map((p) => p.subcategory)));
    return subcats.sort();
  }, []);

  const availableSizes = useMemo(() => {
    const sizes = Array.from(new Set(CLOTHING_CATALOG.flatMap((p) => p.availableSizes || [])));
    return sizes.filter(Boolean);
  }, []);

  const availableColors = useMemo(() => {
    const colors = Array.from(new Set(CLOTHING_CATALOG.flatMap((p) => p.colors || [])));
    return colors.filter(Boolean);
  }, []);

  // Combined and filtered catalog
  const filteredProducts = useMemo(() => {
    // 1. Combine verified products and non-duplicate API products
    const combined = [...verifiedProducts];
    for (const apiProd of apiClothingProducts) {
      if (!combined.some((p) => p.id === apiProd.id)) {
        combined.push(apiProd);
      }
    }

    // 2. Filter by Gender / Audience
    let result = combined.filter((p) => {
      if (genderParam === 'all') return true;

      let pAudience = '';
      try {
        if (p.attributes) {
          const parsed = JSON.parse(p.attributes);
          pAudience = (parsed.audience || '').toLowerCase();
        }
      } catch {}

      const text = `${p.name} ${p.description || ''} ${p.categoryName || ''}`.toLowerCase();
      if (genderParam === 'women') {
        return pAudience === 'women' || text.includes('women') || text.includes('saree') || text.includes('lehenga');
      }
      if (genderParam === 'men') {
        return pAudience === 'men' || text.includes('men') || text.includes('sherwani') || text.includes('bandhgala') || text.includes('suit');
      }
      if (genderParam === 'kids') {
        return pAudience === 'kids' || text.includes('kid') || text.includes('child') || text.includes('anarkali set');
      }
      return true;
    });

    // 3. Filter by Search Query
    if (searchParam) {
      const q = searchParam.toLowerCase();
      result = result.filter((p) => {
        let attrText = '';
        try {
          if (p.attributes) {
            const parsed = JSON.parse(p.attributes);
            attrText = `${parsed.fabric || ''} ${parsed.subcategory || ''} ${parsed.colors || ''}`.toLowerCase();
          }
        } catch {}

        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.categoryName || '').toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          attrText.includes(q)
        );
      });
    }

    // 4. Filter by Brand
    if (brandParam) {
      const bQuery = brandParam.toLowerCase();
      result = result.filter((p) => (p.brand || '').toLowerCase() === bQuery);
    }

    // 5. Filter by Subcategory
    if (subcategoryParam) {
      const subQuery = subcategoryParam.toLowerCase();
      result = result.filter((p) => (p.categoryName || '').toLowerCase() === subQuery);
    }

    // 6. Filter by Size
    if (sizeParam) {
      result = result.filter((p) => {
        try {
          if (p.attributes) {
            const parsed = JSON.parse(p.attributes);
            return (parsed.sizes || '').includes(sizeParam);
          }
        } catch {}
        return false;
      });
    }

    // 7. Filter by Color
    if (colorParam) {
      result = result.filter((p) => {
        try {
          if (p.attributes) {
            const parsed = JSON.parse(p.attributes);
            return (parsed.colors || '').includes(colorParam);
          }
        } catch {}
        return false;
      });
    }

    // 8. Filter by Price Range
    if (priceRangeParam) {
      result = result.filter((p) => {
        const price = p.price;
        if (priceRangeParam === 'inquiry') {
          return price === 0;
        }
        if (priceRangeParam === 'under-50k') {
          return price > 0 && price < 50000;
        }
        if (priceRangeParam === '50k-150k') {
          return price >= 50000 && price <= 150000;
        }
        if (priceRangeParam === '150k-300k') {
          return price > 150000 && price <= 300000;
        }
        if (priceRangeParam === 'above-300k') {
          return price > 300000;
        }
        return true;
      });
    }

    // 9. Sort
    result = [...result].sort((a, b) => {
      if (sortParam === 'price-asc') {
        // Place price on inquiry (0) at the end
        if (a.price === 0 && b.price > 0) return 1;
        if (b.price === 0 && a.price > 0) return -1;
        return a.price - b.price;
      }
      if (sortParam === 'price-desc') {
        if (a.price === 0 && b.price > 0) return 1;
        if (b.price === 0 && a.price > 0) return -1;
        return b.price - a.price;
      }
      if (sortParam === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortParam === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      // 'curated' default order
      return 0;
    });

    return result;
  }, [
    verifiedProducts,
    apiClothingProducts,
    genderParam,
    searchParam,
    brandParam,
    subcategoryParam,
    sizeParam,
    colorParam,
    priceRangeParam,
    sortParam,
  ]);

  // Pagination slice (12 items per page)
  const pageSize = 12;
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = page * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page]);

  // URL updating helper
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    navigate(`/products?${newParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim() || null);
  };

  const clearAllFilters = () => {
    navigate('/products');
    setSearchInput('');
    setMobileFiltersOpen(false);
  };

  const isFiltering = Boolean(
    searchParam || (genderParam && genderParam !== 'all') || brandParam || 
    subcategoryParam || sizeParam || colorParam || priceRangeParam
  );

  const activeGenderLabel = 
    genderParam === 'women' ? "Women's Haute Couture & Pret" :
    genderParam === 'men' ? "Men's Sartorial & Festive" :
    genderParam === 'kids' ? "Kids' Heritage & Festive" : "All Signature Collections";

  // Filter Panel Component for Sidebar & Mobile Drawer
  const FilterPanel = (
    <Box sx={{ width: '100%' }}>
      {/* Search by Keyword */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#181816', display: 'block', mb: 1 }}>
          SEARCH REPERTOIRE
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search piece or atelier..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ bgcolor: '#FFFFFF', borderRadius: 1 }}
          />
          <IconButton type="submit" sx={{ bgcolor: '#181816', color: '#FFFFFF', '&:hover': { bgcolor: '#E50914' } }}>
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 3, borderColor: '#EAE5DC' }} />

      {/* Brand / Atelier Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#181816', display: 'block', mb: 1 }}>
          MAISON / ATELIER
        </Typography>
        <FormControl size="small" fullWidth>
          <Select
            value={brandParam}
            onChange={(e) => updateFilter('brand', e.target.value)}
            displayEmpty
            sx={{ bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="">All Luxury Maisons ({availableBrands.length})</MenuItem>
            {availableBrands.map((b) => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Subcategory / Silhouette Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#181816', display: 'block', mb: 1 }}>
          SILHOUETTE / CATEGORY
        </Typography>
        <FormControl size="small" fullWidth>
          <Select
            value={subcategoryParam}
            onChange={(e) => updateFilter('subcategory', e.target.value)}
            displayEmpty
            sx={{ bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="">All Silhouettes</MenuItem>
            {availableSubcategories.map((sub) => (
              <MenuItem key={sub} value={sub}>{sub}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Sizing Filter (Only supported sizes) */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#181816' }}>
            SIZING BENCHMARK
          </Typography>
          <Button 
            size="small" 
            startIcon={<StraightenOutlined sx={{ fontSize: 14 }} />}
            onClick={() => setSizingModalOpen(true)}
            sx={{ p: 0, fontSize: '0.72rem', color: '#B89758', textTransform: 'none' }}
          >
            Matrix Guide
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          <Chip
            label="All Sizes"
            size="small"
            clickable
            color={!sizeParam ? 'primary' : 'default'}
            onClick={() => updateFilter('size', null)}
            sx={{ fontWeight: 600 }}
          />
          {availableSizes.map((sz) => (
            <Chip
              key={sz}
              label={sz}
              size="small"
              clickable
              color={sizeParam === sz ? 'primary' : 'default'}
              variant={sizeParam === sz ? 'filled' : 'outlined'}
              onClick={() => updateFilter('size', sizeParam === sz ? null : sz)}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>
      </Box>

      {/* Color Filter (Only supported colors) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#181816', display: 'block', mb: 1 }}>
          COLOR PALETTE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          <Chip
            label="All Colors"
            size="small"
            clickable
            color={!colorParam ? 'primary' : 'default'}
            onClick={() => updateFilter('color', null)}
            sx={{ fontWeight: 600 }}
          />
          {availableColors.map((col) => (
            <Chip
              key={col}
              label={col}
              size="small"
              clickable
              color={colorParam === col ? 'primary' : 'default'}
              variant={colorParam === col ? 'filled' : 'outlined'}
              onClick={() => updateFilter('color', colorParam === col ? null : col)}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
      </Box>

      {/* Price Range Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#181816', display: 'block', mb: 1 }}>
          INVESTMENT / PRICE (INR)
        </Typography>
        <FormControl size="small" fullWidth>
          <Select
            value={priceRangeParam}
            onChange={(e) => updateFilter('priceRange', e.target.value)}
            displayEmpty
            sx={{ bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="">All Price Brackets</MenuItem>
            <MenuItem value="under-50k">Under ₹50,000</MenuItem>
            <MenuItem value="50k-150k">₹50,000 – ₹1,50,000</MenuItem>
            <MenuItem value="150k-300k">₹1,50,000 – ₹3,00,000</MenuItem>
            <MenuItem value="above-300k">Above ₹3,00,000</MenuItem>
            <MenuItem value="inquiry">Price Upon Inquiry</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Reset Action */}
      {isFiltering && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={clearAllFilters}
          sx={{ borderColor: '#EAE5DC', color: '#181816', mt: 1 }}
        >
          Reset All Filters
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ pb: 10, pt: 0, bgcolor: '#FAF8F5' }}>
      {/* Editorial Hero Section (Only shown on initial page without filters) */}
      {!isFiltering && page === 0 && (
        <Box 
          sx={{ 
            position: 'relative',
            height: { xs: '60vh', md: '72vh' },
            minHeight: 480,
            width: '100%',
            mb: 6,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#181816',
            backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(24, 24, 22, 0.92) 0%, rgba(24, 24, 22, 0.6) 60%, rgba(24, 24, 22, 0.35) 100%)',
            }
          }}
        >
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ maxWidth: 660, color: '#FAF8F5' }}>
              <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.22em', mb: 2, display: 'block' }}>
                LUMIÈRE CLOTHING REPERTOIRE
              </Typography>
              <Typography variant="h1" sx={{ color: '#FAF8F5', mb: 2.5, fontSize: { xs: '2.6rem', sm: '3.6rem', md: '4.4rem' }, lineHeight: 1.1, fontWeight: 700 }}>
                Haute Couture & Heritage Discovery.
              </Typography>
              <Typography variant="body1" sx={{ color: '#D5C8B4', mb: 4, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7 }}>
                Explore curated bridal lehengas, hand-painted sarees, bespoke bandhgalas, and tailored Parisian tuxedos verified across 58 official maisons.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  className="lumiere-red-btn lumiere-pill-btn"
                  onClick={() => {
                    const el = document.getElementById('discovery-catalog');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{ px: 4, py: 1.5, fontFamily: '"Cinzel", serif', fontWeight: 700 }}
                >
                  Explore Collection
                </Button>
                <Button 
                  variant="outlined" 
                  className="lumiere-pill-btn"
                  onClick={() => setSizingModalOpen(true)}
                  startIcon={<StraightenOutlined />}
                  sx={{ borderColor: '#FAF8F5', color: '#FAF8F5', px: 3, py: 1.5, fontWeight: 600 }}
                >
                  Sizing Matrix
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Brand Value Pillars */}
      {!isFiltering && page === 0 && (
        <Container maxWidth="xl" sx={{ mb: 7 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
            gap: 3, 
            py: 3.5, 
            px: { xs: 2, md: 4 },
            bgcolor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #EAE5DC',
            boxShadow: '0 4px 18px rgba(24, 24, 22, 0.03)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DiamondOutlined sx={{ color: '#B89758', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>Atelier Provenance</Typography>
                <Typography variant="caption" sx={{ color: '#6B665E' }}>Verified official brand links</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VerifiedUserOutlined sx={{ color: '#B89758', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>Authentic INR Pricing</Typography>
                <Typography variant="caption" sx={{ color: '#6B665E' }}>Published atelier retail or inquiry</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalShippingOutlined sx={{ color: '#B89758', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>Direct Brand Checkout</Typography>
                <Typography variant="caption" sx={{ color: '#6B665E' }}>0% intermediary markup</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SupportAgentOutlined sx={{ color: '#B89758', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>Client Concierge</Typography>
                <Typography variant="caption" sx={{ color: '#6B665E' }}>Precision sizing assistance</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {/* Main Discovery Container */}
      <Container maxWidth="xl" id="discovery-catalog">
        {/* Audience Browsing Section Tabs */}
        <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #EAE5DC', mb: 4 }}>
          <Tabs
            value={genderParam}
            onChange={(_, val) => updateFilter('gender', val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                py: 1.5,
                px: { xs: 2, sm: 3 }
              }
            }}
          >
            <Tab label="All Collections" value="all" />
            <Tab label="Women's Haute Couture & Pret (8)" value="women" />
            <Tab label="Men's Sartorial & Festive (4)" value="men" />
            <Tab label="Kids' Heritage & Festive (2)" value="kids" />
          </Tabs>
        </Box>

        {/* Action Controls & Active Filters Bar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4, 
          pb: 2, 
          borderBottom: '1px solid #EAE5DC' 
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#181816' }}>
              {activeGenderLabel}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B665E', mt: 0.3 }}>
              Displaying {filteredProducts.length} verified signature creation{filteredProducts.length === 1 ? '' : 's'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />} 
              onClick={() => setMobileFiltersOpen(true)}
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                borderColor: '#EAE5DC', color: '#181816',
                py: 0.8
              }}
            >
              Filters
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#6B665E', fontWeight: 600 }}>
                Sort:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={sortParam}
                  onChange={(e: SelectChangeEvent) => updateFilter('sort', e.target.value)}
                  sx={{ bgcolor: '#FFFFFF', borderRadius: 1 }}
                >
                  <MenuItem value="curated">Curated Order</MenuItem>
                  <MenuItem value="price-asc">Price: Low to High</MenuItem>
                  <MenuItem value="price-desc">Price: High to Low</MenuItem>
                  <MenuItem value="name-asc">Name: A to Z</MenuItem>
                  <MenuItem value="name-desc">Name: Z to A</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Active Filter Chips */}
        {isFiltering && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#8C827A' }}>
              ACTIVE FILTERS:
            </Typography>
            {genderParam !== 'all' && (
              <Chip label={`Audience: ${genderParam}`} size="small" onDelete={() => updateFilter('gender', 'all')} />
            )}
            {searchParam && (
              <Chip label={`Search: "${searchParam}"`} size="small" onDelete={() => updateFilter('search', null)} />
            )}
            {brandParam && (
              <Chip label={`Atelier: ${brandParam}`} size="small" onDelete={() => updateFilter('brand', null)} />
            )}
            {subcategoryParam && (
              <Chip label={`Silhouette: ${subcategoryParam}`} size="small" onDelete={() => updateFilter('subcategory', null)} />
            )}
            {sizeParam && (
              <Chip label={`Size: ${sizeParam}`} size="small" onDelete={() => updateFilter('size', null)} />
            )}
            {colorParam && (
              <Chip label={`Color: ${colorParam}`} size="small" onDelete={() => updateFilter('color', null)} />
            )}
            {priceRangeParam && (
              <Chip label={`Price: ${priceRangeParam}`} size="small" onDelete={() => updateFilter('priceRange', null)} />
            )}
            <Button size="small" onClick={clearAllFilters} sx={{ color: '#E50914', fontSize: '0.75rem', p: 0 }}>
              Clear All
            </Button>
          </Box>
        )}

        <Grid container spacing={5}>
          {/* Desktop Filter Sidebar */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ bgcolor: '#FFFFFF', p: 3, borderRadius: '8px', border: '1px solid #EAE5DC', position: 'sticky', top: 120 }}>
              {FilterPanel}
            </Box>
          </Grid>

          {/* Product Cards Area */}
          <Grid size={{ xs: 12, md: 9 }}>
            {filteredProducts.length === 0 ? (
              /* Polished Empty State for Zero Filter Matches */
              <Box sx={{ 
                py: 10, px: 4, textAlign: 'center', bgcolor: '#FFFFFF', 
                borderRadius: '8px', border: '1px solid #EAE5DC',
                boxShadow: '0 4px 20px rgba(24, 24, 22, 0.02)'
              }}>
                <CheckroomOutlined sx={{ fontSize: 60, color: '#E50914', mb: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, mb: 1.5, color: '#181816' }}>
                  No Atelier Pieces Match the Selected Criteria
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B665E', maxWidth: 540, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
                  We could not find items matching your current combination of atelier, size, or price criteria. Try adjusting your constraints or reset your filters to explore our full collection.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={clearAllFilters}
                  className="lumiere-red-btn lumiere-pill-btn"
                  sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.06em', px: 4, py: 1.2 }}
                >
                  Reset All Filters
                </Button>
              </Box>
            ) : (
              <Box>
                <Grid container spacing={3.5}>
                  {paginatedProducts.map((prod) => (
                    <Grid key={prod.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <ProductCard product={prod} />
                    </Grid>
                  ))}
                </Grid>
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page + 1} 
                      onChange={(_, newPage) => {
                        updateFilter('page', newPage.toString());
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }} 
                      color="primary" 
                      size="large"
                      sx={{ 
                        '& .MuiPaginationItem-root': { fontWeight: 600 },
                        '& .Mui-selected': { bgcolor: '#181816 !important', color: '#FAF8F5' }
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 320, p: 3, bgcolor: '#FAF8F5' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700 }}>
            FILTERS
          </Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {FilterPanel}
      </Drawer>

      {/* Sizing Matrix Modal */}
      <SizingMatrixModal
        open={sizingModalOpen}
        onClose={() => setSizingModalOpen(false)}
        initialCategory={genderParam === 'kids' ? 'Kids' : genderParam === 'men' ? 'Men' : 'Women'}
      />
    </Box>
  );
};

export default ProductListPage;
