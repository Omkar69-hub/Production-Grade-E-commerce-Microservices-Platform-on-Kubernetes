/**
 * LUMIÈRE Department Experience Configuration
 * ============================================
 * Prototype-matched department configuration equivalent to the
 * original lumiere-wear.html prototype's DEP configuration object.
 *
 * Each department defines its hero content, accent colors,
 * editorial metadata, and animation timing for entrance sequences.
 */

export interface DepartmentLook {
  name: string;
  sub: string;
  brand: string;
  bg: string;
  fill: string;
  shape: string;
  imageUrl: string;
}

export interface DepartmentCollection {
  title: string;
  text: string;
  shapes: string[];
  bgs: string[];
}

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
  /** Prototype DEP marquee text */
  mq: string;
  /** Prototype DEP new in heading */
  newH: string;
  /** Prototype DEP brands heading */
  brH: string;
  /** Prototype DEP audience/category tabs */
  tabs: string[];
  /** Prototype DEP curated brands list */
  brands: string[];
  /** Prototype DEP lookbook items */
  looks: DepartmentLook[];
  /** Prototype DEP curated collections */
  cols: DepartmentCollection[];
}

export const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  women: {
    slug: 'women',
    label: 'Women',
    heroTitle: 'Wear',
    heroTitleItalic: 'the day',
    heroSubtitle:
      'Dresses, tailoring and everyday basics from brands worth knowing.',
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
    mq: 'Women’s fashion from brands worth knowing',
    newH: 'New in for her',
    brH: 'Women’s brands we send you to',
    tabs: ['Dresses', 'Tailoring', 'Everyday'],
    brands: ['Reformation', 'COS', 'Zara', 'H&M', 'W', 'ONLY'],
    looks: [
      {
        name: 'Office edit',
        sub: 'Tailoring and smart basics',
        brand: 'COS',
        bg: '#3a3ce0',
        fill: '#d8f25a',
        shape: 'jacket',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Weekend dress',
        sub: 'Easy dresses',
        brand: 'Reformation',
        bg: '#ff4fa3',
        fill: '#fff1b8',
        shape: 'dress',
        imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Soft knits',
        sub: 'Layers for cooler days',
        brand: 'H&M',
        bg: '#d8f25a',
        fill: '#120f18',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Night out',
        sub: 'Satin and shine',
        brand: 'Zara',
        bg: '#7a3cff',
        fill: '#ffd84d',
        shape: 'dress',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=900',
      },
    ],
    cols: [
      {
        title: 'Occasion',
        text: 'Dresses for weddings, parties and dinners.',
        shapes: ['dress', 'dress', 'jacket'],
        bgs: ['#ff4fa3', '#cfc2ff', '#ffb199'],
      },
      {
        title: 'Work',
        text: 'Tailoring that moves with you.',
        shapes: ['jacket', 'leg', 'tee'],
        bgs: ['#3a3ce0', '#120f18', '#d8f25a'],
      },
    ],
  },
  men: {
    slug: 'men',
    label: 'Men',
    heroTitle: 'Sharp',
    heroTitleItalic: 'every day',
    heroSubtitle:
      'Shirts, denim and tailoring for work and weekends.',
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
    mq: 'Men’s fashion from brands worth knowing',
    newH: 'New in for him',
    brH: 'Men’s brands we send you to',
    tabs: ['Shirts & tees', 'Denim', 'Tailoring'],
    brands: ['Levi’s', 'Uniqlo', 'Massimo Dutti', 'Zara', 'U.S. Polo Assn.', 'Calvin Klein'],
    looks: [
      {
        name: 'Smart casual',
        sub: 'Shirts and chinos',
        brand: 'Massimo Dutti',
        bg: '#3a3ce0',
        fill: '#d8f25a',
        shape: 'jacket',
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Denim day',
        sub: 'Jeans and jackets',
        brand: 'Levi’s',
        bg: '#ff5a1f',
        fill: '#ffffff',
        shape: 'leg',
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Plain basics',
        sub: 'Tees and knits',
        brand: 'Uniqlo',
        bg: '#d8f25a',
        fill: '#120f18',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Polo club',
        sub: 'Polos and chinos',
        brand: 'U.S. Polo Assn.',
        bg: '#7a3cff',
        fill: '#ffd84d',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=900',
      },
    ],
    cols: [
      {
        title: 'Smart',
        text: 'Shirts and blazers for the office and dinners.',
        shapes: ['jacket', 'tee', 'leg'],
        bgs: ['#3a3ce0', '#d8f25a', '#120f18'],
      },
      {
        title: 'Casual',
        text: 'Denim and easy layers for weekends.',
        shapes: ['leg', 'jacket', 'tee'],
        bgs: ['#ff5a1f', '#7a3cff', '#d8f25a'],
      },
    ],
  },
  kids: {
    slug: 'kids',
    label: 'Kids',
    heroTitle: 'Play',
    heroTitleItalic: 'in colour',
    heroSubtitle:
      'Comfy outfits, party looks and school-day basics.',
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
    mq: 'Kidswear from brands parents know',
    newH: 'New in for kids',
    brH: 'Kids’ brands we send you to',
    tabs: ['Girls', 'Boys', 'Baby'],
    brands: ['Hopscotch', 'Carter’s', 'H&M', 'Adidas', 'Puma'],
    looks: [
      {
        name: 'Party time',
        sub: 'Dresses and sets',
        brand: 'Hopscotch',
        bg: '#ff4fa3',
        fill: '#fff1b8',
        shape: 'dress',
        imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'School days',
        sub: 'Everyday basics',
        brand: 'H&M',
        bg: '#d8f25a',
        fill: '#120f18',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Baby basics',
        sub: 'Bodysuits and sleepwear',
        brand: 'Carter’s',
        bg: '#7a3cff',
        fill: '#ffd84d',
        shape: 'crop',
        imageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Sport day',
        sub: 'Tees and shorts',
        brand: 'Adidas',
        bg: '#ff5a1f',
        fill: '#ffffff',
        shape: 'short',
        imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=900',
      },
    ],
    cols: [
      {
        title: 'Occasion',
        text: 'Party dresses and festive sets.',
        shapes: ['dress', 'dress', 'tee'],
        bgs: ['#ff4fa3', '#ffd84d', '#7a3cff'],
      },
      {
        title: 'Everyday',
        text: 'Comfy basics for school and play.',
        shapes: ['tee', 'short', 'hood'],
        bgs: ['#d8f25a', '#3a3ce0', '#ff5a1f'],
      },
    ],
  },
  ethnic: {
    slug: 'ethnic',
    label: 'Ethnic',
    heroTitle: 'Rooted',
    heroTitleItalic: 'in craft',
    heroSubtitle:
      'Kurtas, sarees and festive wear from Indian labels.',
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
    mq: 'Indian ethnic wear from labels with a craft story',
    newH: 'New in ethnic wear',
    brH: 'Ethnic wear labels we send you to',
    tabs: ['Kurtas', 'Sarees', 'Festive'],
    brands: ['Fabindia', 'Anita Dongre', 'Raw Mango', 'Sabyasachi', 'Biba', 'W'],
    looks: [
      {
        name: 'Everyday kurta',
        sub: 'Handloom cotton',
        brand: 'Fabindia',
        bg: '#ff5a1f',
        fill: '#ffffff',
        shape: 'kurta',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Festive',
        sub: 'Gota patti and embroidery',
        brand: 'Anita Dongre',
        bg: '#ff4fa3',
        fill: '#fff1b8',
        shape: 'dress',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Saree',
        sub: 'Handwoven textiles',
        brand: 'Raw Mango',
        bg: '#3a3ce0',
        fill: '#d8f25a',
        shape: 'dress',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Couture',
        sub: 'Wedding wear',
        brand: 'Sabyasachi',
        bg: '#7a3cff',
        fill: '#ffd84d',
        shape: 'jacket',
        imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=900',
      },
    ],
    cols: [
      {
        title: 'Everyday',
        text: 'Handloom cottons and block prints.',
        shapes: ['kurta', 'kurta', 'dress'],
        bgs: ['#ff5a1f', '#bfe3a6', '#f9e08a'],
      },
      {
        title: 'Wedding',
        text: 'Festive and bridal wear.',
        shapes: ['dress', 'jacket', 'dress'],
        bgs: ['#7a3cff', '#ff4fa3', '#3a3ce0'],
      },
    ],
  },
  streetwear: {
    slug: 'streetwear',
    label: 'Streetwear',
    heroTitle: 'Loud',
    heroTitleItalic: 'fits',
    heroSubtitle:
      'Oversized tees, cargos and hoodies.',
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
    mq: 'Streetwear and casual fits',
    newH: 'New in streetwear',
    brH: 'Streetwear brands we send you to',
    tabs: ['Tees', 'Bottoms', 'Outerwear'],
    brands: ['Bewakoof', 'The Souled Store', 'Snitch', 'Superdry', 'Levi’s', 'H&M'],
    looks: [
      {
        name: 'Oversized',
        sub: 'Tees and hoodies',
        brand: 'Bewakoof',
        bg: '#3a3ce0',
        fill: '#d8f25a',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Print drop',
        sub: 'Graphic tees',
        brand: 'The Souled Store',
        bg: '#ff5a1f',
        fill: '#ffffff',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Cargo',
        sub: 'Pants and co-ords',
        brand: 'Snitch',
        bg: '#d8f25a',
        fill: '#120f18',
        shape: 'leg',
        imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Layers',
        sub: 'Jackets and denim',
        brand: 'Superdry',
        bg: '#7a3cff',
        fill: '#ffd84d',
        shape: 'jacket',
        imageUrl: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&q=80&w=900',
      },
    ],
    cols: [
      {
        title: 'Oversized',
        text: 'Big tees and hoodies.',
        shapes: ['tee', 'hood', 'tee'],
        bgs: ['#3a3ce0', '#d8f25a', '#ff5a1f'],
      },
      {
        title: 'Denim',
        text: 'Jeans and jackets.',
        shapes: ['leg', 'jacket', 'leg'],
        bgs: ['#120f18', '#3a3ce0', '#ffb199'],
      },
    ],
  },
  gym: {
    slug: 'gym',
    label: 'Gym',
    heroTitle: 'Move',
    heroTitleItalic: 'in colour',
    heroSubtitle:
      'Studio-ready sets from gym brands worth knowing.',
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
    mq: 'Gym wear for women, men and kids',
    newH: 'New in for training',
    brH: 'Gym brands we send you to',
    tabs: ['Women', 'Men', 'Kids'],
    brands: ['Nike', 'Adidas', 'Puma', 'HRX', 'NIVIA', 'Coitonic', 'Technosport'],
    looks: [
      {
        name: 'Studio flow',
        sub: 'Women · yoga and pilates',
        brand: 'HRX',
        bg: '#ff4fa3',
        fill: '#fff1b8',
        shape: 'crop',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Heavy day',
        sub: 'Men · lifting',
        brand: 'Nike',
        bg: '#3a3ce0',
        fill: '#d8f25a',
        shape: 'tee',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Run club',
        sub: 'Women · road and track',
        brand: 'Puma',
        bg: '#d8f25a',
        fill: '#120f18',
        shape: 'leg',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Gym to street',
        sub: 'Men · hoodies and joggers',
        brand: 'Adidas',
        bg: '#ff5a1f',
        fill: '#ffffff',
        shape: 'hood',
        imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=900',
      },
      {
        name: 'Mini athletes',
        sub: 'Kids · sport days',
        brand: 'Adidas',
        bg: '#7a3cff',
        fill: '#ffd84d',
        shape: 'short',
        imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=900',
      },
    ],
    cols: [
      {
        title: 'Studio',
        text: 'Yoga, pilates and low-impact sessions in soft, stretchy sets.',
        shapes: ['crop', 'leg', 'tee'],
        bgs: ['#ff4fa3', '#cfc2ff', '#ffb199'],
      },
      {
        title: 'Heavy lifting',
        text: 'Compression fits and breathable tees for serious sessions.',
        shapes: ['tee', 'short', 'hood'],
        bgs: ['#3a3ce0', '#120f18', '#d8f25a'],
      },
      {
        title: 'Road and track',
        text: 'Light layers and shorts for running and team sport.',
        shapes: ['short', 'tee', 'leg'],
        bgs: ['#d8f25a', '#ff5a1f', '#7a3cff'],
      },
    ],
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
