import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorSidebar } from './VendorSidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface VendorPortalLayoutProps {
  children: ReactNode;
}

export function VendorPortalLayout({ children }: VendorPortalLayoutProps) {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [businessName, setBusinessName] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/vendor/auth');
    } else if (!authLoading && profile?.role !== 'vendor') {
      navigate('/dashboard');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    async function fetchVendor() {
      if (user) {
        const { data } = await supabase
          .from('vendors')
          .select('business_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setBusinessName(data.business_name);
        }
      }
    }
    fetchVendor();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <VendorSidebar businessName={businessName} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <VendorSidebar businessName={businessName} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-sm truncate">{businessName || 'Vendor Portal'}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        "lg:ml-64", // Desktop: offset by sidebar width
        "pt-14 lg:pt-0" // Mobile: offset by header height
      )}>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
