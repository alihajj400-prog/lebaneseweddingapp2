import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Store, 
  Calendar,
  MapPin,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';

const features = [
  {
    icon: CheckCircle2,
    title: 'Lebanese Wedding Checklist',
    description: 'Pre-built timeline tailored for Lebanese wedding traditions, from engagement to honeymoon.',
  },
  {
    icon: DollarSign,
    title: 'Budget Planner (LBP & USD)',
    description: 'Track your wedding budget in both currencies with detailed category breakdowns.',
  },
  {
    icon: Store,
    title: 'Curated Vendor Directory',
    description: 'Find the best venues, photographers, zaffé groups, and more across all Lebanese regions.',
  },
  {
    icon: Users,
    title: 'Guest List Manager',
    description: 'Organize guests, track RSVPs, and manage seating arrangements effortlessly.',
  },
  {
    icon: Calendar,
    title: 'Wedding Countdown',
    description: 'Keep track of your big day with a beautiful countdown and progress tracker.',
  },
  {
    icon: Heart,
    title: 'Vendor Shortlist',
    description: 'Save your favorite vendors, add notes, and compare options easily.',
  },
];

const stats = [
  { value: '500+', label: 'Verified Vendors' },
  { value: '6', label: 'Lebanese Regions' },
  { value: '1000+', label: 'Happy Couples' },
  { value: '100%', label: 'Free to Use' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 border border-primary-foreground/30 rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-primary-foreground/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-foreground/10 rounded-full" />
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
              <span className="text-primary-foreground/90 text-sm font-medium">
                Made for Lebanese Weddings
              </span>
            </div>
            
            <h1 className="heading-hero text-primary-foreground mb-6">
              Plan Your Perfect
              <br />
              <span className="text-gradient-gold">Lebanese Wedding</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              The complete wedding planning platform designed exclusively for Lebanese couples. 
              Find vendors, manage budgets, and create unforgettable memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button className="btn-hero group">
                  Start Planning Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/vendors">
                <Button className="btn-hero-outline">
                  Browse Vendors
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
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

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="container-custom mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-section text-foreground mb-4">
              Everything You Need to Plan Your Wedding
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for Lebanese wedding traditions and customs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elegant group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className="section-padding bg-secondary">
        <div className="container-custom mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-section text-foreground mb-4">
              Vendors Across All Lebanon
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect vendors in your region, from Beirut to Bekaa.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LEBANESE_REGIONS.map((region, index) => (
              <motion.div
                key={region.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/vendors?region=${region.value}`}
                  className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-soft transition-all text-center group"
                >
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground">{region.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-section text-foreground mb-4">
              Every Vendor Category You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From venues to zaffé, we've got you covered with verified Lebanese vendors.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {VENDOR_CATEGORIES.slice(0, 12).map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={`/vendors?category=${category.value}`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-secondary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="font-medium">{category.label}</span>
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

      {/* CTA Section */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-12 h-12 mx-auto mb-6 fill-gold text-gold" />
            <h2 className="heading-section text-primary-foreground mb-4">
              Ready to Start Planning?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of Lebanese couples who are planning their perfect wedding with us. 
              It's completely free!
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

      <Footer />
    </div>
  );
}
