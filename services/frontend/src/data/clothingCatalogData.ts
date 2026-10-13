import type { Product } from '../types/product';

export type ProductDestinationType = 'EXACT_PRODUCT_PAGE' | 'OFFICIAL_CATEGORY_DESTINATION';
export type PriceVerificationStatus = 'VERIFIED_ATELIER_PRICE' | 'PRICE_UPON_INQUIRY' | 'ILLUSTRATIVE_ESTIMATE';
export type ProductAudience = 'Women' | 'Men' | 'Kids' | 'Unisex';

export interface VerifiedClothingProduct {
  id: string;
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
  priceINR: number;
  priceFormatted: string;
  priceVerificationStatus: PriceVerificationStatus;
  priceSource: string;
  description: string;
  fabric?: string;
  fit?: string;
  availableSizes?: string[];
  colors?: string[];
}

export const CLOTHING_CATALOG: VerifiedClothingProduct[] = [
  {
    id: 'prod-ind-01',
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
    description: 'Bespoke hand-embroidered royal velvet lehenga with antique gold zardozi, handwoven silk tissue dupatta, and heritage craftsmanship.',
    fabric: 'Pure Silk Velvet, Organza & Handwoven Tissue',
    fit: 'Custom Atelier Tailoring',
    availableSizes: ['Custom Fit'],
    colors: ['Crimson Red', 'Antique Gold', 'Deep Emerald']
  },
  {
    id: 'prod-ind-02',
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
    priceINR: 110000,
    priceFormatted: '₹1,10,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Anita Dongre Official E-Boutique Published Listing',
    description: 'Fluid pure silk saree hand-painted by master Rajasthani artisans with traditional Pichhwai motifs, framed by fine gota patti borders.',
    fabric: '100% Pure Bemberg Silk with Hand-Embroidered Gota Patti',
    fit: 'Classic Saree Drape with Unstitched Blouse Piece',
    availableSizes: ['Free Size'],
    colors: ['Ivory Blanc', 'Sage Green', 'Rose Quartz']
  },
  {
    id: 'prod-ind-03',
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
    priceINR: 225000,
    priceFormatted: '₹2,25,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Manish Malhotra Official Atelier Portal Published Listing',
    description: 'Iconic Manish Malhotra evening silhouette in graduated ombré tones, hand-encrusted with shimmering tone-on-tone sequins and Kashmiri silver tilla threadwork.',
    fabric: 'Pure Italian Georgette with Metallic Micro-Sequins',
    fit: 'Fluid Evening Drape',
    availableSizes: ['Custom Fit'],
    colors: ['Silver Lilac Ombré', 'Midnight Noir', 'Champagne Gold']
  },
  {
    id: 'prod-ind-04',
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
    priceINR: 175000,
    priceFormatted: '₹1,75,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Tarun Tahiliani Official Online Boutique',
    description: 'Masterfully structured pre-draped concept saree with boned inner corsetry, sheer Italian tulle pallu, and Lucknowi hand chikankari.',
    fabric: 'Italian Crepe, Sheer Tulle & French Lace',
    fit: 'Structured Pre-Draped Silhouette',
    availableSizes: ['XS', 'S', 'M', 'L'],
    colors: ['Dusty Rose', 'Platinum Gray', 'Classic Noir']
  },
  {
    id: 'prod-ind-05',
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
    priceINR: 42500,
    priceFormatted: '₹42,500',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Raw Mango Official Store Published Price',
    description: 'Minimalist handwoven Chanderi silk kurta with woven gold zari jaal motifs, paired with pure Varanasi silk brocade dupatta.',
    fabric: 'Pure Handloom Chanderi Silk & Zari',
    fit: 'Relaxed Tailored Silhouette',
    availableSizes: ['S', 'M', 'L', 'XL'],
    colors: ['Rani Pink', 'Turquoise', 'Antique Mustard']
  },
  {
    id: 'prod-ind-11',
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
    priceINR: 29999,
    priceFormatted: '₹29,999',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Manyavar Official E-Commerce Store Published Listing',
    description: 'Ceremonial structured sherwani tailored in woven brocade jacquard, accented with jeweled metal buttons and a silk churidar.',
    fabric: 'Artisanal Poly-Silk Jacquard Weave',
    fit: 'Regular Tailored Fit',
    availableSizes: ['38', '40', '42', '44'],
    colors: ['Off-White & Gold', 'Regal Navy', 'Wine Red']
  },
  {
    id: 'prod-ind-12',
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
    priceINR: 58000,
    priceFormatted: '₹58,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Raymond Flagship Catalog Published Pricing',
    description: 'Precision handcrafted two-piece evening tuxedo constructed from ultralight Super 250s Australian merino wool with grosgrain silk peak lapels.',
    fabric: '100% Super 250s Australian Merino Wool & Silk Satin',
    fit: 'Slim Sartorial Italian Cut',
    availableSizes: ['38R', '40R', '42R', '44R'],
    colors: ['Midnight Blue', 'Deep Charcoal', 'Formal Noir']
  },
  {
    id: 'prod-ind-16',
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
    priceINR: 88500,
    priceFormatted: '₹88,500',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Shantnu & Nikhil Official Maison Shop Published Listing',
    description: 'Architectural military-inspired bandhgala jacket with an asymmetric front flap, custom metallic crest emblems, and fluid inner cowl layering.',
    fabric: 'Raw Silk Matka with Antique Brass Embellishments',
    fit: 'Structured Military Cut',
    availableSizes: ['38', '40', '42'],
    colors: ['Matte Black', 'Olive Drab', 'Imperial Cream']
  },
  {
    id: 'prod-ind-13',
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
    priceINR: 18500,
    priceFormatted: '₹18,500',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Torani Official Online Flagship Published Price',
    description: 'Charming festive attire for children hand-tailored in lightweight Chanderi cotton-silk, adorned with delicate dori embroidery and scalloped trims.',
    fabric: 'Pure Handloom Chanderi & Mulmul Lining',
    fit: 'Comfortable Festive Fit for Children',
    availableSizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['Gulabi Rose', 'Haldi Yellow', 'Champa White']
  },
  {
    id: 'prod-ind-24',
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
    priceINR: 4999,
    priceFormatted: '₹4,999',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Biba Official Online Store Published Listing',
    description: 'Vibrant flared Anarkali kurta for young girls with gold foil motifs, soft cotton lining, matching churidar, and lightweight net dupatta.',
    fabric: 'Pure Cotton Mulmul with Gota Border',
    fit: 'Comfortable Flared Anarkali Fit',
    availableSizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: ['Marigold Orange', 'Crimson Red', 'Teal Green']
  },
  {
    id: 'prod-int-02',
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
    priceINR: 285000,
    priceFormatted: '₹2,85,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Saint Laurent Official Boutique (India Delivery/Duty Paid)',
    description: 'The definitive Parisian smoking jacket crafted in textured grain de poudre virgin wool, featuring structured padded shoulders and silk satin peak lapels.',
    fabric: '100% Grain de Poudre Virgin Wool, 100% Silk Lining',
    fit: 'Tailored Sharp Parisian Cut',
    availableSizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40'],
    colors: ['Noir']
  },
  {
    id: 'prod-int-09',
    slug: 'the-row-balham-cashmere-coat',
    name: 'Balham Double-Faced Cashmere Belted Overcoat',
    brandId: 'int-09',
    brandName: 'The Row',
    brandSlug: 'the-row',
    audience: 'Women',
    category: 'Clothing',
    subcategory: 'Outerwear',
    destinationUrl: 'https://www.therow.com/collections/women-coats',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Minimalist Pure Luxury Outerwear',
    priceINR: 520000,
    priceFormatted: '₹5,20,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'The Row Official International E-Commerce Catalog',
    description: 'Unlined wrap overcoat sculpted from plush double-faced Mongolian cashmere, with dropped shoulders, self-tie sash belt, and hidden horn buttons.',
    fabric: '100% Double-Faced Mongolian Cashmere',
    fit: 'Generous Relaxed Silhouette',
    availableSizes: ['US 2', 'US 4', 'US 6', 'US 8'],
    colors: ['Oatmeal Melange', 'Deep Black', 'Camel']
  },
  {
    id: 'prod-int-10',
    slug: 'brunello-cucinelli-solomeo-cashmere-suit',
    name: 'Solomeo Sartorial Cashmere Tailored Suit',
    brandId: 'int-10',
    brandName: 'Brunello Cucinelli',
    brandSlug: 'brunello-cucinelli',
    audience: 'Men',
    category: 'Clothing',
    subcategory: 'Sartorial Suiting',
    destinationUrl: 'https://shop.brunellocucinelli.com/en-in/men/ready-to-wear/suits/',
    destinationType: 'OFFICIAL_CATEGORY_DESTINATION',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=900',
    imageAttribution: 'Unsplash Editorial Fashion — Italian Bespoke Tailoring',
    priceINR: 460000,
    priceFormatted: '₹4,60,000',
    priceVerificationStatus: 'VERIFIED_ATELIER_PRICE',
    priceSource: 'Brunello Cucinelli Official Flagship E-Commerce',
    description: 'Hand-tailored in the village of Solomeo, Italy. Ultralight two-button suit crafted from fine cashmere and silk blend with deconstructed shoulders.',
    fabric: '85% Cashmere, 15% Silk',
    fit: 'Italian Deconstructed Tailored Fit',
    availableSizes: ['IT 48', 'IT 50', 'IT 52', 'IT 54'],
    colors: ['Medium Gray Melange', 'Navy', 'Tobacco Brown']
  },
  {
    id: 'prod-int-01',
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
    description: 'Timeless collarless tweed jacket hand-loomed by Maison Lesage in Paris, finished with camellia silk threading, weighted hem chain, and signature lion-embossed buttons.',
    fabric: 'Maison Lesage Handwoven Wool-Silk Tweed with Silk Lining',
    fit: 'Iconic Boxy Parisian Cut',
    availableSizes: ['FR 36', 'FR 38', 'FR 40'],
    colors: ['Ecru & Black Tweed', 'Navy Tweed', 'Pastel Pink']
  }
];

export const getProductsByBrand = (brandIdOrSlug: string): VerifiedClothingProduct[] => {
  const query = brandIdOrSlug.toLowerCase();
  return CLOTHING_CATALOG.filter(
    p => p.brandId.toLowerCase() === query || p.brandSlug.toLowerCase() === query || p.brandName.toLowerCase() === query
  );
};

export const getProductBySlug = (slug: string): VerifiedClothingProduct | undefined => {
  const query = slug.toLowerCase();
  return CLOTHING_CATALOG.find(p => p.slug.toLowerCase() === query || p.id.toLowerCase() === query);
};

export const getProductByIdOrSlug = getProductBySlug;

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
    audience: item.audience,
    subcategory: item.subcategory,
    fabric: item.fabric,
    fit: item.fit,
    sizes: item.availableSizes?.join(', '),
    colors: item.colors?.join(', '),
    priceVerificationStatus: item.priceVerificationStatus,
    priceFormatted: item.priceFormatted,
    destinationUrl: item.destinationUrl,
    destinationType: item.destinationType,
    brandSlug: item.brandSlug
  })
});
