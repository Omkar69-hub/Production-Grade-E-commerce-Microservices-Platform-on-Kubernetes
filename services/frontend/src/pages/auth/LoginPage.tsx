import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box, Button, TextField, Typography, Alert, Link as MuiLink,
  Divider, InputAdornment, IconButton, Chip
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AuthService } from '../../services/AuthService';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { VisibilityOutlined, VisibilityOffOutlined, LockOutlined, ArrowForwardOutlined } from '@mui/icons-material';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must not exceed 50 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination if coming from protected route
  const from = (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError('');
      const response = await AuthService.login(data);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      navigate(from, { replace: true });
    } catch (err: any) {
      // Security: Strictly fail closed. Wipe any residual credentials or stale tokens.
      dispatch(logout());

      if (err.response?.status === 503) {
        setError('Authentication service is currently unavailable. Please contact the atelier concierge or try again later.');
      } else if (!err.response) {
        setError('Unable to reach authentication services. Please verify your connection.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
      }
    }
  };

  const fillAdminDemo = () => {
    setValue('email', 'admin@ecommerce.com', { shouldValidate: true });
    setValue('password', 'admin123', { shouldValidate: true });
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
          backgroundImage: 'linear-gradient(to top, rgba(26, 20, 32, 0.94) 0%, rgba(26, 20, 32, 0.4) 60%, rgba(26, 20, 32, 0.65) 100%), url(https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1400)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Chip
            label="LUMIÈRE PRIVATE SALON"
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
            Elegance is refusal. Discover certified couture with verified provenance.
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
            Official brand flagship referrals • 58 Verified Maisons • Direct atelier pricing in INR (₹).
          </Typography>
        </Box>
      </Box>

      {/* Right Column: Editorial Authentication Form */}
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
            maxWidth: 460,
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
              <LockOutlined sx={{ fontSize: 22 }} />
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
              CLIENT PORTAL
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
              Sign In to LUMIÈRE
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
              Access your private client dossier, order tracking, and bespoke appointments.
            </Typography>
          </Box>

          {/* Error Feedback */}
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

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ textAlign: 'left' }}>
            <TextField
              margin="normal"
              fullWidth
              label="Client Email Address"
              autoComplete="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                mb: 2.5,
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
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              {isSubmitting ? 'Authenticating...' : 'Enter Salon'}
            </Button>

            <Divider sx={{ my: 3, borderColor: 'var(--line, #e5dccb)' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--mute, #6b6173)',
                  letterSpacing: '0.12em',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontWeight: 600
                }}
              >
                CONCIERGE QUICK LOGIN
              </Typography>
            </Divider>

            <Box sx={{ mb: 3 }}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                fullWidth
                onClick={fillAdminDemo}
                disabled={isSubmitting}
                className="lumiere-pill-btn"
                sx={{
                  borderColor: 'var(--line, #e5dccb)',
                  color: 'var(--ink, #1a1420)',
                  fontSize: '0.8rem',
                  py: 1.2,
                  borderRadius: '99px',
                  fontWeight: 600,
                  fontFamily: '"Instrument Sans", sans-serif',
                  '&:hover': {
                    borderColor: 'var(--cobalt, #3a3ce0)',
                    color: 'var(--cobalt, #3a3ce0)',
                    bgcolor: 'rgba(58, 60, 224, 0.04)'
                  }
                }}
              >
                Fill Admin Atelier
              </Button>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1.2,
                  color: 'var(--mute, #6b6173)',
                  textAlign: 'center',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.74rem'
                }}
              >
                Standard clients should register a personal dossier via the link below.
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--mute, #6b6173)',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '0.88rem'
                }}
              >
                Not yet registered with the Maison?{' '}
                <MuiLink
                  component={Link}
                  to="/register"
                  sx={{
                    color: 'var(--cobalt, #3a3ce0)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Create an Account
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
