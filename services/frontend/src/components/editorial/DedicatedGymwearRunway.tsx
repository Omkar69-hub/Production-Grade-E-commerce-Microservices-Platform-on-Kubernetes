import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';
import { ArrowForwardOutlined, FitnessCenterOutlined, SpeedOutlined, SpaOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface ActivewearLook {
  id: string;
  title: string;
  brand: string;
  brandDomain: string;
  categoryTag: string;
  technicalBadge: string;
  description: string;
  fabric: string;
  fit: string;
  priceFormatted: string;
  imageUrl: string;
  imageAttribution: string;
  targetLink: string;
  isVerifiedPiece: boolean;
}

const MENS_ACTIVEWEAR_LOOKS: ActivewearLook[] = [
  {
    id: 'men-look-01',
    title: 'Dri-FIT ADV Aeroloft Engineered Compression Top',
    brand: 'Nike',
    brandDomain: 'nike.com',
    categoryTag: 'COMPRESSION',
    technicalBadge: 'Dri-FIT ADV Micro-Mesh',
    description: 'Targeted athletic ventilation zones and ergonomic flatlock seams for unrestricted motion during high-intensity conditioning.',
    fabric: '100% Recycled Polyester Dri-FIT',
    fit: 'Slim Athletic Compression Fit',
    priceFormatted: '₹3,495',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Technical Performance Compression Top',
    targetLink: '/products/prod-life-01',
    isVerifiedPiece: true,
  },
  {
    id: 'men-look-02',
    title: 'Primeknit Aeroready High-Performance Track Jacket',
    brand: 'Adidas',
    brandDomain: 'adidas.co.in',
    categoryTag: 'TRACKWEAR',
    technicalBadge: 'Aeroready Doubleknit',
    description: 'Iconic three-stripe heritage engineered with lightweight moisture-absorbing weave, ribbed cuffs, and stand-up collar.',
    fabric: 'Primegreen Recycled Doubleknit',
    fit: 'Regular Sport Cut',
    priceFormatted: '₹4,999',
    imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Performance Track Jacket & Layering',
    targetLink: '/products/prod-life-02',
    isVerifiedPiece: true,
  },
  {
    id: 'men-look-03',
    title: 'Rapid-Dry Anti-Microbial Athletic Training Joggers',
    brand: 'HRX',
    brandDomain: 'myntra.com/hrx',
    categoryTag: 'JOGGERS',
    technicalBadge: 'Rapid-Dry Poly-Spandex',
    description: 'Engineered for gym lifting and outdoor cardio with deep zip-secure utility pockets and ribbed ankle cuffs.',
    fabric: 'Poly-Spandex French Terry Blend',
    fit: 'Tapered Ankle Athletic Fit',
    priceFormatted: '₹1,499',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Tapered Athletic Training Joggers',
    targetLink: '/products/prod-life-04',
    isVerifiedPiece: true,
  },
  {
    id: 'men-look-04',
    title: 'Heavyweight Drop-Armhole Power Stringer',
    brand: 'Coitonic',
    brandDomain: 'coitonic.com',
    categoryTag: 'STRENGTH',
    technicalBadge: 'Combed Cotton & Elastane',
    description: 'Bodybuilding-inspired drop-armhole silhouette crafted with elastane stretch to accentuate upper-body physique aesthetics.',
    fabric: '95% Combed Cotton, 5% Spandex',
    fit: 'Drop-Armhole Athletic Cut',
    priceFormatted: '₹1,299',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Gymwear — Strength Conditioning Stringer',
    targetLink: '/products/prod-life-05',
    isVerifiedPiece: true,
  },
  {
    id: 'men-look-05',
    title: 'Domyos Breathable Cardio Stretch Training Tee',
    brand: 'Decathlon',
    brandDomain: 'decathlon.in',
    categoryTag: 'CARDIO',
    technicalBadge: '360° Omnidirectional Stretch',
    description: 'Multi-sport training t-shirt engineered with fast-drying synthetic micro-yarns for everyday functional workout routines.',
    fabric: '100% Breathable Micro-Poly Knit',
    fit: 'Regular Active Fit',
    priceFormatted: '₹699',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Functional Cardio Athletic T-Shirt',
    targetLink: '/products/prod-life-06',
    isVerifiedPiece: true,
  },
  {
    id: 'men-look-06',
    title: 'Techno-Shield Weather-Resistant Outdoor Windbreaker',
    brand: 'Technosport',
    brandDomain: 'technosport.in',
    categoryTag: 'OUTDOOR RUN',
    technicalBadge: 'Water-Repellent Ripstop',
    description: 'Ultra-lightweight protective outer shell designed for chilly morning runs, featuring underarm laser-cut ventilation ports.',
    fabric: 'Lightweight Poly-Ripstop Matrix',
    fit: 'Athletic Layering Shell',
    priceFormatted: '₹1,999',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Outdoor Endurance & Trail Windbreaker',
    targetLink: '/products?category=gymwear&gender=men',
    isVerifiedPiece: false,
  },
];

const WOMENS_ACTIVEWEAR_LOOKS: ActivewearLook[] = [
  {
    id: 'women-look-01',
    title: 'dryCELL Seamless Performance Workout Tights',
    brand: 'Puma',
    brandDomain: 'in.puma.com',
    categoryTag: 'COMPRESSION TIGHTS',
    technicalBadge: 'dryCELL Sweat-Wicking',
    description: 'High-waisted compression tights featuring seamless jacquard construction and supportive wide waistband for high-impact training.',
    fabric: 'Nylon & Elastane 4-Way Stretch',
    fit: 'High-Waisted Compression Fit',
    priceFormatted: '₹2,799',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Women Conditioning Leggings',
    targetLink: '/products/prod-life-03',
    isVerifiedPiece: true,
  },
  {
    id: 'women-look-02',
    title: 'Pro Seamless Technical Sports Bra & High-Rise Set',
    brand: 'Nike',
    brandDomain: 'nike.com',
    categoryTag: 'STUDIO SET',
    technicalBadge: 'Dri-FIT Seamless Knit',
    description: 'Ergonomic racerback support paired with compressive high-rise tights engineered for full mobility in yoga, pilates, and functional fitness.',
    fabric: '78% Recycled Polyester, 22% Spandex',
    fit: 'Medium Support Ergonomic Fit',
    priceFormatted: '₹4,295',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Seamless Yoga & Mobility Two-Piece Set',
    targetLink: '/products?category=gymwear&gender=women',
    isVerifiedPiece: false,
  },
  {
    id: 'women-look-03',
    title: 'Adizero Pace Running Shorts & Featherlight Vest',
    brand: 'Adidas',
    brandDomain: 'adidas.co.in',
    categoryTag: 'RUNNING PACE',
    technicalBadge: 'Aeroready Featherlight Weave',
    description: 'Designed for speed and distance. Split side seams offer maximum leg extension, with internal moisture-wicking brief liner.',
    fabric: '100% Recycled Polyester Dobby',
    fit: 'Athletic Split-Leg Pace Cut',
    priceFormatted: '₹3,299',
    imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Aerodynamic Race-Day Pace Vest & Shorts',
    targetLink: '/products?category=gymwear&gender=women',
    isVerifiedPiece: false,
  },
  {
    id: 'women-look-04',
    title: 'Studio Luxe Anatomical Four-Way Stretch Jumpsuit',
    brand: 'Puma',
    brandDomain: 'in.puma.com',
    categoryTag: 'SCULPT JUMPSUIT',
    technicalBadge: 'Anatomical Contour Knit',
    description: 'Second-skin one-piece athletic unitard providing seamless zero-chafing comfort across barre, dance conditioning, and core work.',
    fabric: '85% Polyamide, 15% Elastane',
    fit: 'Full-Body Compression Sculpt',
    priceFormatted: '₹4,999',
    imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Sculptural Studio Four-Way Stretch Jumpsuit',
    targetLink: '/products?category=gymwear&gender=women',
    isVerifiedPiece: false,
  },
  {
    id: 'women-look-05',
    title: 'High-Impact HIIT Cross-Back Workout Crop',
    brand: 'HRX',
    brandDomain: 'myntra.com/hrx',
    categoryTag: 'HIIT CROP',
    technicalBadge: 'Anti-Microbial Rapid-Dry',
    description: 'Bonded seams with ventilated laser-cut back panels ensure cool breathability during interval conditioning and heavy circuits.',
    fabric: 'Poly-Elastane Interlock Weave',
    fit: 'High-Support Compression Crop',
    priceFormatted: '₹1,599',
    imageUrl: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — High-Impact Cardio Training Crop',
    targetLink: '/products?category=gymwear&gender=women',
    isVerifiedPiece: false,
  },
  {
    id: 'women-look-06',
    title: 'Domyos Thermal Recovery Ribbed Knit Pullover',
    brand: 'Decathlon',
    brandDomain: 'decathlon.in',
    categoryTag: 'RECOVERY KNIT',
    technicalBadge: 'Brushed French Terry Warmth',
    description: 'Post-training cozy layer crafted from ultra-soft modal blend with thumbholes and relaxed boatneck collar for cool-down comfort.',
    fabric: '60% Cotton, 35% Modal, 5% Spandex',
    fit: 'Relaxed Recovery Cut',
    priceFormatted: '₹1,499',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Sportswear — Athletic Flexibility & Mobility Layer',
    targetLink: '/products?category=gymwear&gender=women',
    isVerifiedPiece: false,
  },
];

export const DedicatedGymwearRunway: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MEN' | 'WOMEN' | 'ALL'>('MEN');

  const displayedLooks =
    activeTab === 'MEN'
      ? MENS_ACTIVEWEAR_LOOKS
      : activeTab === 'WOMEN'
      ? WOMENS_ACTIVEWEAR_LOOKS
      : [...MENS_ACTIVEWEAR_LOOKS.slice(0, 3), ...WOMENS_ACTIVEWEAR_LOOKS.slice(0, 3)];

  return (
    <Box
      component="section"
      id="gymwear-discovery"
      aria-label="Dedicated Gymwear & Performance Sportswear Discovery"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: '#141118',
        color: '#fbf6ec',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(229, 220, 203, 0.15)',
        borderBottom: '1px solid rgba(229, 220, 203, 0.15)',
      }}
    >
      {/* Background Decorative Grid Lines */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Editorial Section Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, mb: 6, gap: 3 }}>
          <Box sx={{ maxWidth: 740 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--lime, #d8f25a)', boxShadow: '0 0 10px rgba(216, 242, 90, 0.6)' }} />
              <Typography
                variant="overline"
                sx={{
                  color: 'var(--lime, #d8f25a)',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.76rem',
                }}
              >
                PERFORMANCE & CONDITIONING • DUAL ATELIER RUNWAY
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                fontWeight: 500,
                color: '#ffffff',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                mb: 2,
              }}
            >
              High-Performance Activewear: <span style={{ fontStyle: 'italic', color: 'var(--lime, #d8f25a)' }}>Engineered for Motion</span>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Instrument Sans", sans-serif',
                color: 'rgba(251, 246, 236, 0.75)',
                fontSize: { xs: '0.98rem', md: '1.08rem' },
                lineHeight: 1.65,
              }}
            >
              Dual athletic curations spanning technical compression, four-way stretch leggings, seamless micro-mesh, and functional cardio silhouettes. Distinct photography for men and women with genuine athletic provenance.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/products?category=gymwear"
            endIcon={<ArrowForwardOutlined sx={{ fontSize: 18 }} />}
            sx={{
              color: 'var(--lime, #d8f25a)',
              borderColor: 'rgba(216, 242, 90, 0.4)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: '999px',
              px: 3,
              py: 1.2,
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.86rem',
              letterSpacing: '0.04em',
              textTransform: 'none',
              alignSelf: { xs: 'flex-start', md: 'flex-end' },
              '&:hover': {
                bgcolor: 'rgba(216, 242, 90, 0.1)',
                borderColor: 'var(--lime, #d8f25a)',
              },
            }}
          >
            Explore Complete Gymwear Catalog
          </Button>
        </Box>

        {/* Dual Universe Filter Tabs */}
        <Box
          role="tablist"
          aria-label="Activewear gender selection"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: 0.7,
            mb: 5,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button
            role="tab"
            aria-selected={activeTab === 'MEN'}
            onClick={() => setActiveTab('MEN')}
            startIcon={<FitnessCenterOutlined sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '999px',
              px: 2.8,
              py: 1,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              color: activeTab === 'MEN' ? '#1a1420' : '#ffffff',
              bgcolor: activeTab === 'MEN' ? 'var(--lime, #d8f25a)' : 'transparent',
              boxShadow: activeTab === 'MEN' ? '0 4px 14px rgba(216, 242, 90, 0.35)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: activeTab === 'MEN' ? 'var(--lime, #d8f25a)' : 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            Men’s Performance ({MENS_ACTIVEWEAR_LOOKS.length})
          </Button>

          <Button
            role="tab"
            aria-selected={activeTab === 'WOMEN'}
            onClick={() => setActiveTab('WOMEN')}
            startIcon={<SpaOutlined sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '999px',
              px: 2.8,
              py: 1,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              color: activeTab === 'WOMEN' ? '#1a1420' : '#ffffff',
              bgcolor: activeTab === 'WOMEN' ? 'var(--lime, #d8f25a)' : 'transparent',
              boxShadow: activeTab === 'WOMEN' ? '0 4px 14px rgba(216, 242, 90, 0.35)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: activeTab === 'WOMEN' ? 'var(--lime, #d8f25a)' : 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            Women’s Conditioning ({WOMENS_ACTIVEWEAR_LOOKS.length})
          </Button>

          <Button
            role="tab"
            aria-selected={activeTab === 'ALL'}
            onClick={() => setActiveTab('ALL')}
            startIcon={<SpeedOutlined sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '999px',
              px: 2.8,
              py: 1,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              color: activeTab === 'ALL' ? '#1a1420' : '#ffffff',
              bgcolor: activeTab === 'ALL' ? 'var(--lime, #d8f25a)' : 'transparent',
              boxShadow: activeTab === 'ALL' ? '0 4px 14px rgba(216, 242, 90, 0.35)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: activeTab === 'ALL' ? 'var(--lime, #d8f25a)' : 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            Dual Universe View
          </Button>
        </Box>

        {/* Technical Performance Feature Seals */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5, py: 2, px: 3, bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(251, 246, 236, 0.7)', display: 'inline-flex', alignItems: 'center', gap: 0.8, fontFamily: '"Instrument Sans", sans-serif' }}>
            <span style={{ color: 'var(--lime, #d8f25a)' }}>⚡</span> Moisture-Wicking Dri-FIT & Aeroready Knits
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(251, 246, 236, 0.7)', display: 'inline-flex', alignItems: 'center', gap: 0.8, fontFamily: '"Instrument Sans", sans-serif' }}>
            <span style={{ color: 'var(--lime, #d8f25a)' }}>🔄</span> 4-Way Anatomical Stretch Matrix
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(251, 246, 236, 0.7)', display: 'inline-flex', alignItems: 'center', gap: 0.8, fontFamily: '"Instrument Sans", sans-serif' }}>
            <span style={{ color: 'var(--lime, #d8f25a)' }}>🛡️</span> Anti-Microbial Odor Repelling
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(251, 246, 236, 0.7)', display: 'inline-flex', alignItems: 'center', gap: 0.8, fontFamily: '"Instrument Sans", sans-serif' }}>
            <span style={{ color: 'var(--lime, #d8f25a)' }}>✂️</span> Ergonomic Laser-Cut Seams
          </Typography>
        </Box>

        {/* Varied Asymmetrical Editorial Grid */}
        <Grid container spacing={3.5}>
          {displayedLooks.map((look) => (
            <Grid key={look.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                component={Link}
                to={look.targetLink}
                className="lumiere-card"
                sx={{
                  bgcolor: '#1b1722',
                  color: '#FFFFFF',
                  borderRadius: '22px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  textDecoration: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: 'var(--lime, #d8f25a)',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 20px rgba(216, 242, 90, 0.2)',
                  },
                }}
              >
                {/* Athletic Image with Dynamic Zoom */}
                <Box sx={{ position: 'relative', pt: '105%', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={look.imageUrl}
                    alt={look.title}
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': { transform: 'scale(1.06)' },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(27, 23, 34, 0.95) 0%, rgba(27, 23, 34, 0.2) 60%, transparent 100%)',
                    }}
                  />

                  {/* Top Badges */}
                  <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={look.categoryTag}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(26, 20, 32, 0.85)',
                        color: 'var(--lime, #d8f25a)',
                        border: '1px solid rgba(216, 242, 90, 0.35)',
                        fontWeight: 700,
                        fontSize: '0.64rem',
                        letterSpacing: '0.1em',
                        fontFamily: '"Instrument Sans", sans-serif',
                        borderRadius: '999px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />

                    <Chip
                      label={look.technicalBadge}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(58, 60, 224, 0.85)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.62rem',
                        fontFamily: '"Instrument Sans", sans-serif',
                        borderRadius: '999px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </Box>

                  {/* Verified Brand Attribution Seal */}
                  <Box sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${look.brand} • ✓ ${look.brandDomain}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontFamily: '"Instrument Sans", sans-serif',
                        borderRadius: '999px',
                        backdropFilter: 'blur(6px)',
                      }}
                    />
                  </Box>
                </Box>

                {/* Card Content & Technical Spec */}
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        mb: 1.2,
                        lineHeight: 1.3,
                      }}
                    >
                      {look.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        color: 'rgba(251, 246, 236, 0.72)',
                        fontSize: '0.84rem',
                        lineHeight: 1.6,
                        mb: 2,
                      }}
                    >
                      {look.description}
                    </Typography>

                    {/* Technical Specs Matrix */}
                    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 1.8, borderRadius: '12px', mb: 2.5 }}>
                      <Typography variant="caption" sx={{ display: 'block', color: 'rgba(251, 246, 236, 0.85)', fontSize: '0.72rem', fontFamily: '"Instrument Sans", sans-serif', mb: 0.5 }}>
                        <strong>Technical Fabric:</strong> {look.fabric}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'rgba(251, 246, 236, 0.85)', fontSize: '0.72rem', fontFamily: '"Instrument Sans", sans-serif' }}>
                        <strong>Athletic Fit:</strong> {look.fit}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Pricing & CTA Row */}
                  <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontStyle: 'italic',
                        color: 'var(--lime, #d8f25a)',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                      }}
                    >
                      {look.priceFormatted}
                    </Typography>

                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 600, fontFamily: '"Instrument Sans", sans-serif' }}>
                      <span>{look.isVerifiedPiece ? 'View Dossier' : 'Explore Category'}</span>
                      <ArrowForwardOutlined sx={{ fontSize: 15, color: 'var(--lime, #d8f25a)' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DedicatedGymwearRunway;
