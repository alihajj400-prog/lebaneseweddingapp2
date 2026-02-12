import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, DollarSign, Users, Heart, Store,
  Sparkles, ArrowRight, Calendar, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebsiteLayout } from '../components/WebsiteLayout';

const benefits = [
  {
    icon: CheckCircle2,
    title: 'Lebanese Wedding Checklist',
    description: 'A 12-month timeline built around Lebanese traditions — from engagement parties to the zaffé and honeymoon. Never miss a step.',
  },
  {
    icon: DollarSign,
    title: 'Budget Tracker (USD & LBP)',
    description: 'Set estimated and actual costs for every category. See your total in both currencies with real-time exchange rate support.',
  },
  {
    icon: Users,
    title: 'Guest List Manager',
    description: 'Organize guests by groups (family, friends, coworkers), track RSVPs, manage plus-ones, and note dietary restrictions.',
  },
  {
    icon: Store,
    title: 'Curated Vendor Directory',
    description: 'Browse 500+ verified vendors across all 6 Lebanese regions — venues, photographers, DJs, zaffé, florists, and more.',
  },
  {
    icon: Heart,
    title: 'Vendor Shortlist',
    description: 'Save your favorite vendors, add personal notes, and compare them side by side before making decisions.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Recommendations',
    description: 'Get vendor suggestions tailored to your budget, region, and wedding size. No more endless searching.',
  },
  {
    icon: Calendar,
    title: 'Booking Requests',
    description: 'Send booking requests directly to vendors through the platform. Track statuses and vendor responses in one place.',
  },
  {
    icon: BarChart3,
    title: 'Wedding Dashboard',
    description: "A bird's-eye view of your wedding progress — tasks completed, budget spent, vendors booked, and days remaining.",
  },
];

export default function ForCouplesPage() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-hero text-primary-foreground mb-6">
              Plan Your Dream Wedding
              <br />
              <span className="text-gradient-gold">With Confidence</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Everything you need to plan a beautiful Lebanese wedding — all in one free platform.
              No stress, no spreadsheets, just joy.
            </p>
            <Link to="/auth?mode=signup">
              <Button className="btn-gold text-lg">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">Built for Lebanese Couples</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every tool is designed with your culture, traditions, and needs in mind.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-5 p-6 rounded-xl border border-border bg-card hover:shadow-soft transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">{b.title}</h3>
                  <p className="text-muted-foreground text-sm">{b.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary">
        <div className="container-custom mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Heart className="w-10 h-10 mx-auto mb-4 text-primary fill-primary" />
            <h2 className="heading-section text-foreground mb-4">Start Planning Today</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              It's free, it's easy, and it's made just for you. Your perfect Lebanese wedding starts here.
            </p>
            <Link to="/auth?mode=signup">
              <Button className="btn-hero group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
