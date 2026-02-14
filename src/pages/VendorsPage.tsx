import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VendorsPageContent } from '@/components/vendors/VendorsPageContent';
import { VENDOR_CATEGORIES } from '@/lib/constants';
import type { VendorListItem } from '@/components/vendors/VendorList';

// Scoring for "recommended" sort
function calculateVendorScore(
  vendor: VendorListItem & { is_featured?: boolean; subscription_plan?: string },
  userBudget: number | null,
  userRegion?: string | null
): number {
  let score = 0;
  if (vendor.is_featured || vendor.subscription_plan === 'featured') score += 100;
  if (vendor.subscription_plan === 'pro') score += 40;
  if (userRegion && vendor.region) {
    if (vendor.region === userRegion) score += 35;
    else {
      const adjacent: Record<string, string[]> = {
        beirut: ['mount_lebanon'],
        mount_lebanon: ['beirut', 'north', 'bekaa'],
        north: ['mount_lebanon', 'bekaa'],
        south: ['mount_lebanon', 'nabatieh'],
        bekaa: ['mount_lebanon', 'north', 'nabatieh'],
        nabatieh: ['south', 'bekaa'],
      };
      if (adjacent[userRegion]?.includes(vendor.region)) score += 20;
    }
  }
  if (userBudget != null && vendor.starting_price_usd != null) {
    const userTier = userBudget < 15000 ? 'budget' : userBudget < 50000 ? 'mid' : 'luxury';
    const vendorTier =
      vendor.starting_price_usd < 1000 ? 'budget' : vendor.starting_price_usd < 5000 ? 'mid' : 'luxury';
    if (userTier === vendorTier) score += 25;
  }
  score += Math.min(vendor.shortlist_count * 2, 20);
  if (vendor.portfolio_images?.length) score += 10;
  if (vendor.description && vendor.description.length > 50) score += 5;
  return score;
}

export default function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<(VendorListItem & { is_featured?: boolean; subscription_plan?: string })[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryFilter = searchParams.get('category') || 'all';
  const regionFilter = searchParams.get('region') || 'all';
  const priceFilter = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'recommended';
  const searchParam = searchParams.get('search') || '';

  useEffect(() => {
    if (searchParam !== searchQuery) setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchVendors();
    if (user) fetchShortlist();
  }, [categoryFilter, regionFilter, priceFilter, user]);

  const fetchVendors = async () => {
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved')
      .order('shortlist_count', { ascending: false })
      .range(0, 999);

    if (categoryFilter !== 'all') query = query.eq('category', categoryFilter as never);
    if (regionFilter !== 'all') query = query.eq('region', regionFilter as never);

    const { data, error } = await query;

    if (!error) {
      let list = data || [];
      if (priceFilter !== 'all') {
        list = list.filter((v: { starting_price_usd: number | null }) => {
          const price = v.starting_price_usd;
          if (price == null) return priceFilter === 'budget';
          if (priceFilter === 'budget') return price < 1000;
          if (priceFilter === 'mid') return price >= 1000 && price < 3000;
          if (priceFilter === 'luxury') return price >= 3000;
          return true;
        });
      }
      setVendors(list);
    } else {
      toast({ title: 'Error loading vendors', variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchShortlist = async () => {
    if (!user) return;
    const { data } = await supabase.from('shortlist').select('vendor_id').eq('user_id', user.id);
    if (data) setShortlistedIds(new Set(data.map((s) => s.vendor_id)));
  };

  const toggleShortlist = async (vendorId: string) => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to save vendors.' });
      return;
    }
    const isShortlisted = shortlistedIds.has(vendorId);
    if (isShortlisted) {
      await supabase.from('shortlist').delete().eq('vendor_id', vendorId).eq('user_id', user.id);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(vendorId);
        return next;
      });
      toast({ title: 'Removed from shortlist' });
    } else {
      await supabase.from('shortlist').insert({ vendor_id: vendorId, user_id: user.id });
      setShortlistedIds((prev) => new Set([...prev, vendorId]));
      toast({ title: 'Added to shortlist!' });
    }
  };

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const filteredVendors = vendors.filter(
    (v) =>
      !searchQuery ||
      v.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    const aFeat = a.is_featured || a.subscription_plan === 'featured';
    const bFeat = b.is_featured || b.subscription_plan === 'featured';
    if (aFeat && !bFeat) return -1;
    if (!aFeat && bFeat) return 1;
    switch (sortBy) {
      case 'recommended':
        return (
          calculateVendorScore(b, profile?.estimated_budget_usd ?? null, regionFilter !== 'all' ? regionFilter : null) -
          calculateVendorScore(a, profile?.estimated_budget_usd ?? null, regionFilter !== 'all' ? regionFilter : null)
        );
      case 'featured':
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.shortlist_count - a.shortlist_count;
      case 'popularity':
        return b.shortlist_count - a.shortlist_count;
      case 'newest':
        return 0;
      case 'price_low':
        return (a.starting_price_usd ?? 999999) - (b.starting_price_usd ?? 999999);
      case 'price_high':
        return (b.starting_price_usd ?? 0) - (a.starting_price_usd ?? 0);
      case 'name':
        return a.business_name.localeCompare(b.business_name);
      default:
        return 0;
    }
  });

  const title =
    categoryFilter !== 'all'
      ? (VENDOR_CATEGORIES.find((c) => c.value === categoryFilter)?.label ?? 'Find Wedding Vendors')
      : 'Find Wedding Vendors';
  const subtitle = `${sortedVendors.length} vendor${sortedVendors.length !== 1 ? 's' : ''} in Lebanon`;

  return (
    <DashboardLayout>
      <VendorsPageContent
        title={title}
        subtitle={subtitle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        regionFilter={regionFilter}
        priceFilter={priceFilter}
        sortBy={sortBy}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        vendors={sortedVendors}
        loading={loading}
        shortlistedIds={shortlistedIds}
        onToggleShortlist={toggleShortlist}
      />
    </DashboardLayout>
  );
}
