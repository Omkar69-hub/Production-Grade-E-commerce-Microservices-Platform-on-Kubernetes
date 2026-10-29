/**
 * LUMIÈRE Department Experience Configuration
 * ============================================
 * Prototype-matched department configuration equivalent to the
 * original lumiere-wear.html prototype's DEP configuration object.
 *
 * Each department defines its hero content, accent colors,
 * editorial metadata, and animation timing for entrance sequences.
 */

export interface DepartmentConfig {
  /** Department slug (matches data-a attribute value) */
  slug: string;
  /** Display label */
  label: string;
  /** Hero section headline (line 1) */
  heroTitle: string;
  /** Hero section headline italic line (line 2) */
  heroTitleItalic: string;
  /** Hero subtitle / editorial description */
  heroSubtitle: string;
  /** Editorial collection tag text */
  heroTag: string;
  /** Chip label on hero image card */
  heroChipLabel: string;
  /** Hero image card title overlay */
  heroCardTitle: string;
  /** Hero image card subtitle overlay */
  heroCardSubtitle: string;
  /** Hero campaign image URL */
  heroImage: string;
  /** Primary accent color for department */
  accentColor: string;
  /** Secondary accent / glow color */
  glowColor: string;
  /** Radial gradient stop for atmospheric glow */
  glowGradient: string;
  /** Delay (ms) before adding .on class after department activates */
  entranceDelay: number;
  /** Animation class to add to hero images (sway, bob, breathe, stick, or none) */
  heroAnimationClass: string;
  /** Trust bar stat text */
  trustBarStat: string;
}

export const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  women: {
    slug: 'women',
    label: 'Women',
    heroTitle: 'Feminine grace.',
    heroTitleItalic: 'Couture reimagined.',
    heroSubtitle:
      'Flowing silhouettes, hand-embroidered sarees, structured evening gowns, and soft silk lehengas — curated from India\'s premier ateliers and Parisian couture houses.',
    heroTag: 'LUMIÈRE WOMEN\'S ATELIER • AUTUMN/WINTER 2026',
    heroChipLabel: 'FEMME COUTURE',
    heroCardTitle: 'Ethereal Silk & Velvet',
    heroCardSubtitle: 'Handcrafted from New Delhi & Paris ateliers • Bridal & Evening',
    heroImage:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#ff4fa3',
    glowColor: 'rgba(255, 79, 163, 0.12)',
    glowGradient:
      'radial-gradient(circle at 80% 25%, rgba(255, 79, 163, 0.10) 0%, rgba(255, 79, 163, 0.03) 45%, transparent 70%)',
    entranceDelay: 80,
    heroAnimationClass: 'sway-animated',
    trustBarStat: 'Bridal & Evening Couture',
  },
  men: {
    slug: 'men',
    label: 'Men',
    heroTitle: 'Sharp tailoring.',
    heroTitleItalic: 'Built to command.',
    heroSubtitle:
      'Bespoke wool suiting, royal jacquard sherwanis, bandhgalas, raw silk kurtas, and luxury linen overshirts — precision-cut for the modern gentleman.',
    heroTag: 'LUMIÈRE MEN\'S SARTORIAL • AUTUMN/WINTER 2026',
    heroChipLabel: 'HOMME SARTORIAL',
    heroCardTitle: 'Structured Precision',
    heroCardSubtitle: 'Tailored from Savile Row & Kolkata ateliers • Suiting & Festive',
    heroImage:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#1a1420',
    glowColor: 'rgba(26, 20, 32, 0.08)',
    glowGradient:
      'radial-gradient(circle at 80% 25%, rgba(26, 20, 32, 0.08) 0%, rgba(58, 60, 224, 0.04) 45%, transparent 70%)',
    entranceDelay: 50,
    heroAnimationClass: '',
    trustBarStat: 'Sartorial & Festive Wear',
  },
  kids: {
    slug: 'kids',
    label: 'Kids',
    heroTitle: 'Little legends.',
    heroTitleItalic: 'Born to shine.',
    heroSubtitle:
      'Pure organic cotton kurta sets, festive lehengas for young girls, miniature sherwanis, fun printed tees, and celebration wear — crafted for comfort and joy.',
    heroTag: 'LUMIÈRE KIDS\' HERITAGE • CELEBRATION COLLECTION',
    heroChipLabel: 'ENFANT HERITAGE',
    heroCardTitle: 'Joyful Heritage',
    heroCardSubtitle: 'Organic cotton & festive silk • Ages 2-14',
    heroImage:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#ff4fa3',
    glowColor: 'rgba(255, 79, 163, 0.10)',
    glowGradient:
      'radial-gradient(circle at 60% 30%, rgba(255, 79, 163, 0.08) 0%, rgba(216, 242, 90, 0.06) 45%, transparent 70%)',
    entranceDelay: 60,
    heroAnimationClass: 'bob-animated',
    trustBarStat: 'Festive & Everyday Wear',
  },
  ethnic: {
    slug: 'ethnic',
    label: 'Ethnic',
    heroTitle: 'Timeless craft.',
    heroTitleItalic: 'Heritage woven in gold.',
    heroSubtitle:
      'Zardozi embroidery, Chanderi weaves, Banarasi brocades, handloom silk sarees, and royal anarkalis — preserving centuries of textile artistry.',
    heroTag: 'LUMIÈRE ETHNIC COUTURE • ARTISANAL HERITAGE',
    heroChipLabel: 'ETHNIC HERITAGE',
    heroCardTitle: 'Zardozi & Brocade',
    heroCardSubtitle: 'Traditional Indian handloom & couture embroidery',
    heroImage:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#e7c04a',
    glowColor: 'rgba(231, 192, 74, 0.10)',
    glowGradient:
      'radial-gradient(circle at 50% 40%, rgba(231, 192, 74, 0.10) 0%, rgba(231, 192, 74, 0.03) 50%, transparent 70%)',
    entranceDelay: 100,
    heroAnimationClass: 'breathe-animated',
    trustBarStat: 'Heritage & Bridal Couture',
  },
  streetwear: {
    slug: 'streetwear',
    label: 'Streetwear',
    heroTitle: 'Break the rules.',
    heroTitleItalic: 'Wear the culture.',
    heroSubtitle:
      'Oversized graphic tees, distressed denim, cargo joggers, statement sneakers, and bold layering pieces — for those who define the street.',
    heroTag: 'LUMIÈRE STREETWEAR LAB • DROP CULTURE 2026',
    heroChipLabel: 'STREET CULTURE',
    heroCardTitle: 'Raw Denim & Graphics',
    heroCardSubtitle: 'Street-ready drops • Limited edition capsules',
    heroImage:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#d8f25a',
    glowColor: 'rgba(216, 242, 90, 0.10)',
    glowGradient:
      'radial-gradient(circle at 70% 20%, rgba(216, 242, 90, 0.08) 0%, rgba(58, 60, 224, 0.06) 45%, transparent 70%)',
    entranceDelay: 30,
    heroAnimationClass: 'stick-animated',
    trustBarStat: 'Streetwear & Drop Culture',
  },
  gym: {
    slug: 'gym',
    label: 'Gym',
    heroTitle: 'Train harder.',
    heroTitleItalic: 'Perform better.',
    heroSubtitle:
      'High-performance compression tights, moisture-wicking training tees, breathable running gear, and ergonomic gym accessories — engineered for peak performance.',
    heroTag: 'LUMIÈRE ACTIVEWEAR • PERFORMANCE COLLECTION',
    heroChipLabel: 'ATHLETIC PERFORMANCE',
    heroCardTitle: 'Performance Engineered',
    heroCardSubtitle: 'Compression tech & moisture-wicking fabrics',
    heroImage:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#d8f25a',
    glowColor: 'rgba(216, 242, 90, 0.10)',
    glowGradient:
      'radial-gradient(circle at 80% 25%, rgba(216, 242, 90, 0.08) 0%, rgba(58, 60, 224, 0.04) 45%, transparent 70%)',
    entranceDelay: 50,
    heroAnimationClass: '',
    trustBarStat: 'Performance & Training Gear',
  },
};

/** Ordered list of department slugs for iteration */
export const DEPARTMENT_SLUGS = ['women', 'men', 'kids', 'ethnic', 'streetwear', 'gym'] as const;
export type DepartmentSlug = (typeof DEPARTMENT_SLUGS)[number];

/** Default (baseline) hero configuration when no department is active */
export const BASELINE_HERO = {
  heroTitle: 'Find the look.',
  heroTitleItalic: 'Buy it from the brand.',
  heroSubtitle:
    'LUMIÈRE is a clothing discovery guide. We show you what\'s worth wearing, then send you to each brand\'s own website to buy it.',
  heroTag: 'LUMIÈRE CLOTHING DISCOVERY GUIDE • 2026/27',
  heroChipLabel: 'AUTUMN / WINTER EDITORIAL',
  heroCardTitle: 'Architectural Drapery & Velvet',
  heroCardSubtitle: 'Curated from Parisian & New Delhi ateliers • 2026/27 Showcase',
  heroImage:
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200',
  glowGradient:
    'radial-gradient(circle at 80% 25%, rgba(58, 60, 224, 0.08) 0%, rgba(216, 242, 90, 0.04) 45%, transparent 70%)',
  trustBarStat: 'Verified Brand Domains',
} as const;
