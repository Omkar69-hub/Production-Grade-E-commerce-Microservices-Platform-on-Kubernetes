import React, { useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Grid, Card, Chip, Button, 
  InputBase, ToggleButtonGroup, ToggleButton, Tooltip 
} from '@mui/material';
import { 
  SearchOutlined, VerifiedUserOutlined, OpenInNewOutlined 
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { BRANDS_DATA } from '../../data/brandsData';

export const BrandDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialOrigin = (searchParams.get('origin') as 'ALL' | 'INDIAN' | 'INTERNATIONAL') || 'ALL';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [originFilter, setOriginFilter] = useState<'ALL' | 'INDIAN' | 'INTERNATIONAL'>(initialOrigin);

  const handleOriginChange = (
    _event: React.MouseEvent<HTMLElement>,
    newOrigin: 'ALL' | 'INDIAN' | 'INTERNATIONAL' | null
  ) => {
    if (newOrigin !== null) {
      setOriginFilter(newOrigin);
      const newParams = new URLSearchParams(searchParams);
      if (newOrigin === 'ALL') {
        newParams.delete('origin');
      } else {
        newParams.set('origin', newOrigin);
      }
      setSearchParams(newParams);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const filteredBrands = useMemo(() => {
    return BRANDS_DATA.filter((brand) => {
      const matchesOrigin = originFilter === 'ALL' || brand.origin === originFilter;
      const matchesSearch = 
        !searchTerm.trim() ||
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.verifiedDomain.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesOrigin && matchesSearch;
    });
  }, [originFilter, searchTerm]);

  const indianCount = BRANDS_DATA.filter((b) => b.origin === 'INDIAN').length;
  const intlCount = BRANDS_DATA.filter((b) => b.origin === 'INTERNATIONAL').length;

  return (
    <Box sx={{ bgcolor: '#FAFAFA', pb: 14 }}>
      {/* Editorial Header Banner */}
      <Box sx={{ bgcolor: '#0A0A0A', color: '#FFFFFF', pt: { xs: 8, md: 10 }, pb: { xs: 7, md: 9 } }}>
        <Container maxWidth="xl">
          <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.22em' }}>
            VERIFIED DIRECTORY
          </Typography>
          <Typography variant="h1" sx={{ color: '#FFFFFF', fontWeight: 700, mt: 1, mb: 2, fontSize: { xs: '2.5rem', md: '3.8rem' } }}>
            The Maison Index
          </Typography>
          <Typography variant="body1" sx={{ color: '#C4BEB4', maxWidth: 650, fontSize: '1.1rem', lineHeight: 1.7 }}>
            A curated directory of 58 verified Indian couture ateliers and global luxury fashion houses. 
            All links direct you exclusively to the certified official root domains.
          </Typography>
        </Container>
      </Box>

      {/* Filter and Search Controls Bar */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 3 }}>
        <Box 
          sx={{ 
            bgcolor: '#FFFFFF', 
            borderRadius: '16px', 
            p: 3, 
            boxShadow: '0 12px 36px rgba(10, 10, 10, 0.08)',
            border: '1px solid #E8E4DC',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2.5
          }}
        >
          {/* Origin Toggle Tabs */}
          <ToggleButtonGroup
            value={originFilter}
            exclusive
            onChange={handleOriginChange}
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: '30px !important',
                px: 3,
                py: 1,
                border: '1px solid #E8E4DC !important',
                mx: 0.5,
                fontWeight: 600,
                fontSize: '0.86rem',
                textTransform: 'none',
                color: '#666',
                '&.Mui-selected': {
                  bgcolor: '#0A0A0A !important',
                  color: '#FFFFFF !important',
                }
              }
            }}
          >
            <ToggleButton value="ALL">All Houses ({BRANDS_DATA.length})</ToggleButton>
            <ToggleButton value="INDIAN">Indian Couture ({indianCount})</ToggleButton>
            <ToggleButton value="INTERNATIONAL">Global Luxury ({intlCount})</ToggleButton>
          </ToggleButtonGroup>

          {/* Search Input Field */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: '#F5F3EF', 
              borderRadius: '30px', 
              px: 2.5, 
              py: 0.8,
              minWidth: { xs: '100%', sm: 320 },
              border: '1px solid #E8E4DC'
            }}
          >
            <SearchOutlined sx={{ color: '#E50914', fontSize: 20, mr: 1.5 }} />
            <InputBase 
              placeholder="Search by maison, city or style..." 
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ fontSize: '0.9rem' }}
            />
          </Box>
        </Box>
      </Container>

      {/* Brands Grid */}
      <Container maxWidth="xl" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#66625B', fontWeight: 600 }}>
            Displaying {filteredBrands.length} certified fashion houses
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {filteredBrands.map((brand) => (
            <Grid key={brand.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card 
                className="lumiere-card" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  bgcolor: '#FFFFFF',
                  p: 3,
                  border: '1px solid #E8E4DC'
                }}
              >
                {/* Header row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Chip 
                      label={brand.origin === 'INDIAN' ? 'INDIAN COUTURE' : 'GLOBAL LUXURY'}
                      size="small"
                      sx={{ 
                        bgcolor: brand.origin === 'INDIAN' ? 'rgba(229, 9, 20, 0.1)' : '#0A0A0A',
                        color: brand.origin === 'INDIAN' ? '#E50914' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        mb: 1
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A0A0A' }}>
                      {brand.name}
                    </Typography>
                  </Box>
                  <Tooltip title="Certified Official Root Domain">
                    <Chip 
                      icon={<VerifiedUserOutlined sx={{ fontSize: '14px !important', color: '#E50914 !important' }} />}
                      label={brand.verifiedDomain}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#E8E4DC', fontSize: '0.68rem', fontWeight: 600 }}
                    />
                  </Tooltip>
                </Box>

                {/* Category & City */}
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1.5, letterSpacing: '0.04em' }}>
                  {brand.category} • Atelier: {brand.city}, {brand.country} (Est. {brand.founded})
                </Typography>

                {/* Description */}
                <Typography variant="body2" sx={{ color: '#5A5650', lineHeight: 1.6, mb: 2.5, flexGrow: 1 }}>
                  {brand.description}
                </Typography>

                {/* Signature Style */}
                <Box sx={{ bgcolor: '#F9F8F5', p: 1.8, borderRadius: 2, mb: 3, border: '1px solid #EFECE6' }}>
                  <Typography variant="caption" sx={{ color: '#E50914', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                    Signature Atelier Craft:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', fontSize: '0.82rem', mt: 0.3 }}>
                    {brand.signatureStyle}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', pt: 2, borderTop: '1px solid #F0ECE4' }}>
                  <Button 
                    component={Link}
                    to={`/brands/${brand.slug}`}
                    size="small"
                    variant="contained"
                    className="lumiere-pill-btn"
                    sx={{ flex: 1, py: 1, fontSize: '0.8rem', bgcolor: '#0A0A0A' }}
                  >
                    Maison Dossier
                  </Button>

                  <Button 
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    variant="outlined"
                    className="lumiere-pill-btn"
                    endIcon={<OpenInNewOutlined sx={{ fontSize: 13 }} />}
                    sx={{ 
                      flex: 1, 
                      py: 1, 
                      fontSize: '0.8rem', 
                      borderColor: '#E8E4DC', 
                      color: '#0A0A0A',
                      '&:hover': { borderColor: '#E50914', color: '#E50914' } 
                    }}
                  >
                    Official Store
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BrandDirectoryPage;
