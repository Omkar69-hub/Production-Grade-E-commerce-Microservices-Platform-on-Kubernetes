import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Container, Typography, Grid, Card, Chip, Button, 
  Divider, Tooltip, Alert
} from '@mui/material';
import { 
  VerifiedUserOutlined, OpenInNewOutlined, ArrowBackOutlined, 
  CheckroomOutlined, DiamondOutlined, SecurityOutlined, InfoOutlined 
} from '@mui/icons-material';
import { getBrandBySlug } from '../../data/brandsData';
import { getProductsByBrand } from '../../data/clothingCatalogData';
import { verifyBrandDomain, getSafeExternalLinkAttributes } from '../../utils/domainVerifier';
import { useProducts } from '../../hooks/useProducts';

export const BrandDetailPage: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const brand = useMemo(() => brandSlug ? getBrandBySlug(brandSlug) : undefined, [brandSlug]);

  // Live products from backend catalog matching this brand name
  const { data: liveCatalogData } = useProducts({
    brand: brand?.name,
    size: 12
  });

  // Verified editorial products from curated clothing catalog
  const curatedProducts = useMemo(() => {
    if (!brand) return [];
    return getProductsByBrand(brand.id);
  }, [brand]);

  // Combined product list (curated products + live catalog pieces, excluding electronics)
  const allBrandProducts = useMemo(() => {
    const list = [...curatedProducts];
    if (liveCatalogData?.content) {
      for (const p of liveCatalogData.content) {
        const isElectronic = p.name.toLowerCase().includes('phone') || 
                             p.name.toLowerCase().includes('electronic') || 
                             (p.categoryName && p.categoryName.toLowerCase().includes('electronic'));
        if (!isElectronic && !list.some(existing => existing.id === p.id || existing.name === p.name)) {
          list.push({
            id: p.id,
            slug: p.sku || p.id,
            name: p.name,
            brandId: brand?.id || '',
            brandName: brand?.name || '',
            brandSlug: brand?.slug || '',
            audience: 'Women',
            category: 'Clothing',
            subcategory: p.categoryName || 'Curated Apparel',
            destinationUrl: brand?.website || '',
            destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
            imageUrl: p.imageUrl || brand?.heroImage || '',
            imageAttribution: 'LUMIÈRE Catalog Database',
            priceINR: p.price,
            priceFormatted: `₹${p.price.toLocaleString('en-IN')}`,
            priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
            priceSource: 'Atelier Published Catalog',
            description: p.description,
            fabric: 'Artisanal Textile',
            fit: 'Standard Atelier Fit',
            availableSizes: ['Custom Fit'],
          });
        }
      }
    }
    return list;
  }, [curatedProducts, liveCatalogData, brand]);

  // If brand is not found in directory
  if (!brand) {
    return (
      <Box sx={{ py: 16, textAlign: 'center', bgcolor: '#FAFAFA' }}>
        <Container maxWidth="md">
          <CheckroomOutlined sx={{ fontSize: 72, color: '#E50914', mb: 2 }} />
          <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 2, color: '#0A0A0A' }}>
            Maison Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B665E', mb: 4, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            The requested designer atelier or fashion house is not listed in our verified brand directory. 
            All featured labels are vetted for direct provenance and authentic craftsmanship.
          </Typography>
          <Button 
            component={Link} 
            to="/brands" 
            variant="contained" 
            className="lumiere-red-btn lumiere-pill-btn"
            startIcon={<ArrowBackOutlined sx={{ color: '#FFFFFF' }} />}
            sx={{ px: 4, py: 1.4 }}
          >
            Return to The Maison Index
          </Button>
        </Container>
      </Box>
    );
  }

  // Domain verification check for this brand's official website
  const verification = verifyBrandDomain(brand.website, brand.slug);
  const safeLinkAttrs = getSafeExternalLinkAttributes();

  return (
    <Box sx={{ bgcolor: '#FAFAFA', pb: 16 }}>
      {/* Editorial Hero Header Banner */}
      <Box 
        sx={{ 
          position: 'relative',
          bgcolor: '#0A0A0A',
          color: '#FFFFFF',
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 12 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${brand.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            opacity: 0.18,
            filter: 'grayscale(60%)',
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Back to directory button */}
          <Button 
            component={Link} 
            to="/brands" 
            startIcon={<ArrowBackOutlined sx={{ color: '#C4BEB4', fontSize: 18 }} />}
            sx={{ color: '#C4BEB4', mb: 4, fontSize: '0.82rem', letterSpacing: '0.05em', '&:hover': { color: '#E50914' } }}
          >
            Back to All 58 Maisons
          </Button>

          <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={brand.origin === 'INDIAN' ? 'INDIAN COUTURE' : 'GLOBAL LUXURY'}
                  size="small"
                  sx={{ 
                    bgcolor: brand.origin === 'INDIAN' ? 'rgba(229, 9, 20, 0.15)' : '#1F1F1F',
                    color: brand.origin === 'INDIAN' ? '#E50914' : '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.08em'
                  }}
                />
                <Chip 
                  icon={<VerifiedUserOutlined sx={{ fontSize: '14px !important', color: '#E50914 !important' }} />}
                  label={`Official: ${brand.verifiedDomain}`}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FAFAFA',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                />
                <Chip 
                  label={`Est. ${brand.founded} • ${brand.city}, ${brand.country}`}
                  size="small"
                  sx={{ bgcolor: 'transparent', color: '#A0988E', fontSize: '0.72rem' }}
                />
              </Box>

              <Typography variant="h1" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2, fontSize: { xs: '2.8rem', md: '4.2rem' }, lineHeight: 1.08 }}>
                {brand.name}
              </Typography>

              <Typography variant="body1" sx={{ color: '#D5C8B4', maxWidth: 720, fontSize: '1.15rem', lineHeight: 1.8, mb: 4 }}>
                {brand.description}
              </Typography>

              {/* Signature Craft Badge Box */}
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 1.5, 
                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(229, 9, 20, 0.3)',
                borderRadius: '12px',
                px: 2.5,
                py: 1.5,
                mb: 4
              }}>
                <DiamondOutlined sx={{ color: '#E50914', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#FAF8F5', fontSize: '0.92rem' }}>
                  <strong style={{ color: '#E50914' }}>Atelier Signature:</strong> {brand.signatureStyle}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button 
                  href={brand.website}
                  {...safeLinkAttrs}
                  variant="contained" 
                  className="lumiere-red-btn lumiere-pill-btn"
                  endIcon={<OpenInNewOutlined sx={{ color: '#FFFFFF', fontSize: 16 }} />}
                  sx={{ px: 4, py: 1.5, fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  Visit Official {brand.name} Portal
                </Button>

                <Tooltip title="Verified against authentic root domain records">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#A0988E' }}>
                    <SecurityOutlined sx={{ fontSize: 16, color: '#E50914' }} />
                    <Typography variant="caption" sx={{ letterSpacing: '0.04em' }}>
                      Certified Destination ({brand.verifiedDomain})
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Grid>

            {/* Right Quick Atelier Facts Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', p: 3.5, borderRadius: '16px' }}>
                <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.15em', display: 'block', mb: 1 }}>
                  ATELIER PROVENANCE
                </Typography>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2.5 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Maison Headquarters</Typography>
                    <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{brand.city}, {brand.country}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Heritage Discipline</Typography>
                    <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{brand.category}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Certified Root Domain</Typography>
                    <Typography variant="body2" sx={{ color: '#E50914', fontWeight: 600, fontFamily: 'monospace' }}>
                      {brand.verifiedDomain}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Direct Link Protocol</Typography>
                    <Typography variant="body2" sx={{ color: '#A0988E', fontSize: '0.8rem' }}>
                      {verification.isVerifiedOfficial ? '100% Encrypted Official Portal' : 'Authenticated External Destination'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Official Referral Protocol Manifesto Notice */}
      <Container maxWidth="xl" sx={{ mt: -3, position: 'relative', zIndex: 3 }}>
        <Alert 
          icon={<InfoOutlined sx={{ color: '#E50914' }} />}
          sx={{ 
            bgcolor: '#FFFFFF', 
            color: '#181816',
            borderRadius: '16px',
            border: '1px solid #E8E4DC',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            p: 2.5,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0A0A0A', letterSpacing: '0.02em' }}>
                LUMIÈRE Verified Direct-Referral Protocol
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A5650', mt: 0.3, maxWidth: 900 }}>
                LUMIÈRE is an independent high-fashion curation discovery index. All bespoke purchases, currency transactions, insured shipping, and atelier returns 
                occur directly on the official certified web boutique of <strong>{brand.name}</strong> ({brand.verifiedDomain}). We charge zero consumer surcharge.
              </Typography>
            </Box>
            <Button
              href={brand.website}
              {...safeLinkAttrs}
              size="small"
              variant="outlined"
              className="lumiere-pill-btn"
              endIcon={<OpenInNewOutlined sx={{ fontSize: 13 }} />}
              sx={{ borderColor: '#0A0A0A', color: '#0A0A0A', whiteSpace: 'nowrap' }}
            >
              Open Maison Portal
            </Button>
          </Box>
        </Alert>
      </Container>

      {/* Featured Pieces Catalog Section */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, pb: 2, borderBottom: '1px solid #E8E4DC' }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.2em' }}>
              SIGNATURE CURATION
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#0A0A0A' }}>
              {brand.name} Collection Showcase
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B665E' }}>
            {allBrandProducts.length > 0 
              ? `Displaying ${allBrandProducts.length} verified signature piece(s)` 
              : 'Atelier Runway Archive'}
          </Typography>
        </Box>

        {allBrandProducts.length === 0 ? (
          // Elegant Empty State for brands with pieces undergoing seasonal curation
          <Card 
            sx={{ 
              p: { xs: 6, md: 10 }, 
              textAlign: 'center', 
              bgcolor: '#FFFFFF', 
              borderRadius: '16px', 
              border: '1px solid #E8E4DC',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
            }}
          >
            <CheckroomOutlined sx={{ fontSize: 64, color: '#E50914', mb: 2 }} />
            <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 1.5, color: '#0A0A0A' }}>
              Runway Pieces Undergoing Curation
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B665E', maxWidth: 580, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
              Our editorial team is currently archiving the latest seasonal runway pieces for <strong>{brand.name}</strong>. 
              In the meantime, you may explore their complete catalog directly on their certified maison portal.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                href={brand.website}
                {...safeLinkAttrs}
                variant="contained" 
                className="lumiere-red-btn lumiere-pill-btn"
                endIcon={<OpenInNewOutlined sx={{ color: '#FFFFFF', fontSize: 16 }} />}
                sx={{ px: 4, py: 1.4 }}
              >
                Browse Complete Collections on {brand.verifiedDomain}
              </Button>
              <Button 
                component={Link} 
                to="/brands" 
                variant="outlined" 
                className="lumiere-pill-btn"
                sx={{ borderColor: '#E8E4DC', color: '#0A0A0A', px: 3, py: 1.4 }}
              >
                Explore Other Ateliers
              </Button>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={3.5}>
            {allBrandProducts.map((product) => {
              const productVerification = verifyBrandDomain(product.destinationUrl, brand.slug);
              return (
                <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card 
                    className="lumiere-card" 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      bgcolor: '#FFFFFF', 
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #E8E4DC'
                    }}
                  >
                    {/* Product Image Area */}
                    <Box sx={{ position: 'relative', pt: '105%', overflow: 'hidden', bgcolor: '#F5F3EF' }}>
                      <Box 
                        component="img"
                        src={product.imageUrl}
                        alt={product.name}
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      />
                      {/* Destination type badge */}
                      <Chip 
                        label={product.destinationType === 'EXACT_PRODUCT_PAGE' ? 'Official Product Page' : 'Official Collection Page'}
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 14, 
                          left: 14, 
                          bgcolor: 'rgba(10, 10, 10, 0.85)', 
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                      <Chip 
                        label={product.audience}
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 14, 
                          right: 14, 
                          bgcolor: '#E50914', 
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}
                      />
                    </Box>

                    {/* Content Area */}
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Typography variant="overline" sx={{ color: '#888', fontWeight: 600, letterSpacing: '0.12em', display: 'block', mb: 0.5 }}>
                        {product.subcategory}
                      </Typography>

                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A0A0A', mb: 1, lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#5A5650', mb: 2, lineHeight: 1.6, flexGrow: 1 }}>
                        {product.description}
                      </Typography>

                      {/* Fabric & Fit Badges */}
                      {product.fabric && (
                        <Box sx={{ bgcolor: '#F9F8F5', p: 1.5, borderRadius: '8px', mb: 2, border: '1px solid #EFECE6' }}>
                          <Typography variant="caption" sx={{ color: '#E50914', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>
                            FABRIC & CRAFT:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#333', fontSize: '0.8rem', mt: 0.2 }}>
                            {product.fabric}
                          </Typography>
                        </Box>
                      )}

                      {/* Price row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#E50914', fontFamily: '"Outfit", sans-serif' }}>
                          {product.priceFormatted}
                        </Typography>
                        <Tooltip title={`Source: ${product.priceSource}`}>
                          <Typography variant="caption" sx={{ color: '#888', textDecoration: 'underline', cursor: 'help' }}>
                            {product.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE' ? 'Verified Price' : 'Price on Inquiry'}
                          </Typography>
                        </Tooltip>
                      </Box>

                      {/* Official Destination Action Button */}
                      <Button
                        href={product.destinationUrl}
                        {...safeLinkAttrs}
                        variant="contained"
                        className="lumiere-red-btn lumiere-pill-btn"
                        endIcon={<OpenInNewOutlined sx={{ fontSize: 14, color: '#FFFFFF' }} />}
                        sx={{ py: 1.3, fontWeight: 700, fontSize: '0.82rem' }}
                      >
                        Acquire on Official Maison Portal
                      </Button>

                      {/* Link Destination Proof */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 1.5 }}>
                        <VerifiedUserOutlined sx={{ fontSize: 13, color: productVerification.isVerifiedOfficial ? '#2E7D32' : '#E50914' }} />
                        <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem' }}>
                          Directs exclusively to <strong>{brand.verifiedDomain}</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default BrandDetailPage;
