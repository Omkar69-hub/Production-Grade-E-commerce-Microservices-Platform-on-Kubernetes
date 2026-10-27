import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box, Button, TextField, Typography, Alert, Link as MuiLink,
  Grid, InputAdornment, IconButton, Chip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import { VisibilityOutlined, VisibilityOffOutlined, PersonAddOutlined, ArrowForwardOutlined } from '@mui/icons-material';

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

export const RegisterPage: React.FC = () => {
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
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (!err.response && err.message ? err.message : null);
      setError(backendMessage || 'Registration could not be completed. The email may already be in use.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        bgcolor: 'var(--bg, #fbf6ec)',
        color: 'var(--ink, #1a1420)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Column: Cinematic Editorial Visual (Desktop Only) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '50%',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 8,
          backgroundImage: 'linear-gradient(to top, rgba(26, 20, 32, 0.94) 0%, rgba(26, 20, 32, 0.4) 60%, rgba(26, 20, 32, 0.65) 100%), url(https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1400)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Chip
            label="MAISON PRIVILEGE"
            size="small"
            sx={{
              bgcolor: 'var(--lime, #d8f25a)',
              color: '#1a1420',
              fontWeight: 700,
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '0.12em',
              borderRadius: '99px',
              fontSize: '0.72rem',
              py: 0.5,
              px: 1,
              mb: 3
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              color: '#FFFFFF',
              fontWeight: 400,
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              lineHeight: 1.15,
              maxWidth: 480
            }}
          >
            The garment is an architecture. Join our global circle of couture connoisseurs.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 2, pt: 4, borderTop: '1px solid rgba(251, 246, 236, 0.2)' }}>
          <Typography
            sx={{
              fontFamily: '"Instrument Sans", sans-serif',
              color: 'rgba(251, 246, 236, 0.8)',
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              lineHeight: 1.6
            }}
          >
            Private Wishlist Vault • Atelier Sizing Benchmarks • Cryptographic Official Domain Safeguards.
          </Typography>
        </Box>
      </Box>

      {/* Right Column: Editorial Enrollment Form */}
      <Box
        sx={{
          width: { xs: '100%', lg: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 4, sm: 8 },
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            p: { xs: 4, sm: 6 },
            border: '1px solid var(--line, #e5dccb)',
            boxShadow: '0 20px 50px rgba(26, 20, 32, 0.08)'
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(58, 60, 224, 0.08)',
                border: '1px solid rgba(58, 60, 224, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cobalt, #3a3ce0)'
              }}
            >
              <PersonAddOutlined sx={{ fontSize: 24 }} />
            </Box>

            <Typography
              variant="overline"
              sx={{
                color: 'var(--cobalt, #3a3ce0)',
                fontWeight: 700,
                letterSpacing: '0.22em',
                fontFamily: '"Instrument Sans", sans-serif',
                display: 'block'
              }}
            >
              MAISON MEMBERSHIP
            </Typography>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 500,
                color: 'var(--ink, #1a1420)',
                mt: 1,
                mb: 1
              }}
            >
              Create Your Account
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'var(--mute, #6b6173)',
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}
            >
              Join our private circle of connoisseurs to access exclusive allocations and serialized delivery tracking.
            </Typography>
          </Box>

          {/* Feedback Alerts */}
          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 3,
                borderRadius: '12px',
                fontFamily: '"Instrument Sans", sans-serif',
                bgcolor: 'rgba(232, 87, 43, 0.08)',
                color: '#c0392b',
                border: '1px solid rgba(232, 87, 43, 0.25)'
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
                borderRadius: '12px',
                fontFamily: '"Instrument Sans", sans-serif',
                bgcolor: 'rgba(216, 242, 90, 0.15)',
                color: '#1a1420',
                border: '1px solid rgba(216, 242, 90, 0.5)',
                '& .MuiAlert-icon': { color: 'var(--ink, #1a1420)' }
              }}
            >
              Welcome to LUMIÈRE. Your dossier is created. Directing to client sign in...
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ textAlign: 'left' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontFamily: '"Instrument Sans", sans-serif',
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--cobalt, #3a3ce0)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontFamily: '"Instrument Sans", sans-serif',
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--cobalt, #3a3ce0)'
                      }
                    }
                  }}
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
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: '"Instrument Sans", sans-serif',
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--cobalt, #3a3ce0)'
                  }
                }
              }}
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
              sx={{
                mt: 2,
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: '"Instrument Sans", sans-serif',
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--cobalt, #3a3ce0)'
                  }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="lumiere-pill-btn"
              size="large"
              disabled={isSubmitting || success}
              endIcon={!isSubmitting && <ArrowForwardOutlined sx={{ fontSize: 18 }} />}
              sx={{
                py: 1.6,
                fontSize: '0.94rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                borderRadius: '99px',
                fontFamily: '"Instrument Sans", sans-serif',
                bgcolor: 'var(--ink, #1a1420)',
                color: 'var(--bg, #fbf6ec)',
                boxShadow: '0 8px 24px rgba(26, 20, 32, 0.18)',
                mb: 3,
                '&:hover': {
                  bgcolor: 'var(--cobalt, #3a3ce0)',
                  color: '#FFFFFF'
                }
              }}
            >
              {isSubmitting ? 'Enrolling Client...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--mute, #6b6173)',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.88rem'
                }}
              >
                Already an enrolled client?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  sx={{
                    color: 'var(--cobalt, #3a3ce0)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign In to Salon
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
