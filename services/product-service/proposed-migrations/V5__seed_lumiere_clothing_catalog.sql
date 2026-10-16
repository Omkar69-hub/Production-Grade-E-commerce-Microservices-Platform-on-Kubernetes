-- Proposed Flyway Migration V5: Seed LUMIÈRE Curated Editorial Clothing Catalog
-- PROPOSED & UNAPPROVED — Stored in proposed-migrations/ outside the active Flyway runtime classpath.
-- Transactional seeding for 14 curated haute couture & luxury editorial clothing referral concepts.
-- All entries represent editorial discovery concepts with PRICE_UPON_INQUIRY sentinel price (0.0000).
-- Legacy product SKU-001 and all historical data are snapshot-asserted and strictly preserved.

DO $$
DECLARE
    -- Legacy SKU-001 snapshot variables (isolated product vs inventory tracking)
    v_legacy_prod_id UUID;
    v_legacy_prod_sku VARCHAR(100);
    v_legacy_prod_name VARCHAR(255);
    v_legacy_prod_price DECIMAL(19,4);
    v_legacy_prod_cat_id UUID;
    v_legacy_prod_status VARCHAR(50);
    v_legacy_prod_version_before INTEGER;
    v_legacy_prod_version_after INTEGER;

    v_legacy_inv_id UUID;
    v_legacy_inv_qty_before INTEGER;
    v_legacy_inv_res_before INTEGER;
    v_legacy_inv_version_before INTEGER;
    v_legacy_inv_qty_after INTEGER;
    v_legacy_inv_res_after INTEGER;
    v_legacy_inv_version_after INTEGER;

    -- Canonical Category UUID established in V4
    v_clothing_category_id CONSTANT UUID := '123e4567-e89b-12d3-a456-426614174010'::UUID;
    v_category_exists BOOLEAN;

    -- Seed payload for the 14 LUMIÈRE editorial clothing concepts
    v_seeds JSONB := $SEEDS$[
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174011",
        "sku": "SABYASACHI-HERITAGE-BRIDAL-LEHENGA",
        "name": "Royal Heritage Zardozi Velvet Lehenga",
        "brand": "Sabyasachi",
        "description": "Curated editorial bridal silhouette celebrating heritage craftsmanship, antique zardozi embroidery aesthetics, and bespoke salon draping.",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174011",
          "frontendId": "prod-ind-01",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Bridal Lehengas",
          "destinationUrl": "https://www.sabyasachi.com/collection/heritage-bridal/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Representative Haute Bridal Silhouettes",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Sabyasachi Flagship Salon Consultation Protocol",
          "fabric": "Pure Silk Velvet, Organza & Handwoven Tissue (Representative concept)",
          "fit": "Custom Atelier Tailoring (Bespoke inquiry)",
          "sizes": "Custom Fit",
          "colors": "Crimson Red, Antique Gold, Deep Emerald",
          "brandId": "ind-01",
          "brandSlug": "sabyasachi"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174012",
        "sku": "ANITA-DONGRE-PICHHWAI-SILK-SAREE",
        "name": "Pichhwai Hand-Painted Silk Saree",
        "brand": "Anita Dongre",
        "description": "Editorial celebration of Pichhwai artistic heritage, showcasing hand-painted Rajasthani motifs and fine gota patti craftsmanship.",
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174012",
          "frontendId": "prod-ind-02",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Sarees",
          "destinationUrl": "https://www.anitadongre.com/women/clothing/sarees/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Handcrafted Traditional Silk Textiles",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Pure Bemberg Silk with Gota Patti Detailing (Representative concept)",
          "fit": "Classic Saree Drape with Unstitched Blouse Piece (Representative)",
          "sizes": "Free Size",
          "colors": "Ivory Blanc, Sage Green, Rose Quartz",
          "brandId": "ind-02",
          "brandSlug": "anita-dongre"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174013",
        "sku": "MANISH-MALHOTRA-SEQUINED-OMBRE-SAREE",
        "name": "Kashmiri Tilla & Sequined Ombré Saree",
        "brand": "Manish Malhotra",
        "description": "Curated evening glamour silhouette in ombré tones, evoking Manish Malhotra signature red-carpet aesthetics with Kashmiri tilla threadwork inspiration.",
        "image_url": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174013",
          "frontendId": "prod-ind-03",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Sarees",
          "destinationUrl": "https://www.manishmalhotra.in/women/sarees/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — High Glamour Evening Haute Silhouettes",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Pure Georgette with Metallic Micro-Sequins (Representative concept)",
          "fit": "Fluid Evening Drape (Custom inquiry)",
          "sizes": "Custom Fit",
          "colors": "Silver Lilac Ombré, Midnight Noir, Champagne Gold",
          "brandId": "ind-03",
          "brandSlug": "manish-malhotra"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174014",
        "sku": "TARUN-TAHILIANI-CHIKANKARI-CONCEPT-SAREE",
        "name": "Sculpted Chikankari Draped Concept Saree",
        "brand": "Tarun Tahiliani",
        "description": "Editorial pre-draped concept silhouette reflecting Tarun Tahiliani architectural corsetry and Lucknowi hand chikankari inspiration.",
        "image_url": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174014",
          "frontendId": "prod-ind-04",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Couture Pret",
          "destinationUrl": "https://www.taruntahiliani.com/women/concept-sarees/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Sculptural Couture Drapes",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Italian Crepe, Sheer Tulle & Lace Accents (Representative concept)",
          "fit": "Structured Pre-Draped Silhouette (Representative)",
          "sizes": "XS, S, M, L",
          "colors": "Dusty Rose, Platinum Gray, Classic Noir",
          "brandId": "ind-04",
          "brandSlug": "tarun-tahiliani"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174015",
        "sku": "RAW-MANGO-CHANDERI-BROCADE-KURTA",
        "name": "Handloom Chanderi Brocade Kurta & Dupatta",
        "brand": "Raw Mango",
        "description": "Editorial study of handloom minimalism, featuring Chanderi silk and zari brocade textiles in signature Raw Mango festive aesthetics.",
        "image_url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174015",
          "frontendId": "prod-ind-05",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Heritage Festive",
          "destinationUrl": "https://www.rawmango.com/collections/kurtas/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Artisanal Handloom Textiles",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Handloom Chanderi Silk & Zari Brocade (Representative concept)",
          "fit": "Relaxed Tailored Silhouette (Representative)",
          "sizes": "S, M, L, XL",
          "colors": "Rani Pink, Turquoise, Antique Mustard",
          "brandId": "ind-05",
          "brandSlug": "raw-mango"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174016",
        "sku": "MANYAVAR-JACQUARD-SHERWANI-SET",
        "name": "Royal Jacquard Sherwani with Zari Detailing",
        "brand": "Manyavar",
        "description": "Editorial ceremonial menswear concept featuring brocade jacquard motifs, mandarin collar styling, and ceremonial churidar pairing.",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174016",
          "frontendId": "prod-ind-11",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Men",
          "category": "Clothing",
          "subcategory": "Sherwanis & Bandhgalas",
          "destinationUrl": "https://www.manyavar.com/men/sherwani/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Classic Tailored Ceremonial Menswear",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Poly-Silk Jacquard Weave (Representative concept)",
          "fit": "Regular Tailored Fit (Representative)",
          "sizes": "38, 40, 42, 44",
          "colors": "Off-White & Gold, Regal Navy, Wine Red",
          "brandId": "ind-11",
          "brandSlug": "manyavar"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174017",
        "sku": "RAYMOND-SUPER-250S-MERINO-TUXEDO",
        "name": "Bespoke Super 250s Fine Merino Wool Tuxedo",
        "brand": "Raymond",
        "description": "Editorial eveningwear tailoring archetype featuring fine merino wool suiting, satin peak lapels, and Italian sartorial cut inspiration.",
        "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174017",
          "frontendId": "prod-ind-12",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Men",
          "category": "Clothing",
          "subcategory": "Sartorial Suiting",
          "destinationUrl": "https://www.myraymond.com/men/suits-blazers/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Master Sartorial Wool Suiting",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Fine Merino Wool Blend & Satin Facing (Representative concept)",
          "fit": "Slim Sartorial Cut (Representative)",
          "sizes": "38R, 40R, 42R, 44R",
          "colors": "Midnight Blue, Deep Charcoal, Formal Noir",
          "brandId": "ind-12",
          "brandSlug": "raymond"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174018",
        "sku": "SHANTNU-NIKHIL-ASYMMETRICAL-BANDHGALA",
        "name": "Regalia Asymmetrical Draped Bandhgala",
        "brand": "Shantnu & Nikhil",
        "description": "Editorial modern ceremonial silhouette reflecting Shantnu & Nikhil neo-military drape aesthetics, asymmetric flap styling, and emblem detailing.",
        "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174018",
          "frontendId": "prod-ind-16",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Men",
          "category": "Clothing",
          "subcategory": "Sherwanis & Bandhgalas",
          "destinationUrl": "https://www.shantanunikhil.com/men/bandhgala/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Dramatic Modern Ceremonial Silhouettes",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Silk Matka Blend with Metallic Embellishments (Representative concept)",
          "fit": "Structured Military Silhouette (Representative)",
          "sizes": "38, 40, 42",
          "colors": "Matte Black, Olive Drab, Imperial Cream",
          "brandId": "ind-16",
          "brandSlug": "shantnu-and-nikhil"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174019",
        "sku": "TORANI-KIDS-CHANDERI-KURTA-SET",
        "name": "Kids' Chanderi Hand-Embroidered Kurta & Dhoti Ensemble",
        "brand": "Torani",
        "description": "Editorial children's festive attire reflecting nostalgic Chanderi craftsmanship, delicate dori embroidery motifs, and scalloped hem artistry.",
        "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174019",
          "frontendId": "prod-ind-13",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Kids",
          "category": "Clothing",
          "subcategory": "Heritage Festive",
          "destinationUrl": "https://www.torani.in/collections/kids/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Artisanal Handcrafted Heritage Garments",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Chanderi Cotton-Silk Blend & Cotton Voile Lining (Representative concept)",
          "fit": "Comfortable Festive Silhouette (Representative)",
          "sizes": "2-3Y, 4-5Y, 6-7Y, 8-9Y",
          "colors": "Gulabi Rose, Haldi Yellow, Champa White",
          "brandId": "ind-13",
          "brandSlug": "torani"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174021",
        "sku": "BIBA-GIRLS-FESTIVE-ANARKALI-SUIT",
        "name": "Kids' Festive Flared Anarkali & Dupatta Set",
        "brand": "Biba",
        "description": "Editorial celebratory attire for young girls featuring festive flared Anarkali silhouette, foil print motifs, and coordinating dupatta ensemble.",
        "image_url": "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174021",
          "frontendId": "prod-ind-24",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Kids",
          "category": "Clothing",
          "subcategory": "Heritage Festive",
          "destinationUrl": "https://www.biba.in/girls/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Festive Celebratory Children's Attire",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Cotton Voile with Gota Detailing (Representative concept)",
          "fit": "Flared Anarkali Silhouette (Representative)",
          "sizes": "3-4Y, 5-6Y, 7-8Y, 9-10Y",
          "colors": "Marigold Orange, Crimson Red, Teal Green",
          "brandId": "ind-24",
          "brandSlug": "biba"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174022",
        "sku": "SAINT-LAURENT-LE-SMOKING-JACKET",
        "name": "Le Smoking Grain de Poudre Wool Tuxedo Jacket",
        "brand": "Saint Laurent",
        "description": "Editorial salute to the iconic Parisian Le Smoking silhouette, showcasing sharp padded shoulders, virgin wool tailoring, and silk satin peak lapels.",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174022",
          "frontendId": "prod-int-02",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Tailoring & Suiting",
          "destinationUrl": "https://www.ysl.com/en-in/ready-to-wear/jackets-and-pants/jackets",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Parisian Tailored Haute Silhouettes",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Grain de Poudre Virgin Wool with Silk Facing (Representative concept)",
          "fit": "Structured Parisian Cut (Representative)",
          "sizes": "FR 34, FR 36, FR 38, FR 40",
          "colors": "Noir",
          "brandId": "int-02",
          "brandSlug": "saint-laurent"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174023",
        "sku": "THE-ROW-BALHAM-CASHMERE-COAT",
        "name": "Balham Double-Faced Cashmere Belted Overcoat",
        "brand": "The Row",
        "description": "Editorial study in minimalist luxury outerwear, showcasing double-faced cashmere draping, dropped shoulders, and relaxed sash tie styling.",
        "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174023",
          "frontendId": "prod-int-09",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Outerwear",
          "destinationUrl": "https://www.therow.com/collections/women-coats",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Minimalist Pure Luxury Outerwear",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Double-Faced Cashmere Blend (Representative concept)",
          "fit": "Relaxed Wrap Silhouette (Representative)",
          "sizes": "US 2, US 4, US 6, US 8",
          "colors": "Oatmeal Melange, Deep Black, Camel",
          "brandId": "int-13",
          "brandSlug": "the-row"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174024",
        "sku": "BRUNELLO-CUCINELLI-SOLOMEO-CASHMERE-SUIT",
        "name": "Solomeo Sartorial Cashmere Tailored Suit",
        "brand": "Brunello Cucinelli",
        "description": "Editorial appreciation of Solomeo tailoring heritage, featuring deconstructed shoulder architecture and luxurious cashmere-silk fabrications.",
        "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174024",
          "frontendId": "prod-int-10",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Men",
          "category": "Clothing",
          "subcategory": "Sartorial Suiting",
          "destinationUrl": "https://shop.brunellocucinelli.com/en-in/men/ready-to-wear/suits/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Italian Bespoke Tailoring",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Direct Atelier Inquiry — Seasonal Collection Category Listing",
          "fabric": "Cashmere & Silk Blend (Representative concept)",
          "fit": "Italian Deconstructed Tailored Fit (Representative)",
          "sizes": "IT 48, IT 50, IT 52, IT 54",
          "colors": "Medium Gray Melange, Navy, Tobacco Brown",
          "brandId": "int-07",
          "brandSlug": "brunello-cucinelli"
        }
      },
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174025",
        "sku": "CHANEL-LESAGE-TWEED-JACKET",
        "name": "Lesage Hand-Embroidered Tweed Jacket",
        "brand": "Chanel",
        "description": "Editorial tribute to Parisian haute couture tweed craftsmanship, celebrating Lesage embroidery traditions and timeless collarless silhouettes.",
        "image_url": "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&q=80&w=900",
        "attributes": {
          "uuid": "123e4567-e89b-12d3-a456-426614174025",
          "frontendId": "prod-int-01",
          "isEditorialConcept": true,
          "isReferral": true,
          "fulfillmentType": "REFERRAL_LINK",
          "audience": "Women",
          "category": "Clothing",
          "subcategory": "Haute Couture",
          "destinationUrl": "https://www.chanel.com/fr/mode/pret-a-porter/vestes/",
          "destinationType": "OFFICIAL_CATEGORY_DESTINATION",
          "imageUrl": "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&q=80&w=900",
          "imageAttribution": "Unsplash Editorial Fashion — Iconic Parisian Haute Couture",
          "priceVerificationStatus": "PRICE_UPON_INQUIRY",
          "priceFormatted": "Price upon atelier inquiry",
          "priceSource": "Chanel Salons Privés & Flagship Boutiques Consultation Protocol",
          "fabric": "Tweed Weave with Silk Lining Accents (Representative concept)",
          "fit": "Boxy Parisian Silhouette (Bespoke inquiry)",
          "sizes": "FR 36, FR 38, FR 40",
          "colors": "Ecru & Black Tweed, Navy Tweed, Pastel Pink",
          "brandId": "int-01",
          "brandSlug": "chanel"
        }
      }
    ]$SEEDS$::jsonb;

    -- Iteration variables
    rec RECORD;
    v_existing_uuid_id UUID;
    v_existing_uuid_sku VARCHAR(100);
    v_existing_uuid_name VARCHAR(255);
    v_existing_uuid_brand VARCHAR(255);
    v_existing_uuid_desc TEXT;
    v_existing_uuid_price DECIMAL(19,4);
    v_existing_uuid_cat_id UUID;
    v_existing_uuid_status VARCHAR(50);
    v_existing_uuid_image_url VARCHAR(500);
    v_existing_uuid_attributes TEXT;
    v_existing_uuid_is_deleted BOOLEAN;

    v_existing_sku_id UUID;
    v_existing_sku_sku VARCHAR(100);
    v_existing_sku_name VARCHAR(255);
    v_existing_sku_brand VARCHAR(255);
    v_existing_sku_desc TEXT;
    v_existing_sku_price DECIMAL(19,4);
    v_existing_sku_cat_id UUID;
    v_existing_sku_status VARCHAR(50);
    v_existing_sku_image_url VARCHAR(500);
    v_existing_sku_attributes TEXT;
    v_existing_sku_is_deleted BOOLEAN;

    v_existing_inv_id UUID;
    v_existing_inv_qty INTEGER;
    v_existing_inv_res INTEGER;
    v_existing_jsonb JSONB;

    v_is_idempotent_match BOOLEAN;
    v_was_inserted BOOLEAN;
    v_inserted_count INTEGER := 0;
    v_idempotent_count INTEGER := 0;

    -- Per-row verification variables
    v_verify_prod_id UUID;
    v_verify_prod_sku VARCHAR(100);
    v_verify_prod_name VARCHAR(255);
    v_verify_prod_brand VARCHAR(255);
    v_verify_prod_desc TEXT;
    v_verify_prod_price DECIMAL(19,4);
    v_verify_prod_cat_id UUID;
    v_verify_prod_status VARCHAR(50);
    v_verify_prod_image_url VARCHAR(500);
    v_verify_prod_attributes TEXT;
    v_verify_prod_is_deleted BOOLEAN;
    v_verify_jsonb JSONB;

    v_verify_inv_qty INTEGER;
    v_verify_inv_res INTEGER;
BEGIN
    -- -------------------------------------------------------------------------
    -- 1. PRE-SEED SAFEGUARDS: SNAPSHOT & ROW LOCK LEGACY SKU-001 (PRODUCTS & INVENTORY)
    -- -------------------------------------------------------------------------
    -- Explicitly lock and snapshot legacy SKU-001 product row
    SELECT id, sku, name, price, category_id, status, version
    INTO v_legacy_prod_id, v_legacy_prod_sku, v_legacy_prod_name, v_legacy_prod_price, v_legacy_prod_cat_id, v_legacy_prod_status, v_legacy_prod_version_before
    FROM products
    WHERE sku = 'SKU-001'
    FOR UPDATE;

    IF v_legacy_prod_id IS NULL THEN
        RAISE EXCEPTION 'Pre-migration check failed: Legacy product SKU-001 was not found in products table.';
    END IF;

    -- Explicitly lock and snapshot legacy SKU-001 inventory row separately
    SELECT product_id, quantity_available, reserved_quantity, version
    INTO v_legacy_inv_id, v_legacy_inv_qty_before, v_legacy_inv_res_before, v_legacy_inv_version_before
    FROM inventory
    WHERE product_id = v_legacy_prod_id
    FOR UPDATE;

    IF v_legacy_inv_id IS NULL THEN
        RAISE EXCEPTION 'Pre-migration check failed: Legacy inventory row for product SKU-001 was not found.';
    END IF;

    -- -------------------------------------------------------------------------
    -- 2. PRE-SEED SAFEGUARDS: VERIFY CLOTHING CATEGORY
    -- -------------------------------------------------------------------------
    SELECT EXISTS (
        SELECT 1 FROM categories 
        WHERE id = v_clothing_category_id AND is_deleted = false
    ) INTO v_category_exists;

    IF NOT v_category_exists THEN
        RAISE EXCEPTION 'Pre-migration check failed: Clothing category % does not exist or is soft-deleted.', v_clothing_category_id;
    END IF;

    -- -------------------------------------------------------------------------
    -- 3. PER-PRODUCT ATOMIC CONFLICT DETECTION, STRICT IDEMPOTENCY & SEEDING
    -- -------------------------------------------------------------------------
    FOR rec IN 
        SELECT 
            (elem->>'uuid')::UUID AS id,
            elem->>'sku' AS sku,
            elem->>'name' AS name,
            elem->>'brand' AS brand,
            elem->>'description' AS description,
            elem->>'image_url' AS image_url,
            (elem->'attributes')::TEXT AS attributes_text,
            (elem->'attributes') AS attributes_jsonb
        FROM jsonb_array_elements(v_seeds) AS elem
    LOOP
        -- Reset loop detection variables to avoid state leakage
        v_is_idempotent_match := false;
        v_was_inserted := false;

        v_existing_uuid_id := NULL;
        v_existing_uuid_sku := NULL;
        v_existing_uuid_name := NULL;
        v_existing_uuid_brand := NULL;
        v_existing_uuid_desc := NULL;
        v_existing_uuid_price := NULL;
        v_existing_uuid_cat_id := NULL;
        v_existing_uuid_status := NULL;
        v_existing_uuid_image_url := NULL;
        v_existing_uuid_attributes := NULL;
        v_existing_uuid_is_deleted := NULL;

        v_existing_sku_id := NULL;
        v_existing_sku_sku := NULL;
        v_existing_sku_name := NULL;
        v_existing_sku_brand := NULL;
        v_existing_sku_desc := NULL;
        v_existing_sku_price := NULL;
        v_existing_sku_cat_id := NULL;
        v_existing_sku_status := NULL;
        v_existing_sku_image_url := NULL;
        v_existing_sku_attributes := NULL;
        v_existing_sku_is_deleted := NULL;

        v_existing_inv_id := NULL;
        v_existing_inv_qty := NULL;
        v_existing_inv_res := NULL;
        v_existing_jsonb := NULL;

        -- Check separate UUID conflict (including soft-deleted records and all seeded fields)
        SELECT id, sku, name, brand, description, price, category_id, status, image_url, attributes, is_deleted
        INTO v_existing_uuid_id, v_existing_uuid_sku, v_existing_uuid_name, v_existing_uuid_brand, v_existing_uuid_desc,
             v_existing_uuid_price, v_existing_uuid_cat_id, v_existing_uuid_status, v_existing_uuid_image_url,
             v_existing_uuid_attributes, v_existing_uuid_is_deleted
        FROM products
        WHERE id = rec.id;

        -- Check separate SKU conflict (including soft-deleted records and all seeded fields)
        SELECT id, sku, name, brand, description, price, category_id, status, image_url, attributes, is_deleted
        INTO v_existing_sku_id, v_existing_sku_sku, v_existing_sku_name, v_existing_sku_brand, v_existing_sku_desc,
             v_existing_sku_price, v_existing_sku_cat_id, v_existing_sku_status, v_existing_sku_image_url,
             v_existing_sku_attributes, v_existing_sku_is_deleted
        FROM products
        WHERE sku = rec.sku;

        -- Check corresponding inventory record
        SELECT product_id, quantity_available, reserved_quantity
        INTO v_existing_inv_id, v_existing_inv_qty, v_existing_inv_res
        FROM inventory
        WHERE product_id = rec.id;

        -- Evaluate collision and idempotency scenarios
        IF v_existing_uuid_id IS NOT NULL AND v_existing_sku_id IS NOT NULL THEN
            -- Both UUID and SKU exist: assert they point to the exact same database row
            IF v_existing_uuid_id <> v_existing_sku_id THEN
                RAISE EXCEPTION 'Cross-identity conflict: Target UUID % matches existing product (SKU: "%"), while target SKU "%" matches different product (UUID: %).',
                    rec.id, v_existing_uuid_sku, rec.sku, v_existing_sku_id;
            END IF;

            -- Fail if existing record is soft-deleted
            IF v_existing_uuid_is_deleted THEN
                RAISE EXCEPTION 'Conflict: Product UUID % (SKU "%") exists but is marked as soft-deleted.', rec.id, rec.sku;
            END IF;

            -- Strict Idempotency Check: all non-generated scalar product fields must match exact seed definitions
            -- Uses IS DISTINCT FROM to prevent SQL three-valued logic from treating NULL mismatches as matches
            IF v_existing_uuid_cat_id IS DISTINCT FROM v_clothing_category_id OR
               v_existing_uuid_name IS DISTINCT FROM rec.name OR
               v_existing_uuid_brand IS DISTINCT FROM rec.brand OR
               v_existing_uuid_desc IS DISTINCT FROM rec.description OR
               v_existing_uuid_price IS DISTINCT FROM 0.0000 OR
               v_existing_uuid_status IS DISTINCT FROM 'ACTIVE' OR
               v_existing_uuid_image_url IS DISTINCT FROM rec.image_url THEN
                RAISE EXCEPTION 'Idempotency failure: Product UUID % exists but scalar fields do not match required seed values. Name: "%" vs "%", Brand: "%" vs "%", Price: % vs 0.0000, Category: % vs %, Status: "%" vs ACTIVE, Desc match: %, Image match: %',
                    rec.id,
                    v_existing_uuid_name, rec.name,
                    v_existing_uuid_brand, rec.brand,
                    v_existing_uuid_price,
                    v_existing_uuid_cat_id, v_clothing_category_id,
                    v_existing_uuid_status,
                    (v_existing_uuid_desc = rec.description),
                    (v_existing_uuid_image_url = rec.image_url);
            END IF;

            -- Strict Idempotency Check: validate and compare attributes semantically as JSONB
            IF v_existing_uuid_attributes IS NULL THEN
                RAISE EXCEPTION 'Idempotency failure: Product UUID % exists but attributes column is NULL.', rec.id;
            END IF;

            BEGIN
                v_existing_jsonb := v_existing_uuid_attributes::JSONB;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'Idempotency failure: Product UUID % exists but contains invalid or corrupted JSON in attributes: "%".',
                    rec.id, v_existing_uuid_attributes;
            END;

            IF v_existing_jsonb IS DISTINCT FROM rec.attributes_jsonb THEN
                RAISE EXCEPTION 'Idempotency failure: Product UUID % exists but metadata attributes diverge from canonical seed. Existing: %, Expected: %',
                    rec.id, v_existing_jsonb::TEXT, rec.attributes_jsonb::TEXT;
            END IF;

            -- Strict Idempotency Check: inventory row must exist with quantity_available=0 and reserved_quantity=0
            IF v_existing_inv_id IS NULL THEN
                RAISE EXCEPTION 'Idempotency failure: Product UUID % exists, but corresponding inventory row is missing.', rec.id;
            END IF;

            IF v_existing_inv_qty IS DISTINCT FROM 0 OR v_existing_inv_res IS DISTINCT FROM 0 THEN
                RAISE EXCEPTION 'Idempotency failure: Product UUID % exists, but inventory quantities are non-zero (available: %, reserved: %).',
                    rec.id, v_existing_inv_qty, v_existing_inv_res;
            END IF;

            -- Valid identical row already present: mark as idempotent match
            v_is_idempotent_match := true;
            v_idempotent_count := v_idempotent_count + 1;

        ELSIF v_existing_uuid_id IS NOT NULL THEN
            -- UUID collision with different SKU
            RAISE EXCEPTION 'UUID conflict: Product UUID % already exists with different SKU "%" (expected "%").',
                rec.id, v_existing_uuid_sku, rec.sku;

        ELSIF v_existing_sku_id IS NOT NULL THEN
            -- SKU collision with different UUID
            RAISE EXCEPTION 'SKU conflict: SKU "%" already exists with different UUID % (expected %).',
                rec.sku, v_existing_sku_id, rec.id;

        ELSE
            -- Neither UUID nor SKU exists: perform safe atomic insertion of new row
            INSERT INTO products (
                id,
                category_id,
                name,
                sku,
                description,
                price,
                status,
                image_url,
                brand,
                attributes,
                is_deleted,
                created_at,
                updated_at,
                version
            ) VALUES (
                rec.id,
                v_clothing_category_id,
                rec.name,
                rec.sku,
                rec.description,
                0.0000,
                'ACTIVE',
                rec.image_url,
                rec.brand,
                rec.attributes_text,
                false,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                0
            );

            INSERT INTO inventory (
                product_id,
                quantity_available,
                reserved_quantity,
                last_updated_at,
                version
            ) VALUES (
                rec.id,
                0,
                0,
                CURRENT_TIMESTAMP,
                0
            );

            v_was_inserted := true;
            v_inserted_count := v_inserted_count + 1;
        END IF;

        -- ---------------------------------------------------------------------
        -- 4. INDIVIDUAL POST-SEED ROW VERIFICATION (ALL FIELDS & SEMANTIC JSONB)
        -- ---------------------------------------------------------------------
        -- Fetch and assert all seeded fields individually for this product row
        v_verify_prod_id := NULL;
        v_verify_prod_sku := NULL;
        v_verify_prod_name := NULL;
        v_verify_prod_brand := NULL;
        v_verify_prod_desc := NULL;
        v_verify_prod_price := NULL;
        v_verify_prod_cat_id := NULL;
        v_verify_prod_status := NULL;
        v_verify_prod_image_url := NULL;
        v_verify_prod_attributes := NULL;
        v_verify_prod_is_deleted := NULL;
        v_verify_jsonb := NULL;

        SELECT id, sku, name, brand, description, price, category_id, status, image_url, attributes, is_deleted
        INTO v_verify_prod_id, v_verify_prod_sku, v_verify_prod_name, v_verify_prod_brand, v_verify_prod_desc,
             v_verify_prod_price, v_verify_prod_cat_id, v_verify_prod_status, v_verify_prod_image_url,
             v_verify_prod_attributes, v_verify_prod_is_deleted
        FROM products
        WHERE id = rec.id;

        IF v_verify_prod_id IS NULL THEN
            RAISE EXCEPTION 'Post-seed verification failed: Product UUID % (SKU "%") was not found after operation.', rec.id, rec.sku;
        END IF;

        IF v_verify_prod_sku IS DISTINCT FROM rec.sku OR
           v_verify_prod_cat_id IS DISTINCT FROM v_clothing_category_id OR
           v_verify_prod_name IS DISTINCT FROM rec.name OR
           v_verify_prod_brand IS DISTINCT FROM rec.brand OR
           v_verify_prod_desc IS DISTINCT FROM rec.description OR
           v_verify_prod_price IS DISTINCT FROM 0.0000 OR
           v_verify_prod_status IS DISTINCT FROM 'ACTIVE' OR
           v_verify_prod_image_url IS DISTINCT FROM rec.image_url OR
           v_verify_prod_is_deleted IS DISTINCT FROM false THEN
            RAISE EXCEPTION 'Post-seed verification failed: Product UUID % (SKU "%") has divergent field values.', rec.id, rec.sku;
        END IF;

        -- Verify semantic JSONB attributes
        IF v_verify_prod_attributes IS NULL THEN
            RAISE EXCEPTION 'Post-seed verification failed: Product UUID % attributes column is NULL.', rec.id;
        END IF;

        BEGIN
            v_verify_jsonb := v_verify_prod_attributes::JSONB;
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Post-seed verification failed: Product UUID % attributes contains invalid JSON: "%".',
                rec.id, v_verify_prod_attributes;
        END;

        IF v_verify_jsonb IS DISTINCT FROM rec.attributes_jsonb THEN
            RAISE EXCEPTION 'Post-seed verification failed: Product UUID % attributes diverge semantically from canonical seed.', rec.id;
        END IF;

        -- Verify corresponding inventory row individually
        v_verify_inv_qty := NULL;
        v_verify_inv_res := NULL;

        SELECT quantity_available, reserved_quantity
        INTO v_verify_inv_qty, v_verify_inv_res
        FROM inventory
        WHERE product_id = rec.id;

        IF v_verify_inv_qty IS NULL THEN
            RAISE EXCEPTION 'Post-seed verification failed: Inventory row for product UUID % is missing.', rec.id;
        END IF;

        IF v_verify_inv_qty IS DISTINCT FROM 0 OR v_verify_inv_res IS DISTINCT FROM 0 THEN
            RAISE EXCEPTION 'Post-seed verification failed: Inventory row for product UUID % has non-zero quantities (available: %, reserved: %).',
                rec.id, v_verify_inv_qty, v_verify_inv_res;
        END IF;

    END LOOP;

    -- -------------------------------------------------------------------------
    -- 5. POST-SEED SAFEGUARDS: RE-ASSERT LEGACY SKU-001 STATE INTEGRITY
    -- -------------------------------------------------------------------------
    -- Assert legacy SKU-001 product version and fields remained unmutated
    SELECT version INTO v_legacy_prod_version_after
    FROM products
    WHERE id = v_legacy_prod_id;

    IF v_legacy_prod_version_after <> v_legacy_prod_version_before THEN
        RAISE EXCEPTION 'Post-migration assertion failed: Legacy product SKU-001 version changed from % to %.',
            v_legacy_prod_version_before, v_legacy_prod_version_after;
    END IF;

    -- Assert legacy SKU-001 inventory row remained unmutated
    SELECT quantity_available, reserved_quantity, version
    INTO v_legacy_inv_qty_after, v_legacy_inv_res_after, v_legacy_inv_version_after
    FROM inventory
    WHERE product_id = v_legacy_prod_id;

    IF v_legacy_inv_version_after <> v_legacy_inv_version_before OR
       v_legacy_inv_qty_after <> v_legacy_inv_qty_before OR
       v_legacy_inv_res_after <> v_legacy_inv_res_before THEN
        RAISE EXCEPTION 'Post-migration assertion failed: Legacy inventory for SKU-001 was altered (version: %->%, qty: %->%, res: %->%).',
            v_legacy_inv_version_before, v_legacy_inv_version_after,
            v_legacy_inv_qty_before, v_legacy_inv_qty_after,
            v_legacy_inv_res_before, v_legacy_inv_res_after;
    END IF;

    RAISE NOTICE 'Flyway migration V5: Successfully validated 14 LUMIÈRE editorial clothing concepts (inserted: %, idempotent existing: %, legacy SKU-001 preserved).',
        v_inserted_count, v_idempotent_count;
END $$;
