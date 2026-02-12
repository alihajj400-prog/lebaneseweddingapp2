import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3, Eye, FileText, Megaphone, Star,
  ArrowRight, Users, TrendingUp, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebsiteLayout } from '../components/WebsiteLayout';

const vendorBenefits = [
  { icon: Users, title: 'Get Quality Leads', description: 'Receive inquiries from engaged couples actively planning their wedding in Lebanon.' },
  { icon: Eye, title: 'Increase Visibility', description: 'Appear in search results across all 6 Lebanese regions and 17 vendor categories.' },
  { icon: BarChart3, title: 'Track Performance', description: 'See profile views, shortlist additions, brochure requests, and lead conversions.' },
  { icon: FileText, title: 'Share Your Brochure', description: 'Upload your PDF brochure and let couples download it directly from your profile.' },
  { icon: Megaphone, title: 'Promote Your Listing', description: 'Get featured placement, priority search ranking, and a verified badge.' },
  { icon: TrendingUp, title: 'Grow Your Business', description: 'Connect with thousands of couples and build your reputation on the platform.' },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Get started and showcase your business.',
    features: ['Business profile listing', '3 portfolio images', 'Basic analytics', 'Receive inquiries', 'Standard search ranking'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'More visibility and professional tools.',
    features: ['Everything in Free', '10 portfolio images', 'Full analytics dashboard', 'Lead management tools', 'Priority search ranking', 'PDF brochure upload'],
    cta: 'Go Pro',
    highlighted: true,
  },
  {
    name: 'Featured',
    price: '$99',
    period: '/month',
    description: 'Maximum exposure and premium placement.',
    features: ['Everything in Pro', 'Unlimited portfolio images', 'Featured badge on profile', 'Top search placement', 'Homepage featured section', 'Priority support'],
    cta: 'Get Featured',
    highlighted: false,
  },
];

export default function ForVendorsPage() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-hero text-primary-foreground mb-6">
              Grow Your Wedding Business
              <br />
              <span className="text-gradient-gold">Across Lebanon</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join 500+ vendors reaching thousands of engaged couples. Get leads, track analytics, and promote your services.
            </p>
            <Link to="/vendor/auth">
              <Button className="btn-gold text-lg">
                Join as a Vendor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">Why Vendors Love Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tools built to help Lebanese wedding vendors succeed.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorBenefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elegant group">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding bg-secondary">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Choose the plan that fits your business. Upgrade anytime.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-8 ${plan.highlighted ? 'bg-primary text-primary-foreground ring-4 ring-gold scale-105' : 'bg-card border border-border'}`}
              >
                <h3 className="font-serif text-2xl font-medium mb-1">{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className="font-serif text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-gold' : 'text-primary'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/vendor/auth">
                  <Button className={`w-full ${plan.highlighted ? 'btn-gold' : ''}`} variant={plan.highlighted ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Payments handled via bank transfer, OMT, or cash. Contact admin to activate your plan.
          </p>
        </div>
      </section>
    </WebsiteLayout>
  );
}
