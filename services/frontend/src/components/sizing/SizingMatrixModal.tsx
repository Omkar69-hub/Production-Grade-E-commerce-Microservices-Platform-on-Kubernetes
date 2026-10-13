import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Tabs, Tab, Button, ToggleButton,
  ToggleButtonGroup, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField,
  Alert, Divider, IconButton, Chip
} from '@mui/material';
import {
  Close as CloseIcon, Straighten as StraightenIcon,
  CheckCircleOutlined, OpenInNewOutlined, InfoOutlined
} from '@mui/icons-material';
import { getSafeExternalLinkAttributes } from '../../utils/domainVerifier';

export type SizingCategory = 'Women' | 'Men' | 'Kids';
export type SizingUnit = 'in' | 'cm';

interface SizingMatrixModalProps {
  open: boolean;
  onClose: () => void;
  initialCategory?: SizingCategory;
  brandName?: string;
  brandSlug?: string;
  verifiedWebsiteUrl?: string;
}

// Benchmark international measurements in INCHES
interface MeasurementRow {
  sizeLabel: string;
  regionalCode: string;
  bustChestIn: [number, number];
  waistIn: [number, number];
  hipsIn?: [number, number];
  lengthIn?: number;
  heightCm?: [number, number];
}

const WOMEN_BENCHMARKS: MeasurementRow[] = [
  { sizeLabel: 'XS / 34', regionalCode: 'FR 34 / UK 6 / US 2', bustChestIn: [31, 32], waistIn: [24, 25], hipsIn: [34, 35], lengthIn: 55 },
  { sizeLabel: 'S / 36', regionalCode: 'FR 36 / UK 8 / US 4', bustChestIn: [33, 34], waistIn: [26, 27], hipsIn: [36, 37], lengthIn: 56 },
  { sizeLabel: 'M / 38', regionalCode: 'FR 38 / UK 10 / US 6', bustChestIn: [35, 36], waistIn: [28, 29], hipsIn: [38, 39], lengthIn: 56.5 },
  { sizeLabel: 'L / 40', regionalCode: 'FR 40 / UK 12 / US 8', bustChestIn: [37, 38], waistIn: [30, 31], hipsIn: [40, 41], lengthIn: 57 },
  { sizeLabel: 'XL / 42', regionalCode: 'FR 42 / UK 14 / US 10', bustChestIn: [39, 41], waistIn: [32, 34], hipsIn: [42, 44], lengthIn: 57.5 },
];

const MEN_BENCHMARKS: MeasurementRow[] = [
  { sizeLabel: '38 / S', regionalCode: 'IT 46 / UK 38 / Kurta 38', bustChestIn: [37, 38], waistIn: [31, 32], lengthIn: 40 },
  { sizeLabel: '40 / M', regionalCode: 'IT 48 / UK 40 / Kurta 40', bustChestIn: [39, 40], waistIn: [33, 34], lengthIn: 41 },
  { sizeLabel: '42 / L', regionalCode: 'IT 50 / UK 42 / Kurta 42', bustChestIn: [41, 42], waistIn: [35, 36], lengthIn: 42 },
  { sizeLabel: '44 / XL', regionalCode: 'IT 52 / UK 44 / Kurta 44', bustChestIn: [43, 44], waistIn: [37, 38], lengthIn: 42.5 },
  { sizeLabel: '46 / XXL', regionalCode: 'IT 54 / UK 46 / Kurta 46', bustChestIn: [45, 47], waistIn: [39, 41], lengthIn: 43 },
];

const KIDS_BENCHMARKS: MeasurementRow[] = [
  { sizeLabel: 'Size 24 (4-5 Y)', regionalCode: 'Height 104-110 cm', bustChestIn: [22, 23], waistIn: [21, 22], heightCm: [104, 110] },
  { sizeLabel: 'Size 28 (6-7 Y)', regionalCode: 'Height 116-122 cm', bustChestIn: [24, 25], waistIn: [22, 23], heightCm: [116, 122] },
  { sizeLabel: 'Size 32 (8-9 Y)', regionalCode: 'Height 128-134 cm', bustChestIn: [26, 27], waistIn: [24, 25], heightCm: [128, 134] },
  { sizeLabel: 'Size 36 (10-12 Y)', regionalCode: 'Height 140-152 cm', bustChestIn: [28, 30], waistIn: [25, 27], heightCm: [140, 152] },
];

export const SizingMatrixModal: React.FC<SizingMatrixModalProps> = ({
  open,
  onClose,
  initialCategory = 'Women',
  brandName,
  verifiedWebsiteUrl,
}) => {
  const [activeTab, setActiveTab] = useState<SizingCategory>(initialCategory);
  const [unit, setUnit] = useState<SizingUnit>('in');

  // Find your size calculator state
  const [inputChest, setInputChest] = useState<string>('');
  const [inputWaist, setInputWaist] = useState<string>('');
  const [recommendation, setRecommendation] = useState<{
    size: string;
    details: string;
    confidence: 'exact' | 'approximate';
  } | null>(null);

  const formatMeasure = (inches: number): string => {
    if (unit === 'cm') {
      return `${Math.round(inches * 2.54)} cm`;
    }
    return `${inches}"`;
  };

  const formatRange = (range: [number, number]): string => {
    if (unit === 'cm') {
      return `${Math.round(range[0] * 2.54)} – ${Math.round(range[1] * 2.54)} cm`;
    }
    return `${range[0]}" – ${range[1]}"`;
  };

  const activeRows = activeTab === 'Women' 
    ? WOMEN_BENCHMARKS 
    : activeTab === 'Men' 
    ? MEN_BENCHMARKS 
    : KIDS_BENCHMARKS;

  const handleCalculateSize = () => {
    const chestVal = parseFloat(inputChest);
    if (isNaN(chestVal) || chestVal <= 0) {
      setRecommendation(null);
      return;
    }

    // Convert input to inches for comparison
    const chestInches = unit === 'cm' ? chestVal / 2.54 : chestVal;

    // Defensible calculation: compare against benchmarks
    const match = activeRows.find(
      (row) => chestInches >= row.bustChestIn[0] - 0.5 && chestInches <= row.bustChestIn[1] + 0.5
    );

    if (match) {
      setRecommendation({
        size: match.sizeLabel,
        details: `Calculated from ${inputChest} ${unit} ${activeTab === 'Women' ? 'bust' : 'chest'} measurement (${match.regionalCode}).`,
        confidence: 'exact',
      });
    } else {
      // Find closest boundary
      if (chestInches < activeRows[0].bustChestIn[0]) {
        setRecommendation({
          size: activeRows[0].sizeLabel,
          details: `Below standard matrix midpoint. Consider tailored petite/custom fit (${activeRows[0].regionalCode}).`,
          confidence: 'approximate',
        });
      } else {
        const last = activeRows[activeRows.length - 1];
        setRecommendation({
          size: last.sizeLabel,
          details: `Above standard matrix midpoint. Consider tailored plus/custom bespoke fit (${last.regionalCode}).`,
          confidence: 'approximate',
        });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="sizing-matrix-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            bgcolor: '#FAF8F5',
            border: '1px solid #EAE5DC',
            boxShadow: '0 20px 60px rgba(24, 24, 22, 0.18)',
          },
        },
      }}
    >
      <DialogTitle
        id="sizing-matrix-title"
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #EAE5DC',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StraightenIcon sx={{ color: '#E50914' }} />
          <Box>
            <Typography variant="overline" sx={{ color: '#E50914', fontWeight: 700, letterSpacing: '0.15em', display: 'block', lineHeight: 1 }}>
              ATELIER MEASUREMENT MATRIX
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700, color: '#181816', mt: 0.3 }}>
              Sizing & Fit Specifications
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close size guide"
          sx={{ color: '#6B665E', '&:hover': { color: '#181816' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Unit and Category Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
              setRecommendation(null);
            }}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                minWidth: 100,
              },
            }}
          >
            <Tab label="Women" value="Women" />
            <Tab label="Men" value="Men" />
            <Tab label="Kids" value="Kids" />
          </Tabs>

          <ToggleButtonGroup
            value={unit}
            exclusive
            onChange={(_, newUnit) => {
              if (newUnit) setUnit(newUnit);
            }}
            size="small"
            sx={{
              bgcolor: '#FFFFFF',
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.6,
                fontWeight: 600,
                fontSize: '0.8rem',
                border: '1px solid #EAE5DC',
                '&.Mui-selected': {
                  bgcolor: '#181816',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#2A2A26' },
                },
              },
            }}
          >
            <ToggleButton value="in">Inches (in)</ToggleButton>
            <ToggleButton value="cm">Centimetres (cm)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Matrix Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px solid #EAE5DC',
            mb: 3.5,
            overflowX: 'auto',
          }}
        >
          <Table size="medium" aria-label="Haute couture sizing benchmark table">
            <TableHead sx={{ bgcolor: '#F4EFE6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', fontSize: '0.78rem' }}>SIZE BENCHMARK</TableCell>
                <TableCell sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', fontSize: '0.78rem' }}>STANDARDS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', fontSize: '0.78rem' }}>{activeTab === 'Women' ? 'BUST' : 'CHEST'}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', fontSize: '0.78rem' }}>WAIST</TableCell>
                {activeTab === 'Women' && (
                  <TableCell sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', fontSize: '0.78rem' }}>HIPS</TableCell>
                )}
                <TableCell sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', fontSize: '0.78rem' }}>
                  {activeTab === 'Kids' ? 'HEIGHT' : 'GARMENT LENGTH'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeRows.map((row) => (
                <TableRow key={row.sizeLabel} sx={{ '&:nth-of-type(even)': { bgcolor: '#FCFAF7' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#181816' }}>{row.sizeLabel}</TableCell>
                  <TableCell sx={{ color: '#6B665E', fontSize: '0.85rem' }}>{row.regionalCode}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatRange(row.bustChestIn)}</TableCell>
                  <TableCell>{formatRange(row.waistIn)}</TableCell>
                  {activeTab === 'Women' && (
                    <TableCell>{row.hipsIn ? formatRange(row.hipsIn) : '—'}</TableCell>
                  )}
                  <TableCell>
                    {activeTab === 'Kids' && row.heightCm
                      ? unit === 'cm'
                        ? `${row.heightCm[0]} – ${row.heightCm[1]} cm`
                        : `${Math.round(row.heightCm[0] / 2.54)}" – ${Math.round(row.heightCm[1] / 2.54)}"`
                      : row.lengthIn
                      ? formatMeasure(row.lengthIn)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Traditional Saree & Bespoke Note for Indian Couture */}
        {activeTab === 'Women' && (
          <Box sx={{ mb: 3.5, p: 2, bgcolor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EAE5DC' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816', mb: 0.5 }}>
              Handloom Sarees & Free-Size Drapes
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B665E', fontSize: '0.85rem' }}>
              All pure handloom and Pichhwai silk sarees are crafted in universal drape length (5.5 metres / 6 yards) accompanied by an unstitched 0.8–1.0m blouse piece intended for tailored bespoke finishing.
            </Typography>
          </Box>
        )}

        {/* Find Your Size Calculator */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #EAE5DC',
            mb: 3.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CheckCircleOutlined sx={{ color: '#E50914', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700, color: '#181816' }}>
              FIND YOUR SIZE (BENCHMARK CALCULATOR)
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#8C827A', display: 'block', mb: 2 }}>
            Input your actual body measurements ({unit}) to calculate your closest standardized silhouette benchmark.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              label={`${activeTab === 'Women' ? 'Bust' : 'Chest'} (${unit})`}
              value={inputChest}
              onChange={(e) => setInputChest(e.target.value)}
              type="number"
              sx={{ width: 160 }}
              slotProps={{ htmlInput: { min: 10, max: 200, step: 0.5 } }}
            />
            <TextField
              size="small"
              label={`Natural Waist (${unit}) [Optional]`}
              value={inputWaist}
              onChange={(e) => setInputWaist(e.target.value)}
              type="number"
              sx={{ width: 180 }}
              slotProps={{ htmlInput: { min: 10, max: 200, step: 0.5 } }}
            />
            <Button
              variant="contained"
              onClick={handleCalculateSize}
              className="lumiere-red-btn"
              sx={{ px: 3, py: 1, fontWeight: 700, fontFamily: '"Cinzel", serif' }}
            >
              Calculate Benchmark
            </Button>
          </Box>

          {recommendation && (
            <Alert
              severity="info"
              icon={<InfoOutlined />}
              sx={{
                mt: 2.5,
                bgcolor: '#FAF8F5',
                border: '1px solid #B89758',
                '& .MuiAlert-icon': { color: '#E50914' },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>
                Suggested Benchmark: {recommendation.size}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B665E', fontSize: '0.85rem' }}>
                {recommendation.details}
              </Typography>
              <Typography variant="caption" sx={{ color: '#8C827A', display: 'block', mt: 0.8, fontStyle: 'italic' }}>
                *Notice: Sizing varies across heritage maisons. Recommendations are mathematical estimations based on international tailoring benchmarks and cannot guarantee bespoke fit.
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Measurement Guide */}
        <Box sx={{ p: 2.5, bgcolor: '#F8F6F2', borderRadius: '8px', border: '1px solid #EAE5DC', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816', mb: 1 }}>
            How to Measure Accurately
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#181816' }}>1. Bust / Chest</Typography>
              <Typography variant="caption" sx={{ color: '#6B665E' }}>
                Measure around the fullest part of your chest, keeping the tape level under your arms.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#181816' }}>2. Natural Waist</Typography>
              <Typography variant="caption" sx={{ color: '#6B665E' }}>
                Measure around the narrowest point of your torso, typically above the belly button.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#181816' }}>3. Full Hips</Typography>
              <Typography variant="caption" sx={{ color: '#6B665E' }}>
                Stand with feet together and measure around the widest part of your hips.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#181816' }}>4. Garment Length</Typography>
              <Typography variant="caption" sx={{ color: '#6B665E' }}>
                Measure from the high point of shoulder straight down to hemline.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Brand-Specific Sizing Limitation Notice */}
        <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: '6px', border: '1px dashed #D5C9B3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Chip label="Bespoke Sizing Notice" size="small" sx={{ bgcolor: '#181816', color: '#FAF8F5', fontSize: '0.68rem', fontWeight: 700 }} />
            {brandName && (
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#181816' }}>
                {brandName} Couture Protocol
              </Typography>
            )}
          </Box>
          <Typography variant="body2" sx={{ color: '#6B665E', fontSize: '0.84rem', lineHeight: 1.6 }}>
            {brandName
              ? `Pieces by ${brandName} are individually made-to-measure or follow maison-specific tailoring blocks. Generic size labels must not be treated as certified bespoke measurements for this atelier.`
              : 'Generic size charts represent standard prêt-à-porter benchmarks. High-fashion couture lehengas, sherwanis, and tailored tuxedos require bespoke atelier consultation.'}
          </Typography>

          {verifiedWebsiteUrl && (
            <Box sx={{ mt: 1.5 }}>
              <Button
                component="a"
                href={verifiedWebsiteUrl}
                {...getSafeExternalLinkAttributes()}
                size="small"
                variant="outlined"
                endIcon={<OpenInNewOutlined sx={{ fontSize: 14 }} />}
                sx={{
                  borderColor: '#EAE5DC',
                  color: '#181816',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#E50914', color: '#E50914' },
                }}
              >
                Consult {brandName || 'Atelier'} Official Sizing Chart
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: '#EAE5DC' }} />

      <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#EAE5DC', color: '#181816' }}>
          Close Size Guide
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SizingMatrixModal;
