import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Chip, InputBase,
  FormControl, Select, MenuItem, Pagination, Button
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Search as SearchIcon,
  RestartAlt as ResetIcon, CheckroomOutlined, VerifiedUserOutlined
} from '@mui/icons-material';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../product/ProductCard';
import { ALL_CLOTHING_CATALOG, toCatalogProduct } from '../../data/clothingCatalogData';

export interface DepartmentProductGridProps {
  deptSlug: string;
  deptLabel: string;
  accentColor?: string;
}

export const DepartmentProductGrid: React.FC<DepartmentProductGridProps> = ({
  deptSlug,
  deptLabel,
  accentColor = 'var(--cobalt, #3a3ce0)'
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('curated');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 8;

  // 1. Fetch optional backend products
  const { data: apiData } = useProducts({
    page: 0,
    size: 50
  });

  // 2. Map verified static catalog
  const verifiedProducts = useMemo(() => {
    return ALL_CLOTHING_CATALOG.map(toCatalogProduct);
  }, []);

  // 3. Combine with non-duplicate API products (clothing only)
  const allProducts = useMemo(() => {
    const combined = [...verifiedProducts];
    const apiProds = (apiData?.content || []).filter((p) => {
      const name = p.name.toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const cat = (p.categoryName || '').toLowerCase();
      return !name.includes('phone') && !desc.includes('electronic') && !cat.includes('electronic');
    });

    for (const apiProd of apiProds) {
      const isDuplicate = combined.some((p) => {
        if (p.id === apiProd.id) return true;
        if (p.sku && apiProd.sku && p.sku.toUpperCase() === apiProd.sku.toUpperCase()) return true;
        let pAttr: any = {};
        try { if (p.attributes) pAttr = JSON.parse(p.attributes); } catch {}
        let apiAttr: any = {};
        try { if (apiProd.attributes) apiAttr = JSON.parse(apiProd.attributes); } catch {}
        if (pAttr.uuid && (apiProd.id === pAttr.uuid || apiAttr.uuid === pAttr.uuid)) return true;
        if (apiAttr.frontendId && p.id === apiAttr.frontendId) return true;
        return false;
      });
      if (!isDuplicate) {
        combined.push(apiProd);
      }
    }
    return combined;
  }, [verifiedProducts, apiData]);

  // 4. Department Metadata Matching Logic
  const departmentProducts = useMemo(() => {
    const slug = deptSlug.toLowerCase();

    return allProducts.filter((p) => {
      let attr: any = {};
      try {
        if (p.attributes) attr = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
      } catch {}

      const audience = (attr.audience || (p as any).audience || '').toLowerCase();
      const subcat = (attr.subcategory || (p as any).subcategory || '').toLowerCase();
      const categoryName = (p.categoryName || '').toLowerCase();

      switch (slug) {
        case 'women':
          return audience === 'women' || audience === 'unisex';
        case 'men':
          return audience === 'men' || audience === 'unisex';
        case 'kids':
          return audience === 'kids';
        case 'ethnic': {
          const ethnicSubcats = [
            'bridal lehengas',
            'sarees',
            'heritage festive',
            'sherwanis & bandhgalas',
            'ethnicwear'
          ];
          return (
            ethnicSubcats.includes(subcat) ||
            categoryName.includes('ethnic') ||
            categoryName.includes('traditional') ||
            ['sabyasachi', 'anita dongre', 'manish malhotra', 'tarun tahiliani', 'raw mango', 'manyavar', 'shantnu & nikhil', 'torani', 'biba', 'fabindia', 'w for woman'].includes(
              (p.brand || attr.brandName || '').toLowerCase()
            )
          );
        }
        case 'streetwear':
          return (
            subcat === 'streetwear' ||
            categoryName.includes('streetwear') ||
            ['the souled store', 'bewakoof', 'snitch'].includes((p.brand || attr.brandName || '').toLowerCase())
          );
        case 'gym':
          return (
            subcat === 'gym & activewear' ||
            categoryName.includes('gym') ||
            categoryName.includes('sportswear') ||
            categoryName.includes('activewear') ||
            ['nike', 'adidas', 'puma', 'hrx', 'decathlon', 'coitonic'].includes((p.brand || attr.brandName || '').toLowerCase())
          );
        default:
          return true;
      }
    });
  }, [allProducts, deptSlug]);

  // 5. Dynamic Subcategories available for this department
  const subcategories = useMemo(() => {
    const set = new Set<string>();
    departmentProducts.forEach((p) => {
      let attr: any = {};
      try {
        if (p.attributes) attr = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
      } catch {}
      const sub = attr.subcategory || (p as any).subcategory;
      if (sub) set.add(sub);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [departmentProducts]);

  // 6. Dynamic Brands list available for this department
  const brands = useMemo(() => {
    const set = new Set<string>();
    departmentProducts.forEach((p) => {
      let attr: any = {};
      try {
        if (p.attributes) attr = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
      } catch {}
      const b = p.brand || attr.brandName;
      if (b) set.add(b);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [departmentProducts]);

  // 7. Apply In-Department Filters, Search & Sorting
  const filteredProducts = useMemo(() => {
    let result = departmentProducts.filter((p) => {
      let attr: any = {};
      try {
        if (p.attributes) attr = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
      } catch {}

      // Subcategory Filter
      if (selectedSubcategory !== 'ALL') {
        const sub = attr.subcategory || (p as any).subcategory;
        if (sub !== selectedSubcategory) return false;
      }

      // Brand Filter
      if (selectedBrand !== 'ALL') {
        const b = p.brand || attr.brandName;
        if (b !== selectedBrand) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || attr.brandName || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const fabric = (attr.fabric || '').toLowerCase();
        if (!name.includes(q) && !brand.includes(q) && !desc.includes(q) && !fabric.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'brand-asc') {
        const brandA = a.brand || '';
        const brandB = b.brand || '';
        return brandA.localeCompare(brandB);
      }
      return 0; // 'curated' retains editorial ordering
    });

    return result;
  }, [departmentProducts, selectedSubcategory, selectedBrand, searchQuery, sortBy]);

  // 8. Pagination Slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  const handleResetFilters = () => {
    setSelectedSubcategory('ALL');
    setSelectedBrand('ALL');
    setSearchQuery('');
    setSortBy('curated');
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Subcategory Pill Filters */}
      {subcategories.length > 2 && (
        <Box sx={{ mb: 3.5, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { height: 4 } }}>
          <Box sx={{ display: 'flex', gap: 1.2, minWidth: 'max-content' }}>
            {subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub;
              return (
                <Chip
                  key={sub}
                  label={sub === 'ALL' ? `All ${deptLabel} (${departmentProducts.length})` : sub}
                  clickable
                  onClick={() => {
                    setSelectedSubcategory(sub);
                    setPage(1);
                  }}
                  sx={{
                    bgcolor: isSelected ? 'var(--ink, #1a1420)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--ink, #1a1420)',
                    border: `1px solid ${isSelected ? accentColor : 'var(--line, #e5dccb)'}`,
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.82rem',
                    py: 1,
                    px: 1,
                    borderRadius: '99px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isSelected ? 'var(--ink, #1a1420)' : 'rgba(58, 60, 224, 0.06)',
                      borderColor: accentColor
                    }
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Control Bar: Search, Brand Filter, Sort & Count */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--line, #e5dccb)',
          p: { xs: 2, md: 2.5 },
          mb: 4,
          boxShadow: '0 8px 24px rgba(26, 20, 32, 0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2
        }}
      >
        {/* Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'var(--bg, #fbf6ec)',
            borderRadius: '99px',
            border: '1px solid var(--line, #e5dccb)',
            px: 2,
            py: 0.6,
            minWidth: { xs: '100%', sm: 280, md: 320 }
          }}
        >
          <SearchIcon sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 18, mr: 1 }} />
          <InputBase
            placeholder={`Search ${deptLabel} pieces, fabrics...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            fullWidth
            sx={{ fontSize: '0.86rem', fontFamily: '"Instrument Sans", sans-serif' }}
          />
        </Box>

        {/* Right Side: Filters & Sorter */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          {/* Brand Selector */}
          {brands.length > 2 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedBrand}
                onChange={(e: SelectChangeEvent) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                displayEmpty
                sx={{
                  borderRadius: '99px',
                  bgcolor: 'var(--bg, #fbf6ec)',
                  fontSize: '0.84rem',
                  fontFamily: '"Instrument Sans", sans-serif',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--line, #e5dccb)' }
                }}
              >
                <MenuItem value="ALL">All Brands ({brands.length - 1})</MenuItem>
                {brands.filter((b) => b !== 'ALL').map((brand) => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Sort Selector */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={sortBy}
              onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
              sx={{
                borderRadius: '99px',
                bgcolor: 'var(--bg, #fbf6ec)',
                fontSize: '0.84rem',
                fontFamily: '"Instrument Sans", sans-serif',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--line, #e5dccb)' }
              }}
            >
              <MenuItem value="curated">Curated Ordering</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
              <MenuItem value="brand-asc">Maison: A to Z</MenuItem>
            </Select>
          </FormControl>

          {/* Reset Filters Button if Active */}
          {(selectedSubcategory !== 'ALL' || selectedBrand !== 'ALL' || searchQuery.trim()) && (
            <Button
              variant="text"
              size="small"
              onClick={handleResetFilters}
              startIcon={<ResetIcon />}
              sx={{
                color: 'var(--mute, #6b6173)',
                textTransform: 'none',
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '0.82rem',
                '&:hover': { color: 'var(--ink, #1a1420)' }
              }}
            >
              Reset
            </Button>
          )}
        </Box>
      </Box>

      {/* Results Header Notice */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Instrument Sans", sans-serif',
            color: 'var(--mute, #6b6173)',
            fontSize: '0.86rem'
          }}
        >
          Displaying{' '}
          <Box component="strong" sx={{ color: 'var(--ink, #1a1420)' }}>
            {filteredProducts.length}
          </Box>{' '}
          verified piece{filteredProducts.length === 1 ? '' : 's'} in {deptLabel}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            alignItems: 'center',
            gap: 0.6,
            color: 'var(--cobalt, #3a3ce0)',
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 600
          }}
        >
          <VerifiedUserOutlined sx={{ fontSize: 14 }} /> Official Maison Referral Safeguards Active
        </Typography>
      </Box>

      {/* Product Grid or Empty State */}
      {paginatedProducts.length > 0 ? (
        <>
          <Grid container spacing={{ xs: 2, sm: 3, md: 3.5 }}>
            {paginatedProducts.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_e, val) => {
                  setPage(val);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontWeight: 600,
                    borderRadius: '8px'
                  },
                  '& .Mui-selected': {
                    bgcolor: 'var(--ink, #1a1420) !important',
                    color: '#FFFFFF !important'
                  }
                }}
              />
            </Box>
          )}
        </>
      ) : (
        /* Empty State */
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            px: 3,
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px dashed var(--line, #e5dccb)',
            boxShadow: '0 10px 30px rgba(26, 20, 32, 0.03)'
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(58, 60, 224, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5
            }}
          >
            <CheckroomOutlined sx={{ fontSize: 32, color: 'var(--cobalt, #3a3ce0)' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              color: 'var(--ink, #1a1420)',
              mb: 1
            }}
          >
            No Silhouettes Found in this Selection
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              color: 'var(--mute, #6b6173)',
              maxWidth: 440,
              mx: 'auto',
              mb: 3
            }}
          >
            We could not find any active pieces matching your current filters in {deptLabel}. Try clearing your search or filtering by another category.
          </Typography>
          <Button
            variant="contained"
            onClick={handleResetFilters}
            startIcon={<ResetIcon />}
            sx={{
              bgcolor: 'var(--ink, #1a1420)',
              color: '#FFFFFF',
              borderRadius: '99px',
              px: 3.5,
              py: 1.2,
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#2a2233' }
            }}
          >
            Reset Filters & View All
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default DepartmentProductGrid;
