-- =============================================================================
-- LUMIÈRE — V5 REFERRAL CATALOG SEED MIGRATION
-- Fully Idempotent, Assertive, Concurrency-Safe Seed for 14 Curated Products
-- =============================================================================

DO $$
DECLARE
    v_clothing_cat_id    UUID := '123e4567-e89b-12d3-a456-426614174010';
    v_electronics_cat_id UUID := '123e4567-e89b-12d3-a456-426614174000';
    v_sku001_id          UUID := '123e4567-e89b-12d3-a456-426614174001';
    v_cat_count          INTEGER;
    v_pre_existing_count INTEGER;
    v_post_existing_count INTEGER;
    v_pre_existing_hash  VARCHAR(32);
    v_post_existing_hash VARCHAR(32);
    v_verified_catalog_count INTEGER;
    v_verified_inventory_count INTEGER;

    v_target RECORD;
    v_by_id RECORD;
    v_by_sku RECORD;
    v_inv RECORD;
    v_existing RECORD;
    v_sku001_check RECORD;
BEGIN
    -- -------------------------------------------------------------------------
    -- PHASE 0: CONCURRENCY CONTROL (MINIMUM APPROPRIATE TABLE LOCK)
    -- Acquire SHARE ROW EXCLUSIVE lock on products and inventory.
    -- Allows concurrent SELECT queries across services, but blocks concurrent
    -- INSERT, UPDATE, DELETE, and DDL until the migration transaction completes.
    -- -------------------------------------------------------------------------
    LOCK TABLE products, inventory IN SHARE ROW EXCLUSIVE MODE;

    -- -------------------------------------------------------------------------
    -- PHASE 1: PREFLIGHT SYSTEM ASSERTIONS
    -- -------------------------------------------------------------------------
    -- 1.1 Assert prerequisite Clothing category exists
    SELECT COUNT(*) INTO v_cat_count 
    FROM categories 
    WHERE id = v_clothing_cat_id AND name = 'Clothing' AND is_deleted = false;
    
    IF v_cat_count <> 1 THEN
        RAISE EXCEPTION 'PREFLIGHT FAILED: Category Clothing (%) not found or deleted', v_clothing_cat_id;
    END IF;

    -- 1.2 Fail-Closed assertion on legacy product SKU-001 (Electronics, 87 stock, ver 12)
    SELECT 
        p.id, p.category_id, p.is_deleted, 
        i.quantity_available, i.reserved_quantity, i.version
    INTO v_sku001_check
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id = v_sku001_id AND p.sku = 'SKU-001';

    IF v_sku001_check.id IS NULL THEN
        RAISE EXCEPTION 'PREFLIGHT FAILED: Legacy product SKU-001 (%) does not exist', v_sku001_id;
    END IF;

    IF v_sku001_check.is_deleted THEN
        RAISE EXCEPTION 'PREFLIGHT FAILED: Legacy product SKU-001 (%) is soft-deleted', v_sku001_id;
    END IF;

    IF v_sku001_check.category_id IS DISTINCT FROM v_electronics_cat_id THEN
        RAISE EXCEPTION 'PREFLIGHT FAILED: SKU-001 category_id (%) does not match Electronics (%)', v_sku001_check.category_id, v_electronics_cat_id;
    END IF;

    IF v_sku001_check.quantity_available IS NULL THEN
        RAISE EXCEPTION 'PREFLIGHT FAILED: Legacy product SKU-001 exists but has NO inventory record';
    END IF;

    IF v_sku001_check.quantity_available <> 87 OR v_sku001_check.reserved_quantity <> 0 OR v_sku001_check.version <> 12 THEN
        RAISE EXCEPTION 'PREFLIGHT FAILED: SKU-001 inventory (avail=%, res=%, ver=%) invalid (expected 87, 0, 12)', 
            v_sku001_check.quantity_available, v_sku001_check.reserved_quantity, v_sku001_check.version;
    END IF;

    -- -------------------------------------------------------------------------
    -- PHASE 2: CATALOG DEFINITION & DETERMINISTIC PRE-STATE FINGERPRINT
    -- -------------------------------------------------------------------------
    DROP TABLE IF EXISTS tmp_seed_catalog;
    CREATE TEMP TABLE tmp_seed_catalog (
        id UUID PRIMARY KEY,
        category_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        brand VARCHAR(255) NOT NULL,
        price NUMERIC(19,4) NOT NULL,
        status VARCHAR(50) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        brand_id VARCHAR(50) NOT NULL,
        brand_slug VARCHAR(100) NOT NULL,
        destination_url VARCHAR(500) NOT NULL,
        destination_type VARCHAR(100) NOT NULL,
        price_verification_status VARCHAR(100) NOT NULL,
        price_formatted VARCHAR(100) NOT NULL,
        price_source VARCHAR(255) NOT NULL,
        attributes TEXT NOT NULL
    ) ON COMMIT DROP;

    INSERT INTO tmp_seed_catalog (id, category_id, name, sku, description, brand, price, status, image_url, brand_id, brand_slug, destination_url, destination_type, price_verification_status, price_formatted, price_source, attributes)
    VALUES
    (
        '123e4567-e89b-12d3-a456-426614174011', v_clothing_cat_id,
        'Royal Heritage Zardozi Velvet Lehenga', 'SABYASACHI-HERITAGE-BRIDAL-LEHENGA',
        'Curated editorial bridal silhouette celebrating heritage craftsmanship, antique zardozi embroidery aesthetics, and bespoke salon draping.',
        'Sabyasachi', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
        'ind-01', 'sabyasachi', 'https://www.sabyasachi.com/collection/heritage-bridal/', 'OFFICIAL_CATEGORY_DESTINATION',
        'PRICE_UPON_INQUIRY', 'Price upon atelier inquiry', 'Sabyasachi Flagship Salon Consultation Protocol',
        '{"frontendId":"prod-ind-01","uuid":"123e4567-e89b-12d3-a456-426614174011","brandId":"ind-01","brandSlug":"sabyasachi","audience":"Women","subcategory":"Bridal Lehengas","fabric":"Pure Silk Velvet, Organza & Handwoven Tissue","fit":"Custom Atelier Tailoring","sizes":"Custom Fit","colors":"Crimson Red, Antique Gold, Deep Emerald","destinationUrl":"https://www.sabyasachi.com/collection/heritage-bridal/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"PRICE_UPON_INQUIRY","priceFormatted":"Price upon atelier inquiry","priceSource":"Sabyasachi Flagship Salon Consultation Protocol","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174012', v_clothing_cat_id,
        'Pichhwai Hand-Painted Silk Saree', 'ANITA-DONGRE-PICHHWAI-SILK-SAREE',
        'Editorial celebration of Pichhwai artistic heritage, showcasing hand-painted Rajasthani motifs and fine gota patti craftsmanship.',
        'Anita Dongre', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=900',
        'ind-02', 'anita-dongre', 'https://www.anitadongre.com/women/clothing/sarees/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹1,10,000 (Category estimate)', 'Anita Dongre Saree Collection Category Benchmark',
        '{"frontendId":"prod-ind-02","uuid":"123e4567-e89b-12d3-a456-426614174012","brandId":"ind-02","brandSlug":"anita-dongre","audience":"Women","subcategory":"Sarees","fabric":"Pure Bemberg Silk with Gota Patti Detailing","fit":"Classic Saree Drape with Unstitched Blouse Piece","sizes":"Free Size","colors":"Ivory Blanc, Sage Green, Rose Quartz","destinationUrl":"https://www.anitadongre.com/women/clothing/sarees/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹1,10,000 (Category estimate)","priceSource":"Anita Dongre Saree Collection Category Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174013', v_clothing_cat_id,
        'Kashmiri Tilla & Sequined Ombré Saree', 'MANISH-MALHOTRA-SEQUINED-OMBRE-SAREE',
        'Curated evening glamour silhouette in ombré tones, evoking Manish Malhotra signature red-carpet aesthetics with Kashmiri tilla threadwork inspiration.',
        'Manish Malhotra', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=900',
        'ind-03', 'manish-malhotra', 'https://www.manishmalhotra.in/women/sarees/', 'OFFICIAL_CATEGORY_DESTINATION',
        'PRICE_UPON_INQUIRY', 'Price upon atelier inquiry', 'Direct Atelier Inquiry — Seasonal Collection Category Listing',
        '{"frontendId":"prod-ind-03","uuid":"123e4567-e89b-12d3-a456-426614174013","brandId":"ind-03","brandSlug":"manish-malhotra","audience":"Women","subcategory":"Sarees","fabric":"Pure Georgette with Metallic Micro-Sequins","fit":"Fluid Evening Drape","sizes":"Custom Fit","colors":"Silver Lilac Ombré, Midnight Noir, Champagne Gold","destinationUrl":"https://www.manishmalhotra.in/women/sarees/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"PRICE_UPON_INQUIRY","priceFormatted":"Price upon atelier inquiry","priceSource":"Direct Atelier Inquiry — Seasonal Collection Category Listing","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174014', v_clothing_cat_id,
        'Sculpted Chikankari Draped Concept Saree', 'TARUN-TAHILIANI-CHIKANKARI-CONCEPT-SAREE',
        'Editorial pre-draped concept silhouette reflecting Tarun Tahiliani architectural corsetry and Lucknowi hand chikankari inspiration.',
        'Tarun Tahiliani', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
        'ind-04', 'tarun-tahiliani', 'https://www.taruntahiliani.com/women/concept-sarees/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹1,75,000 (Category estimate)', 'Tarun Tahiliani Concept Saree Category Benchmark',
        '{"frontendId":"prod-ind-04","uuid":"123e4567-e89b-12d3-a456-426614174014","brandId":"ind-04","brandSlug":"tarun-tahiliani","audience":"Women","subcategory":"Couture Pret","fabric":"Italian Crepe, Sheer Tulle & Lace Accents","fit":"Structured Pre-Draped Silhouette","sizes":"XS, S, M, L","colors":"Dusty Rose, Platinum Gray, Classic Noir","destinationUrl":"https://www.taruntahiliani.com/women/concept-sarees/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹1,75,000 (Category estimate)","priceSource":"Tarun Tahiliani Concept Saree Category Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174015', v_clothing_cat_id,
        'Handloom Chanderi Brocade Kurta & Dupatta', 'RAW-MANGO-CHANDERI-BROCADE-KURTA',
        'Editorial study of handloom minimalism, featuring Chanderi silk and zari brocade textiles in signature Raw Mango festive aesthetics.',
        'Raw Mango', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
        'ind-05', 'raw-mango', 'https://www.rawmango.com/collections/kurtas/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹42,500 (Category estimate)', 'Raw Mango Kurta Collection Category Benchmark',
        '{"frontendId":"prod-ind-05","uuid":"123e4567-e89b-12d3-a456-426614174015","brandId":"ind-05","brandSlug":"raw-mango","audience":"Women","subcategory":"Heritage Festive","fabric":"Handloom Chanderi Silk & Zari Brocade","fit":"Relaxed Tailored Silhouette","sizes":"S, M, L, XL","colors":"Rani Pink, Turquoise, Antique Mustard","destinationUrl":"https://www.rawmango.com/collections/kurtas/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹42,500 (Category estimate)","priceSource":"Raw Mango Kurta Collection Category Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174016', v_clothing_cat_id,
        'Royal Jacquard Sherwani with Zari Detailing', 'MANYAVAR-JACQUARD-SHERWANI-SET',
        'Editorial ceremonial menswear concept featuring brocade jacquard motifs, mandarin collar styling, and ceremonial churidar pairing.',
        'Manyavar', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
        'ind-11', 'manyavar', 'https://www.manyavar.com/men/sherwani/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹29,999 (Catalog benchmark)', 'Manyavar Menswear Category Retail Benchmark',
        '{"frontendId":"prod-ind-11","uuid":"123e4567-e89b-12d3-a456-426614174016","brandId":"ind-11","brandSlug":"manyavar","audience":"Men","subcategory":"Sherwanis & Bandhgalas","fabric":"Poly-Silk Jacquard Weave","fit":"Regular Tailored Fit","sizes":"38, 40, 42, 44","colors":"Off-White & Gold, Regal Navy, Wine Red","destinationUrl":"https://www.manyavar.com/men/sherwani/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹29,999 (Catalog benchmark)","priceSource":"Manyavar Menswear Category Retail Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174017', v_clothing_cat_id,
        'Bespoke Super 250s Fine Merino Wool Tuxedo', 'RAYMOND-SUPER-250S-MERINO-TUXEDO',
        'Editorial eveningwear tailoring archetype featuring fine merino wool suiting, satin peak lapels, and Italian sartorial cut inspiration.',
        'Raymond', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
        'ind-12', 'raymond', 'https://www.myraymond.com/men/suits-blazers/', 'OFFICIAL_CATEGORY_DESTINATION',
        'PRICE_UPON_INQUIRY', 'Price upon bespoke inquiry', 'Raymond Flagship Bespoke Consultation Protocol',
        '{"frontendId":"prod-ind-12","uuid":"123e4567-e89b-12d3-a456-426614174017","brandId":"ind-12","brandSlug":"raymond","audience":"Men","subcategory":"Sartorial Suiting","fabric":"Fine Merino Wool Blend & Satin Facing","fit":"Slim Sartorial Cut","sizes":"38R, 40R, 42R, 44R","colors":"Midnight Blue, Deep Charcoal, Formal Noir","destinationUrl":"https://www.myraymond.com/men/suits-blazers/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"PRICE_UPON_INQUIRY","priceFormatted":"Price upon bespoke inquiry","priceSource":"Raymond Flagship Bespoke Consultation Protocol","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174018', v_clothing_cat_id,
        'Regalia Asymmetrical Draped Bandhgala', 'SHANTNU-NIKHIL-ASYMMETRICAL-BANDHGALA',
        'Editorial modern ceremonial silhouette reflecting Shantnu & Nikhil neo-military drape aesthetics, asymmetric flap styling, and emblem detailing.',
        'Shantnu & Nikhil', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=900',
        'ind-16', 'shantnu-and-nikhil', 'https://www.shantanunikhil.com/men/bandhgala/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹88,500 (Category estimate)', 'Shantnu & Nikhil Bandhgala Category Benchmark',
        '{"frontendId":"prod-ind-16","uuid":"123e4567-e89b-12d3-a456-426614174018","brandId":"ind-16","brandSlug":"shantnu-and-nikhil","audience":"Men","subcategory":"Sherwanis & Bandhgalas","fabric":"Silk Matka Blend with Metallic Embellishments","fit":"Structured Military Silhouette","sizes":"38, 40, 42","colors":"Matte Black, Olive Drab, Imperial Cream","destinationUrl":"https://www.shantanunikhil.com/men/bandhgala/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹88,500 (Category estimate)","priceSource":"Shantnu & Nikhil Bandhgala Category Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174019', v_clothing_cat_id,
        'Kids'' Chanderi Hand-Embroidered Kurta & Dhoti Ensemble', 'TORANI-KIDS-CHANDERI-KURTA-SET',
        'Editorial children''s festive attire reflecting nostalgic Chanderi craftsmanship, delicate dori embroidery motifs, and scalloped hem artistry.',
        'Torani', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
        'ind-13', 'torani', 'https://www.torani.in/collections/kids/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹18,500 (Category estimate)', 'Torani Kids Collection Category Benchmark',
        '{"frontendId":"prod-ind-13","uuid":"123e4567-e89b-12d3-a456-426614174019","brandId":"ind-13","brandSlug":"torani","audience":"Kids","subcategory":"Heritage Festive","fabric":"Chanderi Cotton-Silk Blend & Cotton Voile Lining","fit":"Comfortable Festive Silhouette","sizes":"2-3Y, 4-5Y, 6-7Y, 8-9Y","colors":"Gulabi Rose, Haldi Yellow, Champa White","destinationUrl":"https://www.torani.in/collections/kids/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹18,500 (Category estimate)","priceSource":"Torani Kids Collection Category Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174021', v_clothing_cat_id,
        'Kids'' Festive Flared Anarkali & Dupatta Set', 'BIBA-GIRLS-FESTIVE-ANARKALI-SUIT',
        'Editorial celebratory attire for young girls featuring festive flared Anarkali silhouette, foil print motifs, and coordinating dupatta ensemble.',
        'Biba', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=900',
        'ind-24', 'biba', 'https://www.biba.in/girls/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹4,999 (Catalog benchmark)', 'Biba Girls Collection Retail Benchmark',
        '{"frontendId":"prod-ind-24","uuid":"123e4567-e89b-12d3-a456-426614174021","brandId":"ind-24","brandSlug":"biba","audience":"Kids","subcategory":"Heritage Festive","fabric":"Cotton Voile with Gota Detailing","fit":"Flared Anarkali Silhouette","sizes":"3-4Y, 5-6Y, 7-8Y, 9-10Y","colors":"Marigold Orange, Crimson Red, Teal Green","destinationUrl":"https://www.biba.in/girls/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹4,999 (Catalog benchmark)","priceSource":"Biba Girls Collection Retail Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174022', v_clothing_cat_id,
        'Le Smoking Grain de Poudre Wool Tuxedo Jacket', 'SAINT-LAURENT-LE-SMOKING-JACKET',
        'Editorial salute to the iconic Parisian Le Smoking silhouette, showcasing sharp padded shoulders, virgin wool tailoring, and silk satin peak lapels.',
        'Saint Laurent', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
        'int-02', 'saint-laurent', 'https://www.ysl.com/en-in/ready-to-wear/jackets-and-pants/jackets', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹2,85,000 (Landed estimate)', 'Saint Laurent Tailoring Landed Cost Benchmark',
        '{"frontendId":"prod-int-02","uuid":"123e4567-e89b-12d3-a456-426614174022","brandId":"int-02","brandSlug":"saint-laurent","audience":"Women","subcategory":"Tailoring & Suiting","fabric":"Grain de Poudre Virgin Wool with Silk Facing","fit":"Structured Parisian Cut","sizes":"FR 34, FR 36, FR 38, FR 40","colors":"Noir","destinationUrl":"https://www.ysl.com/en-in/ready-to-wear/jackets-and-pants/jackets","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹2,85,000 (Landed estimate)","priceSource":"Saint Laurent Tailoring Landed Cost Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174023', v_clothing_cat_id,
        'Balham Double-Faced Cashmere Belted Overcoat', 'THE-ROW-BALHAM-CASHMERE-COAT',
        'Editorial study in minimalist luxury outerwear, showcasing double-faced cashmere draping, dropped shoulders, and relaxed sash tie styling.',
        'The Row', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
        'int-13', 'the-row', 'https://www.therow.com/collections/women-coats', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹5,20,000 (Landed estimate)', 'The Row Outerwear Collection Landed Cost Benchmark',
        '{"frontendId":"prod-int-09","uuid":"123e4567-e89b-12d3-a456-426614174023","brandId":"int-13","brandSlug":"the-row","audience":"Women","subcategory":"Outerwear","fabric":"Double-Faced Cashmere Blend","fit":"Relaxed Wrap Silhouette","sizes":"US 2, US 4, US 6, US 8","colors":"Oatmeal Melange, Deep Black, Camel","destinationUrl":"https://www.therow.com/collections/women-coats","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹5,20,000 (Landed estimate)","priceSource":"The Row Outerwear Collection Landed Cost Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174024', v_clothing_cat_id,
        'Solomeo Sartorial Cashmere Tailored Suit', 'BRUNELLO-CUCINELLI-SOLOMEO-CASHMERE-SUIT',
        'Editorial appreciation of Solomeo tailoring heritage, featuring deconstructed shoulder architecture and luxurious cashmere-silk fabrications.',
        'Brunello Cucinelli', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=900',
        'int-07', 'brunello-cucinelli', 'https://shop.brunellocucinelli.com/en-in/men/ready-to-wear/suits/', 'OFFICIAL_CATEGORY_DESTINATION',
        'ILLUSTRATIVE_ESTIMATE', '₹4,60,000 (Landed estimate)', 'Brunello Cucinelli Tailoring Landed Cost Benchmark',
        '{"frontendId":"prod-int-10","uuid":"123e4567-e89b-12d3-a456-426614174024","brandId":"int-07","brandSlug":"brunello-cucinelli","audience":"Men","subcategory":"Sartorial Suiting","fabric":"Cashmere & Silk Blend","fit":"Italian Deconstructed Tailored Fit","sizes":"IT 48, IT 50, IT 52, IT 54","colors":"Medium Gray Melange, Navy, Tobacco Brown","destinationUrl":"https://shop.brunellocucinelli.com/en-in/men/ready-to-wear/suits/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"ILLUSTRATIVE_ESTIMATE","priceFormatted":"₹4,60,000 (Landed estimate)","priceSource":"Brunello Cucinelli Tailoring Landed Cost Benchmark","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    ),
    (
        '123e4567-e89b-12d3-a456-426614174025', v_clothing_cat_id,
        'Lesage Hand-Embroidered Tweed Jacket', 'CHANEL-LESAGE-TWEED-JACKET',
        'Editorial tribute to Parisian haute couture tweed craftsmanship, celebrating Lesage embroidery traditions and timeless collarless silhouettes.',
        'Chanel', 0.0000, 'ACTIVE',
        'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&q=80&w=900',
        'int-01', 'chanel', 'https://www.chanel.com/fr/mode/pret-a-porter/vestes/', 'OFFICIAL_CATEGORY_DESTINATION',
        'PRICE_UPON_INQUIRY', 'Price upon atelier inquiry', 'Chanel Salons Privés & Flagship Boutiques Consultation Protocol',
        '{"frontendId":"prod-int-01","uuid":"123e4567-e89b-12d3-a456-426614174025","brandId":"int-01","brandSlug":"chanel","audience":"Women","subcategory":"Haute Couture","fabric":"Tweed Weave with Silk Lining Accents","fit":"Boxy Parisian Silhouette","sizes":"FR 36, FR 38, FR 40","colors":"Ecru & Black Tweed, Navy Tweed, Pastel Pink","destinationUrl":"https://www.chanel.com/fr/mode/pret-a-porter/vestes/","destinationType":"OFFICIAL_CATEGORY_DESTINATION","priceVerificationStatus":"PRICE_UPON_INQUIRY","priceFormatted":"Price upon atelier inquiry","priceSource":"Chanel Salons Privés & Flagship Boutiques Consultation Protocol","isEditorialConcept":true,"isReferral":true,"fulfillmentType":"REFERRAL_LINK"}'
    );

    -- 2.1 Pre-existing non-seed product count
    SELECT COUNT(*) INTO v_pre_existing_count 
    FROM products 
    WHERE id NOT IN (SELECT id FROM tmp_seed_catalog);

    -- 2.2 Deterministic JSONB state fingerprint of all non-seed products and inventory
    SELECT COALESCE(md5(jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'category_id', p.category_id,
            'name', p.name,
            'sku', p.sku,
            'description', p.description,
            'price', p.price,
            'status', p.status,
            'image_url', p.image_url,
            'is_deleted', p.is_deleted,
            'version', p.version,
            'brand', p.brand,
            'attributes', p.attributes,
            'inv_qty', i.quantity_available,
            'inv_res', i.reserved_quantity,
            'inv_version', i.version,
            'has_inv', (i.product_id IS NOT NULL)
        ) ORDER BY p.id
    )::text), 'EMPTY_NON_SEED')
    INTO v_pre_existing_hash
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id NOT IN (SELECT id FROM tmp_seed_catalog);

    -- -------------------------------------------------------------------------
    -- PHASE 3: EXECUTE VALIDATED INSERTION & DEEP IDEMPOTENCY
    -- -------------------------------------------------------------------------
    FOR v_target IN SELECT * FROM tmp_seed_catalog LOOP
        -- 3.1 Independent identifier lookups (ordered for partial unique index safety)
        SELECT id, sku, is_deleted INTO v_by_id FROM products WHERE id = v_target.id;
        SELECT id, sku, is_deleted INTO v_by_sku FROM products WHERE sku = v_target.sku ORDER BY is_deleted ASC LIMIT 1;

        -- Scenario A: Both clean -> Fresh Insert
        IF v_by_id.id IS NULL AND v_by_sku.id IS NULL THEN
            INSERT INTO products (id, category_id, name, sku, description, price, status, image_url, is_deleted, created_at, updated_at, version, brand, attributes)
            VALUES (v_target.id, v_target.category_id, v_target.name, v_target.sku, v_target.description, v_target.price, v_target.status, v_target.image_url, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, v_target.brand, v_target.attributes);

            INSERT INTO inventory (product_id, quantity_available, reserved_quantity, last_updated_at, version)
            VALUES (v_target.id, 0, 0, CURRENT_TIMESTAMP, 0);

        -- Scenario B: Dual collision (UUID belongs to row A, SKU belongs to row B)
        ELSIF v_by_id.id IS NOT NULL AND v_by_sku.id IS NOT NULL AND v_by_id.id <> v_by_sku.id THEN
            RAISE EXCEPTION 'DUAL COLLISION: UUID % belongs to SKU %, but SKU % belongs to UUID %', v_target.id, v_by_id.sku, v_target.sku, v_by_sku.id;

        -- Scenario C: Single collision on UUID
        ELSIF v_by_id.id IS NOT NULL AND v_by_sku.id IS NULL THEN
            RAISE EXCEPTION 'COLLISION: UUID % already exists with SKU % (expected %)', v_target.id, v_by_id.sku, v_target.sku;

        -- Scenario D: Single collision on SKU
        ELSIF v_by_id.id IS NULL AND v_by_sku.id IS NOT NULL THEN
            RAISE EXCEPTION 'COLLISION: SKU % already exists with UUID % (expected %)', v_target.sku, v_by_sku.id, v_target.id;

        -- Scenario E: Both point to the exact same existing record -> Deep Idempotency Verification
        ELSE
            SELECT * INTO v_existing FROM products WHERE id = v_target.id;
            SELECT * INTO v_inv FROM inventory WHERE product_id = v_target.id;

            -- 1. Check active status and tombstone
            IF v_existing.is_deleted THEN
                RAISE EXCEPTION 'TOMBSTONE CONFLICT: Product % (%) is soft-deleted', v_target.sku, v_target.id;
            END IF;

            -- 2. NULL-safe column comparisons using IS DISTINCT FROM
            IF v_existing.name IS DISTINCT FROM v_target.name OR 
               v_existing.brand IS DISTINCT FROM v_target.brand OR 
               v_existing.category_id IS DISTINCT FROM v_target.category_id OR
               v_existing.description IS DISTINCT FROM v_target.description OR
               v_existing.image_url IS DISTINCT FROM v_target.image_url OR
               v_existing.price IS DISTINCT FROM v_target.price OR 
               v_existing.status IS DISTINCT FROM v_target.status THEN
                RAISE EXCEPTION 'DATA DRIFT: Product columns mismatch for % (%)', v_target.sku, v_target.id;
            END IF;

            -- 3. Comprehensive semantic JSONB verification (all 18 fields)
            IF v_existing.attributes::jsonb IS DISTINCT FROM v_target.attributes::jsonb THEN
                RAISE EXCEPTION 'METADATA DRIFT: Attributes JSON mismatch for % (%): existing attributes differ from target specification', v_target.sku, v_target.id;
            END IF;

            -- 4. Differentiated inventory checks
            IF v_inv.product_id IS NULL THEN
                RAISE EXCEPTION 'CORRUPT STATE: Product % (%) exists but has NO inventory row', v_target.sku, v_target.id;
            END IF;

            -- 5. Inventory quantities and version
            IF v_inv.quantity_available IS DISTINCT FROM 0 OR v_inv.reserved_quantity IS DISTINCT FROM 0 THEN
                RAISE EXCEPTION 'INVENTORY DRIFT: Referral product % (%) has non-zero stock (avail=%, res=%)', v_target.sku, v_target.id, v_inv.quantity_available, v_inv.reserved_quantity;
            END IF;

            IF v_inv.version IS DISTINCT FROM 0 THEN
                RAISE EXCEPTION 'INVENTORY DRIFT: Referral product % (%) has non-zero inventory version (%)', v_target.sku, v_target.id, v_inv.version;
            END IF;

            RAISE NOTICE 'Product % (%) verified identical across all attributes. Skipping.', v_target.sku, v_target.id;
        END IF;
    END LOOP;

    -- -------------------------------------------------------------------------
    -- PHASE 4: TARGETED POST-INSERTION ASSERTIONS
    -- -------------------------------------------------------------------------
    -- 4.1 All 14 catalog products verified active
    SELECT COUNT(*) INTO v_verified_catalog_count
    FROM products p
    JOIN tmp_seed_catalog t ON p.id = t.id AND p.sku = t.sku
    WHERE p.is_deleted = false;

    IF v_verified_catalog_count <> 14 THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Expected 14 active catalog products, verified %', v_verified_catalog_count;
    END IF;

    -- 4.2 All 14 referral inventory rows verified zero-stock
    SELECT COUNT(*) INTO v_verified_inventory_count
    FROM inventory i
    JOIN tmp_seed_catalog t ON i.product_id = t.id
    WHERE i.quantity_available = 0 AND i.reserved_quantity = 0 AND i.version = 0;

    IF v_verified_inventory_count <> 14 THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Expected 14 zero-stock referral inventory rows, verified %', v_verified_inventory_count;
    END IF;

    -- 4.3 Fail-Closed verification on legacy SKU-001
    SELECT 
        p.id, p.category_id, p.is_deleted, 
        i.quantity_available, i.reserved_quantity, i.version
    INTO v_sku001_check
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id = v_sku001_id AND p.sku = 'SKU-001';

    IF v_sku001_check.id IS NULL THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Legacy product SKU-001 (%) does not exist', v_sku001_id;
    END IF;

    IF v_sku001_check.is_deleted THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Legacy product SKU-001 (%) is soft-deleted', v_sku001_id;
    END IF;

    IF v_sku001_check.category_id IS DISTINCT FROM v_electronics_cat_id THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Legacy SKU-001 category_id modified! Found %', v_sku001_check.category_id;
    END IF;

    IF v_sku001_check.quantity_available IS NULL THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Legacy product SKU-001 has NO inventory record';
    END IF;

    IF v_sku001_check.quantity_available <> 87 OR v_sku001_check.reserved_quantity <> 0 OR v_sku001_check.version <> 12 THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Legacy SKU-001 inventory modified! Avail: %, Res: %, Ver: %', 
            v_sku001_check.quantity_available, v_sku001_check.reserved_quantity, v_sku001_check.version;
    END IF;

    -- 4.4 Non-target pre-existing product preservation (Count + JSONB Hash)
    SELECT COUNT(*) INTO v_post_existing_count
    FROM products
    WHERE id NOT IN (SELECT id FROM tmp_seed_catalog);

    IF v_post_existing_count <> v_pre_existing_count THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Pre-existing product count changed from % to %', v_pre_existing_count, v_post_existing_count;
    END IF;

    SELECT COALESCE(md5(jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'category_id', p.category_id,
            'name', p.name,
            'sku', p.sku,
            'description', p.description,
            'price', p.price,
            'status', p.status,
            'image_url', p.image_url,
            'is_deleted', p.is_deleted,
            'version', p.version,
            'brand', p.brand,
            'attributes', p.attributes,
            'inv_qty', i.quantity_available,
            'inv_res', i.reserved_quantity,
            'inv_version', i.version,
            'has_inv', (i.product_id IS NOT NULL)
        ) ORDER BY p.id
    )::text), 'EMPTY_NON_SEED')
    INTO v_post_existing_hash
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id NOT IN (SELECT id FROM tmp_seed_catalog);

    IF v_post_existing_hash IS DISTINCT FROM v_pre_existing_hash THEN
        RAISE EXCEPTION 'POST-CHECK FAILED: Pre-existing non-seed products state modified! (pre=%, post=%)', 
            v_pre_existing_hash, v_post_existing_hash;
    END IF;

    RAISE NOTICE 'V5 Migration Successfully Verified: All 14 referral products, legacy SKU-001, and pre-existing state asserted.';
END $$;
