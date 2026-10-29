import React, { useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Card, Chip, Button, 
  InputBase, ToggleButtonGroup, ToggleButton, Tooltip 
} from '@mui/material';
import { 
  SearchOutlined, VerifiedUserOutlined, OpenInNewOutlined,
  ShieldOutlined, LockOutlined, AutoAwesomeOutlined
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { ALL_VERIFIED_BRANDS, BRANDS_DATA, type Brand } from '../../data/brandsData';
import { getBrandLogoConfig } from '../../data/brandLogos';
import { verifyBrandDomain } from '../../utils/domainVerifier';

const BRAND_LIST: Brand[] = ALL_VERIFIED_BRANDS || BRANDS_DATA;

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export const BrandDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialOrigin = (searchParams.get('origin') as 'ALL' | 'INDIAN' | 'INTERNATIONAL') || 'ALL';
  const initialLetter = searchParams.get('letter') || 'ALL';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [originFilter, setOriginFilter] = useState<'ALL' | 'INDIAN' | 'INTERNATIONAL'>(initialOrigin);
  const [letterFilter, setLetterFilter] = useState<string>(initialLetter);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

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

  const handleLetterClick = (letter: string) => {
    setLetterFilter(letter);
    const newParams = new URLSearchParams(searchParams);
    if (letter === 'ALL') {
      newParams.delete('letter');
    } else {
      newParams.set('letter', letter);
    }
    setSearchParams(newParams);
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

  const handleImageError = (slug: string) => {
    setFailedImages((prev) => ({ ...prev, [slug]: true }));
  };

  const filteredBrands = useMemo(() => {
    return BRAND_LIST.filter((brand) => {
      const matchesOrigin = originFilter === 'ALL' || brand.origin === originFilter;
      const matchesLetter = 
        letterFilter === 'ALL' || 
        brand.name.trim().toUpperCase().startsWith(letterFilter);
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.city.toLowerCase().includes(query) ||
        brand.category.toLowerCase().includes(query) ||
        brand.verifiedDomain.toLowerCase().includes(query) ||
        (brand.signatureStyle && brand.signatureStyle.toLowerCase().includes(query));

      return matchesOrigin && matchesLetter && matchesSearch;
    });
  }, [originFilter, letterFilter, searchTerm]);

  const indianCount = useMemo(() => BRAND_LIST.filter((b) => b.origin === 'INDIAN').length, []);
  const intlCount = useMemo(() => BRAND_LIST.filter((b) => b.origin === 'INTERNATIONAL').length, []);

  // Compute initials for clean text monogram fallback
  const getBrandInitials = (name: string): string => {
    const cleaned = name.replace(/[^a-zA-Z\s]/g, '').trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ bgcolor: 'var(--bg, #fbf6ec)', minHeight: '100vh', pb: 14 }}>
      {/* Editorial Header Banner */}
      <Box sx={{
        bgcolor: '#1a1420',
        color: '#FFFFFF',
        pt: { xs: 8, md: 10 },
        pb: { xs: 8, md: 10 },
        borderBottom: '1px solid rgba(229, 220, 203, 0.2)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
            <ShieldOutlined sx={{ color: 'var(--tang, #e8572b)', fontSize: 18 }} />
            <Typography variant="overline" sx={{ color: 'var(--tang, #e8572b)', fontWeight: 700, letterSpacing: '0.22em' }}>
              OFFICIAL BRAND LOGO DIRECTORY & VERIFIED DESTINATIONS
            </Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{
              color: '#FFFFFF',
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              mt: 0.5,
              mb: 2,
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
              lineHeight: 1.15
            }}
          >
            The Official Maison Index
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(251, 246, 236, 0.82)',
              maxWidth: 780,
              fontSize: { xs: '1rem', md: '1.12rem' },
              lineHeight: 1.7,
              fontFamily: '"Instrument Sans", sans-serif'
            }}
          >
            A certified directory of {BRAND_LIST.length} authentic Indian couture ateliers, global luxury houses,
            and high-performance sportswear labels. Click any brand logo or brand name to navigate directly to the verified
            official website in a new tab.
          </Typography>

          {/* Trust Guarantees Row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockOutlined sx={{ color: 'var(--tang, #e8572b)', fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.84rem', color: '#FFFFFF', fontWeight: 600 }}>
                100% Verified HTTPS Destinations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserOutlined sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.84rem', color: '#FFFFFF', fontWeight: 600 }}>
                Zero Counterfeit Intermediaries
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeOutlined sx={{ color: '#E8A838', fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.84rem', color: '#FFFFFF', fontWeight: 600 }}>
                Official Brand Media & Typography Fallbacks
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Filter and Search Controls Bar */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 3 }}>
        <Box 
          sx={{ 
            bgcolor: '#FFFFFF', 
            borderRadius: '20px', 
            p: { xs: 2.5, md: 3 }, 
            boxShadow: '0 14px 40px rgba(26, 20, 32, 0.08)',
            border: '1px solid var(--line, #e5dccb)',
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
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButtonGroup-grouped': {
                border: '1px solid var(--line, #e5dccb) !important',
                borderRadius: '99px !important',
                mx: '0 !important'
              },
              '& .MuiToggleButton-root': {
                px: 2.8,
                py: 1,
                fontWeight: 600,
                fontSize: '0.86rem',
                textTransform: 'none',
                fontFamily: '"Instrument Sans", sans-serif',
                color: 'var(--ink, #1a1420)',
                '&.Mui-selected': {
                  bgcolor: 'var(--ink, #1a1420) !important',
                  color: '#FFFFFF !important',
                }
              }
            }}
          >
            <ToggleButton value="ALL">All Houses ({BRAND_LIST.length})</ToggleButton>
            <ToggleButton value="INDIAN">Indian Ateliers ({indianCount})</ToggleButton>
            <ToggleButton value="INTERNATIONAL">Global Luxury ({intlCount})</ToggleButton>
          </ToggleButtonGroup>

          {/* Search Input Field */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'var(--bg, #fbf6ec)', 
              borderRadius: '99px', 
              px: 2.5, 
              py: 0.9,
              minWidth: { xs: '100%', sm: 340 },
              border: '1px solid var(--line, #e5dccb)',
              transition: 'all 0.2s ease',
              '&:focus-within': {
                borderColor: 'var(--cobalt, #3a3ce0)',
                bgcolor: '#FFFFFF',
                boxShadow: '0 0 0 3px rgba(58, 60, 224, 0.12)'
              }
            }}
          >
            <SearchOutlined sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 20, mr: 1.5 }} />
            <InputBase 
              placeholder="Search brand, atelier city, or style..." 
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ fontSize: '0.9rem', fontFamily: '"Instrument Sans", sans-serif' }}
            />
          </Box>
        </Box>

        {/* Alphabetical Filter Bar */}
        <Box 
          sx={{ 
            mt: 2.5, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.6, 
            overflowX: 'auto', 
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, mr: 1, color: 'var(--ink, #1a1420)', whiteSpace: 'nowrap' }}>
            A-Z INDEX:
          </Typography>
          {ALPHABET.map((letter) => {
            const isSelected = letterFilter === letter;
            return (
              <Button
                key={letter}
                size="small"
                onClick={() => handleLetterClick(letter)}
                sx={{
                  minWidth: letter === 'ALL' ? 48 : 34,
                  height: 34,
                  p: 0,
                  borderRadius: '99px',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  fontFamily: '"Instrument Sans", sans-serif',
                  bgcolor: isSelected ? 'var(--tang, #e8572b)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--ink, #1a1420)',
                  border: isSelected ? 'none' : '1px solid rgba(229, 220, 203, 0.6)',
                  '&:hover': {
                    bgcolor: isSelected ? 'var(--tang, #e8572b)' : 'rgba(26, 20, 32, 0.05)',
                  }
                }}
              >
                {letter}
              </Button>
            );
          })}
        </Box>
      </Container>

      {/* Official Brand Logo Grid */}
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'var(--ink, #1a1420)', fontWeight: 600 }}>
            Displaying {filteredBrands.length} verified official brands
          </Typography>
          {(searchTerm || originFilter !== 'ALL' || letterFilter !== 'ALL') && (
            <Button
              size="small"
              onClick={() => {
                setSearchTerm('');
                setOriginFilter('ALL');
                setLetterFilter('ALL');
                setSearchParams({});
              }}
              sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}
            >
              Reset Filters
            </Button>
          )}
        </Box>

        {filteredBrands.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#FFFFFF', borderRadius: 4, border: '1px solid var(--line, #e5dccb)' }}>
            <Typography variant="h6" sx={{ color: 'var(--ink, #1a1420)', fontWeight: 600, mb: 1 }}>
              No verified brands match your search
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Try clearing filters or searching by a different maison or category.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setOriginFilter('ALL');
                setLetterFilter('ALL');
                setSearchParams({});
              }}
              sx={{ borderRadius: '99px', textTransform: 'none', borderColor: 'var(--ink, #1a1420)', color: 'var(--ink, #1a1420)' }}
            >
              Show All Houses
            </Button>
          </Box>
        ) : (
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3
            }}
          >
            {filteredBrands.map((brand) => {
              const logoConfig = getBrandLogoConfig(brand.slug);
              const verification = verifyBrandDomain(brand.website, brand.slug);
              const hasUsableLogo = Boolean(
                logoConfig?.cdnUrl && !failedImages[brand.slug]
              );
              const isDestinationVerified = verification.isValid && verification.isVerifiedOfficial;

              return (
                <Card 
                  key={brand.id}
                  className="brand-entry-card"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    bgcolor: '#FFFFFF',
                    borderRadius: '16px',
                    p: 2.8,
                    border: '1px solid var(--line, #e5dccb)',
                    boxShadow: '0 4px 18px rgba(26, 20, 32, 0.03)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'var(--cobalt, #3a3ce0)',
                      boxShadow: '0 16px 36px rgba(58, 60, 224, 0.1)'
                    }
                  }}
                >
                  {/* Card Header: Origin Tag & Domain Chip */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={brand.origin === 'INDIAN' ? 'INDIAN ATELIER' : 'GLOBAL LUXURY'}
                      size="small"
                      sx={{ 
                        bgcolor: brand.origin === 'INDIAN' ? 'rgba(232, 87, 43, 0.1)' : 'rgba(26, 20, 32, 0.06)',
                        color: brand.origin === 'INDIAN' ? 'var(--tang, #e8572b)' : 'var(--ink, #1a1420)',
                        fontWeight: 700,
                        fontSize: '0.64rem',
                        letterSpacing: '0.08em',
                        borderRadius: '99px'
                      }}
                    />
                    <Tooltip title={isDestinationVerified ? 'Verified Official Domain' : 'Verification Pending'}>
                      <Chip 
                        icon={<VerifiedUserOutlined sx={{ fontSize: '13px !important', color: isDestinationVerified ? 'var(--cobalt, #3a3ce0) !important' : '#888 !important' }} />}
                        label={brand.verifiedDomain}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: isDestinationVerified ? 'rgba(58, 60, 224, 0.3)' : 'var(--line, #e5dccb)',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          borderRadius: '99px',
                          color: isDestinationVerified ? 'var(--cobalt, #3a3ce0)' : '#777'
                        }}
                      />
                    </Tooltip>
                  </Box>

                  {/* Official Logo Presentation Container — Clickable directly to Official Website */}
                  {isDestinationVerified ? (
                    <Box
                      component="a"
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit official ${brand.name} website`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 110,
                        my: 1.5,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: 'var(--bg, #fbf6ec)',
                        border: '1px solid rgba(229, 220, 203, 0.5)',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#FFFFFF',
                          borderColor: 'var(--cobalt, #3a3ce0)',
                          boxShadow: '0 4px 14px rgba(26, 20, 32, 0.05)'
                        }
                      }}
                    >
                      {hasUsableLogo ? (
                        <Box
                          component="img"
                          src={logoConfig?.cdnUrl}
                          alt={`${brand.name} Official Logo`}
                          onError={() => handleImageError(brand.slug)}
                          sx={{
                            maxHeight: 52,
                            maxWidth: 150,
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))',
                            transition: 'transform 0.25s ease',
                            '&:hover': { transform: 'scale(1.06)' }
                          }}
                        />
                      ) : (
                        /* Clean Haute-Couture Typography Wordmark Fallback */
                        <Box sx={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              bgcolor: 'var(--ink, #1a1420)',
                              color: '#FFFFFF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: '"Fraunces", Georgia, serif',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              mb: 0.8
                            }}
                          >
                            {getBrandInitials(brand.name)}
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: '"Fraunces", Georgia, serif',
                              fontWeight: 600,
                              fontSize: '0.98rem',
                              color: 'var(--ink, #1a1420)',
                              letterSpacing: '0.04em'
                            }}
                          >
                            {brand.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    /* Disabled link state if unverified */
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 110,
                        my: 1.5,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: '#f5f5f5',
                        border: '1px dashed #ccc',
                        opacity: 0.75
                      }}
                    >
                      <Typography sx={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>
                        Verification Pending
                      </Typography>
                    </Box>
                  )}

                  {/* Brand Name (Clickable directly to official website) */}
                  <Box sx={{ my: 1 }}>
                    {isDestinationVerified ? (
                      <Typography 
                        variant="h5" 
                        component="a"
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          fontWeight: 700, 
                          color: 'var(--ink, #1a1420)',
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: '1.25rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          transition: 'color 0.2s ease',
                          '&:hover': {
                            color: 'var(--cobalt, #3a3ce0)'
                          }
                        }}
                      >
                        {brand.name}
                      </Typography>
                    ) : (
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#888',
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: '1.25rem'
                        }}
                      >
                        {brand.name}
                      </Typography>
                    )}

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'var(--mute, #6b6173)', 
                        display: 'block', 
                        mt: 0.5, 
                        letterSpacing: '0.04em',
                        fontFamily: '"Instrument Sans", sans-serif'
                      }}
                    >
                      {brand.category} • {brand.city}, {brand.country} (Est. {brand.founded})
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#4a444d', 
                      lineHeight: 1.55, 
                      fontSize: '0.82rem',
                      mb: 2, 
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {brand.description}
                  </Typography>

                  {/* Action Link & Buttons */}
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(229, 220, 203, 0.45)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {isDestinationVerified ? (
                      <Button 
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="contained"
                        className="lumiere-pill-btn"
                        endIcon={<OpenInNewOutlined sx={{ fontSize: 13 }} />}
                        sx={{ 
                          width: '100%',
                          py: 0.9, 
                          fontSize: '0.8rem', 
                          bgcolor: 'var(--ink, #1a1420)',
                          color: '#FFFFFF',
                          borderRadius: '99px',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': { 
                            bgcolor: 'var(--cobalt, #3a3ce0)',
                            color: '#FFFFFF' 
                          } 
                        }}
                      >
                        Visit Official Website
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        size="small"
                        variant="outlined"
                        sx={{ width: '100%', py: 0.9, fontSize: '0.8rem', borderRadius: '99px' }}
                      >
                        Verification Pending
                      </Button>
                    )}

                    <Button 
                      component={Link}
                      to={`/brands/${brand.slug}`}
                      size="small"
                      variant="text"
                      sx={{ 
                        width: '100%',
                        py: 0.4, 
                        fontSize: '0.74rem', 
                        color: 'var(--mute, #6b6173)',
                        textTransform: 'none',
                        '&:hover': { color: 'var(--cobalt, #3a3ce0)', bgcolor: 'transparent' }
                      }}
                    >
                      View Maison Dossier & Story →
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BrandDirectoryPage;
