import { VendorCard } from './VendorCard';

export interface VendorListItem {
  id: string;
  business_name: string;
  category: string;
  region: string;
  description: string | null;
  starting_price_usd: number | null;
  portfolio_images: string[];
  shortlist_count: number;
  cover_image_url?: string | null;
}

interface VendorListProps {
  vendors: VendorListItem[];
  shortlistedIds: Set<string>;
  onToggleShortlist: (vendorId: string) => void;
}

/**
 * Renders a list of vendor cards. Reusable in Vendors page, Dashboard "Recommended", etc.
 */
export function VendorList({ vendors, shortlistedIds, onToggleShortlist }: VendorListProps) {
  return (
    <div className="space-y-3">
      {vendors.map((vendor, index) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          isShortlisted={shortlistedIds.has(vendor.id)}
          onToggleShortlist={onToggleShortlist}
          index={index}
        />
      ))}
    </div>
  );
}
