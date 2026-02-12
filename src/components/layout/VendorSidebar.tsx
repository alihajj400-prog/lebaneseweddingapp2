import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Users, 
  Megaphone, 
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  CalendarDays,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const navItems = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendor/profile', label: 'My Profile', icon: User },
  { to: '/vendor/leads', label: 'Leads', icon: Users },
  { to: '/vendor/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/vendor/promotions', label: 'Promotions', icon: Megaphone },
  { to: '/vendor/subscription', label: 'Subscription', icon: Crown },
  { to: '/vendor/settings', label: 'Settings', icon: Settings },
];

interface VendorSidebarProps {
  businessName?: string;
}

export function VendorSidebar({ businessName }: VendorSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate text-sm">
                    {businessName || 'Vendor Portal'}
                  </p>
                  <p className="text-xs text-muted-foreground">Business Dashboard</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn("flex-shrink-0", collapsed && "hidden")}
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto mt-2"
            onClick={() => setCollapsed(false)}
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!collapsed && <span>{item.label}</span>}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-muted-foreground hover:text-foreground",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
            onClick={() => signOut()}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4 mr-2")} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
