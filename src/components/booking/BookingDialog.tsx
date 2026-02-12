import { useState } from 'react';
import { CalendarDays, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BookingDialogProps {
  vendorId: string;
  vendorName: string;
  children: React.ReactNode;
}

export function BookingDialog({ vendorId, vendorName, children }: BookingDialogProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking_date: '',
    guest_count: profile?.estimated_guests || '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ 
        title: 'Please sign in', 
        description: 'You need to be signed in to request a booking.' 
      });
      navigate('/auth');
      return;
    }

    if (!formData.booking_date) {
      toast({ 
        title: 'Date required', 
        description: 'Please select a booking date.',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          vendor_id: vendorId,
          booking_date: formData.booking_date,
          guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
          notes: formData.notes || null,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Booking request sent! 🎉',
        description: `${vendorName} will review your request and get back to you soon.`,
      });

      setOpen(false);
      setFormData({ booking_date: '', guest_count: '', notes: '' });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit booking request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Request Booking</DialogTitle>
          <DialogDescription>
            Send a booking request to {vendorName}. They will review and respond to your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="booking_date" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              Event Date *
            </Label>
            <Input
              id="booking_date"
              type="date"
              value={formData.booking_date}
              onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_count" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Number of Guests
            </Label>
            <Input
              id="guest_count"
              type="number"
              placeholder="e.g., 200"
              value={formData.guest_count}
              onChange={(e) => setFormData(prev => ({ ...prev, guest_count: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Tell the vendor about your wedding plans, special requirements, or questions..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
