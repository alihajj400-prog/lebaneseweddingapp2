// Sample Lebanese vendors for seeding. These are realistic placeholders.
// You can edit or remove them later in the database.

import type { Database } from '@/integrations/supabase/types';
type VendorCategory = Database['public']['Enums']['vendor_category'];
type LebaneseRegion = Database['public']['Enums']['lebanese_region'];

interface SampleVendor {
  business_name: string;
  category: VendorCategory;
  region: LebaneseRegion;
  starting_price_usd: number;
  description: string;
  instagram: string;
  whatsapp: string;
  phone: string;
  is_featured: boolean;
}

export const SAMPLE_VENDORS: SampleVendor[] = [
  { business_name: 'Beirut Seaview Ballroom', category: 'venue', region: 'beirut', starting_price_usd: 8000, description: 'Elegant waterfront ballroom with panoramic sea views in the heart of Beirut.', instagram: '@beirutseaview', whatsapp: '+961700001', phone: '+961700001', is_featured: true },
  { business_name: 'Byblos Garden Venue', category: 'venue', region: 'mount_lebanon', starting_price_usd: 6000, description: 'Lush garden venue surrounded by centuries-old olive trees near Byblos.', instagram: '@byblosgardens', whatsapp: '+961700002', phone: '+961700002', is_featured: false },
  { business_name: 'Broumana Hilltop Estate', category: 'venue', region: 'mount_lebanon', starting_price_usd: 10000, description: 'Exclusive hilltop estate with breathtaking mountain views in Broumana.', instagram: '@broumana_estate', whatsapp: '+961700003', phone: '+961700003', is_featured: true },
  { business_name: 'Batroun Seaside Resort', category: 'venue', region: 'north', starting_price_usd: 7000, description: 'Charming seaside resort in Batroun with a private beach ceremony option.', instagram: '@batrouresort', whatsapp: '+961700004', phone: '+961700004', is_featured: false },
  { business_name: 'Zahle Valley Hall', category: 'venue', region: 'bekaa', starting_price_usd: 4500, description: 'Spacious event hall overlooking the beautiful Bekaa Valley vineyards.', instagram: '@zahlevalleyhall', whatsapp: '+961700005', phone: '+961700005', is_featured: false },
  { business_name: 'Sidon Heritage Palace', category: 'venue', region: 'south', starting_price_usd: 5000, description: 'Historic palace venue with traditional Lebanese architecture in Sidon.', instagram: '@sidonpalace', whatsapp: '+961700006', phone: '+961700006', is_featured: false },
  { business_name: 'Jounieh Bay Terrace', category: 'venue', region: 'mount_lebanon', starting_price_usd: 7500, description: 'Stunning terrace venue overlooking Jounieh Bay and the Harissa statue.', instagram: '@jouniehterrace', whatsapp: '+961700007', phone: '+961700007', is_featured: true },

  // ── Photographers ──
  { business_name: 'Cedars Photography Studio', category: 'photographer', region: 'beirut', starting_price_usd: 2000, description: 'Award-winning wedding photography with a storytelling approach.', instagram: '@cedarsphotography', whatsapp: '+961700010', phone: '+961700010', is_featured: true },
  { business_name: 'Tripoli Lens Studio', category: 'photographer', region: 'north', starting_price_usd: 1200, description: 'Creative wedding photography capturing authentic Lebanese moments.', instagram: '@tripolilens', whatsapp: '+961700011', phone: '+961700011', is_featured: false },
  { business_name: 'Mount Lebanon Photo Co.', category: 'photographer', region: 'mount_lebanon', starting_price_usd: 1800, description: 'Fine art wedding photography with cinematic editing style.', instagram: '@mlphotoco', whatsapp: '+961700012', phone: '+961700012', is_featured: false },
  { business_name: 'Bekaa Valley Photography', category: 'photographer', region: 'bekaa', starting_price_usd: 1000, description: 'Natural light photography specializing in outdoor vineyard weddings.', instagram: '@bekaaphotos', whatsapp: '+961700013', phone: '+961700013', is_featured: false },

  // ── Videographers ──
  { business_name: 'Beirut Cinematic Films', category: 'videographer', region: 'beirut', starting_price_usd: 2500, description: 'Cinematic wedding films with Hollywood-quality production value.', instagram: '@beirutcinematic', whatsapp: '+961700020', phone: '+961700020', is_featured: true },
  { business_name: 'Lebanon Wedding Films', category: 'videographer', region: 'mount_lebanon', starting_price_usd: 1800, description: 'Emotional wedding videos that capture your love story beautifully.', instagram: '@lbweddingfilms', whatsapp: '+961700021', phone: '+961700021', is_featured: false },
  { business_name: 'North Coast Video Productions', category: 'videographer', region: 'north', starting_price_usd: 1500, description: 'Professional wedding videography with drone aerial coverage.', instagram: '@northcoastvideo', whatsapp: '+961700022', phone: '+961700022', is_featured: false },

  // ── DJs ──
  { business_name: 'Downtown DJ & Entertainment', category: 'dj', region: 'beirut', starting_price_usd: 1000, description: 'High-energy DJ mixing Arabic and international hits for unforgettable nights.', instagram: '@downtowndj_lb', whatsapp: '+961700030', phone: '+961700030', is_featured: true },
  { business_name: 'DJ Khalil Events', category: 'dj', region: 'mount_lebanon', starting_price_usd: 800, description: 'Professional DJ services with top-of-the-line sound equipment.', instagram: '@djkhalilevents', whatsapp: '+961700031', phone: '+961700031', is_featured: false },
  { business_name: 'Batroun Beach DJ', category: 'dj', region: 'north', starting_price_usd: 700, description: 'Chill beach vibes to party anthems — perfect for outdoor weddings.', instagram: '@batrounbeachdj', whatsapp: '+961700032', phone: '+961700032', is_featured: false },

  // ── Sound & Lighting ──
  { business_name: 'Lumière Wedding Lighting', category: 'sound_lighting', region: 'beirut', starting_price_usd: 1500, description: 'Dramatic lighting design and crystal-clear sound systems for weddings.', instagram: '@lumiere_lb', whatsapp: '+961700033', phone: '+961700033', is_featured: false },
  { business_name: 'Soundwave Lebanon', category: 'sound_lighting', region: 'mount_lebanon', starting_price_usd: 1200, description: 'Professional sound and lighting packages for venues of all sizes.', instagram: '@soundwavelb', whatsapp: '+961700034', phone: '+961700034', is_featured: false },

  // ── Zaffé ──
  { business_name: 'Beirut Royal Zaffe', category: 'zaffe', region: 'beirut', starting_price_usd: 1200, description: 'Traditional Lebanese zaffé with drummers, dancers, and fireworks.', instagram: '@beirutroyalzaffe', whatsapp: '+961700040', phone: '+961700040', is_featured: true },
  { business_name: 'Mount Lebanon Zaffe Group', category: 'zaffe', region: 'mount_lebanon', starting_price_usd: 900, description: 'Energetic zaffé performances with a modern twist on tradition.', instagram: '@mlzaffegroup', whatsapp: '+961700041', phone: '+961700041', is_featured: false },
  { business_name: 'South Lebanon Heritage Zaffe', category: 'zaffe', region: 'south', starting_price_usd: 800, description: 'Authentic southern Lebanese zaffé preserving cultural traditions.', instagram: '@southzaffe', whatsapp: '+961700042', phone: '+961700042', is_featured: false },

  // ── Bridal Dresses ──
  { business_name: 'Maison de la Mariée', category: 'bridal_dress', region: 'beirut', starting_price_usd: 3000, description: 'Haute couture bridal gowns from top Lebanese and international designers.', instagram: '@maisonmariee_lb', whatsapp: '+961700050', phone: '+961700050', is_featured: true },
  { business_name: 'Hamra Bridal Boutique', category: 'bridal_dress', region: 'beirut', starting_price_usd: 1500, description: 'Beautiful collection of bridal dresses from classic to contemporary.', instagram: '@hamrabridalb', whatsapp: '+961700051', phone: '+961700051', is_featured: false },
  { business_name: 'Jounieh Bridal Gallery', category: 'bridal_dress', region: 'mount_lebanon', starting_price_usd: 2000, description: 'Curated selection of designer bridal gowns with personal styling.', instagram: '@jouniehbridal', whatsapp: '+961700052', phone: '+961700052', is_featured: false },

  // ── Makeup Artists ──
  { business_name: 'Glam by Nour', category: 'makeup_artist', region: 'beirut', starting_price_usd: 500, description: 'Luxury bridal makeup with a natural, radiant finish. Celebrity favorite.', instagram: '@glambynour', whatsapp: '+961700060', phone: '+961700060', is_featured: true },
  { business_name: 'Beauty Studio Beirut', category: 'makeup_artist', region: 'beirut', starting_price_usd: 350, description: 'Professional bridal makeup and hair styling for your perfect day.', instagram: '@beautystudiobeirut', whatsapp: '+961700061', phone: '+961700061', is_featured: false },
  { business_name: 'Saida Glam Studio', category: 'makeup_artist', region: 'south', starting_price_usd: 250, description: 'Talented makeup artist creating stunning bridal looks in South Lebanon.', instagram: '@saidaglam', whatsapp: '+961700062', phone: '+961700062', is_featured: false },

  // ── Flowers ──
  { business_name: 'Byblos Floral & Decor', category: 'flowers', region: 'mount_lebanon', starting_price_usd: 1500, description: 'Stunning floral arrangements and venue décor with Lebanese elegance.', instagram: '@byblosfloral', whatsapp: '+961700070', phone: '+961700070', is_featured: true },
  { business_name: 'Rose de Beirut', category: 'flowers', region: 'beirut', starting_price_usd: 2000, description: 'Luxury wedding floristry with imported and local seasonal blooms.', instagram: '@rosedebeirut', whatsapp: '+961700071', phone: '+961700071', is_featured: false },
  { business_name: 'Bloom & Branch Bekaa', category: 'flowers', region: 'bekaa', starting_price_usd: 800, description: 'Farm-fresh floral designs sourced from the Bekaa Valley fields.', instagram: '@bloombranchbekaa', whatsapp: '+961700072', phone: '+961700072', is_featured: false },

  // ── Car Rental ──
  { business_name: 'Beirut Luxury Rides', category: 'car_rental', region: 'beirut', starting_price_usd: 400, description: 'Luxury wedding cars including Mercedes, Rolls-Royce, and vintage classics.', instagram: '@beirutluxuryrides', whatsapp: '+961700080', phone: '+961700080', is_featured: true },
  { business_name: 'Lebanon Vintage Cars', category: 'car_rental', region: 'mount_lebanon', starting_price_usd: 300, description: 'Beautiful vintage and classic cars for a memorable wedding entrance.', instagram: '@lbvintagecars', whatsapp: '+961700081', phone: '+961700081', is_featured: false },

  // ── Catering ──
  { business_name: 'Phoenicia Catering', category: 'catering', region: 'beirut', starting_price_usd: 3000, description: 'Premium Lebanese and international cuisine for weddings of all sizes.', instagram: '@phoeniciacatering', whatsapp: '+961700090', phone: '+961700090', is_featured: true },
  { business_name: 'Bekaa Valley Kitchen', category: 'catering', region: 'bekaa', starting_price_usd: 2000, description: 'Authentic Lebanese meze and grills with farm-to-table ingredients.', instagram: '@bekaavalleykitchen', whatsapp: '+961700091', phone: '+961700091', is_featured: false },
  { business_name: 'Tyre Seaside Catering', category: 'catering', region: 'south', starting_price_usd: 1800, description: 'Fresh seafood and traditional Lebanese dishes for coastal weddings.', instagram: '@tyreseasidecatering', whatsapp: '+961700092', phone: '+961700092', is_featured: false },

  // ── Wedding Planners ──
  { business_name: 'Cedar & Co. Wedding Planners', category: 'wedding_planner', region: 'beirut', starting_price_usd: 3000, description: 'Full-service wedding planning bringing your Lebanese fairy tale to life.', instagram: '@cedarandco', whatsapp: '+961700100', phone: '+961700100', is_featured: true },
  { business_name: 'Plan It Perfect Lebanon', category: 'wedding_planner', region: 'mount_lebanon', starting_price_usd: 2000, description: 'Boutique wedding planning with attention to every detail.', instagram: '@planitperfectlb', whatsapp: '+961700101', phone: '+961700101', is_featured: false },

  // ── Jewelry ──
  { business_name: 'Beirut Diamond House', category: 'jewelry', region: 'beirut', starting_price_usd: 2000, description: 'Exquisite diamond engagement and wedding rings crafted in Lebanon.', instagram: '@beirutdiamondhouse', whatsapp: '+961700110', phone: '+961700110', is_featured: true },
  { business_name: 'Gold Souk Jewelers', category: 'jewelry', region: 'beirut', starting_price_usd: 1000, description: 'Traditional and modern gold jewelry at competitive prices.', instagram: '@goldsoukjewelers', whatsapp: '+961700111', phone: '+961700111', is_featured: false },

  // ── Invitations ──
  { business_name: 'Papier Beirut', category: 'invitations', region: 'beirut', starting_price_usd: 300, description: 'Luxury letterpress and digital wedding invitations with Lebanese flair.', instagram: '@papierbeirut', whatsapp: '+961700120', phone: '+961700120', is_featured: false },
  { business_name: 'Invite & Celebrate', category: 'invitations', region: 'mount_lebanon', starting_price_usd: 200, description: 'Beautiful bilingual Arabic-English wedding invitation suites.', instagram: '@invitecelebrate', whatsapp: '+961700121', phone: '+961700121', is_featured: false },

  // ── Cake & Sweets ──
  { business_name: 'Sweet Beirut Patisserie', category: 'cake', region: 'beirut', starting_price_usd: 500, description: 'Stunning multi-tier wedding cakes and traditional Lebanese sweets.', instagram: '@sweetbeirutcakes', whatsapp: '+961700130', phone: '+961700130', is_featured: true },
  { business_name: 'Tripoli Sweets House', category: 'cake', region: 'north', starting_price_usd: 300, description: 'Famous North Lebanon sweets and custom wedding cake creations.', instagram: '@tripolisweetshouse', whatsapp: '+961700131', phone: '+961700131', is_featured: false },

  // ── Entertainment ──
  { business_name: 'Beirut Fireworks Co.', category: 'entertainment', region: 'beirut', starting_price_usd: 800, description: 'Spectacular fireworks and pyrotechnics displays for wedding celebrations.', instagram: '@beirutfireworks', whatsapp: '+961700140', phone: '+961700140', is_featured: false },
  { business_name: 'Lebanon Live Band', category: 'entertainment', region: 'mount_lebanon', starting_price_usd: 1500, description: 'Live Arabic and international music band for wedding receptions.', instagram: '@lbleband', whatsapp: '+961700141', phone: '+961700141', is_featured: true },
];
