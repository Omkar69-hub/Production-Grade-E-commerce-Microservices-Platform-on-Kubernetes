import React, { useState, useRef } from 'react';
import { Box, Typography, Chip, Button, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { ArrowForwardOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { CLOTHING_CATALOG, type VerifiedClothingProduct } from '../../data/clothingCatalogData';
import { formatINR } from '../../utils/currency';

export interface OccasionCuration {
  id: string;
  title: string;
  subtitle: string;
  curationStatement: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  subcategories: string[];
}

export const OCCASIONS_DATA: OccasionCuration[] = [
  {
    id: 'grand-sangeet',
    title: 'Grand Sangeet & Celebrations',
    subtitle: 'Vivid heritage weaves & celebratory silhouettes',
    curationStatement: 'Handloom Chanderi silks, Pichhwai motifs, gota patti detailing, and fluid drape craftsmanship curated for matrimonial music celebrations and lively daytime festivities.',
    bgGradient: 'linear-gradient(135deg, #2b1238 0%, #4a1d4e 100%)',
    accentColor: '#d8f25a',
    textColor: '#ffffff',
    subcategories: ['Heritage Festive', 'Sarees'],
  },
  {
    id: 'royal-heritage',
    title: 'Royal Heritage & Ceremonials',
    subtitle: 'Bespoke bridal couture & regal bandhgalas',
    curationStatement: 'Antique zardozi velvets, mandarin-collar ceremonial jacquards, and structured neo-military drapes designed for milestone matrimonial ceremonies.',
    bgGradient: 'linear-gradient(135deg, #1f1b24 0%, #2e2636 100%)',
    accentColor: '#f9e08a',
    textColor: '#ffffff',
    subcategories: ['Bridal Lehengas', 'Sherwanis & Bandhgalas'],
  },
  {
    id: 'sartorial-soiree',
    title: 'Sartorial Soirée & Red Carpet',
    subtitle: 'Fine merino wool suiting, le smoking & evening haute silhouettes',
    curationStatement: 'Super 250s fine merino wool dinner jackets, iconic grain de poudre tuxedo cuts, Parisian tweed craftsmanship, and Kashmiri tilla sequined sarees after dark.',
    bgGradient: 'linear-gradient(135deg, #111422 0%, #1a1e36 100%)',
    accentColor: '#8ea2ff',
    textColor: '#ffffff',
    subcategories: ['Sartorial Suiting', 'Haute Couture', 'Tailoring & Suiting', 'Couture Pret', 'Outerwear'],
  },
];

export interface CuratedOccasionPanelsProps {
  initialExpandedId?: string;
  className?: string;
}

export const CuratedOccasionPanels: React.FC<CuratedOccasionPanelsProps> = ({
  initialExpandedId = 'grand-sangeet',
  className = '',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggleOccasion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    const total = OCCASIONS_DATA.length;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % total;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + total) % total;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = total - 1;
    }

    if (nextIndex !== null) {
      tabRefs.current[nextIndex]?.focus();
    }
  };

  // Filter verified items for a given occasion based strictly on authentic catalog subcategories
  const getPiecesForOccasion = (occasion: OccasionCuration): VerifiedClothingProduct[] => {
    return CLOTHING_CATALOG.filter((p) => occasion.subcategories.includes(p.subcategory));
  };

  return (
    <Box
      className={`lumiere-curated-occasions ${className}`}
      sx={{
        width: '100%',
        py: { xs: 4, md: 6 },
      }}
    >
      {/* Editorial Section Header */}
      <Box sx={{ mb: 4, px: { xs: 2, md: 3 }, maxWidth: 800 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#3a3ce0',
            fontWeight: 700,
            letterSpacing: '0.18em',
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '0.75rem',
            display: 'block',
            mb: 0.8,
          }}
        >
          CURATED OCCASION EDITORIALS
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
            fontWeight: 500,
            color: '#1a1420',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            mb: 1.5,
          }}
        >
          Edits for Every Grand Occasion
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: '"Instrument Sans", sans-serif',
            color: '#6b6173',
            fontSize: '1.05rem',
            lineHeight: 1.6,
          }}
        >
          Explore fashion pieces styled for specific social moments. Discover verified creations from iconic maisons, complete with salon provenance and direct referral links.
        </Typography>
      </Box>

      {/* Accordion Panels Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          px: { xs: 2, md: 3 },
        }}
      >
        {OCCASIONS_DATA.map((occasion, index) => {
          const isExpanded = expandedId === occasion.id;
          const pieces = getPiecesForOccasion(occasion);

          return (
            <Box
              key={occasion.id}
              sx={{
                borderRadius: '24px',
                border: '1px solid #e5dccb',
                bgcolor: '#ffffff',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                '&:hover': {
                  borderColor: '#1a1420',
                  boxShadow: '0 8px 30px rgba(26, 20, 32, 0.06)',
                },
              }}
            >
              {/* Accordion Header Button */}
              <Box
                component="button"
                ref={(el: HTMLButtonElement | null) => {
                  tabRefs.current[index] = el;
                }}
                id={`occasion-tab-${occasion.id}`}
                aria-expanded={isExpanded}
                aria-controls={`occasion-panel-${occasion.id}`}
                onClick={() => toggleOccasion(occasion.id)}
                onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => handleTabKeyDown(e, index)}
                type="button"
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  background: isExpanded ? occasion.bgGradient : '#ffffff',
                  color: isExpanded ? occasion.textColor : '#1a1420',
                  border: 0,
                  cursor: 'pointer',
                  transition: 'background 0.35s ease, color 0.35s ease',
                  '&:focus-visible': {
                    outline: '3px solid #3a3ce0',
                    outlineOffset: '-3px',
                  },
                }}
              >
                <Box sx={{ maxWidth: '85%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8, flexWrap: 'wrap' }}>
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        color: isExpanded ? occasion.accentColor : '#3a3ce0',
                        fontSize: '0.72rem',
                        fontFamily: '"Instrument Sans", sans-serif',
                      }}
                    >
                      OCCASION {String(index + 1).padStart(2, '0')} • {pieces.length} VERIFIED CREATIONS
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                      fontWeight: 500,
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {occasion.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isExpanded ? 'rgba(255, 255, 255, 0.78)' : '#6b6173',
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '0.92rem',
                      mt: 0.5,
                    }}
                  >
                    {occasion.subtitle}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isExpanded ? 'rgba(255, 255, 255, 0.15)' : '#fbf6ec',
                    border: isExpanded ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #e5dccb',
                    color: isExpanded ? '#ffffff' : '#1a1420',
                    transition: 'transform 0.3s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                >
                  <ExpandMoreOutlined />
                </Box>
              </Box>

              {/* Accordion Content Region */}
              <Box
                id={`occasion-panel-${occasion.id}`}
                role="region"
                aria-labelledby={`occasion-tab-${occasion.id}`}
                hidden={!isExpanded}
                sx={{
                  display: isExpanded ? 'block' : 'none',
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  bgcolor: '#faf6ee',
                  borderTop: '1px solid #e5dccb',
                }}
              >
                {/* Occasion Editorial Statement */}
                <Box sx={{ maxWidth: 820, mb: 4 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"Instrument Sans", sans-serif',
                      color: '#1a1420',
                      fontSize: { xs: '0.98rem', md: '1.08rem' },
                      lineHeight: 1.7,
                      fontStyle: 'normal',
                    }}
                  >
                    {occasion.curationStatement}
                  </Typography>
                </Box>

                {/* Verified Pieces Grid */}
                <Grid container spacing={3}>
                  {pieces.map((piece) => {
                    const priceLabel = piece.priceFormatted || (piece.priceINR > 0 ? formatINR(piece.priceINR) : 'Price upon atelier inquiry');

                    return (
                      <Grid key={piece.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e5dccb',
                            overflow: 'hidden',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 10px 24px rgba(26, 20, 32, 0.08)',
                            },
                          }}
                        >
                          {/* Image Box */}
                          <Box sx={{ position: 'relative', pt: '115%', overflow: 'hidden', bgcolor: '#f4efe6' }}>
                            <CardMedia
                              component="img"
                              image={piece.imageUrl}
                              alt={piece.name}
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            />
                            <Chip
                              label={piece.brandName}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: 'rgba(26, 20, 32, 0.88)',
                                color: '#fbf6ec',
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontWeight: 600,
                                fontSize: '0.68rem',
                                letterSpacing: '0.04em',
                                backdropFilter: 'blur(4px)',
                              }}
                            />
                            <Chip
                              label={piece.subcategory}
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                left: 12,
                                bgcolor: '#fbf6ec',
                                color: '#1a1420',
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontWeight: 500,
                                fontSize: '0.65rem',
                                border: '1px solid #e5dccb',
                              }}
                            />
                          </Box>

                          {/* Card Content */}
                          <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography
                              sx={{
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: 'var(--cobalt, #3a3ce0)',
                                mb: 0.5,
                              }}
                            >
                              {piece.brandName}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: '"Fraunces", Georgia, serif',
                                fontSize: '1.05rem',
                                fontWeight: 500,
                                color: '#1a1420',
                                lineHeight: 1.3,
                                mb: 1,
                              }}
                            >
                              {piece.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                color: '#6b6173',
                                fontFamily: '"Instrument Sans", sans-serif',
                                fontSize: '0.82rem',
                                lineHeight: 1.5,
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {piece.description}
                            </Typography>

                            {/* Safe Discovery Actions (Strictly NO Add-To-Cart / NO Purchase Controls) */}
                            <Box
                              sx={{
                                mt: 'auto',
                                pt: 2,
                                borderTop: '1px solid #e5dccb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    color: '#6b6173',
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                  }}
                                >
                                  ATELIER STATUS
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily: '"Fraunces", Georgia, serif',
                                    fontWeight: 500,
                                    color: '#1a1420',
                                    fontSize: '0.88rem',
                                  }}
                                >
                                  {priceLabel}
                                </Typography>
                              </Box>

                              <Button
                                component={Link}
                                to={`/products/${piece.id}`}
                                aria-label={`View Dossier for ${piece.brandName}`}
                                size="small"
                                variant="contained"
                                endIcon={<ArrowForwardOutlined sx={{ fontSize: '14px !important' }} />}
                                sx={{
                                  bgcolor: '#1a1420',
                                  color: '#fbf6ec',
                                  borderRadius: '99px',
                                  textTransform: 'none',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  fontFamily: '"Instrument Sans", sans-serif',
                                  px: 1.8,
                                  py: 0.7,
                                  '&:hover': {
                                    bgcolor: '#3a3ce0',
                                    color: '#ffffff',
                                  },
                                }}
                              >
                                Explore Piece
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CuratedOccasionPanels;
