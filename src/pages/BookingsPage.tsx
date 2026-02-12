import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Store,
  Users,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  vendor_id: string;
  booking_date: string;
  guest_count: number | null;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  vendor_response: string | null;
  created_at: string;
  vendor: {
    business_name: string;
    category: string;
    cover_image_url: string | null;
    portfolio_images: string[] | null;
  };
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    icon: Clock 
  },
  accepted: { 
    label: 'Accepted', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle 
  },
  rejected: { 
    label: 'Declined', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: XCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    icon: XCircle 
  },
};

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vendor:vendors (
          business_name,
          category,
          cover_image_url,
          portfolio_images
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      toast({ title: 'Error loading bookings', variant: 'destructive' });
    } else {
      setBookings((data as unknown as Booking[]) || []);
    }
    setLoading(false);
  };

  const cancelBooking = async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b));
      toast({ title: 'Booking cancelled' });
    }
  };

  const getVendorImage = (booking: Booking) => {
    return booking.vendor.cover_image_url || booking.vendor.portfolio_images?.[0] || null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="heading-section text-foreground mb-1">My Bookings</h1>
          <p className="text-muted-foreground">
            Track your booking requests and vendor responses
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Bookings List */}
        {!loading && (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              const statusConfig = STATUS_CONFIG[booking.status];
              const StatusIcon = statusConfig.icon;
              const vendorImage = getVendorImage(booking);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Vendor Image */}
                    <div className="w-full md:w-48 h-32 md:h-auto bg-muted flex-shrink-0">
                      {vendorImage ? (
                        <img 
                          src={vendorImage} 
                          alt={booking.vendor.business_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <Link 
                            to={`/vendors/${booking.vendor_id}`}
                            className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {booking.vendor.business_name}
                          </Link>
                          <p className="text-sm text-muted-foreground capitalize">
                            {booking.vendor.category.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        {booking.guest_count && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {booking.guest_count} guests
                          </span>
                        )}
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <MessageSquare className="w-3 h-3" />
                            Your message
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{booking.notes}</p>
                        </div>
                      )}

                      {booking.vendor_response && (
                        <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-xs text-primary font-medium mb-1">Vendor Response</div>
                          <p className="text-sm text-foreground">{booking.vendor_response}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Link to={`/vendors/${booking.vendor_id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Vendor
                          </Button>
                        </Link>
                        {booking.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => cancelBooking(booking.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && !loading && (
          <div className="text-center py-16">
            <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">
              No bookings yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Browse vendors and request bookings for your wedding
            </p>
            <Button asChild>
              <Link to="/vendors">Browse Vendors</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
