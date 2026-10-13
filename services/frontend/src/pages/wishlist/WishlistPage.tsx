import React from 'react';
import { 
  Box, Container, Typography, Grid, 
  Button, Card, CardMedia, CardContent, 
  IconButton, Chip, Tooltip, Divider 
} from '@mui/material';
import { 
  ArrowForwardOutlined, CheckroomOutlined, 
  DeleteOutlined, OpenInNewOutlined, 
  DiamondOutlined 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../../services/ProductService';
import ProductCard from '../../components/product/ProductCard';
import { CLOTHING_CATALOG } from '../../data/clothingCatalogData';
import { getSafeExternalLinkAttributes } from '../../utils/domainVerifier';
import { useWishlist } from '../../utils/wishlistStorage';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, removeWishlistItem, clearWishlist } = useWishlist();

  // Fetch full products list from backend API
  const { data: allProductsData } = useQuery({
    queryKey: ['all-products-for-wishlist'],
    queryFn: () => ProductService.getProducts({ size: 100 }),
    staleTime: 60 * 1000,
  });

  // Resolve wishlisted items from both curated catalog and backend API
  const wishlistedCuratedPieces = CLOTHING_CATALOG.filter((item) =>
    wishlistIds.includes(item.id) || wishlistIds.includes(item.slug)
  );

  const wishlistedApiProducts = (allProductsData?.content || []).filter((p) =>
    wishlistIds.includes(p.id) && !wishlistedCuratedPieces.some((c) => c.id === p.id)
  );

  const totalWishlistedCount = wishlistedCuratedPieces.length + wishlistedApiProducts.length;

  return (
    <Box sx={{ bgcolor: '#FAF8F5', minHeight: '85vh', pb: 14 }}>
      {/* Editorial Header */}
      <Box sx={{ bgcolor: '#181816', color: '#FAF8F5', py: { xs: 7, md: 9 } }}>
        <Container maxWidth="xl">
          <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.22em' }}>
            PRIVATE CLIENT VAULT
          </Typography>
          <Typography variant="h1" sx={{ color: '#FAF8F5', fontWeight: 700, mt: 1, mb: 1.5, fontSize: { xs: '2.4rem', md: '3.6rem' } }}>
            Curated Wishlist
          </Typography>
          <Typography variant="body1" sx={{ color: '#D5C8B4', maxWidth: 640, fontSize: '1.05rem', lineHeight: 1.7 }}>
            Your personal salon of coveted fashion pieces and couture creations reserved for private acquisition.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 6 }}>
        {wishlistIds.length === 0 ? (
          /* Editorial Empty State */
          <Box 
            sx={{ 
              py: 12, 
              px: 4, 
              textAlign: 'center', 
              bgcolor: '#FFFFFF', 
              borderRadius: '12px', 
              border: '1px solid #EAE5DC',
              maxWidth: 640,
              mx: 'auto',
              boxShadow: '0 8px 30px rgba(24, 24, 22, 0.03)'
            }}
          >
            <CheckroomOutlined sx={{ fontSize: 64, color: '#E50914', mb: 2 }} />
            <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#181816', mb: 2 }}>
              Your Salon is Currently Empty
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B665E', mb: 4, lineHeight: 1.7 }}>
              You haven't reserved any pieces yet. Explore our seasonal clothing repertoire or 
              consult our directory of 58 verified luxury and Indian couture houses.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                component={Link} 
                to="/products" 
                variant="contained" 
                className="lumiere-red-btn lumiere-pill-btn"
                endIcon={<ArrowForwardOutlined sx={{ fontSize: 16 }} />}
                sx={{ px: 4, py: 1.5, fontFamily: '"Cinzel", serif', fontWeight: 700 }}
              >
                Discover Collections
              </Button>
              <Button 
                component={Link} 
                to="/brands" 
                variant="outlined" 
                className="lumiere-pill-btn"
                sx={{ borderColor: '#181816', color: '#181816', px: 3.5, py: 1.5, fontWeight: 600 }}
              >
                Browse Brands Directory
              </Button>
            </Box>
          </Box>
        ) : (
          /* Wishlist Items Grid */
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid #EAE5DC' }}>
              <Box>
                <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#181816' }}>
                  {totalWishlistedCount || wishlistIds.length} Coveted {(totalWishlistedCount || wishlistIds.length) === 1 ? 'Piece' : 'Pieces'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8C827A' }}>
                  Stored securely in your browser private vault
                </Typography>
              </Box>

              <Button 
                onClick={clearWishlist} 
                size="small" 
                variant="outlined"
                startIcon={<DeleteOutlined sx={{ fontSize: 16 }} />}
                sx={{ 
                  color: '#6B665E', 
                  borderColor: '#EAE5DC',
                  '&:hover': { borderColor: '#E50914', color: '#E50914' } 
                }}
              >
                Clear Wishlist
              </Button>
            </Box>

            {/* Curated Atelier Pieces Showcase */}
            {wishlistedCuratedPieces.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <DiamondOutlined sx={{ color: '#B89758' }} />
                  <Typography variant="subtitle1" sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700, color: '#181816', letterSpacing: '0.08em' }}>
                    VERIFIED ATELIER & COUTURE PIECES ({wishlistedCuratedPieces.length})
                  </Typography>
                </Box>

                <Grid container spacing={3.5}>
                  {wishlistedCuratedPieces.map((piece) => (
                    <Grid key={piece.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <Card 
                          className="lumiere-card"
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            bgcolor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #EAE5DC',
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{ position: 'relative', pt: '90%', bgcolor: '#F8F6F2', overflow: 'hidden' }}>
                            <CardMedia
                              component="img"
                              image={piece.imageUrl}
                              alt={piece.name}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <Chip
                              label={piece.brandName}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: 'rgba(24, 24, 22, 0.88)',
                                color: '#FAF8F5',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                letterSpacing: '0.06em',
                              }}
                            />
                            <Tooltip title="Remove from wishlist">
                              <IconButton
                                onClick={() => removeWishlistItem(piece.id)}
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  bgcolor: 'rgba(255, 255, 255, 0.92)',
                                  color: '#E50914',
                                  p: 0.8,
                                  '&:hover': { bgcolor: '#FFFFFF' }
                                }}
                              >
                                <DeleteOutlined sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Typography variant="caption" sx={{ color: '#B89758', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {piece.audience} • {piece.subcategory}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              component={Link}
                              to={`/products/${piece.id}`}
                              sx={{ 
                                fontFamily: '"Playfair Display", Georgia, serif', 
                                fontWeight: 600, 
                                color: '#181816', 
                                textDecoration: 'none',
                                mt: 0.5,
                                mb: 1,
                                '&:hover': { color: '#E50914' }
                              }}
                            >
                              {piece.name}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#181816' }}>
                                {piece.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ? 'Price Upon Inquiry' : piece.priceFormatted}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#8C827A' }}>
                                ({piece.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ? 'Salon Consultation' : 'Verified Price'})
                              </Typography>
                            </Box>

                            <Divider sx={{ my: 1.5, borderColor: '#F0ECE4' }} />

                            <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
                              <Button
                                component={Link}
                                to={`/products/${piece.id}`}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{ 
                                  borderColor: '#181816', 
                                  color: '#181816', 
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  '&:hover': { bgcolor: '#181816', color: '#FAF8F5' }
                                }}
                              >
                                View Dossier
                              </Button>

                              <Button
                                component="a"
                                href={piece.destinationUrl}
                                {...getSafeExternalLinkAttributes()}
                                variant="contained"
                                size="small"
                                fullWidth
                                endIcon={<OpenInNewOutlined sx={{ fontSize: 14 }} />}
                                className="lumiere-red-btn"
                                sx={{ 
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  fontFamily: '"Cinzel", serif'
                                }}
                              >
                                Official Atelier
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            )}

            {/* Standard Catalog / API Products */}
            {wishlistedApiProducts.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700, color: '#181816', letterSpacing: '0.08em', mb: 3 }}>
                  READY-TO-WEAR INVENTORY ({wishlistedApiProducts.length})
                </Typography>
                <Grid container spacing={3.5}>
                  {wishlistedApiProducts.map((product) => (
                    <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WishlistPage;
