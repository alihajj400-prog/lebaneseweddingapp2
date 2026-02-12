import { motion } from 'framer-motion';
import { Megaphone, Star, TrendingUp, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';

const promotionOptions = [
  {
    title: 'Featured Vendor',
    description: 'Get featured at the top of search results in your category',
    icon: Crown,
    benefits: [
      'Top placement in category',
      'Featured badge on profile',
      'Priority in recommendations',
      'Highlighted listing design',
    ],
    popular: true,
  },
  {
    title: 'Boost Listing',
    description: 'Increase visibility for a limited time',
    icon: TrendingUp,
    benefits: [
      'Higher ranking for 7 days',
      'More profile views',
      'Increased inquiries',
      'Analytics boost tracking',
    ],
    popular: false,
  },
  {
    title: 'Premium Profile',
    description: 'Unlock premium features for your profile',
    icon: Sparkles,
    benefits: [
      'Unlimited portfolio images',
      'Video showcase',
      'Priority support',
      'Verified badge',
    ],
    popular: false,
  },
];

export default function VendorPromotionsPage() {
  return (
    <VendorPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground mt-1">
            Boost your visibility and reach more couples
          </p>
        </div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Current Plan: Free</h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to reach more couples and increase bookings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promotion Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotionOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${option.popular ? 'border-primary shadow-lg' : ''}`}>
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {option.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={option.popular ? 'default' : 'outline'}>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Why Promote Your Listing?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">3x</div>
                  <p className="text-sm text-muted-foreground">
                    More profile views with Featured status
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">2x</div>
                  <p className="text-sm text-muted-foreground">
                    More inquiries from interested couples
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">85%</div>
                  <p className="text-sm text-muted-foreground">
                    Of couples book from top-listed vendors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorPortalLayout>
  );
}
