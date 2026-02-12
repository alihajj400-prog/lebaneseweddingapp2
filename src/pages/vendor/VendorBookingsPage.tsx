import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  guest_count: number | null;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  vendor_response: string | null;
  created_at: string;
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

export default function VendorBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (user) {
      fetchVendorAndBookings();
    }
  }, [user]);

  const fetchVendorAndBookings = async () => {
    if (!user) return;

    // First get the vendor ID
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!vendorData) {
      setLoading(false);
      return;
    }

    setVendorId(vendorData.id);

    // Then fetch bookings
    const { data: bookingsData, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('vendor_id', vendorData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      toast({ title: 'Error loading bookings', variant: 'destructive' });
    } else {
      setBookings((bookingsData as Booking[]) || []);
    }
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: 'accepted' | 'rejected', vendorResponse?: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status, 
        vendor_response: vendorResponse || null 
      })
      .eq('id', id);

    if (!error) {
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, status, vendor_response: vendorResponse || null } : b
      ));
      setRespondingTo(null);
      setResponse('');
      toast({ 
        title: status === 'accepted' ? 'Booking accepted!' : 'Booking declined',
        description: status === 'accepted' 
          ? 'The couple has been notified of your acceptance.'
          : 'The couple has been notified.'
      });
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'accepted').length;

  if (loading) {
    return (
      <VendorPortalLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </VendorPortalLayout>
    );
  }

  return (
    <VendorPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Booking Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage booking requests from couples
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-primary">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Accepted</CardDescription>
              <CardTitle className="text-3xl text-accent-foreground">{acceptedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-3xl">{bookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Acceptance Rate</CardDescription>
              <CardTitle className="text-3xl">
                {bookings.length > 0 
                  ? Math.round((acceptedCount / bookings.length) * 100) 
                  : 0}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.map((booking, index) => {
            const statusConfig = STATUS_CONFIG[booking.status];
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Requested {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {booking.guest_count && (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {booking.guest_count} guests
                            </span>
                          )}
                        </div>

                        {booking.notes && (
                          <div className="p-3 bg-muted/50 rounded-lg mb-4">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <MessageSquare className="w-3 h-3" />
                              Couple's message
                            </div>
                            <p className="text-sm text-foreground">{booking.notes}</p>
                          </div>
                        )}

                        {booking.vendor_response && (
                          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="text-xs text-primary font-medium mb-1">Your Response</div>
                            <p className="text-sm text-foreground">{booking.vendor_response}</p>
                          </div>
                        )}

                        {respondingTo === booking.id && (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              placeholder="Add a message for the couple (optional)..."
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.id, 'accepted', response)}
                                className="gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'rejected', response)}
                                className="gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Decline
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => { setRespondingTo(null); setResponse(''); }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {booking.status === 'pending' && respondingTo !== booking.id && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setRespondingTo(booking.id)}
                            className="gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Respond
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">
              No booking requests yet
            </h3>
            <p className="text-muted-foreground">
              When couples request to book your services, they'll appear here
            </p>
          </div>
        )}
      </div>
    </VendorPortalLayout>
  );
}
