import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Box, Button, TextField, Typography, Container, Alert, Link as MuiLink, Paper, Grid, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import { PersonAddOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required (at least 2 characters)').max(100, 'First name must not exceed 100 characters'),
  lastName: z.string().min(2, 'Last name is required (at least 2 characters)').max(100, 'Last name must not exceed 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must not exceed 50 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError('');
      await AuthService.register(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration could not be completed. The email may already be in use.');
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={0}
        className="lumiere-card"
        sx={{ 
          p: { xs: 4, sm: 6 }, 
          bgcolor: '#FFFFFF', 
          border: '1px solid #EAE5DC', 
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              mx: 'auto', 
              mb: 2, 
              borderRadius: '50%', 
              border: '1px solid #B89758', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'rgba(184, 151, 88, 0.08)'
            }}
          >
            <PersonAddOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 600, 
              letterSpacing: '0.25em' 
            }}
          >
            MAISON MEMBERSHIP
          </Typography>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontFamily: '"Playfair Display", Georgia, serif', 
              fontWeight: 700, 
              mt: 1, 
              color: 'secondary.main' 
            }}
          >
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Join our private circle of connoisseurs to access exclusive allocations and serialized delivery tracking.
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              mb: 3, 
              textAlign: 'left',
              bgcolor: 'rgba(192, 57, 43, 0.05)',
              border: '1px solid rgba(192, 57, 43, 0.3)'
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              width: '100%', 
              mb: 3, 
              textAlign: 'left',
              bgcolor: 'rgba(184, 151, 88, 0.1)',
              border: '1px solid #B89758',
              color: 'secondary.main',
              '& .MuiAlert-icon': { color: 'primary.main' }
            }}
          >
            Welcome to LUMIÈRE. Your dossier is created. Directing to client sign in...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ textAlign: 'left' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Grid>
          </Grid>

          <TextField
            margin="normal"
            fullWidth
            label="Client Email Address"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mt: 2 }}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isSubmitting || success}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mt: 2, mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="btn-shimmer"
            size="large"
            sx={{ py: 1.8, fontSize: '0.9rem', letterSpacing: '0.12em', mb: 3 }}
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Enrolling Client...' : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already an enrolled client?{' '}
              <MuiLink 
                component={Link} 
                to="/login" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 600, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Sign In to Salon
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
