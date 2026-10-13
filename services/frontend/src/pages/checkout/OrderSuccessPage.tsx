import React from 'react';
import { Container, Typography, Button, Paper, Box, Divider, Stack } from '@mui/material';
import { CheckCircleOutlined, ShoppingBagOutlined, HistoryOutlined } from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper 
        elevation={0}
        className="lumiere-card sunrise-glow-card"
        sx={{ 
          p: { xs: 4, sm: 6 }, 
          textAlign: 'center', 
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          border: '1px solid #EAE5DC',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            width: 72, 
            height: 72, 
            mx: 'auto', 
            mb: 3, 
            borderRadius: '50%', 
            border: '2px solid #B89758', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(184, 151, 88, 0.1)',
            boxShadow: '0 0 24px rgba(184, 151, 88, 0.25)'
          }}
        >
          <CheckCircleOutlined sx={{ fontSize: 44, color: 'primary.main' }} />
        </Box>

        <Typography 
          variant="overline" 
          sx={{ 
            color: 'primary.main', 
            fontWeight: 600, 
            letterSpacing: '0.25em',
            display: 'block',
            mb: 1
          }}
        >
          ACQUISITION CONFIRMED
        </Typography>

        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontFamily: '"Playfair Display", Georgia, serif', 
            fontWeight: 700, 
            color: 'secondary.main',
            mb: 2 
          }}
        >
          Thank You for Your Order
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
          Your bespoke allocation has been registered in our microservices vault. An order confirmation notification has been dispatched to our courier desk.
        </Typography>

        <Box 
          sx={{ 
            my: 4, 
            p: 3, 
            bgcolor: '#FAF8F5', 
            borderRadius: 1.5, 
            border: '1px solid #EAE5DC',
            textAlign: 'left'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Serialized Order Number
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'secondary.main' }}>
                #{id}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1, 
                bgcolor: '#181816', 
                color: '#B89758', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                letterSpacing: '0.1em' 
              }}
            >
              CONFIRMED
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: '#EAE5DC' }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/profile" 
            startIcon={<HistoryOutlined />}
            className="btn-shimmer"
            sx={{ py: 1.5, px: 3, fontSize: '0.85rem' }}
          >
            Track in Client Dossier
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/" 
            startIcon={<ShoppingBagOutlined />}
            sx={{ 
              py: 1.5, 
              px: 3, 
              fontSize: '0.85rem',
              borderColor: '#D5C9B3',
              color: 'secondary.main',
              '&:hover': { borderColor: 'primary.main' }
            }}
          >
            Continue Exploring
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;


