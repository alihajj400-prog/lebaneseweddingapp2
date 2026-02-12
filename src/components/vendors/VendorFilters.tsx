import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { useState } from 'react';

interface VendorFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  regionFilter: string;
  priceFilter: string;
  sortBy: string;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
}

const PRICE_RANGES = [
  { value: 'all', label: 'All Prices' },
  { value: 'budget', label: 'Budget (Under $1,000)' },
  { value: 'mid', label: 'Mid-range ($1,000 - $3,000)' },
  { value: 'luxury', label: 'Luxury ($3,000+)' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended for You' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

export function VendorFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  regionFilter,
  priceFilter,
  sortBy,
  onFilterChange,
  onClearFilters,
  resultCount,
}: VendorFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = categoryFilter !== 'all' || regionFilter !== 'all' || priceFilter !== 'all' || searchQuery;

  const getCategoryLabel = (value: string) => 
    VENDOR_CATEGORIES.find(c => c.value === value)?.label || 'All Categories';
  
  const getRegionLabel = (value: string) => 
    LEBANESE_REGIONS.find(r => r.value === value)?.label || 'All Regions';

  const getPriceLabel = (value: string) => 
    PRICE_RANGES.find(p => p.value === value)?.label || 'All Prices';

  const getSortLabel = (value: string) =>
    SORT_OPTIONS.find(s => s.value === value)?.label || 'Most Popular';

  return (
    <div className="space-y-3">
      {/* Compact Search Bar */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-background text-sm"
            />
          </div>

          {/* Category Filter - Hidden on mobile since we have tabs */}
          <div className="hidden lg:block w-[180px]">
            <Select value={categoryFilter} onValueChange={(v) => onFilterChange('category', v)}>
              <SelectTrigger className="h-9 bg-background text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {VENDOR_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button size="sm" className="h-9 px-6 w-full sm:w-auto">
            Search
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Mobile Filters Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 lg:hidden">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow down your search</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={(v) => onFilterChange('category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {VENDOR_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={regionFilter} onValueChange={(v) => onFilterChange('region', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {LEBANESE_REGIONS.map((reg) => (
                      <SelectItem key={reg.value} value={reg.value}>
                        {reg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Select value={priceFilter} onValueChange={(v) => onFilterChange('price', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map((price) => (
                      <SelectItem key={price.value} value={price.value}>
                        {price.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(v) => onFilterChange('sort', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setIsOpen(false)} className="w-full">
                Show {resultCount} results
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filter Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <Select value={priceFilter} onValueChange={(v) => onFilterChange('price', v)}>
            <SelectTrigger className="w-auto gap-2 border-dashed">
              <span>Price</span>
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((price) => (
                <SelectItem key={price.value} value={price.value}>
                  {price.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={(v) => onFilterChange('region', v)}>
            <SelectTrigger className="w-auto gap-2 border-dashed">
              <span>Region</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {LEBANESE_REGIONS.map((reg) => (
                <SelectItem key={reg.value} value={reg.value}>
                  {reg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => onFilterChange('sort', v)}>
            <SelectTrigger className="w-auto gap-2 border-dashed">
              <ArrowUpDown className="w-4 h-4" />
              <span>{getSortLabel(sortBy)}</span>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 ml-auto">
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                {getCategoryLabel(categoryFilter)}
                <button onClick={() => onFilterChange('category', 'all')} className="hover:text-primary/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {regionFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                {getRegionLabel(regionFilter)}
                <button onClick={() => onFilterChange('region', 'all')} className="hover:text-primary/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                {getPriceLabel(priceFilter)}
                <button onClick={() => onFilterChange('price', 'all')} className="hover:text-primary/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
