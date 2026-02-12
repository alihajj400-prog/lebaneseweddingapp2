import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VendorCard } from '@/components/vendors/VendorCard';
import { VendorFilters } from '@/components/vendors/VendorFilters';
import { CategoryTabs } from '@/components/vendors/CategoryTabs';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';
import { BottomNav } from '@/components/layout/BottomNav';

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  region: string;
  description: string | null;
  starting_price_usd: number | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  portfolio_images: string[];
  shortlist_count: number;
  is_featured?: boolean;
  subscription_plan?: string;
}

// Scoring function for recommendation sorting
const calculateVendorScore = (vendor: Vendor, userBudget: number | null, userRegion?: string | null): number => {
  let score = 0;
  
  // Featured vendors get HIGHEST priority (100 points) - always on top
  if (vendor.is_featured || vendor.subscription_plan === 'featured') score += 100;
  
  // Pro subscription bonus (40 points)
  if (vendor.subscription_plan === 'pro') score += 40;
  
  // Region matching (35 points exact, 20 adjacent) - STRENGTHENED
  if (userRegion && vendor.region) {
    if (vendor.region === userRegion) {
      score += 35;
    } else {
      // Adjacent regions bonus
      const adjacentRegions: Record<string, string[]> = {
        beirut: ['mount_lebanon'],
        mount_lebanon: ['beirut', 'north', 'bekaa'],
        north: ['mount_lebanon', 'bekaa'],
        south: ['mount_lebanon', 'nabatieh'],
        bekaa: ['mount_lebanon', 'north', 'nabatieh'],
        nabatieh: ['south', 'bekaa'],
      };
      if (adjacentRegions[userRegion]?.includes(vendor.region)) {
        score += 20;
      }
    }
  }
  
  // Budget matching
  if (userBudget && vendor.starting_price_usd) {
    const userTier = userBudget < 15000 ? 'budget' : userBudget < 50000 ? 'mid' : 'luxury';
    const vendorTier = vendor.starting_price_usd < 1000 ? 'budget' : vendor.starting_price_usd < 5000 ? 'mid' : 'luxury';
    if (userTier === vendorTier) score += 25;
  }
  
  // Popularity
  score += Math.min(vendor.shortlist_count * 2, 20);
  
  // Has content
  if (vendor.portfolio_images?.length > 0) score += 10;
  if (vendor.description && vendor.description.length > 50) score += 5;
  
  return score;
};

export default function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categoryFilter = searchParams.get('category') || 'all';
  const regionFilter = searchParams.get('region') || 'all';
  const priceFilter = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'recommended';
  const { profile } = useAuth();

  useEffect(() => {
    fetchVendors();
    if (user) {
      fetchShortlist();
    }
  }, [categoryFilter, regionFilter, priceFilter, user]);

  const fetchVendors = async () => {
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved')
      .order('shortlist_count', { ascending: false });

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter as any);
    }
    if (regionFilter !== 'all') {
      query = query.eq('region', regionFilter as any);
    }

    const { data, error } = await query;

    if (!error) {
      let filteredData = data || [];
      
      // Apply price filter
      if (priceFilter !== 'all') {
        filteredData = filteredData.filter((v) => {
          const price = v.starting_price_usd;
          if (!price) return priceFilter === 'budget';
          if (priceFilter === 'budget') return price < 1000;
          if (priceFilter === 'mid') return price >= 1000 && price < 3000;
          if (priceFilter === 'luxury') return price >= 3000;
          return true;
        });
      }

      setVendors(filteredData);
    }
    setLoading(false);
  };

  const fetchShortlist = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('shortlist')
      .select('vendor_id')
      .eq('user_id', user.id);

    if (data) {
      setShortlistedIds(new Set(data.map(s => s.vendor_id)));
    }
  };

  const toggleShortlist = async (vendorId: string) => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to save vendors.' });
      return;
    }

    const isShortlisted = shortlistedIds.has(vendorId);

    if (isShortlisted) {
      await supabase.from('shortlist').delete().eq('vendor_id', vendorId).eq('user_id', user.id);
      setShortlistedIds(prev => {
        const next = new Set(prev);
        next.delete(vendorId);
        return next;
      });
      toast({ title: 'Removed from shortlist' });
    } else {
      await supabase.from('shortlist').insert({ vendor_id: vendorId, user_id: user.id });
      setShortlistedIds(prev => new Set([...prev, vendorId]));
      toast({ title: 'Added to shortlist!' });
    }
  };

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const filteredVendors = vendors.filter(v => 
    !searchQuery || 
    v.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting - featured vendors always first for any sort
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    // Featured vendors ALWAYS come first regardless of sort
    const aFeatured = a.is_featured || a.subscription_plan === 'featured';
    const bFeatured = b.is_featured || b.subscription_plan === 'featured';
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    
    switch (sortBy) {
      case 'recommended':
        return calculateVendorScore(b, profile?.estimated_budget_usd || null, regionFilter !== 'all' ? regionFilter : null) - 
               calculateVendorScore(a, profile?.estimated_budget_usd || null, regionFilter !== 'all' ? regionFilter : null);
      case 'featured':
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.shortlist_count - a.shortlist_count;
      case 'popularity':
        return b.shortlist_count - a.shortlist_count;
      case 'newest':
        return 0; // Would need created_at field
      case 'price_low':
        return (a.starting_price_usd || 999999) - (b.starting_price_usd || 999999);
      case 'price_high':
        return (b.starting_price_usd || 0) - (a.starting_price_usd || 0);
      case 'name':
        return a.business_name.localeCompare(b.business_name);
      default:
        return 0;
    }
  });

  const getCategoryLabel = (value: string) => 
    VENDOR_CATEGORIES.find(c => c.value === value)?.label || 'All Categories';

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container-custom mx-auto px-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
              {categoryFilter !== 'all' ? getCategoryLabel(categoryFilter) : 'Find Wedding Vendors'}
            </h1>
            <p className="text-muted-foreground text-xs">
              {sortedVendors.length} vendor{sortedVendors.length !== 1 ? 's' : ''} in Lebanon
            </p>
          </div>

          {/* Filters */}
          <VendorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            regionFilter={regionFilter}
            priceFilter={priceFilter}
            sortBy={sortBy}
            onFilterChange={setFilter}
            onClearFilters={clearFilters}
            resultCount={sortedVendors.length}
          />

          {/* Category Tabs */}
          <div className="mt-4">
            <CategoryTabs
              selectedCategory={categoryFilter}
              onCategoryChange={(value) => setFilter('category', value)}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}

          {/* Vendors List */}
          {!loading && (
            <div className="space-y-3 mt-6">
              {sortedVendors.map((vendor, index) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  isShortlisted={shortlistedIds.has(vendor.id)}
                  onToggleShortlist={toggleShortlist}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {sortedVendors.length === 0 && !loading && (
            <EmptyState
              icon={Store}
              title="No vendors found"
              description="Try adjusting your filters or search query to find the perfect vendors for your wedding."
              action={{
                label: 'Clear Filters',
                onClick: clearFilters,
              }}
            />
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
