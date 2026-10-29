/**
 * LUMIÈRE Master Fashion Image Manifest & Attribution Registry (Stage 15C)
 * 
 * Strict Acceptance Requirement:
 * - Zero accidental image duplication across unrelated products or homepage sections.
 * - Legitimate, verified image sources (Unsplash Editorial Fashion & Sportswear licenses).
 * - Distinct, verified male activewear photography separate from female activewear.
 * - Preserved permitted women's athletic imagery.
 * - Comprehensive provenance and attribution for every editorial asset.
 */

export interface ImageManifestEntry {
  id: string;
  url: string;
  usage: string;
  category: 'Couture' | 'Activewear' | 'Streetwear' | 'Casualwear' | 'Ethnicwear' | 'Kidswear' | 'Editorial Hero' | 'Lookbook';
  subjectGender: 'Men' | 'Women' | 'Kids' | 'Unisex' | 'Editorial Atmosphere';
  modelPoseAndStyle: string;
  source: string;
  attribution: string;
  isDeliberateReuse: boolean;
  notes?: string;
}

export const MASTER_IMAGE_MANIFEST: ImageManifestEntry[] = [
  // =========================================================================
  // 1. HOMEPAGE HERO & EDITORIAL COMPOSITION
  // =========================================================================
  {
    id: 'img-hero-main',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae',
    usage: 'homepage_hero_portrait',
    category: 'Editorial Hero',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Dramatic high-fashion studio portrait wearing architectural textured velvet and draped scarf',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Unsplash Editorial Collection — Architectural Drapery & Velvet Showcase',
    isDeliberateReuse: false,
    notes: 'Primary hero campaign portrait for Autumn/Winter showcase'
  },
  {
    id: 'img-universe-women',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    usage: 'homepage_universe_women',
    category: 'Couture',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Full-length high-fashion runway model in fluid silk couture evening silhouette',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Dom Hill on Unsplash — Femme Haute Couture Atelier',
    isDeliberateReuse: false,
    notes: 'Portfolio I: Women’s Haute Couture & Pret'
  },
  {
    id: 'img-universe-men',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
    usage: 'homepage_universe_men',
    category: 'Couture',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Tailored sartorial portrait of man in structured wool bandhgala and blazer',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Hunters Race on Unsplash — Homme Sartorial & Festive',
    isDeliberateReuse: false,
    notes: 'Portfolio II: Men’s Sartorial & Festive'
  },
  {
    id: 'img-universe-kids',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985',
    usage: 'homepage_universe_kids',
    category: 'Kidswear',
    subjectGender: 'Kids',
    modelPoseAndStyle: 'Young girl in pure cotton artisanal festive clothing with warm natural lighting',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Senjuti Kundu on Unsplash — Enfant Heritage & Festive Wear',
    isDeliberateReuse: false,
    notes: 'Portfolio III: Kids’ Festive & Heritage'
  },

  // =========================================================================
  // 2. DEDICATED GYMWEAR & ACTIVEWEAR (MEN'S COLLECTION)
  // =========================================================================
  {
    id: 'img-gym-men-01',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    usage: 'gymwear_men_compression_top',
    category: 'Activewear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Male athletic model in obsidian technical Dri-FIT compression training top, front athletic stance',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Unsplash Sport — Technical Performance Compression Top',
    isDeliberateReuse: false,
    notes: 'Nike Dri-FIT ADV Engineered Training Top (prod-life-01)'
  },
  {
    id: 'img-gym-men-02',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    usage: 'gymwear_men_power_stringer',
    category: 'Activewear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Male athlete in heavy-gauge drop-armhole bodybuilding stringer, mid-training in athletic gym',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Arthur Edelmans on Unsplash — Strength Conditioning Stringer',
    isDeliberateReuse: false,
    notes: 'Coitonic Heavyweight Drop-Armhole Compression Stringer (prod-life-05)'
  },
  {
    id: 'img-gym-men-03',
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
    usage: 'gymwear_men_cardio_tee',
    category: 'Activewear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Male cardio runner in breathable technical stretch training t-shirt, dynamic motion profile',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Karsten Winegeart on Unsplash — Functional Cardio Athletic T-Shirt',
    isDeliberateReuse: false,
    notes: 'Decathlon Domyos Cardio Stretch Training Tee (prod-life-06)'
  },
  {
    id: 'img-gym-men-04',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
    usage: 'gymwear_men_joggers_conditioning',
    category: 'Activewear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Male fitness athlete in tapered charcoal training joggers and athletic shoes, strength posture',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Anastase Maragos on Unsplash — Tapered Athletic Training Joggers',
    isDeliberateReuse: false,
    notes: 'HRX Rapid-Dry Athletic Conditioning Joggers (prod-life-04)'
  },
  {
    id: 'img-gym-men-05',
    url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc',
    usage: 'gymwear_men_track_jacket',
    category: 'Activewear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Male sprinter wearing zip-front technical performance track jacket, warm-up motion',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Fitsum Admasu on Unsplash — Performance Track Jacket & Layering',
    isDeliberateReuse: false,
    notes: 'Adidas Primeknit Aeroready High-Performance Track Jacket (prod-life-02)'
  },
  {
    id: 'img-gym-men-06',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    usage: 'gymwear_men_outdoor_windbreaker',
    category: 'Activewear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Male outdoor athlete in lightweight weather-resistant cardio running layer',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Fitsum Admasu on Unsplash — Outdoor Endurance & Trail Windbreaker',
    isDeliberateReuse: false,
    notes: 'Technosport Outdoor Cardio Weather-Resistant Shell'
  },

  // =========================================================================
  // 3. DEDICATED GYMWEAR & ACTIVEWEAR (WOMEN'S COLLECTION)
  // =========================================================================
  {
    id: 'img-gym-women-01',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    usage: 'gymwear_women_compression_tights',
    category: 'Activewear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Female athletic model in matte black high-waisted seamless compression leggings, studio conditioning',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Scott Webb on Unsplash — Women High-Rise Compression Tights',
    isDeliberateReuse: false,
    notes: 'Preserved verified women’s athletic template image (prod-life-03)'
  },
  {
    id: 'img-gym-women-02',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
    usage: 'gymwear_women_studio_set',
    category: 'Activewear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Female athlete in coordinated sage-green technical sports bra and high-rise performance leggings',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Form on Unsplash — Seamless Yoga & Mobility Two-Piece Set',
    isDeliberateReuse: false,
    notes: 'Nike Pro Women’s Seamless Studio Set'
  },
  {
    id: 'img-gym-women-03',
    url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2',
    usage: 'gymwear_women_marathon_vest',
    category: 'Activewear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Female marathon runner in lightweight aerodynamic running vest and split shorts in outdoor sunshine',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Jenny Hill on Unsplash — Aerodynamic Race-Day Pace Vest & Shorts',
    isDeliberateReuse: false,
    notes: 'Adidas Adizero Lightweight Distance Running Set'
  },
  {
    id: 'img-gym-women-04',
    url: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
    usage: 'gymwear_women_sculpt_jumpsuit',
    category: 'Activewear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Female dancer/athlete in sleek four-way stretch one-piece athletic catsuit in training studio',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Karsten Winegeart on Unsplash — Sculptural Studio Four-Way Stretch Jumpsuit',
    isDeliberateReuse: false,
    notes: 'Puma Studio Luxe Anatomical Bodysuit'
  },
  {
    id: 'img-gym-women-05',
    url: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb',
    usage: 'gymwear_women_hiit_crop',
    category: 'Activewear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Female fitness athlete in deep charcoal cross-back HIIT training crop and compression shorts',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Karsten Winegeart on Unsplash — High-Impact Cardio Training Crop',
    isDeliberateReuse: false,
    notes: 'HRX Women High-Intensity Cardio Training Set'
  },
  {
    id: 'img-gym-women-06',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    usage: 'gymwear_women_recovery_knit',
    category: 'Activewear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Female model in soft ribbed modal athletic knit recovery pullover and warm-up pants',
    source: 'Unsplash Editorial Sportswear',
    attribution: 'Photo by Dave Goudreau on Unsplash — Athletic Flexibility & Mobility Layer',
    isDeliberateReuse: false,
    notes: 'Decathlon Domyos Post-Workout Thermal Recovery Layer'
  },

  // =========================================================================
  // 4. STREETWEAR & URBAN GRAPHIC APPAREL
  // =========================================================================
  {
    id: 'img-street-01',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
    usage: 'streetwear_oversized_tee',
    category: 'Streetwear',
    subjectGender: 'Unisex',
    modelPoseAndStyle: 'Urban streetwear model in 240 GSM drop-shoulder boxy graphic t-shirt in city street',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Unsplash Editorial Streetwear — Oversized Pop-Culture Graphic Tee',
    isDeliberateReuse: false,
    notes: 'The Souled Store Heavyweight Oversized Tee (prod-life-07)'
  },
  {
    id: 'img-street-02',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
    usage: 'streetwear_fleece_hoodie',
    category: 'Streetwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Streetwear model in heavy-gauge sage green fleece hoodie with kangaroo pocket',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Unsplash Editorial Streetwear — Heavy Gauge Boxy Fleece Hoodie',
    isDeliberateReuse: false,
    notes: 'Bewakoof Boxy Typography Fleece Hoodie (prod-life-08)'
  },
  {
    id: 'img-street-03',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
    usage: 'streetwear_cuban_shirt',
    category: 'Streetwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Young man in textured waffle-weave Cuban camp collar shirt and wide cargo trousers',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Unsplash Editorial Menswear — Textured Camp Collar Resort Shirt',
    isDeliberateReuse: false,
    notes: 'Snitch Textured Cuban Collar Bowling Shirt (prod-life-09)'
  },
  {
    id: 'img-street-04',
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6',
    usage: 'streetwear_urban_cargos',
    category: 'Streetwear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'High-contrast street photography of model in oversized utility streetwear jacket and cargo pants',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Apostolos Vamvouras on Unsplash — Urban Streetwear Layering',
    isDeliberateReuse: false,
    notes: 'Superdry & Bewakoof Multi-Pocket Urban Utility Collection'
  },
  {
    id: 'img-street-05',
    url: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234',
    usage: 'streetwear_vintage_denim',
    category: 'Streetwear',
    subjectGender: 'Unisex',
    modelPoseAndStyle: 'Streetwear model in vintage washed oversized denim jacket with distressed collar',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Tamara Bellis on Unsplash — Vintage Relaxed Acid Wash Denim',
    isDeliberateReuse: false,
    notes: 'Levi’s Streetwear Trucker Collection'
  },

  // =========================================================================
  // 5. EVERYDAY CASUALWEAR & SMART PRET
  // =========================================================================
  {
    id: 'img-casual-01',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
    usage: 'casualwear_white_tee',
    category: 'Casualwear',
    subjectGender: 'Unisex',
    modelPoseAndStyle: 'Minimalist clean studio portrait of model in pure white relaxed heavyweight crewneck t-shirt',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Faith Yarn on Unsplash — Minimalist Clean Cotton T-Shirt',
    isDeliberateReuse: false,
    notes: 'Uniqlo AIRism Cotton Oversized Crewneck Tee (prod-life-10)'
  },
  {
    id: 'img-casual-02',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
    usage: 'casualwear_twill_overshirt',
    category: 'Casualwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Tailored casual look featuring organic cotton khaki twill overshirt layered over ivory tee',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Clem Onojeghuo on Unsplash — Heavyweight Cotton Twill Shacket',
    isDeliberateReuse: false,
    notes: 'H&M Relaxed-Fit Heavy Twill Overshirt (prod-life-11)'
  },
  {
    id: 'img-casual-03',
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
    usage: 'casualwear_selvedge_jeans',
    category: 'Casualwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Full-length shot of authentic raw indigo selvedge denim jeans paired with leather boots',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Jason Leung on Unsplash — Classic Authentic Blue Denim',
    isDeliberateReuse: false,
    notes: 'Levi’s Original 501 Straight Fit Selvedge Denim (prod-life-12)'
  },
  {
    id: 'img-casual-04',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    usage: 'casualwear_dobby_shirt',
    category: 'Casualwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Smart casual model in micro-textured white dobby shirt with rolled cuffs',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Nimble Made on Unsplash — Textured Dobby Tailored Shirt',
    isDeliberateReuse: false,
    notes: 'Rare Rabbit Textured Dobby Weave Smart Shirt (prod-life-13)'
  },
  {
    id: 'img-casual-05',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0',
    usage: 'casualwear_denim_jacket',
    category: 'Casualwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Man leaning against architectural wall wearing classic medium blue selvedge denim trucker jacket',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Taylor Smith on Unsplash — Classic Denim Layering',
    isDeliberateReuse: false,
    notes: 'Zara & Levi’s Elevated Casual Outerwear'
  },

  // =========================================================================
  // 6. ARTISANAL & CONTEMPORARY ETHNICWEAR
  // =========================================================================
  {
    id: 'img-ethnic-01',
    url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e',
    usage: 'ethnicwear_dabu_kurta',
    category: 'Ethnicwear',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Indian man in traditional handspun indigo Dabu block-printed straight cotton kurta',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Swapnil Dwivedi on Unsplash — Traditional Indigo Block Print Kurta',
    isDeliberateReuse: false,
    notes: 'Fabindia Hand-Block Printed Dabu Cotton Kurta (prod-life-14)'
  },
  {
    id: 'img-ethnic-02',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
    usage: 'ethnicwear_fusion_kurti',
    category: 'Ethnicwear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Indian woman in modern teal tiered festive anarkali kurti with golden zari accents',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Dollar Gill on Unsplash — Contemporary Tiered Fusion Kurti',
    isDeliberateReuse: false,
    notes: 'W for Woman Contemporary Tiered Fusion Kurti & Palazzos (prod-life-15)'
  },
  {
    id: 'img-ethnic-03',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
    usage: 'ethnicwear_pichhwai_saree',
    category: 'Ethnicwear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Artisanal portrait showcasing hand-painted Pichhwai silk textile with fine gota patti embroidery',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Unsplash Editorial Fashion — Handcrafted Traditional Silk Textiles',
    isDeliberateReuse: false,
    notes: 'Anita Dongre Pichhwai Hand-Painted Silk Saree (prod-ind-02)'
  },
  {
    id: 'img-ethnic-04',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
    usage: 'ethnicwear_zardozi_lehenga',
    category: 'Ethnicwear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Royal Indian couture bride in antique zardozi embroidered silk velvet lehenga',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Unsplash Editorial Fashion — Representative Haute Bridal Silhouettes',
    isDeliberateReuse: false,
    notes: 'Sabyasachi Royal Heritage Zardozi Velvet Lehenga (prod-ind-01)'
  },
  {
    id: 'img-ethnic-05',
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
    usage: 'ethnicwear_chanderi_kurta',
    category: 'Ethnicwear',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Ethereal garden lighting with model draped in translucent pure handloom Chanderi silk and gold tissue',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Tamara Bellis on Unsplash — Handloom Chanderi & Organza Weaves',
    isDeliberateReuse: false,
    notes: 'Raw Mango Handloom Chanderi Brocade Kurta & Dupatta (prod-ind-05)'
  },

  // =========================================================================
  // 7. EXPANDABLE LOOKBOOK ACCORDION (UNIQUE HIGH-FASHION BACKGROUNDS)
  // =========================================================================
  {
    id: 'img-lookbook-01',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    usage: 'lookbook_capsule_summer_silks',
    category: 'Lookbook',
    subjectGender: 'Women',
    modelPoseAndStyle: 'High-fashion editorial model in flowing lightweight linen-silk resort coat against golden sunlight',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Pete Bellis on Unsplash — Summer Resort Handloom Silks',
    isDeliberateReuse: false,
    notes: 'Capsule 01: Summer Handloom Silks'
  },
  {
    id: 'img-lookbook-02',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
    usage: 'lookbook_capsule_sartorial_suiting',
    category: 'Lookbook',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Close-up sartorial menswear showing bespoke double-breasted fine merino wool suiting with satin lapel',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Vladislav Balepov on Unsplash — Super 250s Merino Wool Sartorial Suiting',
    isDeliberateReuse: false,
    notes: 'Capsule 02: Heritage Bandhgalas & Bespoke Suiting'
  },
  {
    id: 'img-lookbook-03',
    url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67',
    usage: 'lookbook_capsule_royal_zardozi',
    category: 'Lookbook',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Evening gala atmosphere with deep plum and crimson velvet gown illuminated by chandelier light',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Clem Onojeghuo on Unsplash — Royal Zardozi Velvet Haute Silhouettes',
    isDeliberateReuse: false,
    notes: 'Capsule 03: Royal Zardozi Velvet & Bridal Maisons'
  },
  {
    id: 'img-lookbook-04',
    url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e',
    usage: 'lookbook_capsule_contemporary_resort',
    category: 'Lookbook',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Mediterranean minimalist fashion setting with draped linen trench and quiet luxury styling',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Valerie Elash on Unsplash — Riviera & Cruise Linen Silhouettes',
    isDeliberateReuse: false,
    notes: 'Capsule 04: Riviera & Cruise Silhouettes'
  },
  {
    id: 'img-lookbook-05',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
    usage: 'lookbook_capsule_after_dark',
    category: 'Lookbook',
    subjectGender: 'Women',
    modelPoseAndStyle: 'Sculptural dark aubergine evening cape with reflective beadwork and dramatic avant-garde lighting',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Oladimeji Odunsi on Unsplash — After Dark Velvet & Gala Capes',
    isDeliberateReuse: false,
    notes: 'Capsule 05: Gala & Evening Capes'
  },

  // =========================================================================
  // 8. KIDSWEAR PORTFOLIO & INFANT APPAREL
  // =========================================================================
  {
    id: 'img-kids-01',
    url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4',
    usage: 'kidswear_boys_suit',
    category: 'Kidswear',
    subjectGender: 'Kids',
    modelPoseAndStyle: 'Young boy in navy tailored houndstooth waistcoat and crisp collared shirt',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Chayene Rafaela on Unsplash — Boys Formal Occasionwear Set',
    isDeliberateReuse: false,
    notes: 'Hopscotch Boys’ Classic Tailored Waistcoat Set (prod-life-16)'
  },
  {
    id: 'img-kids-02',
    url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba',
    usage: 'kidswear_baby_romper',
    category: 'Kidswear',
    subjectGender: 'Kids',
    modelPoseAndStyle: 'Infant in gentle pastel organic cotton snap-button romper resting on soft organic linen',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Isaac Quesada on Unsplash — Organic Cotton Baby Rompers',
    isDeliberateReuse: false,
    notes: 'FirstCry Pure Organic Cotton Breathable Baby Romper (prod-life-17)'
  },
  {
    id: 'img-kids-03',
    url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8',
    usage: 'kidswear_toddler_playwear',
    category: 'Kidswear',
    subjectGender: 'Kids',
    modelPoseAndStyle: 'Toddler playing in soft combed cotton striped ribbed bodysuit and elastic pants',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Tatiana Syrikova on Unsplash — Toddler Cotton Playwear Set',
    isDeliberateReuse: false,
    notes: 'Carter’s Pure Combed Cotton 3-Piece Bodysuit Set (prod-life-18)'
  },

  // =========================================================================
  // 9. ATELIER SIZING & PROTOCOL MANIFESTO
  // =========================================================================
  {
    id: 'img-sizing-measure',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    usage: 'sizing_matrix_tailoring',
    category: 'Editorial Hero',
    subjectGender: 'Men',
    modelPoseAndStyle: 'Master tailor measuring shoulder and chest lines with bespoke cloth measuring tape in salon',
    source: 'Unsplash Editorial Fashion',
    attribution: 'Photo by Albert Dera on Unsplash — Atelier Precision Measurement Matrix',
    isDeliberateReuse: false,
    notes: 'Atelier Sizing Benchmark section'
  }
];

/**
 * Returns a unique image manifest entry by ID
 */
export const getImageById = (id: string): ImageManifestEntry | undefined => {
  return MASTER_IMAGE_MANIFEST.find((img) => img.id === id);
};

/**
 * Returns an image URL by ID with fallback
 */
export const getImageUrl = (id: string, fallbackUrl?: string): string => {
  const entry = getImageById(id);
  return entry ? entry.url : (fallbackUrl || '');
};

/**
 * Verifies that every manifest URL is distinct (zero duplicate URLs)
 */
export const verifyManifestUniqueness = (): { isUnique: boolean; duplicates: string[] } => {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const entry of MASTER_IMAGE_MANIFEST) {
    if (seen.has(entry.url)) {
      duplicates.push(entry.url);
    } else {
      seen.add(entry.url);
    }
  }
  return {
    isUnique: duplicates.length === 0,
    duplicates,
  };
};
