import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';
import { ArrowForwardOutlined, StyleOutlined, WeekendOutlined, AutoFixHighOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const DedicatedStyleCollections: React.FC = () => {
  const [activeCollection, setActiveCollection] = useState<'STREETWEAR' | 'CASUALWEAR' | 'ETHNICWEAR'>('STREETWEAR');

  return (
    <Box
      component="section"
      id="style-collections"
      aria-label="Dedicated Streetwear, Casualwear, and Ethnicwear Collections"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: 'var(--bg, #fbf6ec)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line, #e5dccb)',
      }}
    >
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ maxWidth: 760, mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--cobalt, #3a3ce0)', boxShadow: '0 0 10px rgba(58, 60, 224, 0.4)' }} />
            <Typography
              variant="overline"
              sx={{
                color: 'var(--cobalt, #3a3ce0)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '0.76rem',
              }}
            >
              EDITORIAL SPOTLIGHT • THREE CULTURAL MOVEMENTS
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
              fontWeight: 500,
              color: 'var(--ink, #1a1420)',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              mb: 2,
            }}
          >
            Streetwear, Casualwear & <span style={{ fontStyle: 'italic', color: 'var(--cobalt, #3a3ce0)' }}>Heritage Craft</span>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              color: 'var(--mute, #6b6173)',
              fontSize: { xs: '0.98rem', md: '1.08rem' },
              lineHeight: 1.65,
            }}
          >
            Explore three distinct fashion disciplines: from high-energy urban streetwear drops and Japanese-inspired quiet luxury casuals, to ancient Indian master weaves and handloom heritage.
          </Typography>
        </Box>

        {/* Tab Controls */}
        <Box
          role="tablist"
          aria-label="Collection category switcher"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: 0.7,
            mb: 6,
            bgcolor: 'rgba(26, 20, 32, 0.06)',
            borderRadius: '999px',
            border: '1px solid var(--line, #e5dccb)',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button
            role="tab"
            aria-selected={activeCollection === 'STREETWEAR'}
            onClick={() => setActiveCollection('STREETWEAR')}
            startIcon={<StyleOutlined sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '999px',
              px: 3,
              py: 1,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              color: activeCollection === 'STREETWEAR' ? '#ffffff' : 'var(--ink, #1a1420)',
              bgcolor: activeCollection === 'STREETWEAR' ? 'var(--ink, #1a1420)' : 'transparent',
              boxShadow: activeCollection === 'STREETWEAR' ? '0 4px 14px rgba(26, 20, 32, 0.25)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: activeCollection === 'STREETWEAR' ? 'var(--ink, #1a1420)' : 'rgba(26, 20, 32, 0.08)',
              },
            }}
          >
            Streetwear & Graphic
          </Button>

          <Button
            role="tab"
            aria-selected={activeCollection === 'CASUALWEAR'}
            onClick={() => setActiveCollection('CASUALWEAR')}
            startIcon={<WeekendOutlined sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '999px',
              px: 3,
              py: 1,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              color: activeCollection === 'CASUALWEAR' ? '#1a1420' : 'var(--ink, #1a1420)',
              bgcolor: activeCollection === 'CASUALWEAR' ? 'var(--lime, #d8f25a)' : 'transparent',
              boxShadow: activeCollection === 'CASUALWEAR' ? '0 4px 14px rgba(216, 242, 90, 0.35)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: activeCollection === 'CASUALWEAR' ? 'var(--lime, #d8f25a)' : 'rgba(26, 20, 32, 0.08)',
              },
            }}
          >
            Everyday Casualwear
          </Button>

          <Button
            role="tab"
            aria-selected={activeCollection === 'ETHNICWEAR'}
            onClick={() => setActiveCollection('ETHNICWEAR')}
            startIcon={<AutoFixHighOutlined sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '999px',
              px: 3,
              py: 1,
              fontSize: '0.80rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"Instrument Sans", sans-serif',
              color: activeCollection === 'ETHNICWEAR' ? '#ffffff' : 'var(--ink, #1a1420)',
              bgcolor: activeCollection === 'ETHNICWEAR' ? 'var(--cobalt, #3a3ce0)' : 'transparent',
              boxShadow: activeCollection === 'ETHNICWEAR' ? '0 4px 14px rgba(58, 60, 224, 0.3)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: activeCollection === 'ETHNICWEAR' ? 'var(--cobalt, #3a3ce0)' : 'rgba(26, 20, 32, 0.08)',
              },
            }}
          >
            Artisanal Ethnicwear
          </Button>
        </Box>

        {/* 1. STREETWEAR COLLECTION VIEW */}
        {activeCollection === 'STREETWEAR' && (
          <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              {/* Feature Hero Card (Left 5 Cols) */}
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card
                  component={Link}
                  to="/products?category=streetwear"
                  sx={{
                    height: '100%',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#141414',
                    color: '#ffffff',
                    border: '1px solid var(--line, #e5dccb)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 4, md: 5 },
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=900"
                    alt="Streetwear Culture"
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.35)',
                      zIndex: 1,
                    }}
                  />
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Chip
                      label="CULTURE DROP • 2026/27"
                      size="small"
                      sx={{ bgcolor: 'var(--lime, #d8f25a)', color: '#1a1420', fontWeight: 700, mb: 3 }}
                    />
                    <Typography variant="h3" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, mb: 2 }}>
                      The Underground Drop
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, maxWidth: 380, fontFamily: '"Instrument Sans", sans-serif' }}>
                      Oversized heavyweight 240 GSM drops, French terry hoodies, waffle Cuban shirts, and utilitarian multi-pocket cargos curated across top Indian streetwear ateliers.
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', zIndex: 2, pt: 6 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                      {['The Souled Store', 'Bewakoof', 'Snitch', 'Levi’s', 'Superdry'].map((brand) => (
                        <Chip
                          key={brand}
                          label={brand}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', backdropFilter: 'blur(6px)' }}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      className="lumiere-pill-btn"
                      endIcon={<ArrowForwardOutlined />}
                      sx={{ bgcolor: 'var(--lime, #d8f25a)', color: '#1a1420', fontWeight: 700 }}
                    >
                      Explore All Streetwear
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* 3 Featured Products (Right 7 Cols) */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <Grid container spacing={3}>
                  {[
                    {
                      id: 'prod-life-07',
                      name: 'Heavyweight Pop-Culture Oversized Graphic Tee',
                      brand: 'The Souled Store',
                      price: '₹999',
                      tag: '240 GSM Cotton',
                      img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=900',
                      desc: 'Drop-shoulder boxy silhouette with high-density pigment screenprint.',
                    },
                    {
                      id: 'prod-life-08',
                      name: 'Heavy Gauge Boxy Fit Typography Fleece Hoodie',
                      brand: 'Bewakoof',
                      price: '₹1,299',
                      tag: '320 GSM Brushed Fleece',
                      img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=900',
                      desc: 'Youth culture streetwear hoodie with signature back typography block print.',
                    },
                    {
                      id: 'prod-life-09',
                      name: 'Textured Cuban Collar Relaxed Bowling Shirt',
                      brand: 'Snitch',
                      price: '₹1,899',
                      tag: 'Waffle-Weave Cotton',
                      img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=900',
                      desc: 'Modern men’s streetwear staple with Cuban notch collar and relaxed cut.',
                    },
                  ].map((item) => (
                    <Grid key={item.id} size={{ xs: 12, sm: 4 }}>
                      <Card
                        component={Link}
                        to={`/products/${item.id}`}
                        className="lumiere-card"
                        sx={{
                          height: '100%',
                          borderRadius: '20px',
                          bgcolor: '#ffffff',
                          border: '1px solid var(--line, #e5dccb)',
                          textDecoration: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={item.img}
                            alt={item.name}
                            loading="lazy"
                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Chip
                            label={item.tag}
                            size="small"
                            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(26, 20, 32, 0.85)', color: '#fff', fontSize: '0.62rem' }}
                          />
                        </Box>
                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="overline" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 700, fontSize: '0.68rem', display: 'block' }}>
                              {item.brand}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--ink, #1a1420)', fontFamily: '"Fraunces", Georgia, serif', mb: 1, lineHeight: 1.3 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', fontSize: '0.78rem', lineHeight: 1.5, mb: 2 }}>
                              {item.desc}
                            </Typography>
                          </Box>
                          <Box sx={{ pt: 1.5, borderTop: '1px solid var(--line, #e5dccb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: 'var(--ink, #1a1420)' }}>
                              {item.price}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 600 }}>
                              View Dossier ↗
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 2. CASUALWEAR COLLECTION VIEW */}
        {activeCollection === 'CASUALWEAR' && (
          <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              {/* Feature Hero Card (Left 5 Cols) */}
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card
                  component={Link}
                  to="/products?category=casualwear"
                  sx={{
                    height: '100%',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#2b231c',
                    color: '#ffffff',
                    border: '1px solid var(--line, #e5dccb)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 4, md: 5 },
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=900"
                    alt="Everyday Casuals"
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.38)',
                      zIndex: 1,
                    }}
                  />
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Chip
                      label="QUIET LUXURY • ELEVATED BASICS"
                      size="small"
                      sx={{ bgcolor: '#ffffff', color: '#1a1420', fontWeight: 700, mb: 3 }}
                    />
                    <Typography variant="h3" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, mb: 2 }}>
                      The Art of the Everyday
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, maxWidth: 380, fontFamily: '"Instrument Sans", sans-serif' }}>
                      Clean minimalist silhouettes, moisture-wicking AIRism linings, 14 oz raw selvedge denim, and textured dobby button-downs engineered for modern daily living.
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', zIndex: 2, pt: 6 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                      {['Uniqlo', 'Levi’s', 'Rare Rabbit', 'H&M', 'Zara'].map((brand) => (
                        <Chip
                          key={brand}
                          label={brand}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', backdropFilter: 'blur(6px)' }}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      className="lumiere-pill-btn"
                      endIcon={<ArrowForwardOutlined />}
                      sx={{ bgcolor: '#ffffff', color: '#1a1420', fontWeight: 700 }}
                    >
                      Explore Casualwear Catalog
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* 3 Featured Products (Right 7 Cols) */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <Grid container spacing={3}>
                  {[
                    {
                      id: 'prod-life-10',
                      name: 'AIRism Cotton Oversized Crewneck T-Shirt',
                      brand: 'Uniqlo',
                      price: '₹1,490',
                      tag: 'AIRism Tech',
                      img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=900',
                      desc: 'Double-faced cotton with moisture-wicking and quick-drying lining.',
                    },
                    {
                      id: 'prod-life-12',
                      name: 'Original 501 Straight Fit Selvedge Denim',
                      brand: 'Levi’s',
                      price: '₹4,599',
                      tag: '14 oz Raw Denim',
                      img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
                      desc: 'The iconic blueprint for denim with classic straight leg and button fly.',
                    },
                    {
                      id: 'prod-life-13',
                      name: 'Premium Textured Dobby Weave Smart Shirt',
                      brand: 'Rare Rabbit',
                      price: '₹3,299',
                      tag: 'Combed Dobby',
                      img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=900',
                      desc: 'Micro-geometric texture with mother-of-pearl buttons and semi-spread collar.',
                    },
                  ].map((item) => (
                    <Grid key={item.id} size={{ xs: 12, sm: 4 }}>
                      <Card
                        component={Link}
                        to={`/products/${item.id}`}
                        className="lumiere-card"
                        sx={{
                          height: '100%',
                          borderRadius: '20px',
                          bgcolor: '#ffffff',
                          border: '1px solid var(--line, #e5dccb)',
                          textDecoration: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={item.img}
                            alt={item.name}
                            loading="lazy"
                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Chip
                            label={item.tag}
                            size="small"
                            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(26, 20, 32, 0.85)', color: '#fff', fontSize: '0.62rem' }}
                          />
                        </Box>
                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="overline" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 700, fontSize: '0.68rem', display: 'block' }}>
                              {item.brand}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--ink, #1a1420)', fontFamily: '"Fraunces", Georgia, serif', mb: 1, lineHeight: 1.3 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', fontSize: '0.78rem', lineHeight: 1.5, mb: 2 }}>
                              {item.desc}
                            </Typography>
                          </Box>
                          <Box sx={{ pt: 1.5, borderTop: '1px solid var(--line, #e5dccb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: 'var(--ink, #1a1420)' }}>
                              {item.price}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 600 }}>
                              View Dossier ↗
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 3. ETHNICWEAR COLLECTION VIEW */}
        {activeCollection === 'ETHNICWEAR' && (
          <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              {/* Feature Hero Card (Left 5 Cols) */}
              <Grid size={{ xs: 12, lg: 5 }}>
                <Card
                  component={Link}
                  to="/products?category=ethnicwear"
                  sx={{
                    height: '100%',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#2b1238',
                    color: '#ffffff',
                    border: '1px solid var(--line, #e5dccb)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 4, md: 5 },
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=900"
                    alt="Indian Heritage Craft"
                    loading="lazy"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.35)',
                      zIndex: 1,
                    }}
                  />
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Chip
                      label="HERITAGE LOOM • LIVING ARTISTRY"
                      size="small"
                      sx={{ bgcolor: 'var(--lime, #d8f25a)', color: '#1a1420', fontWeight: 700, mb: 3 }}
                    />
                    <Typography variant="h3" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, mb: 2 }}>
                      Textile Civilizations
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, maxWidth: 380, fontFamily: '"Instrument Sans", sans-serif' }}>
                      Centuries of handloom mastery: from Rajasthani mud-resist Dabu prints and Chanderi zari brocades to bespoke royal sherwanis and antique zardozi embroideries.
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', zIndex: 2, pt: 6 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                      {['Fabindia', 'Raw Mango', 'Anita Dongre', 'W for Woman', 'Sabyasachi'].map((brand) => (
                        <Chip
                          key={brand}
                          label={brand}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', backdropFilter: 'blur(6px)' }}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      className="lumiere-pill-btn"
                      endIcon={<ArrowForwardOutlined />}
                      sx={{ bgcolor: 'var(--lime, #d8f25a)', color: '#1a1420', fontWeight: 700 }}
                    >
                      Explore Ethnicwear Weaves
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* 3 Featured Products (Right 7 Cols) */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <Grid container spacing={3}>
                  {[
                    {
                      id: 'prod-life-14',
                      name: 'Hand-Block Printed Dabu Cotton Kurta',
                      brand: 'Fabindia',
                      price: '₹2,499',
                      tag: 'Handspun Dabu',
                      img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=900',
                      desc: 'Artisanal indigo block print using traditional Rajasthan mud-resist craft.',
                    },
                    {
                      id: 'prod-life-15',
                      name: 'Contemporary Tiered Fusion Kurti & Palazzos',
                      brand: 'W for Woman',
                      price: '₹2,799',
                      tag: 'Modal Silk',
                      img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=900',
                      desc: 'Flared tiered anarkali silhouette with metallic gold border accents.',
                    },
                    {
                      id: 'prod-ind-02',
                      name: 'Pichhwai Hand-Painted Pure Silk Saree',
                      brand: 'Anita Dongre',
                      price: 'Price upon inquiry',
                      tag: 'Master Gota Patti',
                      img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900',
                      desc: 'Hand-painted Rajasthani temple art on pure Bemberg silk with gota patti.',
                    },
                  ].map((item) => (
                    <Grid key={item.id} size={{ xs: 12, sm: 4 }}>
                      <Card
                        component={Link}
                        to={`/products/${item.id}`}
                        className="lumiere-card"
                        sx={{
                          height: '100%',
                          borderRadius: '20px',
                          bgcolor: '#ffffff',
                          border: '1px solid var(--line, #e5dccb)',
                          textDecoration: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={item.img}
                            alt={item.name}
                            loading="lazy"
                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Chip
                            label={item.tag}
                            size="small"
                            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(26, 20, 32, 0.85)', color: '#fff', fontSize: '0.62rem' }}
                          />
                        </Box>
                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="overline" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 700, fontSize: '0.68rem', display: 'block' }}>
                              {item.brand}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--ink, #1a1420)', fontFamily: '"Fraunces", Georgia, serif', mb: 1, lineHeight: 1.3 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--mute, #6b6173)', fontSize: '0.78rem', lineHeight: 1.5, mb: 2 }}>
                              {item.desc}
                            </Typography>
                          </Box>
                          <Box sx={{ pt: 1.5, borderTop: '1px solid var(--line, #e5dccb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: 'var(--ink, #1a1420)' }}>
                              {item.price}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--cobalt, #3a3ce0)', fontWeight: 600 }}>
                              View Dossier ↗
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DedicatedStyleCollections;
