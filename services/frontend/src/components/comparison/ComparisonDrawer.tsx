import React from 'react';
import { 
  Drawer, Box, Typography, IconButton, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import { CloseOutlined, DeleteOutlined, ShoppingBagOutlined, CompareArrowsOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { formatINR, isDemoPrice } from '../../utils/currency';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import type { AppDispatch } from '../../store';

const parseAttributes = (raw?: string): Record<string, any> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const ComparisonDrawer: React.FC = () => {
  const { comparisonItems, removeFromComparison, clearComparison, isComparisonOpen, setIsComparisonOpen } = useComparison();
  const dispatch = useDispatch<AppDispatch>();

  if (comparisonItems.length === 0) return null;

  // Gather unique attribute keys across all items
  const allParsed = comparisonItems.map(item => parseAttributes(item.attributes));
  const attributeKeys = Array.from(new Set(allParsed.flatMap(p => Object.keys(p))));

  const handleAcquire = (productId: string) => {
    const item = comparisonItems.find(p => p.id === productId);
    if (item) {
      const attrs = parseAttributes(item.attributes);
      const isReferralOrInquiry =
        Boolean(item.id && item.id.startsWith('prod-')) ||
        Boolean(attrs.destinationUrl) ||
        Boolean(attrs.isReferral) ||
        Boolean(attrs.destinationType) ||
        attrs.fulfillmentType === 'EXTERNAL_REFERRAL' ||
        attrs.fulfillmentType === 'EXTERNAL_ATELIER_REFERRAL' ||
        attrs.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ||
        Boolean(attrs.isEditorialConcept) ||
        !item.price ||
        item.price <= 0;
      if (isReferralOrInquiry) {
        return; // Fail-closed: Never acquire inquiry or referral items
      }
    }
    dispatch(addToCart({ item: { productId, quantity: 1 } }));
  };

  return (
    <>
      {/* Floating Bottom Bar when items are selected but drawer closed */}
      {!isComparisonOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            bgcolor: '#181816',
            color: '#FAF8F5',
            px: 3,
            py: 1.5,
            borderRadius: '30px',
            border: '1px solid #B89758',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrowsOutlined sx={{ color: '#B89758' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {comparisonItems.length} Piece{comparisonItems.length > 1 ? 's' : ''} in Salon Comparison
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={() => setIsComparisonOpen(true)}
            sx={{
              bgcolor: '#B89758',
              color: '#181816',
              fontWeight: 700,
              fontFamily: '"Cinzel", serif',
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#E8D3B5' }
            }}
          >
            Compare Now
          </Button>
          <IconButton size="small" onClick={clearComparison} sx={{ color: '#D5C8B4' }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Paper>
      )}

      {/* Main Full / Bottom Modal Drawer */}
      <Drawer
        anchor="bottom"
        open={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            maxHeight: '85vh',
            bgcolor: '#FAF8F5',
            borderTop: '2px solid #B89758',
            p: { xs: 2, md: 4 },
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#B89758', letterSpacing: '0.2em', fontWeight: 600 }}>
              LUMIÈRE ATELIER COMPARISON
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#181816' }}>
              Side-by-Side Specification Matrix
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button size="small" onClick={clearComparison} sx={{ color: '#6B665E', textDecoration: 'underline' }}>
              Clear All
            </Button>
            <IconButton onClick={() => setIsComparisonOpen(false)}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #EAE5DC', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#F7F4EE' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '20%', color: '#181816' }}>Attribute</TableCell>
                {comparisonItems.map((item) => (
                  <TableCell key={item.id} align="center" sx={{ width: `${80 / comparisonItems.length}%` }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="img"
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300'}
                        alt={item.name}
                        sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px', border: '1px solid #EAE5DC' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>
                        {item.name}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => removeFromComparison(item.id)}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Category */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B665E' }}>Collection Category</TableCell>
                {comparisonItems.map(item => (
                  <TableCell key={item.id} align="center">
                    <Chip label={item.categoryName || 'Curated'} size="small" sx={{ bgcolor: '#181816', color: '#FAF8F5', fontSize: '0.72rem' }} />
                  </TableCell>
                ))}
              </TableRow>

              {/* Price (in ₹ INR) */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B665E' }}>Price (INR ₹)</TableCell>
                {comparisonItems.map((item, idx) => {
                  const attrs = allParsed[idx] || {};
                  const isPriceOnInquiry = attrs.priceVerificationStatus === 'PRICE_UPON_INQUIRY' || item.price === 0;
                  return (
                    <TableCell key={item.id} align="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#B89758' }}>
                        {isPriceOnInquiry ? 'Price upon inquiry' : formatINR(item.price)}
                      </Typography>
                      {isPriceOnInquiry ? (
                        <Typography variant="caption" sx={{ color: '#B89758', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                          Atelier Consultation
                        </Typography>
                      ) : isDemoPrice(item.sku) ? (
                        <Typography variant="caption" sx={{ color: '#A08040', display: 'block', fontSize: '0.65rem' }}>
                          Unverified Demo Feed
                        </Typography>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Brand & SKU */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B665E' }}>Atelier Brand / Vault SKU</TableCell>
                {comparisonItems.map(item => (
                  <TableCell key={item.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.brand || 'LUMIÈRE Maison'}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#8C827A' }}>{item.sku}</Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Status */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B665E' }}>Availability</TableCell>
                {comparisonItems.map(item => (
                  <TableCell key={item.id} align="center">
                    <Chip 
                      label={item.status === 'ACTIVE' ? 'Available' : 'Reserved'} 
                      size="small" 
                      color={item.status === 'ACTIVE' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Dynamic Category Attributes */}
              {attributeKeys.map(attrKey => (
                <TableRow key={attrKey}>
                  <TableCell sx={{ fontWeight: 600, color: '#6B665E', textTransform: 'capitalize' }}>
                    {attrKey}
                  </TableCell>
                  {comparisonItems.map((item, idx) => {
                    const val = allParsed[idx][attrKey] || '—';
                    return (
                      <TableCell key={item.id} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {val}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* Actions */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B665E' }}>Acquisition</TableCell>
                {comparisonItems.map((item, idx) => {
                  const attrs = allParsed[idx] || {};
                  const isReferralOrInquiry =
                    Boolean(item.id && item.id.startsWith('prod-')) ||
                    Boolean(attrs.destinationUrl) ||
                    Boolean(attrs.isReferral) ||
                    Boolean(attrs.destinationType) ||
                    attrs.fulfillmentType === 'EXTERNAL_REFERRAL' ||
                    attrs.fulfillmentType === 'EXTERNAL_ATELIER_REFERRAL' ||
                    attrs.priceVerificationStatus === 'PRICE_UPON_INQUIRY' ||
                    Boolean(attrs.isEditorialConcept) ||
                    !item.price ||
                    item.price <= 0;

                  return (
                    <TableCell key={item.id} align="center">
                      {isReferralOrInquiry ? (
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/products/${item.id}`}
                          sx={{
                            borderColor: '#181816',
                            color: '#181816',
                            fontFamily: '"Cinzel", serif',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '20px',
                            '&:hover': { bgcolor: '#181816', color: '#FAF8F5' }
                          }}
                        >
                          View Dossier
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingBagOutlined />}
                          onClick={() => handleAcquire(item.id)}
                          sx={{
                            bgcolor: '#181816',
                            color: '#FAF8F5',
                            border: '1px solid #B89758',
                            fontFamily: '"Cinzel", serif',
                            fontSize: '0.75rem',
                            '&:hover': { bgcolor: '#2A2A26' }
                          }}
                        >
                          Acquire Piece
                        </Button>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Drawer>
    </>
  );
};
