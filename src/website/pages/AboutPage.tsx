import { motion } from 'framer-motion';
import { Heart, Shield, MapPin, Users } from 'lucide-react';
import { WebsiteLayout } from '../components/WebsiteLayout';

const values = [
  { icon: Heart, title: 'Made for Lebanon', description: 'Every feature is designed around Lebanese wedding culture — from zaffé to dual-currency budgeting.' },
  { icon: Shield, title: 'Trust & Quality', description: 'We verify vendors to ensure couples get connected with reliable, professional businesses.' },
  { icon: MapPin, title: 'All Regions Covered', description: 'From Beirut to Bekaa, North to South — we serve every corner of Lebanon.' },
  { icon: Users, title: 'Community First', description: 'We are building a community where couples and vendors support each other to create magical celebrations.' },
];

export default function AboutPage() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-hero text-primary-foreground mb-6">About Us</h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              We believe every Lebanese couple deserves a stress-free, beautifully organized wedding planning experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="heading-section text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Lebanon Wedding was born from a simple observation: planning a wedding in Lebanon is exciting but overwhelming. 
              Between managing budgets in two currencies, coordinating with vendors across different regions, and honoring 
              cultural traditions, couples need a dedicated tool that understands their unique needs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to be the trusted companion for every Lebanese couple — providing the tools, connections, 
              and guidance they need to plan their dream wedding with confidence and joy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container-custom mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="heading-section text-foreground mb-4">What We Stand For</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-5 p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
