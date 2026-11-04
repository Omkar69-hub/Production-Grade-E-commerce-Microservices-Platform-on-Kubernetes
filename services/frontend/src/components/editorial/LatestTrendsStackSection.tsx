import React, { useState } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import {
  ArrowForwardOutlined,
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface TrendStory {
  id: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  badgeColor: string;
}

const STORIES: TrendStory[] = [
  {
    id: 'story-1',
    tag: 'TREND 01',
    title: 'Colour Blocking: Three brights, zero rules',
    description: 'Electric cobalt meets sunset tangerine and citrus lemon. Tailored with architectural precision so that high saturation never loses composure.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
    badgeColor: '#E8572B'
  },
  {
    id: 'story-2',
    tag: 'TREND 02',
    title: 'Sheer Layers: Transparency as structure',
    description: 'Silk organza overlays layered across tailored bandhgalas and bias slip gowns. A delicate play between veiled mystery and couture geometry.',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=900',
    badgeColor: '#3A3CE0'
  },
  {
    id: 'story-3',
    tag: 'TREND 03',
    title: 'Sunday Suiting: Relaxed shoulders & puddle hems',
    description: 'Unlined Portuguese linen and fluid Italian wools cut for effortless elegance. Move seamlessly from midday salon visits to high-summer soirées.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    badgeColor: '#D8F25A'
  }
];

const CATEGORIES = [
  { num: '01', name: 'Tailoring', path: '/products?category=tailoring' },
  { num: '02', name: 'Dresses', path: '/products?category=dresses' },
  { num: '03', name: 'Knitwear', path: '/products?category=knitwear' },
  { num: '04', name: 'Outerwear', path: '/products?category=outerwear' },
  { num: '05', name: 'Evening', path: '/products?category=evening' }
];

export const LatestTrendsStackSection: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);

  const prev = () => setCurrentCard((prev) => (prev > 0 ? prev - 1 : STORIES.length - 1));
  const next = () => setCurrentCard((prev) => (prev < STORIES.length - 1 ? prev + 1 : 0));

  const activeStory = STORIES[currentCard];

  return (
    <Box
      component="section"
      aria-label="Latest Trends Stories Behind the Seams"
      sx={{
        py: { xs: 8, md: 14 },
        bgcolor: 'var(--bg, #fbf6ec)',
        borderBottom: '1px solid var(--line, #e5dccb)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl">
        {/* Massive 3D Shadow Typography Headline */}
        <Box sx={{ mb: 6, textAlign: { xs: 'left', md: 'center' } }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: '3rem', sm: '4.8rem', md: '6.2rem' },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--ink, #1a1420)',
              lineHeight: 0.9,
              textShadow: '4px 4px 0px #E8572B, 8px 8px 0px rgba(26, 20, 32, 0.15)',
              mb: 2
            }}
          >
            LATEST TRENDS
          </Typography>

          <Box
            component={Link}
            to="/products"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              px: 3.5,
              py: 1.4,
              borderRadius: '999px',
              bgcolor: 'var(--cobalt, #3a3ce0)',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              letterSpacing: '0.08em',
              fontFamily: '"Instrument Sans", sans-serif',
              boxShadow: '0 8px 20px rgba(58, 60, 224, 0.35)',
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: '#2b2dc0',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <span>DISCOVER NOW</span>
            <ArrowForwardOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* 3-Column Content Layout: Stories Copy, 3D Stacked Deck, Category Menu */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr 0.8fr' },
            gap: { xs: 5, lg: 6 },
            alignItems: 'center'
          }}
        >
          {/* Left: Editorial Storytelling */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'var(--cobalt, #3a3ce0)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                fontSize: '0.78rem',
                fontFamily: '"Instrument Sans", sans-serif',
                display: 'block',
                mb: 1
              }}
            >
              EDITORIAL PERSPECTIVE
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 600,
                color: 'var(--ink, #1a1420)',
                lineHeight: 1.15,
                mb: 2.5
              }}
            >
              Stories Behind the Seams
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'var(--mute, #6b6173)',
                fontSize: '1.02rem',
                lineHeight: 1.7,
                fontFamily: '"Instrument Sans", sans-serif',
                mb: 4
              }}
            >
              Every piece starts as a swatch pinned to a wall in Lisbon — then a pattern, a toile, a fitting, and a lot of arguing about exactly which orange.
            </Typography>

            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: 'var(--card-bg, #FFFFFF)',
                border: '1px solid var(--line, #e5dccb)'
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: activeStory.badgeColor,
                  textTransform: 'uppercase',
                  mb: 0.8
                }}
              >
                {activeStory.tag}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--ink, #1a1420)',
                  mb: 1
                }}
              >
                {activeStory.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.86rem',
                  color: 'var(--mute, #6b6173)',
                  lineHeight: 1.6
                }}
              >
                {activeStory.description}
              </Typography>
            </Box>
          </Box>

          {/* Center: 3D Stacked Card Deck */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 400,
                height: 480,
                perspective: '1000px'
              }}
            >
              {STORIES.map((story, idx) => {
                const diff = (idx - currentCard + STORIES.length) % STORIES.length;
                const isTop = diff === 0;

                const translateY = diff * 16;
                const scale = 1 - diff * 0.05;
                const rotate = diff === 1 ? '4deg' : diff === 2 ? '-4deg' : '0deg';
                const zIndex = 30 - diff * 10;
                const opacity = diff > 2 ? 0 : 1 - diff * 0.2;

                return (
                  <Box
                    key={story.id}
                    onClick={() => setCurrentCard(idx)}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '24px',
                      overflow: 'hidden',
                      bgcolor: '#FFFFFF',
                      border: '1px solid var(--line, #e5dccb)',
                      boxShadow: '0 20px 45px rgba(26, 20, 32, 0.12)',
                      cursor: 'pointer',
                      transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate})`,
                      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex,
                      opacity,
                      pointerEvents: isTop ? 'auto' : 'auto'
                    }}
                  >
                    <Box
                      component="img"
                      src={story.imageUrl}
                      alt={story.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 3,
                        background: 'linear-gradient(to top, rgba(26, 20, 32, 0.9) 0%, transparent 100%)',
                        color: '#FFFFFF'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: 'var(--lime, #d8f25a)',
                          textTransform: 'uppercase',
                          mb: 0.5
                        }}
                      >
                        {story.tag}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          lineHeight: 1.2
                        }}
                      >
                        {story.title}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 4 }}>
              <IconButton
                onClick={prev}
                aria-label="Previous story"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  bgcolor: '#FFFFFF',
                  color: 'var(--ink, #1a1420)',
                  '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
                }}
              >
                <ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />
              </IconButton>

              <Typography
                sx={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '0.1em'
                }}
              >
                &lt; {currentCard + 1} / {STORIES.length} &gt;
              </Typography>

              <IconButton
                onClick={next}
                aria-label="Next story"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid var(--line, #e5dccb)',
                  bgcolor: '#FFFFFF',
                  color: 'var(--ink, #1a1420)',
                  '&:hover': { bgcolor: 'var(--ink, #1a1420)', color: '#FFFFFF' }
                }}
              >
                <ArrowForwardIosOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Right: Category Navigation Directory */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'var(--mute, #6b6173)',
                fontWeight: 700,
                letterSpacing: '0.16em',
                fontSize: '0.74rem',
                fontFamily: '"Instrument Sans", sans-serif',
                mb: 1
              }}
            >
              EXPLORE BY DISCIPLINE
            </Typography>

            {CATEGORIES.map((cat) => (
              <Box
                key={cat.num}
                component={Link}
                to={cat.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: '14px',
                  textDecoration: 'none',
                  color: 'var(--ink, #1a1420)',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'var(--card-bg, #FBF7F0)',
                    borderColor: 'var(--line, #e5dccb)',
                    transform: 'translateX(6px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--cobalt, #3a3ce0)'
                    }}
                  >
                    {cat.num}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}
                  >
                    {cat.name}
                  </Typography>
                </Box>
                <ArrowForwardOutlined sx={{ fontSize: 18, color: 'var(--mute, #6b6173)' }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LatestTrendsStackSection;

