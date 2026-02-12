// Lebanese Regions
export const LEBANESE_REGIONS = [
  { value: 'beirut', label: 'Beirut' },
  { value: 'mount_lebanon', label: 'Mount Lebanon' },
  { value: 'north', label: 'North Lebanon' },
  { value: 'south', label: 'South Lebanon' },
  { value: 'bekaa', label: 'Bekaa' },
  { value: 'nabatieh', label: 'Nabatieh' },
] as const;

// Vendor Categories
export const VENDOR_CATEGORIES = [
  { value: 'venue', label: 'Venues', icon: 'Building2' },
  { value: 'photographer', label: 'Photographers', icon: 'Camera' },
  { value: 'videographer', label: 'Videographers', icon: 'Video' },
  { value: 'dj', label: 'DJs', icon: 'Music' },
  { value: 'sound_lighting', label: 'Sound & Lighting', icon: 'Lightbulb' },
  { value: 'zaffe', label: 'Zaffé', icon: 'Drum' },
  { value: 'bridal_dress', label: 'Bridal Dresses', icon: 'Shirt' },
  { value: 'makeup_artist', label: 'Makeup Artists', icon: 'Sparkles' },
  { value: 'flowers', label: 'Flower Designers', icon: 'Flower2' },
  { value: 'car_rental', label: 'Car Rentals', icon: 'Car' },
  { value: 'catering', label: 'Catering', icon: 'UtensilsCrossed' },
  { value: 'wedding_planner', label: 'Wedding Planners', icon: 'Calendar' },
  { value: 'jewelry', label: 'Jewelry', icon: 'Gem' },
  { value: 'invitations', label: 'Invitations', icon: 'Mail' },
  { value: 'cake', label: 'Cake & Sweets', icon: 'Cake' },
  { value: 'entertainment', label: 'Entertainment', icon: 'PartyPopper' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
] as const;

// Default Budget Categories for Lebanese Weddings
export const DEFAULT_BUDGET_CATEGORIES = [
  { name: 'Venue', estimated_usd: 5000 },
  { name: 'Catering', estimated_usd: 3000 },
  { name: 'Photography', estimated_usd: 2000 },
  { name: 'Videography', estimated_usd: 1500 },
  { name: 'DJ & Music', estimated_usd: 1000 },
  { name: 'Zaffé', estimated_usd: 800 },
  { name: 'Bridal Dress', estimated_usd: 2000 },
  { name: 'Groom Suit', estimated_usd: 500 },
  { name: 'Makeup & Hair', estimated_usd: 400 },
  { name: 'Flowers & Decorations', estimated_usd: 1500 },
  { name: 'Wedding Car', estimated_usd: 300 },
  { name: 'Invitations', estimated_usd: 200 },
  { name: 'Cake & Sweets', estimated_usd: 500 },
  { name: 'Jewelry', estimated_usd: 1000 },
  { name: 'Honeymoon', estimated_usd: 3000 },
  { name: 'Miscellaneous', estimated_usd: 500 },
];

// Default Checklist Items (12 months timeline)
export const DEFAULT_CHECKLIST_ITEMS = [
  // 12 months before
  { title: 'Set a wedding budget', category: 'Planning', due_months_before: 12 },
  { title: 'Choose your wedding date', category: 'Planning', due_months_before: 12 },
  { title: 'Start venue research', category: 'Venue', due_months_before: 12 },
  { title: 'Research and book wedding planner', category: 'Planning', due_months_before: 12 },
  
  // 10 months before
  { title: 'Book your venue', category: 'Venue', due_months_before: 10 },
  { title: 'Start dress shopping', category: 'Attire', due_months_before: 10 },
  { title: 'Research photographers', category: 'Photography', due_months_before: 10 },
  { title: 'Research videographers', category: 'Photography', due_months_before: 10 },
  
  // 8 months before
  { title: 'Book photographer', category: 'Photography', due_months_before: 8 },
  { title: 'Book videographer', category: 'Photography', due_months_before: 8 },
  { title: 'Book catering', category: 'Food', due_months_before: 8 },
  { title: 'Choose wedding party', category: 'Planning', due_months_before: 8 },
  
  // 6 months before
  { title: 'Book DJ or band', category: 'Entertainment', due_months_before: 6 },
  { title: 'Book Zaffé group', category: 'Entertainment', due_months_before: 6 },
  { title: 'Order wedding dress', category: 'Attire', due_months_before: 6 },
  { title: 'Start guest list', category: 'Guests', due_months_before: 6 },
  { title: 'Book florist', category: 'Decor', due_months_before: 6 },
  
  // 4 months before
  { title: 'Book makeup artist', category: 'Beauty', due_months_before: 4 },
  { title: 'Book hair stylist', category: 'Beauty', due_months_before: 4 },
  { title: 'Choose groom suit', category: 'Attire', due_months_before: 4 },
  { title: 'Design and order invitations', category: 'Stationery', due_months_before: 4 },
  { title: 'Book wedding car', category: 'Transport', due_months_before: 4 },
  
  // 3 months before
  { title: 'Send out invitations', category: 'Guests', due_months_before: 3 },
  { title: 'Order wedding cake', category: 'Food', due_months_before: 3 },
  { title: 'Book honeymoon', category: 'Honeymoon', due_months_before: 3 },
  { title: 'Plan seating arrangement', category: 'Planning', due_months_before: 3 },
  
  // 2 months before
  { title: 'Wedding dress fitting', category: 'Attire', due_months_before: 2 },
  { title: 'Confirm all vendor bookings', category: 'Planning', due_months_before: 2 },
  { title: 'Purchase wedding rings', category: 'Jewelry', due_months_before: 2 },
  { title: 'Finalize guest list', category: 'Guests', due_months_before: 2 },
  
  // 1 month before
  { title: 'Final dress fitting', category: 'Attire', due_months_before: 1 },
  { title: 'Confirm final guest count', category: 'Guests', due_months_before: 1 },
  { title: 'Create day-of timeline', category: 'Planning', due_months_before: 1 },
  { title: 'Prepare wedding favors', category: 'Decor', due_months_before: 1 },
  { title: 'Hair and makeup trial', category: 'Beauty', due_months_before: 1 },
  
  // Week before
  { title: 'Final venue walkthrough', category: 'Venue', due_months_before: 0 },
  { title: 'Confirm transportation', category: 'Transport', due_months_before: 0 },
  { title: 'Prepare tips for vendors', category: 'Planning', due_months_before: 0 },
  { title: 'Pack for honeymoon', category: 'Honeymoon', due_months_before: 0 },
];

// Exchange rate (approximate - should be updated)
export const USD_TO_LBP_RATE = 89500;

export type VendorCategory = typeof VENDOR_CATEGORIES[number]['value'];
export type LebaneseRegion = typeof LEBANESE_REGIONS[number]['value'];
