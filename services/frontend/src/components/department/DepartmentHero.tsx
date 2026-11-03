import React from 'react';
import { Box, Container, Typography, Chip, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { AutoAwesomeOutlined } from '@mui/icons-material';
import type { DepartmentConfig } from '../../data/departmentConfig';
import { PrototypeIllustration } from '../../utils/prototypeIllustrations';

export interface DepartmentHeroProps {
  config: DepartmentConfig;
}

export const DepartmentHero: React.FC<DepartmentHeroProps> = ({ config }) => {
  const getDeptShape = (slug: string) => {
    switch (slug) {
      case 'women': return 'dress';
      case 'men': return 'jacket';
      case 'kids': return 'tee';
      case 'ethnic': return 'kurta';
      case 'streetwear': return 'hood';
      case 'gym': return 'crop';
      default: return 'dress';
    }
  };

  const getDeptTickerSpeed = (slug: string) => {
    switch (slug) {
      case 'gym': return '12s';
      case 'streetwear': return '14s';
      case 'kids': return '18s';
      case 'men': return '24s';
      case 'women': return '28s';
      case 'ethnic': return '32s';
      default: return '24s';
    }
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        bgcolor: 'var(--bg, #fbf6ec)',
        pt: { xs: 3, md: 5 },
        pb: { xs: 4, md: 6 },
        borderBottom: '1px solid var(--line, #e5dccb)',
        overflow: 'hidden'
      }}
    >
      {/* Atmospheric Radial Glow */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: '-15%',
          right: '-5%',
          width: { xs: 300, md: 650 },
          height: { xs: 300, md: 650 },
          borderRadius: '50%',
          background: config.glowGradient || 'radial-gradient(circle, rgba(58,60,224,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 2.5,
            fontSize: '0.78rem',
            fontFamily: '"Instrument Sans", sans-serif',
            '& .MuiBreadcrumbs-separator': { color: 'var(--mute, #6b6173)' }
          }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            sx={{ color: 'var(--mute, #6b6173)', '&:hover': { color: 'var(--cobalt, #3a3ce0)' } }}
          >
            LUMIÈRE
          </MuiLink>
          <Typography
            sx={{
              color: 'var(--ink, #1a1420)',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: '"Instrument Sans", sans-serif'
            }}
          >
            DEPARTMENTS
          </Typography>
          <Typography
            sx={{
              color: config.accentColor || 'var(--cobalt, #3a3ce0)',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: '"Instrument Sans", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            {config.label}
          </Typography>
        </Breadcrumbs>

        {/* Hero Grid Container */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center'
          }}
        >
          {/* Left Text Presentation */}
          <Box>
            {/* Tag / Category Badge */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<AutoAwesomeOutlined sx={{ fontSize: '13px !important', color: `${config.accentColor} !important` }} />}
                label={config.heroTag}
                size="small"
                sx={{
                  bgcolor: 'rgba(26, 20, 32, 0.04)',
                  border: `1px solid ${config.accentColor || 'var(--line, #e5dccb)'}`,
                  color: 'var(--ink, #1a1420)',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  px: 0.8
                }}
              />
            </Box>

            {/* Stacked Anton / Fraunces Title */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: '"Anton", "Impact", sans-serif',
                fontSize: { xs: '3.2rem', sm: '4.8rem', md: '5.6rem', lg: '6.4rem' },
                lineHeight: 0.92,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: 'var(--ink, #1a1420)',
                mb: 1.5
              }}
            >
              {config.heroTitle}{' '}
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: '-0.02em',
                  color: config.accentColor || 'var(--cobalt, #3a3ce0)'
                }}
              >
                {config.heroTitleItalic}
              </Box>
            </Typography>

            {/* Curated Editorial Subtitle */}
            <Typography
              variant="h6"
              component="p"
              sx={{
                fontFamily: '"Instrument Sans", "Outfit", sans-serif',
                fontSize: { xs: '1rem', md: '1.18rem' },
                lineHeight: 1.55,
                color: 'var(--mute, #6b6173)',
                maxWidth: 620,
                mb: 3.5,
                fontWeight: 400
              }}
            >
              {config.heroSubtitle}
            </Typography>

            {/* Curated Brand Spotlights in this Department */}
            {config.brands && config.brands.length > 0 && (
              <Box sx={{ pt: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--ink, #1a1420)',
                    display: 'block',
                    mb: 1.2
                  }}
                >
                  Featured Maisons & Ateliers:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {config.brands.map((brand) => (
                    <Chip
                      key={brand}
                      component={Link}
                      to={`/brands?search=${encodeURIComponent(brand)}`}
                      clickable
                      label={brand}
                      size="small"
                      sx={{
                        bgcolor: '#FFFFFF',
                        border: '1px solid var(--line, #e5dccb)',
                        color: 'var(--ink, #1a1420)',
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: config.accentColor || 'var(--cobalt, #3a3ce0)',
                          bgcolor: 'rgba(58, 60, 224, 0.04)',
                          color: config.accentColor || 'var(--cobalt, #3a3ce0)'
                        }
                      }}
                    />
                  ))}
                  <Chip
                    component={Link}
                    to="/brands"
                    clickable
                    label="View All 70 Maisons →"
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1px dashed var(--line, #e5dccb)',
                      color: 'var(--mute, #6b6173)',
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      '&:hover': {
                        borderColor: 'var(--cobalt, #3a3ce0)',
                        color: 'var(--cobalt, #3a3ce0)'
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* Right Visual Card */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 420,
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                border: '1px solid var(--line, #e5dccb)',
                boxShadow: '0 16px 40px rgba(26, 20, 32, 0.06)',
                p: { xs: 2.5, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Card Header Badge */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Chip
                  label={config.heroChipLabel}
                  size="small"
                  sx={{
                    bgcolor: config.accentColor ? `${config.accentColor}18` : 'rgba(58, 60, 224, 0.08)',
                    color: config.accentColor || 'var(--cobalt, #3a3ce0)',
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    letterSpacing: '0.08em'
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    color: 'var(--mute, #6b6173)',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  AUTUMN/WINTER 2026
                </Typography>
              </Box>

              {/* Silhouette Vector Presentation */}
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 220, md: 260 },
                  bgcolor: 'var(--bg, #fbf6ec)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  p: 2,
                  mb: 2.5,
                  position: 'relative'
                }}
              >
                <PrototypeIllustration
                  slot="hero1"
                  shape={getDeptShape(config.slug)}
                  deptName={config.label}
                  style={{
                    maxHeight: '100%',
                    filter: 'drop-shadow(0 12px 20px rgba(26, 20, 32, 0.12))'
                  }}
                />
              </Box>

              {/* Card Meta Description */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: 'var(--ink, #1a1420)',
                  textAlign: 'center',
                  mb: 0.5
                }}
              >
                {config.heroCardTitle}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  color: 'var(--mute, #6b6173)',
                  fontSize: '0.78rem',
                  textAlign: 'center'
                }}
              >
                {config.heroCardSubtitle}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Marquee Ticker Strip (.mq) */}
      <Box
        className="mq"
        sx={{
          mt: { xs: 3, md: 4.5 },
          bgcolor: 'var(--lime, #d8f25a)',
          color: '#1a1420',
          py: 0.9,
          borderTop: '1px solid #1a1420',
          borderBottom: '1px solid #1a1420',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        <Box
          sx={{
            display: 'inline-block',
            animation: `mq ${getDeptTickerSpeed(config.slug)} linear infinite`,
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          ✦ {config.mq} &nbsp; • &nbsp; ✦ DIRECT ATELIER REFERRALS &nbsp; • &nbsp; ✦ ZERO COUNTERFEITS &nbsp; • &nbsp; ✦ {config.mq} &nbsp; • &nbsp; ✦ DIRECT ATELIER REFERRALS &nbsp; • &nbsp; ✦ ZERO COUNTERFEITS &nbsp; • &nbsp;
        </Box>
      </Box>
    </Box>
  );
};

export default DepartmentHero;
