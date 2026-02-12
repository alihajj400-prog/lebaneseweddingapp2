import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { WebsiteLayout } from '../components/WebsiteLayout';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: 'Message sent!', description: 'We will get back to you soon.' });
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-hero text-primary-foreground mb-6">Contact Us</h1>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Have a question or feedback? We would love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="heading-section text-foreground mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Whether you are a couple planning your wedding or a vendor looking to join, we are here to help.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground text-sm">hello@lebanonwedding.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Location</h3>
                    <p className="text-muted-foreground text-sm">Beirut, Lebanon</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-xl border border-border bg-card">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us more..." rows={4} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
