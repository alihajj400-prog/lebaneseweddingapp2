 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Check, Crown, Star, Zap, ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
 import { useAuth } from '@/hooks/useAuth';
 import { useToast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';
 
 interface VendorSubscription {
   id: string;
   subscription_plan: 'free' | 'pro' | 'featured';
   subscription_valid_until: string | null;
   is_featured: boolean;
   max_images: number;
 }
 
 const PLANS = [
   {
     id: 'free',
     name: 'Free',
     price: 0,
     icon: Star,
     description: 'Get started with basic features',
     features: [
       'Basic listing in directory',
       'Up to 3 portfolio images',
       'Basic analytics (total views only)',
       'Receive inquiries via WhatsApp/Email',
     ],
     limitations: [
       'No priority ranking',
       'Limited analytics',
       'No featured badge',
     ],
   },
   {
     id: 'pro',
     name: 'Pro',
     price: 29,
     icon: Zap,
     description: 'Grow your business with more visibility',
     popular: true,
     features: [
       'Everything in Free',
       'Up to 10 portfolio images',
       'Full analytics dashboard',
       'Lead management tools',
       'Priority in search results',
       'PDF brochure uploads',
     ],
     limitations: [],
   },
   {
     id: 'featured',
     name: 'Featured',
     price: 99,
     icon: Crown,
     description: 'Maximum visibility and premium placement',
     features: [
       'Everything in Pro',
       'Unlimited portfolio images',
       'Featured badge on listing',
       'Top placement in recommendations',
       'Homepage feature rotation',
       'Priority support',
     ],
     limitations: [],
   },
 ];
 
 export default function VendorSubscriptionPage() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [vendor, setVendor] = useState<VendorSubscription | null>(null);
   const [loading, setLoading] = useState(true);
   const [upgrading, setUpgrading] = useState<string | null>(null);
 
   useEffect(() => {
     if (user) {
       fetchVendor();
     }
   }, [user]);
 
   const fetchVendor = async () => {
     if (!user) return;
 
     const { data } = await supabase
       .from('vendors')
       .select('id, subscription_plan, subscription_valid_until, is_featured, max_images')
       .eq('user_id', user.id)
       .maybeSingle();
 
     if (data) {
       setVendor(data as VendorSubscription);
     }
     setLoading(false);
   };
 
   const handleUpgrade = async (planId: string) => {
     if (!vendor) return;
     
     setUpgrading(planId);
     
     // In a real implementation, this would redirect to Stripe checkout
     // For now, we simulate the upgrade
     const maxImages = planId === 'free' ? 3 : planId === 'pro' ? 10 : 50;
     const isFeatured = planId === 'featured';
     
     const { error } = await supabase
       .from('vendors')
       .update({
         subscription_plan: planId,
         is_featured: isFeatured,
         max_images: maxImages,
         subscription_valid_until: planId !== 'free' 
           ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
           : null,
       })
       .eq('id', vendor.id);
 
     if (error) {
       toast({
         title: 'Error',
         description: 'Failed to update subscription. Please try again.',
         variant: 'destructive',
       });
     } else {
       toast({
         title: 'Success!',
         description: `You've been upgraded to the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan.`,
       });
       fetchVendor();
     }
     
     setUpgrading(null);
   };
 
   if (loading) {
     return (
       <VendorPortalLayout>
         <div className="flex items-center justify-center py-16">
           <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
         </div>
       </VendorPortalLayout>
     );
   }
 
   const currentPlan = vendor?.subscription_plan || 'free';
 
   return (
     <VendorPortalLayout>
       <div className="space-y-8">
         <div>
           <h1 className="font-serif text-3xl font-bold text-foreground">Subscription Plans</h1>
           <p className="text-muted-foreground mt-1">
             Choose the plan that best fits your business needs
           </p>
         </div>
 
         {/* Current Plan Banner */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-primary/5 border border-primary/20 rounded-xl p-6"
         >
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-muted-foreground">Current Plan</p>
               <p className="font-serif text-2xl font-bold text-foreground capitalize">
                 {currentPlan}
               </p>
               {vendor?.subscription_valid_until && (
                 <p className="text-sm text-muted-foreground mt-1">
                   Valid until {new Date(vendor.subscription_valid_until).toLocaleDateString()}
                 </p>
               )}
             </div>
             <Badge variant={currentPlan === 'featured' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
               {currentPlan === 'featured' && <Crown className="w-4 h-4 mr-1" />}
               {currentPlan === 'pro' && <Zap className="w-4 h-4 mr-1" />}
               {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
             </Badge>
           </div>
         </motion.div>
 
         {/* Plans Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {PLANS.map((plan, index) => {
             const Icon = plan.icon;
             const isCurrentPlan = currentPlan === plan.id;
             const canUpgrade = 
               (currentPlan === 'free' && (plan.id === 'pro' || plan.id === 'featured')) ||
               (currentPlan === 'pro' && plan.id === 'featured');
 
             return (
               <motion.div
                 key={plan.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
               >
                 <Card className={`relative h-full ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                   {plan.popular && (
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                       <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                     </div>
                   )}
                   {isCurrentPlan && (
                     <div className="absolute -top-3 right-4">
                       <Badge variant="outline" className="bg-background">Current Plan</Badge>
                     </div>
                   )}
                   <CardHeader className="text-center pt-8">
                     <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                       <Icon className="w-6 h-6 text-primary" />
                     </div>
                     <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                     <CardDescription>{plan.description}</CardDescription>
                     <div className="mt-4">
                       <span className="font-serif text-4xl font-bold">${plan.price}</span>
                       <span className="text-muted-foreground">/month</span>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <ul className="space-y-3">
                       {plan.features.map((feature, idx) => (
                         <li key={idx} className="flex items-start gap-2 text-sm">
                           <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                           <span>{feature}</span>
                         </li>
                       ))}
                     </ul>
 
                     {isCurrentPlan ? (
                       <Button disabled className="w-full">
                         Current Plan
                       </Button>
                     ) : canUpgrade ? (
                       <Button
                         className="w-full gap-2"
                         onClick={() => handleUpgrade(plan.id)}
                         disabled={upgrading === plan.id}
                       >
                         {upgrading === plan.id ? 'Processing...' : 'Upgrade'}
                         <ArrowRight className="w-4 h-4" />
                       </Button>
                     ) : (
                       <Button variant="outline" disabled className="w-full">
                         {plan.price < PLANS.find(p => p.id === currentPlan)?.price! ? 'Downgrade' : 'N/A'}
                       </Button>
                     )}
                   </CardContent>
                 </Card>
               </motion.div>
             );
           })}
         </div>
 
          {/* Payment Note */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-sm text-amber-800 dark:text-amber-200">
                💳 Payments are currently handled manually. Contact us to upgrade your plan.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Once your payment is confirmed, your plan will be activated within 24 hours.
            </p>
          </div>
        </div>
      </VendorPortalLayout>
   );
 }