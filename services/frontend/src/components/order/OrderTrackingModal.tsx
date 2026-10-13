import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  AccessTimeOutlined,
  ScienceOutlined
} from '@mui/icons-material';
import { OrderService } from '../../services/OrderService';
import type { OrderTrackingResponse, OrderStatusHistoryItem } from '../../types/order';

interface OrderTrackingModalProps {
  open: boolean;
  orderId: string | null;
  orderNumber: string | null;
  onClose: () => void;
  onStatusChanged?: () => void;
}

const ORDER_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  open,
  orderId,
  orderNumber,
  onClose,
  onStatusChanged
}) => {
  const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [selectedSimStatus, setSelectedSimStatus] = useState<string>('CONFIRMED');

  const fetchTracking = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrderTracking(id);
      setTracking(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to retrieve tracking dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && orderId) {
      fetchTracking(orderId);
    } else {
      setTracking(null);
      setError(null);
    }
  }, [open, orderId]);

  const handleSimulateTransition = async () => {
    if (!orderId || !selectedSimStatus) return;
    try {
      setSimulating(true);
      setError(null);
      const updated = await OrderService.simulateStatusTransition(orderId, selectedSimStatus);
      setTracking(updated);
      if (onStatusChanged) onStatusChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to apply simulated transition');
    } finally {
      setSimulating(false);
    }
  };

  const getStatusIndex = (currentStatus: string) => {
    return ORDER_FLOW.indexOf(currentStatus);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2, p: 1 }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.15em' }}>
            ACQUISITION TRACKING DOSSIER
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }}>
            Order #{orderNumber || tracking?.orderNumber || 'N/A'}
          </Typography>
        </Box>
        {tracking && (
          <Chip
            label={tracking.currentStatus}
            sx={{
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.75rem',
              bgcolor: tracking.currentStatus === 'DELIVERED' ? '#27AE60' : tracking.currentStatus === 'CANCELLED' || tracking.currentStatus === 'PAYMENT_FAILED' ? '#C0392B' : '#181816',
              color: tracking.currentStatus === 'DELIVERED' || tracking.currentStatus === 'CANCELLED' || tracking.currentStatus === 'PAYMENT_FAILED' ? '#FFFFFF' : '#B89758'
            }}
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : tracking ? (
          <Box>
            {/* Stepper Progress Bar */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FAF8F5', border: '1px solid #EAE5DC', borderRadius: 2, mb: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'block', mb: 2 }}>
                Fulfillment Trajectory
              </Typography>
              <Stepper activeStep={getStatusIndex(tracking.currentStatus)} alternativeLabel>
                {ORDER_FLOW.map((statusLabel) => {
                  const isCurrent = tracking.currentStatus === statusLabel;
                  return (
                    <Step key={statusLabel} completed={getStatusIndex(tracking.currentStatus) > ORDER_FLOW.indexOf(statusLabel)}>
                      <StepLabel
                        sx={{
                          '& .MuiStepIcon-root.Mui-active': { color: '#B89758' },
                          '& .MuiStepIcon-root.Mui-completed': { color: '#181816' }
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'primary.main' : 'text.primary' }}>
                          {statusLabel}
                        </Typography>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>

            {/* Persisted History Timeline */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '0.05em' }}>
              Persisted Event Timeline ({tracking.timeline.length} milestone{tracking.timeline.length === 1 ? '' : 's'})
            </Typography>

            <Stack spacing={2} sx={{ mb: 4 }}>
              {tracking.timeline.map((event: OrderStatusHistoryItem, index: number) => (
                <Paper
                  key={event.id || index}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #EAE5DC',
                    borderLeft: '4px solid #B89758',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>
                        {event.status}
                      </Typography>
                      {event.isSimulated && (
                        <Chip
                          label="SIMULATED TEST EVENT"
                          size="small"
                          sx={{
                            fontSize: '0.6rem',
                            height: 18,
                            bgcolor: 'rgba(184, 151, 88, 0.15)',
                            color: '#8C6D2B',
                            fontWeight: 700
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#777' }}>
                      <AccessTimeOutlined sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {new Date(event.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {event.comment && (
                    <Typography variant="body2" sx={{ color: '#444', fontStyle: 'italic', mt: 0.5 }}>
                      "{event.comment}"
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ my: 3, borderColor: '#EAE5DC' }} />

            {/* Development-Only Visible Status Simulator */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#FFFDF9',
                border: '1px dashed #B89758',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScienceOutlined sx={{ color: '#B89758' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816', letterSpacing: '0.05em' }}>
                  Local Status Simulator (Development Mode Only)
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Visibly simulated data for local development & demonstration. Not connected to real courier telemetry. Status events are logged with <code>is_simulated = true</code> and broadcast over RabbitMQ for testing notification flows.
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="sim-status-label">Target Status</InputLabel>
                  <Select
                    labelId="sim-status-label"
                    value={selectedSimStatus}
                    label="Target Status"
                    onChange={(e) => setSelectedSimStatus(e.target.value)}
                  >
                    <MenuItem value="CONFIRMED">CONFIRMED (Payment Verified)</MenuItem>
                    <MenuItem value="PROCESSING">PROCESSING (Atelier Prep)</MenuItem>
                    <MenuItem value="SHIPPED">SHIPPED (White-Glove Transit)</MenuItem>
                    <MenuItem value="DELIVERED">DELIVERED (Client Presentation)</MenuItem>
                    <MenuItem value="CANCELLED">CANCELLED (Acquisition Revoked)</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={handleSimulateTransition}
                  disabled={simulating || selectedSimStatus === tracking.currentStatus}
                  sx={{
                    borderColor: '#B89758',
                    color: '#8C6D2B',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#8C6D2B', bgcolor: 'rgba(184, 151, 88, 0.08)' }
                  }}
                >
                  {simulating ? 'Transitioning...' : `Advance to ${selectedSimStatus}`}
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#181816', fontWeight: 600 }}>
          Close Dossier
        </Button>
      </DialogActions>
    </Dialog>
  );
};
