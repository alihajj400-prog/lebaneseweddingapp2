import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  checklist: 'Checklist',
  budget: 'Budget',
  guests: 'Guest List',
  vendors: 'Vendors',
  shortlist: 'Favorites',
  bookings: 'Bookings',
  settings: 'Settings',
  auth: 'Sign In',
  admin: 'Admin',
  profile: 'Profile',
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();

  const crumbs: BreadcrumbItem[] =
    items ??
    location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment, i, arr) => {
        const href = '/' + arr.slice(0, i + 1).join('/');
        const label =
          routeLabels[segment] ||
          (segment.length === 36 && segment.match(/^[0-9a-f-]{36}$/i) ? 'Details' : segment.replace(/-/g, ' '));
        return { label: label.charAt(0).toUpperCase() + label.slice(1), href: i < arr.length - 1 ? href : undefined };
      });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
      <Link to="/" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
        Home
      </Link>
      {crumbs.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-4 h-4 text-muted-foreground/60" aria-hidden />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
