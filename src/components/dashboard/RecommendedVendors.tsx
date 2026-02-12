 import { Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { ArrowRight, Sparkles } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { useRecommendedVendorsByCategory } from '@/hooks/useRecommendedVendors';
 import { VENDOR_CATEGORIES } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';
 
type VendorCategory = Database['public']['Enums']['vendor_category'];

const KEY_CATEGORIES: VendorCategory[] = ['venue', 'photographer', 'dj', 'flowers'];
 
 export function RecommendedVendors() {
   const { vendorsByCategory, loading } = useRecommendedVendorsByCategory(KEY_CATEGORIES, 3);
 
   const getCategoryLabel = (value: string) =>
     VENDOR_CATEGORIES.find(c => c.value === value)?.label || value;
 
   if (loading) {
     return (
       <div className="space-y-6">
         <div className="flex items-center justify-between">
           <h3 className="font-serif text-xl font-medium text-foreground flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-primary" />
             Recommended for You
           </h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
           ))}
         </div>
       </div>
     );
   }
 
   const hasVendors = Object.values(vendorsByCategory).some(v => v.length > 0);
 
   if (!hasVendors) {
     return null;
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h3 className="font-serif text-xl font-medium text-foreground flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-primary" />
           Recommended for You
         </h3>
         <Link to="/vendors">
           <Button variant="ghost" size="sm" className="gap-1">
             View All Vendors
             <ArrowRight className="w-4 h-4" />
           </Button>
         </Link>
       </div>
 
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {KEY_CATEGORIES.map((category, idx) => {
           const vendors = vendorsByCategory[category] || [];
           const topVendor = vendors[0];
 
           if (!topVendor) return null;
 
           return (
             <motion.div
               key={category}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
             >
               <Link
                 to={`/vendors/${topVendor.id}`}
                 className="block bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
               >
                 <div className="aspect-[4/3] relative overflow-hidden">
                   {topVendor.portfolio_images?.[0] ? (
                     <img
                       src={topVendor.portfolio_images[0]}
                       alt={topVendor.business_name}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     />
                   ) : (
                     <div className="w-full h-full bg-muted flex items-center justify-center">
                       <span className="text-muted-foreground text-sm">No image</span>
                     </div>
                   )}
                   {topVendor.is_featured && (
                     <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                       Featured
                     </Badge>
                   )}
                 </div>
                 <div className="p-4">
                   <p className="text-xs text-primary font-medium mb-1">
                     {getCategoryLabel(category)}
                   </p>
                   <h4 className="font-medium text-foreground truncate">
                     {topVendor.business_name}
                   </h4>
                   {topVendor.starting_price_usd && (
                     <p className="text-sm text-muted-foreground mt-1">
                       From ${topVendor.starting_price_usd.toLocaleString()}
                     </p>
                   )}
                 </div>
               </Link>
             </motion.div>
           );
         })}
       </div>
     </div>
   );
 }