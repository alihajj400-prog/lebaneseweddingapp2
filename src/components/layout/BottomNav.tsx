import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, CalendarDays, User, Shield, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminRole } from '@/hooks/useAdminRole';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/vendors', label: 'Vendors', icon: Store },
  { href: '/shortlist', label: 'Favorites', icon: Heart },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/settings', label: 'Profile', icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAdminRole();

  const items = isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: Shield }]
    : navItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur border-t border-border"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around safe-area-pb">
        {items.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === '/vendors' && location.pathname.startsWith('/vendors') && !location.pathname.startsWith('/vendor/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 px-1 relative min-w-0 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />
              )}
              <Icon className="w-5 h-5 mb-1 shrink-0" aria-hidden />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
