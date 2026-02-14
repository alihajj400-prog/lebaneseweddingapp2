import { Store } from 'lucide-react';
import { VendorFilters } from './VendorFilters';
import { CategoryTabs } from './CategoryTabs';
import { VendorList } from './VendorList';
import { VendorCardSkeletonGrid } from './VendorCardSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { VendorListItem } from './VendorList';

export interface VendorsPageContentProps {
  /** Page title (e.g. "Find Wedding Vendors" or category label) */
  title: string;
  /** Subtitle, e.g. "154 vendors in Lebanon" */
  subtitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  regionFilter: string;
  priceFilter: string;
  sortBy: string;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  vendors: VendorListItem[];
  loading: boolean;
  shortlistedIds: Set<string>;
  onToggleShortlist: (vendorId: string) => void;
}

/**
 * Vendors browse UI: title, search/filters, category chips, list or empty state.
 * Use inside DashboardLayout (or any layout) for the /vendors page, or embed in Dashboard/Home.
 */
export function VendorsPageContent({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  categoryFilter,
  regionFilter,
  priceFilter,
  sortBy,
  onFilterChange,
  onClearFilters,
  vendors,
  loading,
  shortlistedIds,
  onToggleShortlist,
}: VendorsPageContentProps) {
  return (
    <div className="space-y-6">
      {/* Page title - same style as Dashboard, Shortlist, Bookings */}
      <div>
        <h1 className="heading-section text-foreground mb-1">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Search + filters row - design system inputs/buttons */}
      <VendorFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        categoryFilter={categoryFilter}
        regionFilter={regionFilter}
        priceFilter={priceFilter}
        sortBy={sortBy}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        resultCount={vendors.length}
      />

      {/* Category chips */}
      <div className="mt-4">
        <CategoryTabs
          selectedCategory={categoryFilter}
          onCategoryChange={(value) => onFilterChange('category', value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6">
          <VendorCardSkeletonGrid count={6} />
        </div>
      )}

      {/* Vendor list */}
      {!loading && vendors.length > 0 && (
        <div className="mt-6">
          <VendorList
            vendors={vendors}
            shortlistedIds={shortlistedIds}
            onToggleShortlist={onToggleShortlist}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && vendors.length === 0 && (
        <EmptyState
          icon={Store}
          title="No vendors found"
          description={
            searchQuery || categoryFilter !== 'all' || regionFilter !== 'all' || priceFilter !== 'all'
              ? 'Try adjusting your filters or search query to find the perfect vendors for your wedding.'
              : 'No approved vendors in the directory yet. Check back soon!'
          }
          action={{
            label: 'Clear Filters',
            onClick: onClearFilters,
          }}
        />
      )}
    </div>
  );
}
