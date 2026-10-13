import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, Grid, Card, CardMedia, CardContent, 
  Chip, IconButton, Drawer, Divider 
} from '@mui/material';
import { 
  ArrowForwardOutlined, VerifiedUserOutlined, StraightenOutlined, 
  CloseOutlined, DiamondOutlined, PublicOutlined 
} from '@mui/icons-material';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { BRANDS_DATA } from '../../data/brandsData';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sizeDrawerOpen, setSizeDrawerOpen] = useState(false);

  // Call React Hooks unconditionally at the top level
  const { data: catalogData } = useProducts({ size: 4 });

  // If search parameters are present on root URL, redirect seamlessly to the full products catalog
  if (searchParams.get('search') || searchParams.get('categoryId') || searchParams.get('brand')) {
    return <Navigate to={`/products?${searchParams.toString()}`} replace />;
  }

  const liveProducts = catalogData?.content?.filter(p => !p.name.toLowerCase().includes('phone') && !p.name.toLowerCase().includes('electronic')) || [];

  // Marquee brand names list
  const marqueeBrands = [
    'Sabyasachi', 'Chanel', 'Anita Dongre', 'Saint Laurent', 'Raw Mango', 
    'Bottega Veneta', 'Tarun Tahiliani', 'Brunello Cucinelli', 'Manish Malhotra', 
    'The Row', 'Fabindia', 'Loewe', 'Manyavar', 'Jacquemus', 'Raymond', 
    'Prada', 'Rahul Mishra', 'Loro Piana', 'Torani', 'Alexander McQueen', 
    'Gaurav Gupta', 'Burberry', 'Good Earth', 'Tom Ford', 'Rare Rabbit'
  ];

  // Editorial Curated Capsule Categories
  const capsuleCategories = [
    {
      title: 'Haute Outerwear & Trench',
      sub: 'Double-faced cashmere, wool gabardine & belted capes',
      img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
      link: '/products?category=outerwear',
      tag: 'Couture Capsule'
    },
    {
      title: 'Evening Gowns & Draped Silks',
      sub: 'Fluid architectural draping, silk organza & sculptural gowns',
      img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
      link: '/products?category=evening-wear',
      tag: 'Soirée Collection'
    },
    {
      title: 'Heritage Sherwanis & Bandhgalas',
      sub: 'Royal handloom brocades, raw silk kurtas & bespoke tailoring',
      img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
      link: '/products?category=heritage-sartorial',
      tag: 'Indian Sartorial'
    },
    {
      title: 'Artisanal Handloom Sarees',
      sub: 'Chanderi weaves, antique Varanasi zardozi & pure mulmul',
      img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
      link: '/products?category=sarees-handloom',
      tag: 'Master Weaves'
    },
    {
      title: 'Sartorial Suiting & Blazers',
      sub: 'Super 200s fine wool, unstructured Italian lapels & sharp trousers',
      img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
      link: '/products?category=suiting',
      tag: 'Bespoke Tailoring'
    },
    {
      title: 'Quiet Luxury Casualwear',
      sub: 'Pure organic linens, fine cashmere knits & selvedge denim',
      img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=900',
      link: '/products?category=contemporary-pret',
      tag: 'Modern Pret'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#FAFAFA', color: '#0A0A0A', overflow: 'hidden' }}>
      
      {/* =========================================================================
          1. CINEMATIC EDITORIAL HERO
      ========================================================================= */}
      <Box 
        sx={{ 
          position: 'relative',
          minHeight: { xs: '85vh', md: '92vh' },
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#0A0A0A',
          color: '#FFFFFF',
          backgroundImage: 'radial-gradient(circle at 75% 30%, rgba(229, 9, 20, 0.16) 0%, rgba(10, 10, 10, 0.95) 60%)',
          overflow: 'hidden',
          pt: { xs: 8, md: 4 },
          pb: { xs: 8, md: 6 }
        }}
      >
        {/* Subtle Atmospheric Red Halo */}
        <Box className="hero-atmospheric-glow" />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={{ xs: 6, lg: 8 }} sx={{ alignItems: 'center' }}>
            
            {/* Left Headline & Action Column */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={{ maxWidth: 740 }}>
                
                {/* Editorial Collection Tag */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E50914', boxShadow: '0 0 10px #E50914' }} />
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: '#FAF8F5', 
                      letterSpacing: '0.22em', 
                      fontWeight: 700, 
                      fontSize: { xs: '0.72rem', sm: '0.82rem' } 
                    }}
                  >
                    LUMIÈRE HAUTE ATELIER • AUTUMN/WINTER 2026/27
                  </Typography>
                </Box>

                {/* Oversized Editorial Typography */}
                <Typography 
                  variant="h1" 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontSize: { xs: '2.85rem', sm: '4.2rem', md: '5.2rem' },
                    lineHeight: { xs: 1.08, md: 1.02 },
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    mb: 3
                  }}
                >
                  The Architecture of <span className="lumiere-red-gradient-text">Modern Distinction.</span>
                </Typography>

                {/* Refined Editorial Subtitle */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#C4BEB4', 
                    fontSize: { xs: '1.05rem', md: '1.22rem' }, 
                    lineHeight: 1.7, 
                    maxWidth: 620,
                    mb: 5,
                    fontWeight: 300
                  }}
                >
                  Curating premier Indian artisanal heritage and iconic international couture. 
                  Discover authentic brand-direct creations, verified official website referrals, 
                  and standardized atelier size benchmarks.
                </Typography>

                {/* Pill-Shaped Calls To Action */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'center' }}>
                  <Button 
                    component={Link}
                    to="/products"
                    variant="contained" 
                    size="large"
                    className="lumiere-red-btn lumiere-pill-btn"
                    endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
                    sx={{ px: 4, py: 1.8, fontSize: '0.96rem' }}
                  >
                    Explore Collections
                  </Button>

                  <Button 
                    component={Link}
                    to="/brands"
                    variant="outlined"
                    size="large"
                    className="lumiere-pill-btn"
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.45)', 
                      color: '#FFFFFF',
                      px: 3.8, 
                      py: 1.7,
                      fontSize: '0.96rem',
                      '&:hover': { 
                        borderColor: '#E50914', 
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(229, 9, 20, 0.12)' 
                      } 
                    }}
                  >
                    Directory of 55+ Maisons
                  </Button>
                </Box>

                {/* Verification Trust Indicators */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 6, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <VerifiedUserOutlined sx={{ color: '#E50914', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: '#DDD', letterSpacing: '0.04em', fontWeight: 500 }}>
                      100% Verified Brand Domains
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <DiamondOutlined sx={{ color: '#E50914', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: '#DDD', letterSpacing: '0.04em', fontWeight: 500 }}>
                      Indian Couture & Global Luxury
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <StraightenOutlined sx={{ color: '#E50914', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: '#DDD', letterSpacing: '0.04em', fontWeight: 500 }}>
                      Unified Precision Sizing Matrix
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Grid>

            {/* Right Asymmetrical Campaign Visual */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ position: 'relative', maxWidth: 500, mx: 'auto' }}>
                
                {/* Main Hero Portrait Card */}
                <Card 
                  sx={{ 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    bgcolor: '#141414'
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '130%' }}>
                    <CardMedia 
                      component="img"
                      image="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200"
                      alt="Lumière Editorial Haute Couture Campaign"
                      sx={{ 
                        position: 'absolute', 
                        inset: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        filter: 'contrast(1.05) brightness(0.95)'
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        inset: 0, 
                        background: 'linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.1) 60%, transparent 100%)' 
                      }} 
                    />
                    <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                      <Chip 
                        label="AUTUMN / WINTER EDITORIAL" 
                        size="small" 
                        sx={{ 
                          bgcolor: '#E50914', 
                          color: '#FFFFFF', 
                          fontWeight: 700, 
                          fontFamily: '"Cinzel", serif', 
                          letterSpacing: '0.1em',
                          mb: 1.5,
                          fontSize: '0.68rem'
                        }} 
                      />
                      <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5 }}>
                        Architectural Drapery & Velvet
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#D0CAC0', display: 'block' }}>
                        Curated from Parisian & New Delhi ateliers • 2026/27 Showcase
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Floating Asymmetrical Accent Card */}
                <Box 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    position: 'absolute', 
                    top: -24, 
                    left: -32, 
                    bgcolor: 'rgba(20, 20, 20, 0.92)', 
                    backdropFilter: 'blur(16px)',
                    p: 2.5, 
                    borderRadius: '16px', 
                    border: '1px solid rgba(229, 9, 20, 0.4)',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
                    maxWidth: 210
                  }}
                >
                  <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                    AUTHENTICITY
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 600, mt: 0.5 }}>
                    Zero Counterfeits
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0988E', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    Direct referrals exclusively to certified brand flagships.
                  </Typography>
                </Box>

              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          2. ANIMATED HORIZONTAL FASHION-BRAND MARQUEE
      ========================================================================= */}
      <Box 
        sx={{ 
          bgcolor: '#0F0F0F', 
          py: 2.2, 
          borderTop: '1px solid rgba(229, 9, 20, 0.3)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 5
        }}
      >
        <Box className="marquee-container">
          <Box className="marquee-track">
            {/* First sequence */}
            {marqueeBrands.map((brandName, idx) => (
              <Box key={`mq1-${idx}`} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Link to={`/brands?search=${encodeURIComponent(brandName)}`} className="marquee-item">
                  {brandName}
                </Link>
                <Typography component="span" sx={{ color: '#E50914', fontSize: '0.85rem', mx: 1 }}>
                  //
                </Typography>
              </Box>
            ))}
            {/* Second sequence for seamless infinite loop */}
            {marqueeBrands.map((brandName, idx) => (
              <Box key={`mq2-${idx}`} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Link to={`/brands?search=${encodeURIComponent(brandName)}`} className="marquee-item">
                  {brandName}
                </Link>
                <Typography component="span" sx={{ color: '#E50914', fontSize: '0.85rem', mx: 1 }}>
                  //
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* =========================================================================
          3. THREE VISUAL ENTRY POINTS: MEN, WOMEN & KIDS
      ========================================================================= */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FAFAFA' }}>
        <Container maxWidth="xl">
          
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: { xs: 6, md: 8 } }}>
            <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.2em' }}>
              DISTINCT CURATIONS
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, mt: 1, mb: 2 }}>
              Choose Your Atelier Universe
            </Typography>
            <Typography variant="body1" sx={{ color: '#66625B', fontSize: '1.05rem' }}>
              Explore dedicated fashion portfolios tailored to women’s couture, men’s bespoke sartorial suiting, and exquisite young heritage wear.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            
            {/* 1. WOMEN'S COLLECTION */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card 
                component={Link}
                to="/products?gender=women"
                className="lumiere-card"
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative', 
                  textDecoration: 'none',
                  bgcolor: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <Box sx={{ position: 'relative', pt: '125%', overflow: 'hidden' }}>
                  <CardMedia 
                    component="img"
                    image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900"
                    alt="Women's Haute Couture Collection"
                    sx={{ 
                      position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': { transform: 'scale(1.06)' }
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Chip 
                      label="FEMME ATELIER" 
                      size="small" 
                      sx={{ bgcolor: '#0A0A0A', color: '#FFF', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em' }} 
                    />
                  </Box>
                </Box>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700 }}>
                    PORTFOLIO I
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: '#0A0A0A' }}>
                    Women’s Couture & Pret
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#66625B', mb: 3, lineHeight: 1.6 }}>
                    Fluid silk lehengas, structured double-breasted blazers, hand-embroidered anarkalis, and evening gowns.
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, color: '#E50914', fontWeight: 600 }}>
                    <Typography variant="button" sx={{ letterSpacing: '0.04em' }}>Explore Women's</Typography>
                    <ArrowForwardOutlined sx={{ fontSize: 16 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 2. MEN'S COLLECTION */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card 
                component={Link}
                to="/products?gender=men"
                className="lumiere-card"
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative', 
                  textDecoration: 'none',
                  bgcolor: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <Box sx={{ position: 'relative', pt: '125%', overflow: 'hidden' }}>
                  <CardMedia 
                    component="img"
                    image="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900"
                    alt="Men's Sartorial Collection"
                    sx={{ 
                      position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': { transform: 'scale(1.06)' }
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Chip 
                      label="HOMME SARTORIAL" 
                      size="small" 
                      sx={{ bgcolor: '#0A0A0A', color: '#FFF', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em' }} 
                    />
                  </Box>
                </Box>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700 }}>
                    PORTFOLIO II
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: '#0A0A0A' }}>
                    Men’s Sartorial & Festive
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#66625B', mb: 3, lineHeight: 1.6 }}>
                    Bespoke wool suiting, royal jacquard sherwanis, bandhgalas, raw silk kurtas, and luxury linen overshirts.
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, color: '#E50914', fontWeight: 600 }}>
                    <Typography variant="button" sx={{ letterSpacing: '0.04em' }}>Explore Men's</Typography>
                    <ArrowForwardOutlined sx={{ fontSize: 16 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 3. KIDS' COLLECTION */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card 
                component={Link}
                to="/products?gender=kids"
                className="lumiere-card"
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative', 
                  textDecoration: 'none',
                  bgcolor: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <Box sx={{ position: 'relative', pt: '125%', overflow: 'hidden' }}>
                  <CardMedia 
                    component="img"
                    image="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=900"
                    alt="Kids' Festive & Heritage Collection"
                    sx={{ 
                      position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': { transform: 'scale(1.06)' }
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Chip 
                      label="ENFANT HERITAGE" 
                      size="small" 
                      sx={{ bgcolor: '#0A0A0A', color: '#FFF', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em' }} 
                    />
                  </Box>
                </Box>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700 }}>
                    PORTFOLIO III
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: '#0A0A0A' }}>
                    Kids’ Festive & Heritage
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#66625B', mb: 3, lineHeight: 1.6 }}>
                    Pure organic cotton kurta sets, festive lehengas for young girls, miniature sherwanis, and celebration wear.
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, color: '#E50914', fontWeight: 600 }}>
                    <Typography variant="button" sx={{ letterSpacing: '0.04em' }}>Explore Kids'</Typography>
                    <ArrowForwardOutlined sx={{ fontSize: 16 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          4. EDITORIAL BRAND SPOTLIGHT: INDIAN CRAFT X GLOBAL LUXURY
      ========================================================================= */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#0A0A0A', color: '#FFFFFF', position: 'relative' }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 6, lg: 8 }} sx={{ alignItems: 'center' }}>
            
            <Grid size={{ xs: 12, lg: 5 }}>
              <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.22em' }}>
                MAISON CURATION
              </Typography>
              <Typography variant="h2" sx={{ color: '#FFFFFF', fontWeight: 700, my: 2 }}>
                Dual Heritage: <span className="lumiere-red-gradient-text">Indian Artistry</span> & Global Avant-Garde
              </Typography>
              <Typography variant="body1" sx={{ color: '#C4BEB4', mb: 4, lineHeight: 1.8, fontSize: '1.05rem' }}>
                LUMIÈRE bridges the world’s most celebrated textile civilizations. 
                From the timeless zardozi embroidery of Sabyasachi and handloom Chanderi weaves of Raw Mango 
                to the sculptural minimalism of The Row and Parisian tailoring of Saint Laurent.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(229, 9, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E50914', flexShrink: 0 }}>
                    <PublicOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFF' }}>58 Curated Partner Maisons</Typography>
                    <Typography variant="body2" sx={{ color: '#9E988F' }}>28 prestigious Indian couturiers and 30 iconic international luxury houses.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(229, 9, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E50914', flexShrink: 0 }}>
                    <VerifiedUserOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFF' }}>Certified Official Domains</Typography>
                    <Typography variant="body2" sx={{ color: '#9E988F' }}>Every external referral links exclusively to the verified root domain of each designer.</Typography>
                  </Box>
                </Box>
              </Box>

              <Button 
                component={Link}
                to="/brands"
                variant="contained"
                className="lumiere-red-btn lumiere-pill-btn"
                endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
                sx={{ px: 4, py: 1.5 }}
              >
                Browse Full Brand Directory
              </Button>
            </Grid>

            {/* Featured Brand Grid */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Grid container spacing={3}>
                {BRANDS_DATA.slice(0, 4).map((brand) => (
                  <Grid key={brand.id} size={{ xs: 12, sm: 6 }}>
                    <Card 
                      component={Link}
                      to={`/brands?search=${encodeURIComponent(brand.name)}`}
                      className="lumiere-card"
                      sx={{ 
                        bgcolor: '#141414', 
                        color: '#FFF', 
                        p: 3, 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textDecoration: 'none',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip 
                            label={brand.origin === 'INDIAN' ? 'INDIAN COUTURE' : 'INTERNATIONAL'} 
                            size="small" 
                            sx={{ 
                              bgcolor: brand.origin === 'INDIAN' ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.15)', 
                              color: brand.origin === 'INDIAN' ? '#FF5E5E' : '#FFF',
                              fontWeight: 700, 
                              fontSize: '0.65rem'
                            }} 
                          />
                          <Chip 
                            label={`✓ ${brand.verifiedDomain}`}
                            size="small"
                            variant="outlined"
                            sx={{ color: '#A0988E', borderColor: 'rgba(255, 255, 255, 0.2)', fontSize: '0.62rem' }}
                          />
                        </Box>
                        
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFF', mb: 1 }}>
                          {brand.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#A0988E', fontSize: '0.86rem', lineHeight: 1.6, mb: 3 }}>
                          {brand.description}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#888' }}>
                          Atelier: {brand.city}, {brand.country}
                        </Typography>
                        <ArrowForwardOutlined sx={{ fontSize: 16, color: '#E50914' }} />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          5. FASHION DISCOVERY CAPSULE CARDS
      ========================================================================= */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="xl">
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, mb: 6 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.2em' }}>
                EDITORIAL ARCHIVES
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>
                Signature Wardrobe Capsules
              </Typography>
            </Box>
            <Button 
              component={Link}
              to="/products"
              endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
              sx={{ color: '#0A0A0A', fontWeight: 600, mt: { xs: 2, md: 0 }, '&:hover': { color: '#E50914' } }}
            >
              View All Garment Categories
            </Button>
          </Box>

          <Grid container spacing={4}>
            {capsuleCategories.map((cat, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card 
                  component={Link}
                  to={cat.link}
                  className="lumiere-card"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    textDecoration: 'none',
                    bgcolor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '80%', overflow: 'hidden' }}>
                    <CardMedia 
                      component="img"
                      image={cat.img}
                      alt={cat.title}
                      sx={{ 
                        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                    <Chip 
                      label={cat.tag}
                      size="small"
                      sx={{ 
                        position: 'absolute', top: 14, left: 14,
                        bgcolor: 'rgba(10, 10, 10, 0.85)', color: '#FFF',
                        fontWeight: 600, fontSize: '0.65rem'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A0A0A', mb: 1 }}>
                      {cat.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#66625B', lineHeight: 1.6 }}>
                      {cat.sub}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

        </Container>
      </Box>

      {/* =========================================================================
          6. TRENDING / FEATURED CATALOG SECTION
      ========================================================================= */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#F5F3EF', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC' }}>
        <Container maxWidth="xl">
          
          <Box sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: 6 }}>
            <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.2em' }}>
              CURATED SELECTION
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, mt: 1, mb: 1.5 }}>
              Featured Runway Pieces
            </Typography>
            <Typography variant="body1" sx={{ color: '#66625B' }}>
              Hand-selected signature creations showcasing the pinnacle of modern tailoring and textile craft.
            </Typography>
          </Box>

          {/* Render real products if available and clothing-oriented */}
          {liveProducts.length > 0 ? (
            <Grid container spacing={3.5}>
              {liveProducts.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          ) : (
            /* Elegant, clearly labeled editorial concept showcase */
            <Box>
              <Grid container spacing={3.5}>
                {[
                  {
                    id: 'feat-01',
                    name: 'Hand-Embroidered Zardozi Velvet Bandhgala',
                    brand: 'Sabyasachi',
                    sku: 'SAB-V-01',
                    category: 'Indian Sartorial',
                    price: '₹1,45,000',
                    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900'
                  },
                  {
                    id: 'feat-02',
                    name: 'Sculptural Double-Faced Cashmere Trench Coat',
                    brand: 'The Row',
                    sku: 'ROW-CT-02',
                    category: 'Haute Outerwear',
                    price: '₹2,85,000',
                    img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900'
                  },
                  {
                    id: 'feat-03',
                    name: 'Pure Handloom Chanderi Draped Silk Kurta Set',
                    brand: 'Raw Mango',
                    sku: 'RMG-CH-03',
                    category: 'Heritage Festive',
                    price: '₹48,500',
                    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900'
                  },
                  {
                    id: 'feat-04',
                    name: 'Grain de Poudre Wool Tuxedo Dinner Jacket',
                    brand: 'Saint Laurent',
                    sku: 'YSL-SM-04',
                    category: 'Modern Luxury',
                    price: '₹2,40,000',
                    img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900'
                  }
                ].map((item) => (
                  <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card className="lumiere-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF' }}>
                      <Box sx={{ position: 'relative', pt: '105%', overflow: 'hidden' }}>
                        <CardMedia 
                          component="img"
                          image={item.img}
                          alt={item.name}
                          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Chip 
                          label={item.brand}
                          size="small"
                          sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: '#0A0A0A', color: '#FFF', fontWeight: 700, fontSize: '0.65rem' }}
                        />
                        <Chip 
                          label="Atelier Showcase"
                          size="small"
                          sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255, 255, 255, 0.9)', color: '#0A0A0A', fontWeight: 600, fontSize: '0.65rem' }}
                        />
                      </Box>
                      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.08em' }}>
                          {item.sku}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', my: 0.8, color: '#0A0A0A', lineHeight: 1.3 }}>
                          {item.name}
                        </Typography>
                        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EBE8E2' }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#888', display: 'block', fontSize: '0.68rem' }}>INDICATIVE PRICE</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0A0A0A' }}>{item.price}</Typography>
                          </Box>
                          <Button 
                            component={Link}
                            to={`/brands?search=${encodeURIComponent(item.brand)}`}
                            size="small"
                            variant="outlined"
                            className="lumiere-pill-btn"
                            sx={{ borderColor: '#0A0A0A', color: '#0A0A0A', fontSize: '0.75rem', px: 2 }}
                          >
                            Maison Link
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#888', mt: 3 }}>
                * Verified Atelier Showcase • Official external flagship URLs and stock verified in Brand Directory.
              </Typography>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button 
              component={Link}
              to="/products"
              variant="contained"
              className="lumiere-red-btn lumiere-pill-btn"
              endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
              sx={{ px: 4, py: 1.6 }}
            >
              Explore Complete Catalog
            </Button>
          </Box>

        </Container>
      </Box>

      {/* =========================================================================
          7. SIZE-GUIDE MATRIX TEASER
      ========================================================================= */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Card 
            sx={{ 
              borderRadius: '24px', 
              p: { xs: 4, md: 6 }, 
              bgcolor: '#0A0A0A', 
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Grid container spacing={4} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <StraightenOutlined sx={{ color: '#E50914', fontSize: 28 }} />
                  <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.2em' }}>
                    ATELIER SIZING BENCHMARK
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1.5 }}>
                  Unified International & Indian Fit Matrix
                </Typography>
                <Typography variant="body1" sx={{ color: '#C4BEB4', maxWidth: 650, lineHeight: 1.7 }}>
                  Different couturiers adhere to distinct measurement standards. 
                  LUMIÈRE’s measurement matrix provides millimeter-exact cross-references between 
                  Indian kurta sizing (inches), French/Italian couture sizes (FR 36-44 / IT 38-48), and UK/US standards.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button 
                  onClick={() => setSizeDrawerOpen(true)}
                  variant="contained"
                  className="lumiere-red-btn lumiere-pill-btn"
                  startIcon={<StraightenOutlined />}
                  sx={{ px: 4, py: 1.8 }}
                >
                  Open Sizing Matrix
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* =========================================================================
          8. HOW LUMIÈRE WORKS / VERIFIED REFERRAL MANIFESTO
      ========================================================================= */}
      <Box sx={{ py: { xs: 10, md: 12 }, bgcolor: '#FAFAFA' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.2em' }}>
              THE LUMIÈRE PROTOCOL
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>
              How Discovery Works
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Curated Editorial Discovery',
                desc: 'Our fashion directors continually review seasonal collections, selecting only authentic creations across 58 verified Indian and global luxury houses.'
              },
              {
                step: '02',
                title: 'Verified Official Domain Referrals',
                desc: 'Every external acquisition link is cryptographically validated to match the official verified root domain of each designer maison. Zero counterfeit risks.'
              },
              {
                step: '03',
                title: 'Unified Measurement & Concierge',
                desc: 'Consult standardized measurement charts across chest, waist, and length before finalizing your acquisition directly with the official atelier.'
              }
            ].map((p, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <Card className="lumiere-card" sx={{ p: 4, height: '100%', bgcolor: '#FFFFFF', border: '1px solid #E8E4DC' }}>
                  <Typography variant="h1" sx={{ color: '#E50914', fontSize: '2.5rem', fontWeight: 800, mb: 1, fontFamily: '"Cinzel", serif' }}>
                    {p.step}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A0A0A', mb: 1.5 }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#66625B', lineHeight: 1.7 }}>
                    {p.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          INTERACTIVE SIZE GUIDE DRAWER
      ========================================================================= */}
      <Drawer
        anchor="right"
        open={sizeDrawerOpen}
        onClose={() => setSizeDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 460 },
            bgcolor: '#FAFAFA',
            p: 4
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700 }}>ATELIER SIZING</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0A0A0A' }}>Measurement Matrix</Typography>
          </Box>
          <IconButton onClick={() => setSizeDrawerOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body2" sx={{ color: '#66625B', mb: 3, lineHeight: 1.6 }}>
          Standardized sizing conversions across Indian festive couture and international ready-to-wear garments.
        </Typography>

        {/* Women's Matrix */}
        <Box sx={{ bgcolor: '#FFF', p: 2.5, borderRadius: 2, border: '1px solid #E8E4DC', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0A0A0A' }}>
            Women's Couture (FR / US / IN)
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>FR 36 / US 2 / S:</strong> 33-34" Bust | 26" Waist | 36" Hip</Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>FR 38 / US 4 / M:</strong> 35-36" Bust | 28" Waist | 38" Hip</Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>FR 40 / US 6 / L:</strong> 37-38" Bust | 30" Waist | 40" Hip</Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>• <strong>FR 42 / US 8 / XL:</strong> 39-40" Bust | 32" Waist | 42" Hip</Typography>
        </Box>

        {/* Men's Matrix */}
        <Box sx={{ bgcolor: '#FFF', p: 2.5, borderRadius: 2, border: '1px solid #E8E4DC', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0A0A0A' }}>
            Men's Sartorial & Kurta Sizing
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>Size 38 / S:</strong> 38" Chest | 32" Waist | 15" Neck</Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>Size 40 / M:</strong> 40" Chest | 34" Waist | 15.5" Neck</Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>Size 42 / L:</strong> 42" Chest | 36" Waist | 16" Neck</Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>• <strong>Size 44 / XL:</strong> 44" Chest | 38" Waist | 16.5" Neck</Typography>
        </Box>

        {/* Kids' Matrix */}
        <Box sx={{ bgcolor: '#FFF', p: 2.5, borderRadius: 2, border: '1px solid #E8E4DC' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0A0A0A' }}>
            Kids' Festive Age & Height Matrix
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>Age 3-4 Y:</strong> 98-104 cm Height | 22" Chest</Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>Age 5-6 Y:</strong> 110-116 cm Height | 24" Chest</Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.8 }}>• <strong>Age 7-8 Y:</strong> 122-128 cm Height | 26" Chest</Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>• <strong>Age 9-10 Y:</strong> 134-140 cm Height | 28" Chest</Typography>
        </Box>
      </Drawer>

    </Box>
  );
};

export default HomePage;
