import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Search, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
  { href: '/vendors', label: 'Explore', icon: Search },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/settings', label: 'Account', icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border">
      <div className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/vendors' && location.pathname.startsWith('/vendor'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex-1 flex flex-col items-center py-2 relative"
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
              )}
              
              <Icon 
                className={cn(
                  'w-6 h-6 mb-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} 
              />
              <span 
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
