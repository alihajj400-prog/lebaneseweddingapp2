import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Heart,
  Star,
  Phone,
  Mail,
  Globe,
  Instagram,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Send,
  CheckCircle,
  Bookmark,
  Share2,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { BookingDialog } from '@/components/booking/BookingDialog';
import { VendorLocationMap } from '@/components/vendors/VendorLocationMap';
import { BottomNav } from '@/components/layout/BottomNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  region: string;
  description: string | null;
  starting_price_usd: number | null;
  starting_price_lbp: number | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  website: string | null;
  portfolio_images: string[];
  shortlist_count: number;
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [message, setMessage] = useState(
    "We're interested in your venue for our wedding! We would like to receive more details. Please send them as soon as you can!\n\nThank you!"
  );
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactLinks, setContactLinks] = useState<{ whatsapp?: string; email?: string }>({});

  const openExternal = (url: string) => {
    // Some external sites (e.g. wa.me) refuse to load in iframes.
    // Try opening a new tab; if blocked, break out of the iframe.
    try {
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (w) return;
    } catch {
      // ignore
    }

    try {
      if (window.top && window.top !== window.self) {
        window.top.location.assign(url);
        return;
      }
    } catch {
      // cross-origin access can fail in some embed contexts
    }

    window.location.assign(url);
  };

  useEffect(() => {
    if (id) {
      fetchVendor();
      trackView();
      if (user) {
        checkShortlist();
      }
    }
  }, [id, user]);

  const trackView = async () => {
    if (!id) return;
    
    // Generate or get session ID for anonymous tracking
    let sessionId = sessionStorage.getItem('lwp_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('lwp_session_id', sessionId);
    }

    await supabase.from('vendor_views').insert({
      vendor_id: id,
      user_id: user?.id || null,
      session_id: sessionId,
    });
  };

  const fetchVendor = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/vendors');
      return;
    }

    setVendor(data);
    setLoading(false);
  };

  const checkShortlist = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('shortlist')
      .select('id')
      .eq('vendor_id', id)
      .eq('user_id', user.id)
      .single();

    setIsShortlisted(!!data);
  };

  const toggleShortlist = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to save vendors.' });
      return;
    }

    if (isShortlisted) {
      const { error } = await supabase.from('shortlist').delete().eq('vendor_id', id).eq('user_id', user.id);
      if (!error) {
        setIsShortlisted(false);
        toast({ title: 'Removed from favourites' });
      } else {
        toast({ title: 'Could not remove from favourites', variant: 'destructive' });
      }
    } else {
      const { error } = await supabase.from('shortlist').insert({ vendor_id: id, user_id: user.id });
      if (!error) {
        setIsShortlisted(true);
        toast({ title: 'Added to favourites!' });
      } else {
        toast({ title: 'Could not add to favourites', variant: 'destructive' });
      }
    }
  };

  const handleRequestBrochure = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to contact vendors.' });
      return;
    }

    if (!vendor || !id) return;

    // Track the brochure request
    let contactMethod = 'none';
    if (vendor.whatsapp) {
      contactMethod = 'whatsapp';
    } else if (vendor.email) {
      contactMethod = 'email';
    }

    await supabase.from('brochure_requests').insert({
      vendor_id: id,
      user_id: user.id,
      message: message,
      contact_method: contactMethod,
    });
    
    // Build contact links and show dialog
    if (vendor.whatsapp) {
      const whatsappLink = `https://wa.me/${vendor.whatsapp}?text=${encodeURIComponent(message)}`;
      const emailLink = vendor.email 
        ? `mailto:${vendor.email}?subject=Wedding Inquiry - ${vendor.business_name}&body=${encodeURIComponent(message)}`
        : undefined;
      
      setContactLinks({ whatsapp: whatsappLink, email: emailLink });
      setShowContactDialog(true);
      toast({ title: 'Request recorded!', description: 'Choose how you want to contact the vendor.' });
    } else if (vendor.email) {
      const emailLink = `mailto:${vendor.email}?subject=Wedding Inquiry - ${vendor.business_name}&body=${encodeURIComponent(message)}`;
      setContactLinks({ email: emailLink });
      setShowContactDialog(true);
      toast({ title: 'Request recorded!', description: 'Choose how you want to contact the vendor.' });
    } else {
      toast({ title: 'Contact info unavailable', description: 'This vendor has not provided contact information.' });
    }
  };

  const getCategoryLabel = (value: string) =>
    VENDOR_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getRegionLabel = (value: string) =>
    LEBANESE_REGIONS.find((r) => r.value === value)?.label || value;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  const images = vendor.portfolio_images || [];

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-0">
      <Header />

      <main className="pt-20 pb-4">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container-custom mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/vendors" className="text-muted-foreground hover:text-foreground">
                Vendors
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link to={`/vendors?category=${vendor.category}`} className="text-muted-foreground hover:text-foreground">
                {getCategoryLabel(vendor.category)}
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{vendor.business_name}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-16 z-40 bg-background border-b border-border">
          <div className="container-custom mx-auto px-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="h-12 bg-transparent border-0 p-0 gap-6">
                <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0">
                  About
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0">
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0">
                  Details
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0">
                  Get in touch
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="container-custom mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Title Section */}
              <div className="mb-6">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {vendor.business_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {getRegionLabel(vendor.region)}, Lebanon
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-muted-foreground">(0 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-6">
                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                )}
                {vendor.instagram && (
                  <a
                    href={`https://instagram.com/${vendor.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Image Gallery */}
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-3">
                  {/* Thumbnails */}
                  <div className="col-span-1 space-y-3">
                    {images.slice(0, 3).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === idx ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="col-span-3 relative">
                    {images.length > 0 ? (
                      <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                        <img
                          src={images[selectedImageIndex]}
                          alt={vendor.business_name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Navigation */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* View All */}
                        {images.length > 3 && (
                          <button className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 text-white rounded-lg text-sm flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View all ({images.length})
                          </button>
                        )}

                        {/* Share & Favourite */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={toggleShortlist}
                            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                              isShortlisted ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:text-primary'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${isShortlisted ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No images available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button onClick={handleRequestBrochure} size="lg" className="flex-1 gap-2">
                  <Send className="w-4 h-4" />
                  Request a brochure
                </Button>
                <BookingDialog vendorId={vendor.id} vendorName={vendor.business_name}>
                  <Button variant="outline" size="lg" className="flex-1 gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    Request Booking
                  </Button>
                </BookingDialog>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none mb-8">
                <h2 className="font-serif text-2xl font-semibold mb-4">About The {getCategoryLabel(vendor.category).slice(0, -1)}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {vendor.description || 'No description available.'}
                </p>
              </div>

              {/* Pricing */}
              {vendor.starting_price_usd && (
                <div className="bg-muted/50 rounded-xl p-6 mb-8">
                  <h3 className="font-serif text-xl font-semibold mb-2">Pricing</h3>
                  <p className="text-2xl font-bold text-primary">
                    Starting from ${vendor.starting_price_usd.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Contact vendor for detailed pricing</p>
                </div>
              )}

              {/* Location Map */}
              <div className="mb-8">
                <VendorLocationMap 
                  currentVendor={{
                    id: vendor.id,
                    business_name: vendor.business_name,
                    region: vendor.region,
                    category: vendor.category,
                    starting_price_usd: vendor.starting_price_usd,
                    cover_image_url: vendor.portfolio_images?.[0] || null,
                  }} 
                  category={vendor.category} 
                />
              </div>
            </div>

            {/* Sidebar - Contact Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-serif text-lg font-semibold mb-2">
                  Send a message to {vendor.business_name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We will pass your details to the supplier so they can get back to you with a proposal.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user?.email || 'Please sign in'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-primary">[recommended]</span>
                  </div>
                  {profile?.full_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Names:</span>
                      <span>{profile.full_name} {profile.partner_name ? `& ${profile.partner_name}` : ''}</span>
                    </div>
                  )}
                  {profile?.wedding_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Date:</span>
                      <span>{new Date(profile.wedding_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {profile?.estimated_guests && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Guests:</span>
                      <span>{profile.estimated_guests}</span>
                    </div>
                  )}
                </div>

                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mb-4"
                />

                <Button onClick={handleRequestBrochure} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Request a brochure
                </Button>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border">
                  <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-muted transition-colors text-center">
                    <Bookmark className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Mark as booked</span>
                  </button>
                  <button
                    onClick={toggleShortlist}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-muted transition-colors text-center"
                  >
                    <Heart className={`w-5 h-5 ${isShortlisted ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs text-muted-foreground">
                      {isShortlisted ? 'Saved' : 'Add to favourites'}
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-muted transition-colors text-center">
                    <Star className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Write a review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA on mobile */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden p-3 bg-background/95 backdrop-blur border-t border-border safe-area-pb">
        <div className="container-custom mx-auto flex gap-2">
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={() => setShowContactDialog(true)}
          >
            <Send className="w-4 h-4" />
            Contact / Book
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="shrink-0 px-4"
            onClick={toggleShortlist}
            aria-label={isShortlisted ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart className={`w-5 h-5 ${isShortlisted ? 'fill-primary text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      <Footer />

      {/* Contact Options Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {vendor.business_name}</DialogTitle>
            <DialogDescription>
              Your request has been recorded. Choose how you'd like to reach out:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            {contactLinks.whatsapp && (
              <Button
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openExternal(contactLinks.whatsapp!)}
              >
                <MessageSquare className="w-5 h-5" />
                Open WhatsApp
              </Button>
            )}
            {contactLinks.email && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => openExternal(contactLinks.email!)}
              >
                <Mail className="w-5 h-5" />
                Send Email
              </Button>
            )}
            {vendor.phone && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => openExternal(`tel:${vendor.phone}`)}
              >
                <Phone className="w-5 h-5" />
                Call {vendor.phone}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
