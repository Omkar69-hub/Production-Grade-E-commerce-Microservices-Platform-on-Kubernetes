import type { Product } from '../types/product';
import { LIFESTYLE_CATALOG } from './lifestyleCatalogData';

export type ProductDestinationType = 'EXACT_PRODUCT_PAGE' | 'OFFICIAL_CATEGORY_DESTINATION';
export type PriceVerificationStatus = 'VERIFIED_ATELIER_PRICE' | 'PRICE_UPON_INQUIRY' | 'ILLUSTRATIVE_ESTIMATE';
export type ProductAudience = 'Women' | 'Men' | 'Kids' | 'Unisex';

export interface VerifiedClothingProduct {
  id: string;
  uuid: string; // Canonical backend UUID bridge (Stage 6I-B3 sequence)
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  audience: ProductAudience;
  category: 'Clothing' | 'Footwear' | 'Accessories';
  subcategory: string;
  destinationUrl: string;
  destinationType: ProductDestinationType;
  imageUrl: string;
  imageAttribution: string;
  priceINR: number; // Sentinel 0 paired with PRICE_UPON_INQUIRY
  priceFormatted: string;
  priceVerificationStatus: PriceVerificationStatus;
  priceSource: string;
  description: string;
  fabric?: string;
  fit?: string;
  availableSizes?: string[];
  colors?: string[];
  isEditorialConcept: boolean;
  editorialDisclaimer?: string;
  isReferral: boolean;
  fulfillmentType: 'REFERRAL_LINK';
}

export const CANONICAL_CATALOG_UUIDS: Record<string, string> = {
  'prod-ind-01': '123e4567-e89b-12d3-a456-426614174011',
  'prod-ind-02': '123e4567-e89b-12d3-a456-426614174012',
  'prod-ind-03': '123e4567-e89b-12d3-a456-426614174013',
  'prod-ind-04': '123e4567-e89b-12d3-a456-426614174014',
  'prod-ind-05': '123e4567-e89b-12d3-a456-426614174015',
  'prod-ind-11': '123e4567-e89b-12d3-a456-426614174016',
  'prod-ind-12': '123e4567-e89b-12d3-a456-426614174017',
  'prod-ind-16': '123e4567-e89b-12d3-a456-426614174018',
  'prod-ind-13': '123e4567-e89b-12d3-a456-426614174019',
  'prod-ind-24': '123e4567-e89b-12d3-a456-426614174021',
  'prod-int-02': '123e4567-e89b-12d3-a456-426614174022',
  'prod-int-09': '123e4567-e89b-12d3-a456-426614174023',
  'prod-int-10': '123e4567-e89b-12d3-a456-426614174024',
  'prod-int-01': '123e4567-e89b-12d3-a456-426614174025',
};

export const CLOTHING_CATALOG: VerifiedClothingProduct[] = [
  {
    id: 'prod-ind-01',
    uuid: '123e4567-e89b-12d3-a456-426614174011',
    slug: 'sabyasachi-heritage-bridal-lehenga',
    name: 'Royal Heritage Zardozi Velvet Lehenga',
    brandId: 'ind-01',
    brandName: 'Sabyasachi',
    brandSlug: 'sabyasachi',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Bridal Lehengas',
    destinationUrl: 'https://www.sabyasachi.com/collection/heritage-bridal/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Representative Haute Bridal Silhouettes',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Sabyasachi Flagship Salon Consultation Protocol',
    description: 'Curated editorial bridal silhouette celebrating heritage craftsmanship, antique zardozi embroidery aesthetics, and bespoke salon draping.',
    fabric: 'Pure Silk Velvet, Organza & Handwoven Tissue (Representative concept)',
    fit: 'Custom Atelier Tailoring (Bespoke inquiry)',
    availableSizes: ['Custom Fit'],
    colors: ['Crimson Red', 'Antique Gold', 'Deep Emerald'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-02',
    uuid: '123e4567-e89b-12d3-a456-426614174012',
    slug: 'anita-dongre-pichhwai-silk-saree',
    name: 'Pichhwai Hand-Painted Silk Saree',
    brandId: 'ind-02',
    brandName: 'Anita Dongre',
    brandSlug: 'anita-dongre',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Sarees',
    destinationUrl: 'https://www.anitadongre.com/women/clothing/sarees/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Handcrafted Traditional Silk Textiles',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial celebration of Pichhwai artistic heritage, showcasing hand-painted Rajasthani motifs and fine gota patti craftsmanship.',
    fabric: 'Pure Bemberg Silk with Gota Patti Detailing (Representative concept)',
    fit: 'Classic Saree Drape with Unstitched Blouse Piece (Representative)',
    availableSizes: ['Free Size'],
    colors: ['Ivory Blanc', 'Sage Green', 'Rose Quartz'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-03',
    uuid: '123e4567-e89b-12d3-a456-426614174013',
    slug: 'manish-malhotra-sequined-ombre-saree',
    name: 'Kashmiri Tilla & Sequined Ombré Saree',
    brandId: 'ind-03',
    brandName: 'Manish Malhotra',
    brandSlug: 'manish-malhotra',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Sarees',
    destinationUrl: 'https://www.manishmalhotra.in/women/sarees/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — High Glamour Evening Haute Silhouettes',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Curated evening glamour silhouette in ombré tones, evoking Manish Malhotra signature red-carpet aesthetics with Kashmiri tilla threadwork inspiration.',
    fabric: 'Pure Georgette with Metallic Micro-Sequins (Representative concept)',
    fit: 'Fluid Evening Drape (Custom inquiry)',
    availableSizes: ['Custom Fit'],
    colors: ['Silver Lilac Ombré', 'Midnight Noir', 'Champagne Gold'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-04',
    uuid: '123e4567-e89b-12d3-a456-426614174014',
    slug: 'tarun-tahiliani-chikankari-concept-saree',
    name: 'Sculpted Chikankari Draped Concept Saree',
    brandId: 'ind-04',
    brandName: 'Tarun Tahiliani',
    brandSlug: 'tarun-tahiliani',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Couture Pret',
    destinationUrl: 'https://www.taruntahiliani.com/women/concept-sarees/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Sculptural Couture Drapes',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial pre-draped concept silhouette reflecting Tarun Tahiliani architectural corsetry and Lucknowi hand chikankari inspiration.',
    fabric: 'Italian Crepe, Sheer Tulle & Lace Accents (Representative concept)',
    fit: 'Structured Pre-Draped Silhouette (Representative)',
    availableSizes: ['XS', 'S', 'M', 'L'],
    colors: ['Dusty Rose', 'Platinum Gray', 'Classic Noir'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-05',
    uuid: '123e4567-e89b-12d3-a456-426614174015',
    slug: 'raw-mango-chanderi-brocade-kurta',
    name: 'Handloom Chanderi Brocade Kurta & Dupatta',
    brandId: 'ind-05',
    brandName: 'Raw Mango',
    brandSlug: 'raw-mango',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Heritage Festive',
    destinationUrl: 'https://www.rawmango.com/collections/kurtas/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Artisanal Handloom Textiles',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial study of handloom minimalism, featuring Chanderi silk and zari brocade textiles in signature Raw Mango festive aesthetics.',
    fabric: 'Handloom Chanderi Silk & Zari Brocade (Representative concept)',
    fit: 'Relaxed Tailored Silhouette (Representative)',
    availableSizes: ['S', 'M', 'L', 'XL'],
    colors: ['Rani Pink', 'Turquoise', 'Antique Mustard'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-11',
    uuid: '123e4567-e89b-12d3-a456-426614174016',
    slug: 'manyavar-jacquard-sherwani-set',
    name: 'Royal Jacquard Sherwani with Zari Detailing',
    brandId: 'ind-11',
    brandName: 'Manyavar',
    brandSlug: 'manyavar',
    audience: 'Men',
    category: 'Clothing',
    subcategory: 'Sherwanis & Bandhgalas',
    destinationUrl: 'https://www.manyavar.com/men/sherwani/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Classic Tailored Ceremonial Menswear',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial ceremonial menswear concept featuring brocade jacquard motifs, mandarin collar styling, and ceremonial churidar pairing.',
    fabric: 'Poly-Silk Jacquard Weave (Representative concept)',
    fit: 'Regular Tailored Fit (Representative)',
    availableSizes: ['38', '40', '42', '44'],
    colors: ['Off-White & Gold', 'Regal Navy', 'Wine Red'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-12',
    uuid: '123e4567-e89b-12d3-a456-426614174017',
    slug: 'raymond-super-250s-merino-tuxedo',
    name: 'Bespoke Super 250s Fine Merino Wool Tuxedo',
    brandId: 'ind-12',
    brandName: 'Raymond',
    brandSlug: 'raymond',
    audience: 'Men',
    category: 'Clothing',
    subcategory: 'Sartorial Suiting',
    destinationUrl: 'https://www.myraymond.com/men/suits-blazers/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Master Sartorial Wool Suiting',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial eveningwear tailoring archetype featuring fine merino wool suiting, satin peak lapels, and Italian sartorial cut inspiration.',
    fabric: 'Fine Merino Wool Blend & Satin Facing (Representative concept)',
    fit: 'Slim Sartorial Cut (Representative)',
    availableSizes: ['38R', '40R', '42R', '44R'],
    colors: ['Midnight Blue', 'Deep Charcoal', 'Formal Noir'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-16',
    uuid: '123e4567-e89b-12d3-a456-426614174018',
    slug: 'shantnu-nikhil-asymmetrical-bandhgala',
    name: 'Regalia Asymmetrical Draped Bandhgala',
    brandId: 'ind-16',
    brandName: 'Shantnu & Nikhil',
    brandSlug: 'shantnu-and-nikhil',
    audience: 'Men',
    category: 'Clothing',
    subcategory: 'Sherwanis & Bandhgalas',
    destinationUrl: 'https://www.shantanunikhil.com/men/bandhgala/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Dramatic Modern Ceremonial Silhouettes',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial modern ceremonial silhouette reflecting Shantnu & Nikhil neo-military drape aesthetics, asymmetric flap styling, and emblem detailing.',
    fabric: 'Silk Matka Blend with Metallic Embellishments (Representative concept)',
    fit: 'Structured Military Silhouette (Representative)',
    availableSizes: ['38', '40', '42'],
    colors: ['Matte Black', 'Olive Drab', 'Imperial Cream'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-13',
    uuid: '123e4567-e89b-12d3-a456-426614174019',
    slug: 'torani-kids-chanderi-kurta-set',
    name: 'Kids\' Chanderi Hand-Embroidered Kurta & Dhoti Ensemble',
    brandId: 'ind-13',
    brandName: 'Torani',
    brandSlug: 'torani',
    audience: 'Kids',
    category: 'Clothing',
    subcategory: 'Heritage Festive',
    destinationUrl: 'https://www.torani.in/collections/kids/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Artisanal Handcrafted Heritage Garments',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial children\'s festive attire reflecting nostalgic Chanderi craftsmanship, delicate dori embroidery motifs, and scalloped hem artistry.',
    fabric: 'Chanderi Cotton-Silk Blend & Cotton Voile Lining (Representative concept)',
    fit: 'Comfortable Festive Silhouette (Representative)',
    availableSizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['Gulabi Rose', 'Haldi Yellow', 'Champa White'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-ind-24',
    uuid: '123e4567-e89b-12d3-a456-426614174021',
    slug: 'biba-girls-festive-anarkali-suit',
    name: 'Kids\' Festive Flared Anarkali & Dupatta Set',
    brandId: 'ind-24',
    brandName: 'Biba',
    brandSlug: 'biba',
    audience: 'Kids',
    category: 'Clothing',
    subcategory: 'Heritage Festive',
    destinationUrl: 'https://www.biba.in/girls/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Festive Celebratory Children\'s Attire',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial celebratory attire for young girls featuring festive flared Anarkali silhouette, foil print motifs, and coordinating dupatta ensemble.',
    fabric: 'Cotton Voile with Gota Detailing (Representative concept)',
    fit: 'Flared Anarkali Silhouette (Representative)',
    availableSizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: ['Marigold Orange', 'Crimson Red', 'Teal Green'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-int-02',
    uuid: '123e4567-e89b-12d3-a456-426614174022',
    slug: 'saint-laurent-le-smoking-jacket',
    name: 'Le Smoking Grain de Poudre Wool Tuxedo Jacket',
    brandId: 'int-02',
    brandName: 'Saint Laurent',
    brandSlug: 'saint-laurent',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Tailoring & Suiting',
    destinationUrl: 'https://www.ysl.com/en-in/ready-to-wear/jackets-and-pants/jackets',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Parisian Tailored Haute Silhouettes',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial salute to the iconic Parisian Le Smoking silhouette, showcasing sharp padded shoulders, virgin wool tailoring, and silk satin peak lapels.',
    fabric: 'Grain de Poudre Virgin Wool with Silk Facing (Representative concept)',
    fit: 'Structured Parisian Cut (Representative)',
    availableSizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40'],
    colors: ['Noir'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-int-09',
    uuid: '123e4567-e89b-12d3-a456-426614174023',
    slug: 'the-row-balham-cashmere-coat',
    name: 'Balham Double-Faced Cashmere Belted Overcoat',
    brandId: 'int-13', // Corrected in Stage 6I-A from int-09 -> int-13
    brandName: 'The Row',
    brandSlug: 'the-row',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Outerwear',
    destinationUrl: 'https://www.therow.com/collections/women-coats',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Minimalist Pure Luxury Outerwear',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial study in minimalist luxury outerwear, showcasing double-faced cashmere draping, dropped shoulders, and relaxed sash tie styling.',
    fabric: 'Double-Faced Cashmere Blend (Representative concept)',
    fit: 'Relaxed Wrap Silhouette (Representative)',
    availableSizes: ['US 2', 'US 4', 'US 6', 'US 8'],
    colors: ['Oatmeal Melange', 'Deep Black', 'Camel'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-int-10',
    uuid: '123e4567-e89b-12d3-a456-426614174024',
    slug: 'brunello-cucinelli-solomeo-cashmere-suit',
    name: 'Solomeo Sartorial Cashmere Tailored Suit',
    brandId: 'int-07', // Corrected in Stage 6I-A from int-10 -> int-07
    brandName: 'Brunello Cucinelli',
    brandSlug: 'brunello-cucinelli',
    audience: 'Men',
    category: 'Clothing',
    subcategory: 'Sartorial Suiting',
    destinationUrl: 'https://shop.brunellocucinelli.com/en-in/men/ready-to-wear/suits/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Italian Bespoke Tailoring',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
    description: 'Editorial appreciation of Solomeo tailoring heritage, featuring deconstructed shoulder architecture and luxurious cashmere-silk fabrications.',
    fabric: 'Cashmere & Silk Blend (Representative concept)',
    fit: 'Italian Deconstructed Tailored Fit (Representative)',
    availableSizes: ['IT 48', 'IT 50', 'IT 52', 'IT 54'],
    colors: ['Medium Gray Melange', 'Navy', 'Tobacco Brown'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  },
  {
    id: 'prod-int-01',
    uuid: '123e4567-e89b-12d3-a456-426614174025',
    slug: 'chanel-lesage-tweed-jacket',
    name: 'Lesage Hand-Embroidered Tweed Jacket',
    brandId: 'int-01',
    brandName: 'Chanel',
    brandSlug: 'chanel',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Haute Couture',
    destinationUrl: 'https://www.chanel.com/fr/mode/pret-a-porter/vestes/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Iconic Parisian Haute Couture',
    priceINR: 0,
    priceFormatted: 'Price upon atelier inquiry',
    priceVerificationStatus: 'PRICE_UPON_INQUIRY',
    priceSource: 'Chanel Salons Privés & Flagship Boutiques Consultation Protocol',
    description: 'Editorial tribute to Parisian haute couture tweed craftsmanship, celebrating Lesage embroidery traditions and timeless collarless silhouettes.',
    fabric: 'Tweed Weave with Silk Lining Accents (Representative concept)',
    fit: 'Boxy Parisian Silhouette (Bespoke inquiry)',
    availableSizes: ['FR 36', 'FR 38', 'FR 40'],
    colors: ['Ecru & Black Tweed', 'Navy Tweed', 'Pastel Pink'],
    isEditorialConcept: true,
    isReferral: true,
    fulfillmentType: 'REFERRAL_LINK'
  }
];

/**
 * Combined complete catalog including canonical couture and verified lifestyle apparel
 */
export const ALL_CLOTHING_CATALOG: VerifiedClothingProduct[] = [
  ...CLOTHING_CATALOG,
  ...LIFESTYLE_CATALOG,
];

export const getProductsByBrand = (brandIdOrSlug: string): VerifiedClothingProduct[] => {
  const query = brandIdOrSlug.toLowerCase().trim();
  return ALL_CLOTHING_CATALOG.filter(
    p => p.brandId.toLowerCase() === query || p.brandSlug.toLowerCase() === query || p.brandName.toLowerCase() === query
  );
};

export const getProductBySlug = (identifier: string): VerifiedClothingProduct | undefined => {
  if (!identifier) return undefined;
  const query = identifier.toLowerCase().trim();
  return ALL_CLOTHING_CATALOG.find(
    p => p.slug.toLowerCase() === query || 
         p.id.toLowerCase() === query || 
         (p.uuid && p.uuid.toLowerCase() === query)
  );
};

export const getProductByIdOrSlug = getProductBySlug;

export const getAllClothingProducts = (): Product[] => ALL_CLOTHING_CATALOG.map(toCatalogProduct);

export const toCatalogProduct = (item: VerifiedClothingProduct): Product => ({
  id: item.id,
  sku: item.slug.toUpperCase(),
  name: item.name,
  description: item.description,
  price: item.priceINR,
  currency: 'INR',
  brand: item.brandName,
  categoryId: item.category.toLowerCase(),
  categoryName: item.subcategory,
  status: 'ACTIVE',
  imageUrl: item.imageUrl,
  attributes: JSON.stringify({
    uuid: item.uuid,
    frontendId: item.id,
    isEditorialConcept: item.isEditorialConcept,
    isReferral: item.isReferral,
    fulfillmentType: item.fulfillmentType,
    audience: item.audience,
    subcategory: item.subcategory,
    fabric: item.fabric,
    fit: item.fit,
    sizes: item.availableSizes?.join(', '),
    colors: item.colors?.join(', '),
    priceVerificationStatus: item.priceVerificationStatus,
    priceFormatted: item.priceFormatted,
    priceSource: item.priceSource,
    destinationUrl: item.destinationUrl,
    destinationType: item.destinationType,
    brandId: item.brandId,
    brandSlug: item.brandSlug
  })
});
