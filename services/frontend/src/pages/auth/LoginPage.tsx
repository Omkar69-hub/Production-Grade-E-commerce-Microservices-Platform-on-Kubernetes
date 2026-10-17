import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Box, Button, TextField, Typography, Container, Alert, Link as MuiLink, Paper, Divider, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AuthService } from '../../services/AuthService';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { LockOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must not exceed 50 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
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
      localStorage.removeItem('token');

      if (err.response?.status === 503) {
        setError('Authentication service is currently unavailable. Please contact the atelier concierge or try again later.');
      } else if (!err.response) {
        setError('Unable to reach authentication services. Please verify your connection.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
      }
    }
  };

  const fillAdminDemo = () => {
    setValue('email', 'admin@ecommerce.com', { shouldValidate: true });
    setValue('password', 'admin123', { shouldValidate: true });
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
            <LockOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 600, 
              letterSpacing: '0.25em' 
            }}
          >
            CLIENT PORTAL
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
            Sign In to LUMIÈRE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Access your private client dossier, order tracking, and bespoke appointments.
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
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ textAlign: 'left' }}>
          <TextField
            margin="normal"
            fullWidth
            label="Client Email Address"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
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
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="btn-shimmer"
            size="large"
            sx={{ py: 1.8, fontSize: '0.9rem', letterSpacing: '0.12em', mb: 3 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Enter Salon'}
          </Button>

          <Divider sx={{ my: 3, borderColor: '#EAE5DC' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}>
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
              sx={{ borderColor: '#D5C9B3', color: 'text.primary', fontSize: '0.75rem', py: 1 }}
            >
              Fill Admin Atelier
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
              Standard clients should register a personal dossier via the link below.
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Not yet registered with the Maison?{' '}
              <MuiLink 
                component={Link} 
                to="/register" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 600, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Create an Account
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
