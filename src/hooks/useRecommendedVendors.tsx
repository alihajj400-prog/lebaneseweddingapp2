 import { useState, useEffect, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type VendorCategory = Database['public']['Enums']['vendor_category'];
 
 interface Vendor {
   id: string;
   business_name: string;
   category: string;
   region: string;
   description: string | null;
   starting_price_usd: number | null;
   portfolio_images: string[];
   shortlist_count: number;
   is_featured?: boolean;
   subscription_plan?: string;
 }
 
 interface RecommendedVendorsOptions {
   category?: string;
   limit?: number;
   excludeIds?: string[];
 }
 
 // Region adjacency map for Lebanon
 const ADJACENT_REGIONS: Record<string, string[]> = {
   beirut: ['mount_lebanon'],
   mount_lebanon: ['beirut', 'north', 'bekaa'],
   north: ['mount_lebanon', 'bekaa'],
   south: ['mount_lebanon', 'nabatieh'],
   bekaa: ['mount_lebanon', 'north', 'nabatieh'],
   nabatieh: ['south', 'bekaa'],
 };
 
 // Budget tiers for matching
 const getBudgetTier = (budget: number | null): 'budget' | 'mid' | 'luxury' | null => {
   if (!budget) return null;
   if (budget < 15000) return 'budget';
   if (budget < 50000) return 'mid';
   return 'luxury';
 };
 
 const getVendorBudgetTier = (price: number | null): 'budget' | 'mid' | 'luxury' | null => {
   if (!price) return null;
   if (price < 1000) return 'budget';
   if (price < 5000) return 'mid';
   return 'luxury';
 };
 
 export function useRecommendedVendors(options: RecommendedVendorsOptions = {}) {
   const { profile } = useAuth();
   const [vendors, setVendors] = useState<Vendor[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
 
   const { category, limit = 10, excludeIds = [] } = options;
 
   useEffect(() => {
     fetchAndScoreVendors();
   }, [profile?.estimated_budget_usd, category]);
 
   const fetchAndScoreVendors = async () => {
     try {
       setLoading(true);
       setError(null);
 
       let query = supabase
         .from('vendors')
         .select('*')
         .eq('status', 'approved');
 
       if (category) {
        query = query.eq('category', category as VendorCategory);
       }
 
       const { data, error: fetchError } = await query;
 
       if (fetchError) throw fetchError;
 
       const scoredVendors = scoreAndSortVendors(data || [], profile);
       const filteredVendors = scoredVendors.filter(v => !excludeIds.includes(v.id));
       
       setVendors(filteredVendors.slice(0, limit));
     } catch (err) {
       console.error('Error fetching recommended vendors:', err);
       setError(err instanceof Error ? err : new Error('Failed to fetch vendors'));
     } finally {
       setLoading(false);
     }
   };
 
   const scoreAndSortVendors = (vendorList: Vendor[], userProfile: typeof profile) => {
     return vendorList
       .map(vendor => ({
         ...vendor,
         score: calculateVendorScore(vendor, userProfile),
       }))
       .sort((a, b) => b.score - a.score);
   };
 
  const calculateVendorScore = (vendor: Vendor, userProfile: typeof profile): number => {
    let score = 0;

    // Featured vendors get HIGHEST priority (100 points) - always on top
    if (vendor.is_featured || vendor.subscription_plan === 'featured') {
      score += 100;
    }

    // Pro subscription bonus (40 points)
    if (vendor.subscription_plan === 'pro') {
      score += 40;
    }

    // Region matching (35 points for exact, 20 for adjacent) - STRENGTHENED
    // For now we use a simple approach - in future can use user's venue region
    const vendorRegion = vendor.region?.toLowerCase();
    if (vendorRegion && userProfile) {
      // If user is in Beirut area (most common), prioritize Mount Lebanon and Beirut
      // This is a placeholder - in future we'd get user's preferred region
      const adjacentRegions = ADJACENT_REGIONS[vendorRegion] || [];
      // Bonus for vendors with good regional coverage
      if (adjacentRegions.length > 0) {
        score += 10; // Well-connected region bonus
      }
    }

    // Budget tier matching (25 points)
    const userBudgetTier = getBudgetTier(userProfile?.estimated_budget_usd);
    const vendorBudgetTier = getVendorBudgetTier(vendor.starting_price_usd);
    
    if (userBudgetTier && vendorBudgetTier) {
      if (userBudgetTier === vendorBudgetTier) {
        score += 25;
      } else if (
        (userBudgetTier === 'mid' && vendorBudgetTier === 'budget') ||
        (userBudgetTier === 'luxury' && vendorBudgetTier === 'mid')
      ) {
        score += 15; // Partial match for adjacent tiers
      }
    }

    // Popularity signals (up to 20 points)
    score += Math.min(vendor.shortlist_count * 2, 20);

    // Has portfolio images (10 points)
    if (vendor.portfolio_images && vendor.portfolio_images.length > 0) {
      score += 10;
    }

    // Has description (5 points)
    if (vendor.description && vendor.description.length > 50) {
      score += 5;
    }

    return score;
  };
 
   return { vendors, loading, error, refetch: fetchAndScoreVendors };
 }
 
 // Hook to get top vendors across multiple categories
export function useRecommendedVendorsByCategory(categories: VendorCategory[], limit = 3) {
   const [vendorsByCategory, setVendorsByCategory] = useState<Record<string, Vendor[]>>({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
   const { profile } = useAuth();
 
   useEffect(() => {
     fetchAllCategories();
   }, [profile?.estimated_budget_usd, categories.join(',')]);
 
   const fetchAllCategories = async () => {
     try {
       setLoading(true);
       setError(null);
 
       const { data, error: fetchError } = await supabase
         .from('vendors')
         .select('*')
         .eq('status', 'approved')
         .in('category', categories);
 
       if (fetchError) throw fetchError;
 
       // Group by category and score
       const grouped: Record<string, Vendor[]> = {};
       
       categories.forEach(cat => {
         const categoryVendors = (data || []).filter(v => v.category === cat);
         const scored = categoryVendors
           .map(vendor => ({
             ...vendor,
             score: calculateScore(vendor, profile),
           }))
           .sort((a, b) => b.score - a.score)
           .slice(0, limit);
         
         grouped[cat] = scored;
       });
 
       setVendorsByCategory(grouped);
     } catch (err) {
       console.error('Error fetching vendors by category:', err);
       setError(err instanceof Error ? err : new Error('Failed to fetch vendors'));
     } finally {
       setLoading(false);
     }
   };
 
   const calculateScore = (vendor: Vendor, userProfile: typeof profile): number => {
     let score = 0;
     
     if (vendor.is_featured) score += 50;
     if (vendor.subscription_plan === 'pro') score += 20;
     
     const userBudgetTier = getBudgetTier(userProfile?.estimated_budget_usd);
     const vendorBudgetTier = getVendorBudgetTier(vendor.starting_price_usd);
     
     if (userBudgetTier && vendorBudgetTier && userBudgetTier === vendorBudgetTier) {
       score += 25;
     }
     
     score += Math.min(vendor.shortlist_count * 2, 20);
     if (vendor.portfolio_images?.length > 0) score += 10;
     if (vendor.description && vendor.description.length > 50) score += 5;
     
     return score;
   };
 
   return { vendorsByCategory, loading, error, refetch: fetchAllCategories };
 }