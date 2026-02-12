import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Heart, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';

interface VendorCardProps {
  vendor: {
    id: string;
    business_name: string;
    category: string;
    region: string;
    description: string | null;
    starting_price_usd: number | null;
    portfolio_images: string[];
    shortlist_count: number;
    cover_image_url?: string | null;
  };
  isShortlisted: boolean;
  onToggleShortlist: (vendorId: string) => void;
  index?: number;
}

export function VendorCard({ vendor, isShortlisted, onToggleShortlist, index = 0 }: VendorCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const portfolioImages = vendor.portfolio_images || [];
  const images = portfolioImages.length > 0 
    ? portfolioImages 
    : vendor.cover_image_url 
      ? [vendor.cover_image_url] 
      : [];
  
  const getCategoryLabel = (value: string) => 
    VENDOR_CATEGORIES.find(c => c.value === value)?.label || value;
  
  const getRegionLabel = (value: string) => 
    LEBANESE_REGIONS.find(r => r.value === value)?.label || value;

  const getPriceTier = (price: number | null) => {
    if (!price) return null;
    if (price < 1000) return { label: 'Budget', symbol: '$' };
    if (price < 3000) return { label: 'Mid-range', symbol: '$$' };
    return { label: 'Luxury', symbol: '$$$' };
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const priceTier = getPriceTier(vendor.starting_price_usd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-row">
        {/* Image Carousel */}
        <div className="relative w-[140px] md:w-[200px] aspect-[3/4] bg-muted flex-shrink-0 group">
          {images.length > 0 ? (
            <>
              <Link to={`/vendors/${vendor.id}`}>
                <img
                  src={images[currentImageIndex]}
                  alt={vendor.business_name}
                  className="w-full h-full object-cover"
                />
              </Link>
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.slice(0, 4).map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Message Icon */}
              <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 md:p-4 flex flex-col min-w-0">
          <Link to={`/vendors/${vendor.id}`} className="block">
            <h3 className="font-serif text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors truncate">
              {vendor.business_name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
            <span>{getRegionLabel(vendor.region)}</span>
            {priceTier && (
              <>
                <span className="mx-1">·</span>
                <span>{priceTier.symbol}</span>
              </>
            )}
          </div>

          {vendor.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
              {vendor.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onToggleShortlist(vendor.id)}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </Button>
            
            <Button asChild size="sm" className="flex-1 h-8 text-xs">
              <Link to={`/vendors/${vendor.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
