# 🇱🇧 Lebanese Wedding Dreams

A comprehensive wedding planning platform designed exclusively for Lebanese couples. Plan your perfect Lebanese wedding with localized tools, verified vendors, and cultural traditions in mind.

![Lebanese Wedding Dreams](https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop)

## ✨ Features

### For Couples
- **📋 Wedding Checklist** - Pre-built timeline tailored for Lebanese wedding traditions (12 months to wedding day)
- **💰 Budget Planner** - Track expenses in both USD and LBP with automatic conversion
- **👥 Guest List Manager** - Organize guests by groups, track RSVPs, manage plus-ones
- **🏪 Vendor Directory** - Browse 500+ verified vendors across all Lebanese regions
- **❤️ Shortlist** - Save favorite vendors with personal notes
- **📅 Booking System** - Request bookings directly from vendor pages
- **🎯 Onboarding** - Personalized setup capturing wedding date, budget, guest count

### For Vendors
- **📊 Business Dashboard** - Analytics for page views, inquiries, and shortlists
- **👤 Profile Management** - Edit business info, pricing, contact details
- **🖼️ Portfolio** - Upload and manage gallery images
- **📄 Brochure Upload** - Share PDF brochures with potential clients
- **📬 Lead Management** - View and respond to couple inquiries
- **📅 Booking Management** - Accept/reject booking requests
- **📢 Promotions** - Featured placement options
- **💳 Subscription Plans** - Free, Pro, and Featured tiers

### For Admins
- **👥 User Management** - View and manage all platform users
- **✅ Vendor Approval** - Review and approve vendor applications
- **⚙️ Platform Settings** - Configure system-wide settings

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Animation** | Framer Motion |
| **Backend** | Supabase (Lovable Cloud) |
| **Auth** | Supabase Auth |
| **Database** | PostgreSQL (via Supabase) |
| **Storage** | Supabase Storage |
| **Mobile** | Capacitor (iOS & Android) |
| **Forms** | React Hook Form, Zod |
| **State** | TanStack Query |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Couples   │   Vendors   │   Admins    │   Public Pages   │
│  Dashboard  │   Portal    │   Panel     │   (Landing/Dir)  │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │             │             │               │
       └─────────────┴──────┬──────┴───────────────┘
                            │
                    ┌───────▼───────┐
                    │  Supabase API │
                    ├───────────────┤
                    │ - Auth        │
                    │ - Database    │
                    │ - Storage     │
                    │ - RLS         │
                    └───────────────┘
```

## 📁 Project Structure

```
src/
├── components/
│   ├── booking/        # Booking dialog components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── onboarding/     # Onboarding wizard steps
│   ├── ui/             # shadcn/ui components
│   └── vendors/        # Vendor card, filters
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client & types
├── lib/                # Constants, utilities
└── pages/
    ├── admin/          # Admin panel pages
    └── vendor/         # Vendor portal pages
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lebanese-wedding-dreams

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The project uses Lovable Cloud (Supabase) which auto-configures the following:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 📱 Mobile Development

This project supports native mobile apps via Capacitor:

```bash
# Add platforms
npx cap add ios
npx cap add android

# Sync after changes
npx cap sync

# Run on device/emulator
npx cap run ios
npx cap run android
```

## 🗃️ Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (couples, vendors, admins) |
| `vendors` | Vendor business profiles with subscription plans |
| `bookings` | Booking requests between couples and vendors |
| `shortlist` | Couple's saved vendors |
| `brochure_requests` | Lead tracking with status management |
| `guests` | Guest list management |
| `checklist_items` | Wedding planning tasks |
| `budget_categories` | Budget tracking |
| `vendor_views` | Analytics for vendor profiles |
| `user_roles` | Role-based access control |

## 💳 Subscription Plans

| Feature | Free | Pro ($29/mo) | Featured ($99/mo) |
|---------|------|--------------|-------------------|
| Portfolio Images | 3 | 10 | Unlimited |
| Analytics | Basic | Full | Full |
| Search Ranking | Normal | Priority | Top |
| Featured Badge | ❌ | ❌ | ✅ |
| Lead Management | Basic | ✅ | ✅ |
| PDF Brochure | ❌ | ✅ | ✅ |

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Add environment variables in dashboard
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add `public/_redirects` file:
   ```
   /*    /index.html   200
   ```

### Supabase Setup (if not using Lovable Cloud)

1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations from `supabase/migrations/` folder
3. Create storage bucket: `vendor-files` (public)
4. Copy URL and anon key to environment variables

## 🔐 Security

- Row Level Security (RLS) on all tables
- Role-based access (couple, vendor, admin)
- Secure authentication via Supabase Auth
- Protected API routes

## 🌍 Localization

- **Regions**: Beirut, Mount Lebanon, North, South, Bekaa, Nabatieh
- **Currency**: Dual support for USD and LBP
- **Categories**: Lebanese-specific (Zaffé, Sound & Lighting, etc.)

## 📄 License

Private project. All rights reserved.

## 🗺️ Roadmap

- [ ] Email notifications for bookings/leads
- [ ] Vendor availability calendar
- [ ] Real-time messaging
- [ ] Stripe payment integration
- [ ] Reviews and ratings
- [ ] Multi-language (Arabic/French)
- [ ] AI-powered vendor matching

---

Built with ❤️ for Lebanese couples 
