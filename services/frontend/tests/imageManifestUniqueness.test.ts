import { describe, it, expect } from 'vitest';
import { MASTER_IMAGE_MANIFEST, verifyManifestUniqueness } from '../src/data/imageManifest';

describe('LUMIÈRE Stage 15C: Image Manifest & Uniqueness Verification', () => {
  it('ensures every image URL in the master manifest is unique with zero duplicates', () => {
    const { isUnique, duplicates } = verifyManifestUniqueness();
    expect(duplicates).toEqual([]);
    expect(isUnique).toBe(true);
  });

  it('contains verified distinct male activewear imagery separate from female activewear', () => {
    const maleGymwear = MASTER_IMAGE_MANIFEST.filter(
      (img) => img.category === 'Activewear' && img.subjectGender === 'Men'
    );
    const femaleGymwear = MASTER_IMAGE_MANIFEST.filter(
      (img) => img.category === 'Activewear' && img.subjectGender === 'Women'
    );

    expect(maleGymwear.length).toBeGreaterThanOrEqual(4);
    expect(femaleGymwear.length).toBeGreaterThanOrEqual(4);

    // Cross-check that no male activewear image URL matches any female activewear image URL
    const maleUrls = new Set(maleGymwear.map((m) => m.url));
    femaleGymwear.forEach((f) => {
      expect(maleUrls.has(f.url)).toBe(false);
    });
  });

  it('all manifest entries have valid HTTPS protocol and legitimate source attributions', () => {
    MASTER_IMAGE_MANIFEST.forEach((entry) => {
      expect(entry.url).toMatch(/^https:\/\//);
      expect(entry.attribution).toBeTruthy();
      expect(entry.modelPoseAndStyle).toBeTruthy();
      expect(entry.category).toBeTruthy();
      expect(entry.subjectGender).toBeTruthy();
    });
  });
});
