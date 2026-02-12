import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart, CheckCircle2, DollarSign, Users, Store, Star,
  ArrowRight, Sparkles, MapPin, Camera, Music, Flower2,
  Drum, Building2, Cake, Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebsiteLayout } from '../components/WebsiteLayout';

const howItWorks = [
  { step: '01', title: 'Create Your Free Account', description: 'Sign up in seconds and tell us about your dream wedding — date, budget, guest count.', icon: Heart },
  { step: '02', title: 'Discover & Plan', description: 'Browse verified vendors, build your checklist, track your budget in USD & LBP, and manage your guest list.', icon: Store },
  { step: '03', title: 'Book & Celebrate', description: 'Shortlist your favorites, request bookings, and bring your perfect Lebanese wedding to life.', icon: Star },
];

const features = [
  { icon: CheckCircle2, title: 'Wedding Checklist', description: '12-month timeline built for Lebanese wedding traditions.' },
  { icon: DollarSign, title: 'Budget Planner', description: 'Track spending in USD & LBP with category breakdowns.' },
  { icon: Users, title: 'Guest List', description: 'RSVPs, groups, plus-ones, and dietary notes — all organized.' },
  { icon: Heart, title: 'Vendor Shortlist', description: 'Save, compare, and add notes to your favorite vendors.' },
  { icon: Sparkles, title: 'Smart Recommendations', description: 'Get personalized vendor suggestions based on your wedding.' },
];

const categories = [
  { icon: Building2, label: 'Venues' },
  { icon: Camera, label: 'Photographers' },
  { icon: Music, label: 'DJs' },
  { icon: Drum, label: 'Zaffé' },
  { icon: Flower2, label: 'Flowers' },
  { icon: Cake, label: 'Cake & Sweets' },
];

const testimonials = [
  { name: 'Sarah & Karim', location: 'Beirut', quote: 'Lebanon Wedding made planning so much easier. We found our venue and photographer in the same week!' },
  { name: 'Nadia & Georges', location: 'Mount Lebanon', quote: 'The budget tracker saved us from overspending. Being able to see everything in LBP and USD was a game-changer.' },
  { name: 'Maya & Hassan', location: 'Bekaa', quote: 'We loved the checklist — it kept us organized from day one. Highly recommend for any Lebanese couple!' },
];

const stats = [
  { value: '500+', label: 'Verified Vendors' },
  { value: '6', label: 'Lebanese Regions' },
  { value: '1000+', label: 'Happy Couples' },
  { value: '100%', label: 'Free to Use' },
];

export default function HomePage() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 border border-primary-foreground/30 rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-primary-foreground/20 rounded-full" />
        </div>

        <div className="container-custom mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-primary-foreground/90 text-sm font-medium">Made for Lebanese Weddings</span>
            </div>

            <h1 className="heading-hero text-primary-foreground mb-6">
              Plan Your Lebanese Wedding
              <br />
              <span className="text-gradient-gold">In One Place</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              The complete wedding planning platform designed exclusively for Lebanese couples.
              Find vendors, manage budgets, and create unforgettable memories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vendors">
                <Button className="btn-hero group">
                  Explore Vendors
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/vendor/auth">
                <Button className="btn-hero-outline">Join as a Vendor</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 px-8 py-4 rounded-lg">
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container-custom mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to your perfect wedding.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">Step {item.step}</span>
                <h3 className="font-serif text-xl font-medium text-foreground mt-2 mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="section-padding bg-secondary">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Powerful tools built for Lebanese wedding traditions.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elegant group">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Categories */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="heading-section text-foreground mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From venues to zaffé, find verified vendors for every part of your celebration.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to="/vendors" className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-soft transition-all text-center group">
                  <cat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground text-sm">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/vendors">
              <Button variant="outline" className="group">
                View All Categories
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="heading-section text-foreground mb-4">Loved by Couples</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">See what Lebanese couples are saying about us.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elegant">
                <Quote className="w-8 h-8 text-gold mb-4" />
                <p className="text-foreground mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Heart className="w-12 h-12 mx-auto mb-6 fill-gold text-gold" />
            <h2 className="heading-section text-primary-foreground mb-4">Ready to Start Planning?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of Lebanese couples who are planning their perfect wedding with us. It's completely free!
            </p>
            <Link to="/auth?mode=signup">
              <Button className="btn-gold text-lg">
                Create Your Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
