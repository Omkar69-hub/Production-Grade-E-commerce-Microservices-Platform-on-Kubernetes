import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardMedia,
  Chip, IconButton, Drawer, Divider
} from '@mui/material';
import {
  ArrowForwardOutlined, VerifiedUserOutlined, StraightenOutlined,
  CloseOutlined, DiamondOutlined, PublicOutlined, PlayArrowRounded
} from '@mui/icons-material';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { ALL_VERIFIED_BRANDS, BRANDS_DATA } from '../../data/brandsData';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';
import EditorialRunwayTrack from '../../components/editorial/EditorialRunwayTrack';
import { ALL_CLOTHING_CATALOG, toCatalogProduct } from '../../data/clothingCatalogData';
import { useDepartmentExperience } from '../../hooks/useDepartmentExperience';
import { PrototypeIllustration } from '../../utils/prototypeIllustrations';

// Video Reference Recreated Sections
import DesignerRunwayCarousel from '../../components/editorial/DesignerRunwayCarousel';
import NewArrivalsTrack from '../../components/editorial/NewArrivalsTrack';
import EveningEditSection from '../../components/editorial/EveningEditSection';
import SummerSpecialsSection from '../../components/editorial/SummerSpecialsSection';
import InteractiveLookConfigurator from '../../components/editorial/InteractiveLookConfigurator';
import { ExpandableLookbookAccordion } from '../../components/editorial/ExpandableLookbookAccordion';
import PoolsideLookbookSection from '../../components/editorial/PoolsideLookbookSection';
import LatestTrendsStackSection from '../../components/editorial/LatestTrendsStackSection';
import MonumentalFooterHero from '../../components/editorial/MonumentalFooterHero';

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sizeDrawerOpen, setSizeDrawerOpen] = useState(false);
  const [brandCategory, setBrandCategory] = useState<'ALL' | 'INDIAN' | 'INTERNATIONAL' | 'STREETWEAR' | 'ACTIVEWEAR'>('ALL');

  // STAGE 15C.3: Department experience integration
  const dept = useDepartmentExperience();

  // Hero scroll-driven animation refs (scale 1.0 -> 0.94 and title parallax over first 500px)
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleScroll = () => {
      if (mediaQuery.matches) return;
      animationFrameId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Smoothly interpolate across the first 500 pixels of scroll
        const progress = Math.min(Math.max(scrollY / 500, 0), 1);
        const scale = 1.0 - progress * 0.06; // 1.0 -> 0.94
        const translateY = progress * -24; // layered title parallax movement

        if (heroImageRef.current) {
          heroImageRef.current.style.transform = `scale(${scale.toFixed(4)})`;
        }
        if (heroHeadlineRef.current) {
          heroHeadlineRef.current.style.transform = `translateY(${translateY.toFixed(2)}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Multi-brand catalog: showcase at least 8 distinct verified brands or department curation
  const featuredBrands = useMemo(() => {
    const registry = ALL_VERIFIED_BRANDS || BRANDS_DATA;
    if (dept.activeDept && dept.config?.brands && dept.config.brands.length > 0) {
      const deptBrandNames = dept.config.brands.map((b) => b.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const deptMatches = registry.filter((b) => {
        const cleanName = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanSlug = b.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        return deptBrandNames.some((dn) => cleanName === dn || cleanSlug.includes(dn) || cleanName.includes(dn));
      });
      if (deptMatches.length > 0) return deptMatches;
    }

    if (brandCategory === 'INDIAN') {
      return registry.filter((b) => b.origin === 'INDIAN').slice(0, 8);
    }
    if (brandCategory === 'INTERNATIONAL') {
      return registry.filter((b) => b.origin === 'INTERNATIONAL').slice(0, 8);
    }
    if (brandCategory === 'STREETWEAR') {
      const slugs = ['the-souled-store', 'bewakoof', 'snitch', 'levis', 'rare-rabbit', 'superdry', 'zara', 'hm'];
      return registry.filter((b) => slugs.includes(b.slug) || b.signatureStyle.toLowerCase().includes('streetwear')).slice(0, 8);
    }
    if (brandCategory === 'ACTIVEWEAR') {
      const slugs = ['nike', 'adidas', 'puma', 'hrx', 'decathlon', 'coitonic', 'technosport', 'nivia'];
      return registry.filter((b) => slugs.includes(b.slug) || b.signatureStyle.toLowerCase().includes('training') || b.signatureStyle.toLowerCase().includes('compression')).slice(0, 8);
    }
    // 'ALL': Diverse 8-brand curation across Indian couture, streetwear, activewear & international fashion
    const spotlightSlugs = ['sabyasachi', 'nike', 'the-souled-store', 'uniqlo', 'snitch', 'fabindia', 'the-row', 'hopscotch'];
    const curated = spotlightSlugs.map((s) => registry.find((b) => b.slug === s)).filter(Boolean) as typeof registry;
    return curated.length >= 8 ? curated : registry.slice(0, 8);
  }, [brandCategory, dept.activeDept, dept.config]);

  // Curated runway pieces spanning diverse brands for Section 8 (department-matched)
  const runwaySpotlight = useMemo(() => {
    if (dept.activeDept) {
      const slug = dept.activeDept.toLowerCase();
      let matched: typeof ALL_CLOTHING_CATALOG = [];
      if (slug === 'women') {
        matched = ALL_CLOTHING_CATALOG.filter((p) => p.audience === 'Women' || p.subcategory.toLowerCase().includes('dress'));
      } else if (slug === 'men') {
        matched = ALL_CLOTHING_CATALOG.filter((p) => p.audience === 'Men' || p.subcategory.toLowerCase().includes('suit') || p.subcategory.toLowerCase().includes('shirt'));
      } else if (slug === 'kids') {
        matched = ALL_CLOTHING_CATALOG.filter((p) => p.audience === 'Kids' || p.brandName.toLowerCase().includes('hopscotch') || p.brandName.toLowerCase().includes('carter'));
      } else if (slug === 'ethnic') {
        matched = ALL_CLOTHING_CATALOG.filter((p) => p.subcategory.toLowerCase().includes('kurta') || p.subcategory.toLowerCase().includes('saree') || p.subcategory.toLowerCase().includes('lehenga') || p.description.toLowerCase().includes('zardozi') || p.brandName.toLowerCase().includes('sabyasachi') || p.brandName.toLowerCase().includes('fabindia') || p.brandName.toLowerCase().includes('raw mango'));
      } else if (slug === 'streetwear') {
        matched = ALL_CLOTHING_CATALOG.filter((p) => p.subcategory.toLowerCase().includes('tee') || p.subcategory.toLowerCase().includes('cargo') || p.subcategory.toLowerCase().includes('hoodie') || p.brandName.toLowerCase().includes('snitch') || p.brandName.toLowerCase().includes('bewakoof') || p.brandName.toLowerCase().includes('souled store'));
      } else if (slug === 'gym') {
        matched = ALL_CLOTHING_CATALOG.filter((p) => p.subcategory.toLowerCase().includes('compression') || p.subcategory.toLowerCase().includes('jogger') || p.subcategory.toLowerCase().includes('legging') || p.brandName.toLowerCase().includes('nike') || p.brandName.toLowerCase().includes('puma') || p.brandName.toLowerCase().includes('adidas') || p.brandName.toLowerCase().includes('hrx'));
      }
      if (matched.length > 0) {
        return matched.slice(0, 8).map(toCatalogProduct);
      }
    }
    const diverseIds = ['prod-life-01', 'prod-life-07', 'prod-ind-01', 'prod-life-10', 'prod-life-09', 'prod-life-14', 'prod-life-03', 'prod-life-16'];
    const items = diverseIds.map((id) => ALL_CLOTHING_CATALOG.find((p) => p.id === id)).filter(Boolean) as typeof ALL_CLOTHING_CATALOG;
    return items.length >= 8 ? items.map(toCatalogProduct) : ALL_CLOTHING_CATALOG.slice(0, 8).map(toCatalogProduct);
  }, [dept.activeDept]);

  // Call React Hooks unconditionally at the top level
  const { data: catalogData } = useProducts({ size: 4 });

  // If search parameters are present on root URL, redirect seamlessly to the full products catalog
  if (searchParams.get('search') || searchParams.get('categoryId') || searchParams.get('brand')) {
    return <Navigate to={`/products?${searchParams.toString()}`} replace />;
  }

  const liveProducts = catalogData?.content?.filter(p => !p.name.toLowerCase().includes('phone') && !p.name.toLowerCase().includes('electronic')) || [];

  // STAGE 15C.3: Build the hero slide class name for prototype-matched lifecycle
  const heroSlideClass = `hs sl${dept.heroRevealed ? ' on' : ''}`;

  return (
    <Box sx={{ bgcolor: 'var(--bg, #fbf6ec)', color: 'var(--ink, #1a1420)', overflow: 'hidden' }}>

      {/* =========================================================================
          1. PROTOTYPE-ALIGNED EDITORIAL HERO WITH PARALLAX & TRUST BAR
          STAGE 15C.3: Department-specific content, animation lifecycle, glow
      ========================================================================= */}
      <Box
        component="section"
        aria-label={dept.activeDept ? `${dept.config?.label ?? ''} Department Editorial Hero` : 'Lumière Opening Editorial Hero'}
        className={heroSlideClass}
        sx={{
          position: 'relative',
          minHeight: { xs: '84vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'var(--bg, #fbf6ec)',
          color: 'var(--ink, #1a1420)',
          backgroundImage: dept.hero.glowGradient,
          overflow: 'hidden',
          pt: { xs: 8, md: 7 },
          pb: { xs: 8, md: 9 },
          borderBottom: '1px solid var(--line, #e5dccb)',
          transition: 'background-image 0.6s ease'
        }}
      >
        {/* Subtle Atmospheric Glow */}
        <Box className="hero-atmospheric-glow" />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={{ xs: 6, lg: 8 }} sx={{ alignItems: 'center' }}>

            {/* Left Headline & Action Column */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box ref={heroHeadlineRef} sx={{ maxWidth: 740, willChange: 'transform', transition: 'transform 0.05s ease-out' }}>

                {/* Editorial Collection Tag */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor: dept.config?.accentColor ?? 'var(--cobalt, #3a3ce0)',
                    boxShadow: `0 0 10px ${dept.config?.glowColor ?? 'rgba(58, 60, 224, 0.5)'}`,
                    transition: 'background-color 0.4s ease, box-shadow 0.4s ease'
                  }} />
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'var(--mute, #6b6173)',
                      letterSpacing: '0.22em',
                      fontWeight: 700,
                      fontSize: { xs: '0.72rem', sm: '0.82rem' },
                      fontFamily: '"Instrument Sans", sans-serif'
                    }}
                  >
                    {dept.hero.tag}
                  </Typography>
                </Box>

                {/* Oversized Editorial Typography */}
                <Typography
                  variant="h1"
                  component="h1"
                  className="hero-h1"
                  sx={{
                    color: 'var(--ink, #1a1420)',
                    fontSize: dept.activeDept
                      ? { xs: '3.4rem', sm: '5.2rem', md: 'clamp(58px, 9vw, 126px)' }
                      : { xs: '2.85rem', sm: '4.2rem', md: 'clamp(46px, 7.5vw, 108px)' },
                    lineHeight: dept.activeDept ? 0.92 : { xs: 1.08, md: 0.96 },
                    fontWeight: 400,
                    letterSpacing: dept.activeDept ? '-0.02em' : '-0.035em',
                    fontFamily: dept.activeDept ? 'Anton, Impact, sans-serif' : '"Fraunces", Georgia, serif',
                    textTransform: dept.activeDept ? 'uppercase' : 'none',
                    mb: 3
                  }}
                >
                  <span style={{ display: 'block', overflow: 'hidden' }}>
                    <b style={{ display: 'block' }}>{dept.hero.title}</b>
                  </span>
                  <span style={{ display: 'block', overflow: 'hidden' }}>
                    <b
                      className={dept.activeDept ? 'hl' : ''}
                      style={{
                        display: 'block',
                        fontStyle: dept.activeDept ? 'normal' : 'italic',
                        color: dept.config?.accentColor
                          ? dept.config.accentColor
                          : dept.activeDept
                            ? 'var(--lime, #d8f25a)'
                            : 'var(--cobalt, #3a3ce0)',
                        letterSpacing: dept.activeDept ? '-0.02em' : '-0.02em',
                        transition: 'color 0.4s ease'
                      }}
                    >
                      {dept.hero.titleItalic}
                    </b>
                  </span>
                </Typography>

                {/* Refined Editorial Subtitle */}
                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--mute, #6b6173)',
                    fontSize: { xs: '1.05rem', md: '1.22rem' },
                    lineHeight: 1.7,
                    maxWidth: 580,
                    mb: 5,
                    fontWeight: 400,
                    fontFamily: '"Instrument Sans", sans-serif'
                  }}
                >
                  {dept.hero.subtitle}
                </Typography>

                {/* Pill-Shaped Calls To Action */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'center' }}>
                  <Button
                    component={Link}
                    to="#runway-track"
                    variant="contained"
                    size="large"
                    className="lumiere-pill-btn"
                    endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 4,
                      py: 1.8,
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      bgcolor: 'var(--lime, #d8f25a)',
                      color: '#1a1420',
                      borderRadius: '99px',
                      fontFamily: '"Instrument Sans", sans-serif',
                      boxShadow: '0 8px 24px rgba(216, 242, 90, 0.35)',
                      '&:hover': {
                        bgcolor: '#c6e245',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {dept.activeDept && dept.config?.tabs?.[0] ? `Shop ${dept.config.tabs[0].toLowerCase()} →` : 'Explore Collections'}
                  </Button>

                  <Button
                    component={Link}
                    to="/brands"
                    variant="outlined"
                    size="large"
                    className="lumiere-pill-btn"
                    sx={{
                      borderColor: 'var(--ink, #1a1420)',
                      color: 'var(--ink, #1a1420)',
                      px: 3.8,
                      py: 1.7,
                      fontSize: '0.96rem',
                      borderRadius: '99px',
                      '&:hover': {
                        borderColor: 'var(--cobalt, #3a3ce0)',
                        color: 'var(--cobalt, #3a3ce0)',
                        backgroundColor: 'rgba(58, 60, 224, 0.05)'
                      }
                    }}
                  >
                    Directory of 55+ Maisons
                  </Button>

                  {/* Secondary Circular Play Button */}
                  <Box
                    component="a"
                    href="#runway-track"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1.2,
                      textDecoration: 'none',
                      color: 'var(--ink, #1a1420)',
                      cursor: 'pointer',
                      py: 0.8,
                      px: 1.2
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        bgcolor: 'rgba(26, 20, 32, 0.08)',
                        border: '1px solid var(--line, #e5dccb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ink, #1a1420)',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
                      }}
                    >
                      <PlayArrowRounded sx={{ fontSize: 22, ml: 0.2 }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: '0.80rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      WATCH FILM
                    </Typography>
                  </Box>
                </Box>

                {/* Verification Trust Indicators */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 6, pt: 4, borderTop: '1px solid var(--line, #e5dccb)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <VerifiedUserOutlined sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: 'var(--ink, #1a1420)', letterSpacing: '0.04em', fontWeight: 600 }}>
                      100% Verified Brand Domains
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <DiamondOutlined sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: 'var(--ink, #1a1420)', letterSpacing: '0.04em', fontWeight: 600 }}>
                      Indian Couture & Global Luxury
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <StraightenOutlined sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: 'var(--ink, #1a1420)', letterSpacing: '0.04em', fontWeight: 600 }}>
                      Unified Precision Sizing Matrix
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Grid>

            {/* Right Asymmetrical Campaign Visual */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ position: 'relative', maxWidth: 500, mx: 'auto' }}>

                {/* Main Hero Visual Card with Silhouette Illustration Support */}
                <Card
                  ref={heroImageRef}
                  className={`sa${dept.heroAnimationClass ? ` ${dept.heroAnimationClass}` : ''}`}
                  sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 60px rgba(26, 20, 32, 0.12)',
                    border: '1px solid var(--line, #e5dccb)',
                    bgcolor: dept.activeDept ? '#120f18' : '#FFFFFF',
                    willChange: 'transform',
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s ease-out, background-color 0.4s ease'
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '130%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {dept.activeDept ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: { xs: 2, md: 3 },
                          background: 'radial-gradient(circle at 50% 50%, rgba(216, 242, 90, 0.08) 0%, transparent 70%)'
                        }}
                      >
                        <PrototypeIllustration
                          slot="hero1"
                          shape={
                            dept.activeDept === 'women' ? 'dress' :
                              dept.activeDept === 'men' ? 'jacket' :
                                dept.activeDept === 'kids' ? 'tee' :
                                  dept.activeDept === 'ethnic' ? 'kurta' :
                                    dept.activeDept === 'streetwear' ? 'hood' : 'leg'
                          }
                          gender={dept.activeDept === 'men' ? 'm' : dept.activeDept === 'kids' ? 'k' : 'w'}
                          style={{
                            width: '100%',
                            height: '100%',
                            maxHeight: '440px',
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.45))'
                          }}
                        />
                      </Box>
                    ) : (
                      <CardMedia
                        component="img"
                        className="hero-art"
                        image={dept.hero.image}
                        alt="Lumière Editorial Haute Couture Campaign"
                        loading="eager"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'opacity 0.5s ease'
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(26, 20, 32, 0.88) 0%, rgba(26, 20, 32, 0.1) 60%, transparent 100%)',
                        pointerEvents: 'none'
                      }}
                    />
                    <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24, zIndex: 3 }}>
                      <Chip
                        label={dept.hero.chipLabel}
                        size="small"
                        sx={{
                          bgcolor: dept.config?.accentColor === '#e7c04a' ? '#e7c04a' : 'var(--lime, #d8f25a)',
                          color: '#1a1420',
                          fontWeight: 700,
                          fontFamily: '"Instrument Sans", sans-serif',
                          letterSpacing: '0.08em',
                          mb: 1.5,
                          fontSize: '0.68rem',
                          borderRadius: '99px'
                        }}
                      />
                      <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: 'Anton, "Fraunces", Georgia, serif', mb: 0.5, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                        {dept.hero.cardTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#E5DCCB', display: 'block', fontFamily: '"Instrument Sans", sans-serif' }}>
                        {dept.hero.cardSubtitle}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Floating Asymmetrical Accent Card (Preserved for Tests) */}
                <Box
                  sx={{
                    display: dept.activeDept ? 'none' : { xs: 'none', sm: 'block' },
                    position: 'absolute',
                    top: -24,
                    left: -32,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    p: 2.5,
                    borderRadius: '18px',
                    border: '1px solid var(--line, #e5dccb)',
                    boxShadow: '0 16px 36px rgba(26, 20, 32, 0.08)',
                    maxWidth: 220
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 700, display: 'block', lineHeight: 1.2, letterSpacing: '0.1em' }}>
                    AUTHENTICITY
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'var(--ink, #1a1420)', fontWeight: 600, mt: 0.5, fontFamily: '"Fraunces", Georgia, serif' }}>
                    Zero Counterfeits
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--mute, #6b6173)', display: 'block', mt: 0.5, lineHeight: 1.4, fontFamily: '"Instrument Sans", sans-serif' }}>
                    Direct referrals exclusively to certified brand flagships.
                  </Typography>
                </Box>

              </Box>
            </Grid>

          </Grid>
        </Container>

        {/* Floating Bottom Glass Trust Bar */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(26, 20, 32, 0.88)',
            backdropFilter: 'blur(16px)',
            color: '#fbf6ec',
            py: 1.2,
            px: 3.5,
            borderRadius: '999px',
            border: '1px solid rgba(229, 220, 203, 0.25)',
            boxShadow: '0 16px 40px rgba(26, 20, 32, 0.25)',
            alignItems: 'center',
            gap: 4,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ color: 'var(--lime, #d8f25a)', fontSize: '13px' }}>✂</Box>
            <Box>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, fontFamily: '"Instrument Sans", sans-serif' }}>{dept.activeDept ? dept.hero.trustBarStat : '58 Master Ateliers'}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(251, 246, 236, 0.65)', fontFamily: '"Instrument Sans", sans-serif' }}>{dept.activeDept ? `${dept.config?.label ?? ''} Collection` : 'Fair wages & couture craft'}</Typography>
            </Box>
          </Box>

          <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(251, 246, 236, 0.2)' }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ color: 'var(--lime, #d8f25a)', fontSize: '13px' }}>★</Box>
            <Box>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, fontFamily: '"Instrument Sans", sans-serif' }}>Direct Brand Checkout</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(251, 246, 236, 0.65)', fontFamily: '"Instrument Sans", sans-serif' }}>Official designer domains</Typography>
            </Box>
          </Box>

          <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(251, 246, 236, 0.2)' }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ color: 'var(--lime, #d8f25a)', fontSize: '13px' }}>↺</Box>
            <Box>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, fontFamily: '"Instrument Sans", sans-serif' }}>Zero Middlemen</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(251, 246, 236, 0.65)', fontFamily: '"Instrument Sans", sans-serif' }}>Authentic atelier prices</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Prototype Department Marquee Ticker (Active Department Only) */}
      {dept.activeDept && (
        <Box
          className="mq"
          sx={{
            py: 1.4,
            bgcolor: 'var(--lime, #d8f25a)',
            color: '#120f18',
            borderTop: '1px solid var(--line, #e5dccb)',
            borderBottom: '1px solid var(--line, #e5dccb)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: '0.92rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          <Box className="t" sx={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            <span>
              ★ {dept.config?.mq || 'DIRECT ATELIER REFERRALS • 100% VERIFIED AUTHENTIC'} ● 14-DAY HASSLE-FREE RETURNS ● ETHICAL ATELIERS ONLY ★ {dept.config?.mq || 'DIRECT ATELIER REFERRALS • 100% VERIFIED AUTHENTIC'} ● SAME DAY DISPATCH IN METROS ● ZERO MIDDLEMEN
            </span>
          </Box>
        </Box>
      )}

      {/* =========================================================================
          FASHION DESIGNER 3D ANIMATED CAROUSEL (REFERENCE IMAGE 3 RECREATION)
          - Replaces Section 1 (The Lumière Signatures arched cards) and Section 2 (Three Portfolio Cards)
          - Single unified 3D layered carousel with warm cream background, rich colors, and DRAG interaction
      ========================================================================= */}
      <DesignerRunwayCarousel />

      {/* =========================================================================
          SECTION 3 (REFERENCE RECREATION): FRESH OFF THE CUTTING TABLE / NEW ARRIVALS
      ========================================================================= */}
      <NewArrivalsTrack />

      {/* =========================================================================
          SECTION 4 (REFERENCE RECREATION): AFTER DARK / THE EVENING EDIT
      ========================================================================= */}
      <EveningEditSection />

      {/* =========================================================================
          SECTION 5 (REFERENCE RECREATION): SUMMER SPECIALS & TRENDING TODAY
      ========================================================================= */}
      <SummerSpecialsSection />

      {/* =========================================================================
          SECTION 6 (REFERENCE RECREATION): INTERACTIVE LOOKBOOK CONFIGURATOR
      ========================================================================= */}
      <InteractiveLookConfigurator />

      {/* =========================================================================
          SECTION 7 (REFERENCE RECREATION): WORTH YOUR ATTENTION (CURRENT OFFERS)
      ========================================================================= */}
      <Box className={`ly${dept.lookbookRevealed ? ' on' : ''}`}>
        <ExpandableLookbookAccordion activeDept={dept.activeDept} departmentLooks={dept.config?.looks} />
      </Box>

      {/* =========================================================================
          SECTION 8 (REFERENCE RECREATION): POOLSIDE SS/26 LOOKBOOK
      ========================================================================= */}
      <PoolsideLookbookSection />

      {/* =========================================================================
          SECTION 9 (REFERENCE RECREATION): LATEST TRENDS & STORIES BEHIND THE SEAMS
      ========================================================================= */}
      <LatestTrendsStackSection />

      {/* =========================================================================
          MAISON CURATION: 70 CURATED PARTNER BRANDS & VERIFIED DOMAINS
      ========================================================================= */}
      <Box className={`rv${dept.heroRevealed ? ' in' : ''}`} sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--eve-bg, #2b1238)', color: '#FFFFFF', position: 'relative' }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 6, lg: 8 }} sx={{ alignItems: 'center' }}>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Typography variant="overline" sx={{ color: 'var(--lime, #d8f25a)', fontWeight: 700, letterSpacing: '0.22em', fontFamily: '"Instrument Sans", sans-serif' }}>
                {dept.activeDept ? `${dept.config?.label.toUpperCase()} BRAND DIRECTORY` : 'MAISON CURATION'}
              </Typography>
              <Typography variant="h2" sx={{ color: '#FFFFFF', fontWeight: 400, my: 2, fontFamily: '"Fraunces", Georgia, serif' }}>
                {dept.activeDept && dept.config?.brH ? (
                  <span>{dept.config.label}&apos;s brands <span style={{ color: 'var(--lime, #d8f25a)', fontStyle: 'italic' }}>we send you to</span></span>
                ) : (
                  <>Dual Heritage: <span style={{ color: 'var(--lime, #d8f25a)' }}>Indian Artistry</span> & Global Avant-Garde</>
                )}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--eve-mute, #cbb8d6)', mb: 4, lineHeight: 1.8, fontSize: '1.02rem', fontFamily: '"Instrument Sans", sans-serif' }}>
                {dept.activeDept && dept.config ? (
                  `LUMIÈRE curates verified official destinations for ${dept.config.label} wear. Every brand card directs you directly to the authenticated designer website.`
                ) : (
                  'LUMIÈRE bridges the world’s most celebrated textile civilizations. From the timeless zardozi embroidery of Sabyasachi and handloom Chanderi weaves of Raw Mango to the sculptural minimalism of The Row and Parisian tailoring of Saint Laurent.'
                )}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(216, 242, 90, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime, #d8f25a)', flexShrink: 0 }}>
                    <PublicOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFF', fontFamily: '"Instrument Sans", sans-serif' }}>70 Curated Partner Brands</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--eve-mute, #cbb8d6)', fontFamily: '"Instrument Sans", sans-serif' }}>35 prestigious Indian couturiers & labels, and 35 iconic international houses.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(216, 242, 90, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime, #d8f25a)', flexShrink: 0 }}>
                    <VerifiedUserOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFF', fontFamily: '"Instrument Sans", sans-serif' }}>Certified Official Domains</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--eve-mute, #cbb8d6)', fontFamily: '"Instrument Sans", sans-serif' }}>Every external referral links exclusively to the verified root domain of each designer.</Typography>
                  </Box>
                </Box>
              </Box>

              <Button
                component={Link}
                to="/brands"
                variant="contained"
                className="lumiere-pill-btn"
                endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
                sx={{
                  px: 4,
                  py: 1.6,
                  bgcolor: 'var(--lime, #d8f25a)',
                  color: '#1a1420',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontFamily: '"Instrument Sans", sans-serif',
                  '&:hover': {
                    bgcolor: '#c2e043'
                  }
                }}
              >
                Browse Full Brand Directory
              </Button>
            </Grid>

            {/* Featured Brand Grid Column */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box
                role="group"
                aria-label="Brand category filter"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  p: 0.6,
                  mb: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  position: 'relative',
                  gap: 0.5,
                  flexWrap: 'wrap'
                }}
              >
                {[
                  { id: 'ALL', label: 'All Houses (8)' },
                  { id: 'STREETWEAR', label: 'Streetwear & Denim' },
                  { id: 'ACTIVEWEAR', label: 'Activewear & Sport' },
                  { id: 'INDIAN', label: 'Indian Couture & Craft' },
                  { id: 'INTERNATIONAL', label: 'Global Fashion' }
                ].map((tab) => {
                  const isActive = brandCategory === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setBrandCategory(tab.id as any)}
                      aria-pressed={isActive}
                      size="small"
                      sx={{
                        borderRadius: '999px',
                        px: 2.2,
                        py: 0.8,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontFamily: '"Instrument Sans", sans-serif',
                        color: isActive ? '#1a1420' : 'rgba(255, 255, 255, 0.7)',
                        bgcolor: isActive ? 'var(--lime, #d8f25a)' : 'transparent',
                        boxShadow: isActive ? '0 4px 14px rgba(216, 242, 90, 0.25)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          bgcolor: isActive ? 'var(--lime, #d8f25a)' : 'rgba(255, 255, 255, 0.1)',
                          color: isActive ? '#1a1420' : '#FFF'
                        }
                      }}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </Box>

              <Grid container spacing={2}>
                {featuredBrands.map((brand) => (
                  <Grid key={brand.id} size={{ xs: 12, sm: 6 }}>
                    <Card
                      component={Link}
                      to={`/brands?search=${encodeURIComponent(brand.name)}`}
                      className="lumiere-card br"
                      sx={{
                        bgcolor: '#141414',
                        color: '#FFF',
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textDecoration: 'none',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          borderColor: 'var(--lime, #d8f25a)',
                          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
                        }
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, gap: 1 }}>
                          <Chip
                            label={brand.origin === 'INDIAN' ? 'INDIAN COUTURE' : 'INTERNATIONAL'}
                            size="small"
                            sx={{
                              bgcolor: brand.origin === 'INDIAN' ? 'rgba(58, 60, 224, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                              color: brand.origin === 'INDIAN' ? 'var(--lime, #d8f25a)' : '#FFF',
                              fontWeight: 700,
                              fontSize: '0.62rem',
                              fontFamily: '"Instrument Sans", sans-serif',
                              borderRadius: '999px'
                            }}
                          />
                          <Chip
                            label={`✓ ${brand.verifiedDomain}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: '#A0988E',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              fontSize: '0.62rem',
                              fontFamily: '"Instrument Sans", sans-serif',
                              borderRadius: '999px'
                            }}
                          />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFF', mb: 0.6, fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.2rem' }}>
                          {brand.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#A0988E', fontSize: '0.8rem', lineHeight: 1.5, mb: 2, fontFamily: '"Instrument Sans", sans-serif' }}>
                          {brand.signatureStyle || brand.description}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#888', fontFamily: '"Instrument Sans", sans-serif', fontSize: '0.7rem' }}>
                          Atelier: {brand.city}, {brand.country}
                        </Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'var(--lime, #d8f25a)', fontSize: '0.72rem', fontWeight: 600 }}>
                          <span>Explore Maison</span>
                          <ArrowForwardOutlined sx={{ fontSize: 13 }} />
                        </Box>
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
          EDITORIAL RUNWAY: FEATURED RUNWAY PIECES
      ========================================================================= */}
      <Box id="runway-track" component="section" aria-label="Featured Runway Pieces Runway" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--bg, #fbf6ec)', borderTop: '1px solid var(--line, #e5dccb)', borderBottom: '1px solid var(--line, #e5dccb)', overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <EditorialRunwayTrack
            eyebrow={dept.activeDept ? `${dept.config?.label.toUpperCase()} RUNWAY` : 'CURATED SELECTION'}
            title={dept.activeDept && dept.config?.newH ? dept.config.newH : 'Featured Runway Pieces'}
            subtitle={dept.activeDept ? `Explore new seasonal ${dept.config?.label.toLowerCase()} arrivals and signature wardrobe pieces.` : 'Hand-selected signature creations showcasing the pinnacle of modern tailoring and textile craft.'}
            ariaLabel={dept.activeDept ? `${dept.config?.label} Runway Pieces` : 'Featured runway pieces track'}
            action={
              <Button
                component={Link}
                to={dept.activeDept ? `/products?category=${dept.activeDept}` : '/products'}
                sx={{ color: '#1a1420', fontWeight: 600, fontFamily: '"Instrument Sans", sans-serif' }}
              >
                View Full Catalog
              </Button>
            }
          >
            {(liveProducts.length > 0 ? liveProducts : runwaySpotlight).map((p) => (
              <Box key={p.id} sx={{ height: '100%' }}>
                <ProductCard product={p} />
              </Box>
            ))}
          </EditorialRunwayTrack>
        </Container>
      </Box>

      {/* =========================================================================
          SIZE-GUIDE MATRIX TEASER
      ========================================================================= */}
      <Box component="section" aria-label="Atelier Sizing Matrix Benchmark" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
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
                  <StraightenOutlined sx={{ color: 'var(--lime, #d8f25a)', fontSize: 28 }} />
                  <Typography variant="overline" sx={{ color: 'var(--lime, #d8f25a)', fontWeight: 700, letterSpacing: '0.2em', fontFamily: '"Instrument Sans", sans-serif' }}>
                    ATELIER SIZING BENCHMARK
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 400, fontFamily: '"Fraunces", Georgia, serif', mb: 1.5 }}>
                  Unified International & Indian Fit Matrix
                </Typography>
                <Typography variant="body1" sx={{ color: '#C4BEB4', maxWidth: 650, lineHeight: 1.7, fontFamily: '"Instrument Sans", sans-serif' }}>
                  Different couturiers adhere to distinct measurement standards.
                  LUMIÈRE’s measurement matrix provides millimeter-exact cross-references between
                  Indian kurta sizing (inches), French/Italian couture sizes (FR 36-44 / IT 38-48), and UK/US standards.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  onClick={() => setSizeDrawerOpen(true)}
                  variant="contained"
                  className="lumiere-pill-btn"
                  startIcon={<StraightenOutlined />}
                  sx={{
                    px: 4,
                    py: 1.8,
                    bgcolor: 'var(--lime, #d8f25a)',
                    color: '#1a1420',
                    borderRadius: '99px',
                    fontWeight: 600,
                    fontFamily: '"Instrument Sans", sans-serif',
                    '&:hover': { bgcolor: '#c2e043' }
                  }}
                >
                  Open Sizing Matrix
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* =========================================================================
          THE LUMIÈRE PROTOCOL / VERIFIED REFERRAL MANIFESTO
      ========================================================================= */}
      <Box component="section" aria-label="The Lumière Protocol" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--bg, #fbf6ec)', borderTop: '1px solid var(--line, #e5dccb)' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 7 }}>
            <Typography variant="overline" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 700, letterSpacing: '0.2em', fontFamily: '"Instrument Sans", sans-serif' }}>
              THE LUMIÈRE PROTOCOL
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 400, mt: 1, fontFamily: '"Fraunces", Georgia, serif', color: 'var(--ink, #1a1420)' }}>
              How Discovery Works
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
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
                <Card className="lumiere-card" sx={{ p: 4, height: '100%', bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid var(--line, #e5dccb)' }}>
                  <Typography variant="h1" sx={{ color: 'var(--cobalt, #3a3ce0)', fontSize: '2.5rem', fontWeight: 600, mb: 1, fontFamily: '"Fraunces", Georgia, serif' }}>
                    {p.step}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--ink, #1a1420)', mb: 1.5, fontFamily: '"Fraunces", Georgia, serif' }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', lineHeight: 1.7, fontFamily: '"Instrument Sans", sans-serif' }}>
                    {p.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          SECTION 10 (REFERENCE RECREATION): MONUMENTAL TERRACE FOOTER HERO
      ========================================================================= */}
      <MonumentalFooterHero />

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
            bgcolor: 'var(--bg, #fbf6ec)',
            p: 4
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 700, fontFamily: '"Instrument Sans", sans-serif' }}>ATELIER SIZING</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'var(--ink, #1a1420)', fontFamily: '"Fraunces", Georgia, serif' }}>Measurement Matrix</Typography>
          </Box>
          <IconButton onClick={() => setSizeDrawerOpen(false)} aria-label="Close sizing matrix">
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
