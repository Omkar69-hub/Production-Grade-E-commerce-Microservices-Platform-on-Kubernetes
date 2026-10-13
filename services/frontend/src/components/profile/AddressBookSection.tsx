import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  Add,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddressService } from '../../services/AddressService';
import type { Address, AddressInput } from '../../types/address';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full recipient name is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone number required (e.g. +919876543210 or 9876543210)'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  zipCode: z.string().min(4, 'Postal PIN code is required'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export const AddressBookSection: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false,
    }
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AddressService.getAddresses();
      setAddresses(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load delivery addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    reset({
      fullName: '',
      phoneNumber: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    reset({
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setOpenDialog(true);
  };

  const onSubmit = async (values: AddressFormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      if (editingAddress) {
        await AddressService.updateAddress(editingAddress.id, values as AddressInput);
        setSuccessMsg('Delivery address updated successfully');
      } else {
        await AddressService.createAddress(values as AddressInput);
        setSuccessMsg('New delivery address registered to your dossier');
      }
      setOpenDialog(false);
      await loadAddresses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you wish to remove this delivery address from your dossier?')) return;
    try {
      setError(null);
      await AddressService.deleteAddress(id);
      setSuccessMsg('Address removed successfully');
      await loadAddresses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to remove address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setError(null);
      await AddressService.setDefaultAddress(id);
      setSuccessMsg('Default destination updated');
      await loadAddresses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to set default address');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.15em' }}>
            CLIENT DELIVERY DOSSIER
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }}>
            Saved Addresses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
          sx={{
            bgcolor: '#181816',
            color: '#B89758',
            fontWeight: 600,
            letterSpacing: '0.08em',
            '&:hover': { bgcolor: '#2A2925' }
          }}
        >
          Add New Address
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

      {addresses.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: '#FAF8F5',
            border: '1px dashed #D5C9B3',
            borderRadius: 2
          }}
        >
          <HomeOutlined sx={{ fontSize: 48, color: '#B89758', mb: 2 }} />
          <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, mb: 1 }}>
            No Saved Destinations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 3 }}>
            Add your primary residence or concierge delivery location for expedited white-glove checkouts.
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={handleOpenAdd}>
            Add Delivery Address
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((addr) => (
            <Grid key={addr.id} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  bgcolor: addr.isDefault ? '#FFFDF9' : '#FAF8F5',
                  border: addr.isDefault ? '2px solid #B89758' : '1px solid #EAE5DC',
                  borderRadius: 2,
                  boxShadow: addr.isDefault ? '0 4px 16px rgba(184, 151, 88, 0.12)' : 'none',
                  position: 'relative'
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                        {addr.fullName}
                      </Typography>
                    </Box>
                    {addr.isDefault && (
                      <Chip
                        icon={<CheckCircleOutlined sx={{ fontSize: '14px !important', color: '#B89758 !important' }} />}
                        label="DEFAULT RESIDENCE"
                        size="small"
                        sx={{
                          bgcolor: '#181816',
                          color: '#B89758',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          letterSpacing: '0.08em',
                          height: 24
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ color: '#2A2925', mb: 0.5, lineHeight: 1.6 }}>
                    {addr.street}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                    {addr.city}, {addr.state} - <strong>{addr.zipCode}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#777', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    {addr.country}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666', mb: 2 }}>
                    <PhoneOutlined sx={{ fontSize: 16, color: '#B89758' }} />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {addr.phoneNumber}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: '#EAE5DC' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {!addr.isDefault ? (
                    <Button
                      size="small"
                      onClick={() => handleSetDefault(addr.id)}
                      sx={{
                        color: '#B89758',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em'
                      }}
                    >
                      Set as Default
                    </Button>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>
                      Primary Destination
                    </Typography>
                  )}

                  <Box>
                    <IconButton size="small" onClick={() => handleOpenEdit(addr)} sx={{ color: 'text.secondary', mr: 0.5 }}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(addr.id)} sx={{ color: '#C0392B' }}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Address Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => { if (!submitting) setOpenDialog(false); }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, pb: 1 }}>
          {editingAddress ? 'Update Delivery Destination' : 'Add New Delivery Destination'}
        </DialogTitle>
        <form onSubmit={handleSubmit((values) => onSubmit(values))}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Recipient Full Name"
                    fullWidth
                    required
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Phone Number"
                    placeholder="+919876543210"
                    fullWidth
                    required
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message || 'Include country prefix (e.g. +91) or 10-digit number'}
                  />
                )}
              />

              <Controller
                name="street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address / Suite"
                    fullWidth
                    required
                    error={!!errors.street}
                    helperText={errors.street?.message}
                  />
                )}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="City"
                        fullWidth
                        required
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="State / Province"
                        fullWidth
                        required
                        error={!!errors.state}
                        helperText={errors.state?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Postal / PIN Code"
                        fullWidth
                        required
                        error={!!errors.zipCode}
                        helperText={errors.zipCode?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Country"
                        fullWidth
                        required
                        error={!!errors.country}
                        helperText={errors.country?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Set as default delivery destination"
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: '#181816',
                color: '#B89758',
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: '#2A2925' }
              }}
            >
              {submitting ? 'Saving...' : editingAddress ? 'Update Destination' : 'Save Destination'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
