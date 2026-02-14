import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VENDOR_CATEGORIES } from '@/lib/constants';
import { 
  Building2, Camera, Video, Music, Lightbulb, Drum, Shirt, 
  Sparkles, Flower2, Car, UtensilsCrossed, Calendar, Gem, 
  Mail, Cake, PartyPopper, MoreHorizontal 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Camera,
  Video,
  Music,
  Lightbulb,
  Drum,
  Shirt,
  Sparkles,
  Flower2,
  Car,
  UtensilsCrossed,
  Calendar,
  Gem,
  Mail,
  Cake,
  PartyPopper,
  MoreHorizontal,
};

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view on mount/change
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeTab = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      
      const scrollLeft = tabRect.left - containerRect.left - (containerRect.width / 2) + (tabRect.width / 2);
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const allCategories = [
    { value: 'all', label: 'All', icon: 'MoreHorizontal' },
    ...VENDOR_CATEGORIES,
  ];

  return (
    <div className="sticky top-16 lg:top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-3 -mx-4 px-4 md:-mx-0 md:px-0">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allCategories.map((category) => {
          const isActive = selectedCategory === category.value;
          const IconComponent = ICON_MAP[category.icon] || MoreHorizontal;
          
          return (
            <button
              key={category.value}
              ref={isActive ? activeRef : null}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
