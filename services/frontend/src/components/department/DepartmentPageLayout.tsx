import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import type { DepartmentConfig } from '../../data/departmentConfig';
import { DepartmentHero } from './DepartmentHero';
import { DepartmentProductGrid } from './DepartmentProductGrid';

export interface DepartmentPageLayoutProps {
  config: DepartmentConfig;
}

export const DepartmentPageLayout: React.FC<DepartmentPageLayoutProps> = ({ config }) => {
  useEffect(() => {
    // Set document title
    document.title = `LUMIÈRE ${config.label} — Luxury Department & Curated Pieces`;

    // Apply department animation / styling identifier to document.body
    document.body.dataset.a = config.slug;

    // Scroll to top upon entering department page
    window.scrollTo(0, 0);

    return () => {
      document.body.removeAttribute('data-a');
    };
  }, [config.slug, config.label]);

  return (
    <Box
      component="main"
      id="main-content"
      sx={{
        width: '100%',
        maxWidth: '100%',
        minHeight: '100vh',
        bgcolor: 'var(--bg, #fbf6ec)',
        overflowX: 'hidden'
      }}
    >
      {/* Editorial Department Hero */}
      <DepartmentHero config={config} />

      {/* Filterable Product Grid */}
      <DepartmentProductGrid
        deptSlug={config.slug}
        deptLabel={config.label}
        accentColor={config.accentColor}
      />
    </Box>
  );
};

export default DepartmentPageLayout;

