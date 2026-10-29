/**
 * LUMIÈRE Official Brand Logo Registry
 * Stage 15C.2: Verified Official Brand Logos & Clean Typography Fallbacks
 *
 * Requirements:
 * - Prefer official brand-provided logo assets, permitted brand media assets,
 *   or appropriately licensed open vector resources (SimpleIcons / SVG vectors).
 * - For brands where verified vector assets cannot be obtained without scraping
 *   (e.g., bespoke Indian couture ateliers), provide clean text-based brand-name fallbacks.
 * - Preserve each logo's aspect ratio and prevent distortion (object-fit: contain).
 */

export interface BrandLogoConfig {
  slug: string;
  name: string;
  /** Direct SVG markup or URL */
  svgData?: string;
  cdnUrl?: string;
  hasOfficialAsset: boolean;
  notes?: string;
}

export const BRAND_LOGOS: Record<string, BrandLogoConfig> = {
  // ==========================================
  // ATHLETICWEAR & ACTIVE LIFESTYLE
  // ==========================================
  'nike': {
    slug: 'nike',
    name: 'Nike',
    cdnUrl: 'https://cdn.simpleicons.org/nike/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Nike Swoosh vector via SimpleIcons CDN'
  },
  'adidas': {
    slug: 'adidas',
    name: 'Adidas',
    cdnUrl: 'https://cdn.simpleicons.org/adidas/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Adidas 3-Bars vector via SimpleIcons CDN'
  },
  'puma': {
    slug: 'puma',
    name: 'Puma',
    cdnUrl: 'https://cdn.simpleicons.org/puma/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Puma leaping cat vector via SimpleIcons CDN'
  },
  'decathlon': {
    slug: 'decathlon',
    name: 'Decathlon',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Decathlon_Logo.svg',
    hasOfficialAsset: true,
    notes: 'Official Decathlon vector via Wikimedia Commons'
  },
  'hrx': {
    slug: 'hrx',
    name: 'HRX',
    hasOfficialAsset: false,
    notes: 'Official vector not publicly licensed; using clean haute-couture typography fallback'
  },
  'coitonic': {
    slug: 'coitonic',
    name: 'Coitonic',
    hasOfficialAsset: false,
    notes: 'Official vector not publicly licensed; using clean typography fallback'
  },

  // ==========================================
  // GLOBAL LUXURY MAISONS
  // ==========================================
  'chanel': {
    slug: 'chanel',
    name: 'Chanel',
    cdnUrl: 'https://cdn.simpleicons.org/chanel/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Chanel CC vector'
  },
  'dior': {
    slug: 'dior',
    name: 'Dior',
    cdnUrl: 'https://cdn.simpleicons.org/dior/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Dior vector via SimpleIcons CDN'
  },
  'gucci': {
    slug: 'gucci',
    name: 'Gucci',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/1970s_Gucci_logo.svg',
    hasOfficialAsset: true,
    notes: 'Official Gucci interlocking Gs vector'
  },
  'prada': {
    slug: 'prada',
    name: 'Prada',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Prada-Logo.svg',
    hasOfficialAsset: true,
    notes: 'Official Prada Milano vector'
  },
  'louis-vuitton': {
    slug: 'louis-vuitton',
    name: 'Louis Vuitton',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Louis_Vuitton_logo_and_wordmark.svg',
    hasOfficialAsset: true,
    notes: 'Official Louis Vuitton monogram vector'
  },
  'burberry': {
    slug: 'burberry',
    name: 'Burberry',
    cdnUrl: 'https://cdn.simpleicons.org/burberry/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Burberry vector'
  },
  'balenciaga': {
    slug: 'balenciaga',
    name: 'Balenciaga',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Balenciaga_Logo.svg',
    hasOfficialAsset: true,
    notes: 'Official Balenciaga vector'
  },
  'saint-laurent': {
    slug: 'saint-laurent',
    name: 'Saint Laurent',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Saint_Laurent_logo.svg',
    hasOfficialAsset: true,
    notes: 'Official Saint Laurent Paris vector'
  },
  'ralph-lauren': {
    slug: 'ralph-lauren',
    name: 'Ralph Lauren',
    cdnUrl: 'https://cdn.simpleicons.org/ralphlauren/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Ralph Lauren vector'
  },
  'tommy-hilfiger': {
    slug: 'tommy-hilfiger',
    name: 'Tommy Hilfiger',
    cdnUrl: 'https://cdn.simpleicons.org/tommyhilfiger/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Tommy Hilfiger vector'
  },
  'calvin-klein': {
    slug: 'calvin-klein',
    name: 'Calvin Klein',
    cdnUrl: 'https://cdn.simpleicons.org/calvinklein/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Calvin Klein vector'
  },
  'versace': {
    slug: 'versace',
    name: 'Versace',
    cdnUrl: 'https://cdn.simpleicons.org/versace/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Versace vector'
  },
  'giorgio-armani': {
    slug: 'giorgio-armani',
    name: 'Giorgio Armani',
    cdnUrl: 'https://cdn.simpleicons.org/giorgioarmani/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Giorgio Armani vector'
  },
  'zara': {
    slug: 'zara',
    name: 'Zara',
    cdnUrl: 'https://cdn.simpleicons.org/zara/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Zara vector via SimpleIcons CDN'
  },
  'h-m': {
    slug: 'h-m',
    name: 'H&M',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
    hasOfficialAsset: true,
    notes: 'Official H&M vector via Wikimedia Commons'
  },
  'uniqlo': {
    slug: 'uniqlo',
    name: 'Uniqlo',
    cdnUrl: 'https://cdn.simpleicons.org/uniqlo/1a1420',
    hasOfficialAsset: true,
    notes: 'Official Uniqlo vector via SimpleIcons CDN'
  },
  'levis': {
    slug: 'levis',
    name: 'Levi’s',
    cdnUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Levi%27s_logo.svg',
    hasOfficialAsset: true,
    notes: 'Official Levi’s batwing vector'
  },

  // ==========================================
  // CONTEMPORARY INDIAN STREETWEAR & KIDS
  // ==========================================
  'the-souled-store': {
    slug: 'the-souled-store',
    name: 'The Souled Store',
    hasOfficialAsset: false,
    notes: 'Indian brand; using clean typography fallback'
  },
  'bewakoof': {
    slug: 'bewakoof',
    name: 'Bewakoof',
    hasOfficialAsset: false,
    notes: 'Indian brand; using clean typography fallback'
  },
  'snitch': {
    slug: 'snitch',
    name: 'Snitch',
    hasOfficialAsset: false,
    notes: 'Indian brand; using clean typography fallback'
  },
  'hopscotch': {
    slug: 'hopscotch',
    name: 'Hopscotch',
    hasOfficialAsset: false,
    notes: 'Children’s brand; using clean typography fallback'
  },
  'firstcry': {
    slug: 'firstcry',
    name: 'FirstCry',
    hasOfficialAsset: false,
    notes: 'Children’s brand; using clean typography fallback'
  },
  'carters': {
    slug: 'carters',
    name: 'Carter’s',
    hasOfficialAsset: false,
    notes: 'Children’s brand; using clean typography fallback'
  },

  // ==========================================
  // INDIAN COUTURE & HERITAGE MAISONS (28)
  // All strictly using verified haute-couture typography
  // per instructions: "If a verified logo asset cannot be obtained,
  // use a clean text-based brand-name fallback and report the missing logo."
  // ==========================================
  'sabyasachi': { slug: 'sabyasachi', name: 'Sabyasachi', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'anita-dongre': { slug: 'anita-dongre', name: 'Anita Dongre', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'manish-malhotra': { slug: 'manish-malhotra', name: 'Manish Malhotra', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'tarun-tahiliani': { slug: 'tarun-tahiliani', name: 'Tarun Tahiliani', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'raw-mango': { slug: 'raw-mango', name: 'Raw Mango', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'ritu-kumar': { slug: 'ritu-kumar', name: 'Ritu Kumar', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'rahul-mishra': { slug: 'rahul-mishra', name: 'Rahul Mishra', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'gaurav-gupta': { slug: 'gaurav-gupta', name: 'Gaurav Gupta', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'abraham-thakore': { slug: 'abraham-thakore', name: 'Abraham & Thakore', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'fabindia': { slug: 'fabindia', name: 'Fabindia', hasOfficialAsset: false, notes: 'Artisanal brand; clean typography fallback' },
  'manyavar': { slug: 'manyavar', name: 'Manyavar', hasOfficialAsset: false, notes: 'Festive brand; clean typography fallback' },
  'raymond': { slug: 'raymond', name: 'Raymond', hasOfficialAsset: false, notes: 'Sartorial brand; clean typography fallback' },
  'torani': { slug: 'torani', name: 'Torani', hasOfficialAsset: false, notes: 'Artisanal brand; clean typography fallback' },
  'payal-singhal': { slug: 'payal-singhal', name: 'Payal Singhal', hasOfficialAsset: false, notes: 'Contemporary pret; clean typography fallback' },
  'anamika-khanna': { slug: 'anamika-khanna', name: 'Anamika Khanna', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'shantnu-nikhil': { slug: 'shantnu-nikhil', name: 'Shantnu & Nikhil', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'house-of-masaba': { slug: 'house-of-masaba', name: 'House of Masaba', hasOfficialAsset: false, notes: 'Contemporary pret; clean typography fallback' },
  'nicobar': { slug: 'nicobar', name: 'Nicobar', hasOfficialAsset: false, notes: 'Modern luxury; clean typography fallback' },
  'good-earth': { slug: 'good-earth', name: 'Good Earth', hasOfficialAsset: false, notes: 'Artisanal brand; clean typography fallback' },
  'rimzim-dadu': { slug: 'rimzim-dadu', name: 'Rimzim Dadu', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'rare-rabbit': { slug: 'rare-rabbit', name: 'Rare Rabbit', hasOfficialAsset: false, notes: 'Modern luxury; clean typography fallback' },
  'jaypore': { slug: 'jaypore', name: 'Jaypore', hasOfficialAsset: false, notes: 'Artisanal brand; clean typography fallback' },
  'and-india': { slug: 'and-india', name: 'AND India', hasOfficialAsset: false, notes: 'Contemporary pret; clean typography fallback' },
  'biba': { slug: 'biba', name: 'Biba', hasOfficialAsset: false, notes: 'Heritage festive; clean typography fallback' },
  'w-for-woman': { slug: 'w-for-woman', name: 'W for Woman', hasOfficialAsset: false, notes: 'Contemporary pret; clean typography fallback' },
  'peter-england': { slug: 'peter-england', name: 'Peter England', hasOfficialAsset: false, notes: 'Sartorial brand; clean typography fallback' },
  'rohit-bal': { slug: 'rohit-bal', name: 'Rohit Bal', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
  'kallol-datta-1955': { slug: 'kallol-datta-1955', name: 'Kallol Datta 1955', hasOfficialAsset: false, notes: 'Haute couture atelier; clean typography fallback' },
};

/**
 * Retrieve verified logo configuration for a brand slug
 */
export const getBrandLogoConfig = (slug: string): BrandLogoConfig | undefined => {
  const normalized = slug.toLowerCase().trim();
  return BRAND_LOGOS[normalized];
};
