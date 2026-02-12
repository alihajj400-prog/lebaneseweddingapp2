import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2,
  Mail,
  Phone,
  Check,
  X,
  UserPlus,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';
type GuestGroup = 'family' | 'friends' | 'coworkers' | 'other';

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  guest_group: GuestGroup;
  rsvp_status: RsvpStatus;
  plus_one: boolean;
  plus_one_name: string | null;
  dietary_restrictions: string | null;
  notes: string | null;
}

const RSVP_COLORS: Record<RsvpStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  confirmed: 'bg-olive/10 text-olive',
  declined: 'bg-destructive/10 text-destructive',
  maybe: 'bg-gold/10 text-gold-dark',
};

const GROUP_LABELS: Record<GuestGroup, string> = {
  family: 'Family',
  friends: 'Friends',
  coworkers: 'Coworkers',
  other: 'Other',
};

export default function GuestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    guest_group: 'friends' as GuestGroup,
    plus_one: false,
    plus_one_name: '',
  });

  useEffect(() => {
    if (user) {
      fetchGuests();
    }
  }, [user]);

  const fetchGuests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      toast({ title: 'Error loading guests', variant: 'destructive' });
    } else {
      setGuests(data || []);
    }
    setLoading(false);
  };

  const addGuest = async () => {
    if (!user || !newGuest.name.trim()) return;

    const { data, error } = await supabase
      .from('guests')
      .insert({
        user_id: user.id,
        name: newGuest.name,
        email: newGuest.email || null,
        phone: newGuest.phone || null,
        guest_group: newGuest.guest_group,
        plus_one: newGuest.plus_one,
        plus_one_name: newGuest.plus_one_name || null,
        rsvp_status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      setGuests(prev => [...prev, data]);
      setNewGuest({
        name: '',
        email: '',
        phone: '',
        guest_group: 'friends',
        plus_one: false,
        plus_one_name: '',
      });
      setDialogOpen(false);
      toast({ title: 'Guest added!' });
    }
  };

  const updateRsvp = async (id: string, status: RsvpStatus) => {
    const { error } = await supabase
      .from('guests')
      .update({ rsvp_status: status })
      .eq('id', id);

    if (!error) {
      setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp_status: status } : g));
    }
  };

  const deleteGuest = async (id: string) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (!error) {
      setGuests(prev => prev.filter(g => g.id !== id));
      toast({ title: 'Guest removed' });
    }
  };

  const filteredGuests = guests.filter(g => {
    if (groupFilter !== 'all' && g.guest_group !== groupFilter) return false;
    if (rsvpFilter !== 'all' && g.rsvp_status !== rsvpFilter) return false;
    return true;
  });

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvp_status === 'confirmed').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    declined: guests.filter(g => g.rsvp_status === 'declined').length,
    plusOnes: guests.filter(g => g.plus_one).length,
  };

  const totalAttending = stats.confirmed + guests.filter(g => g.rsvp_status === 'confirmed' && g.plus_one).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="heading-section text-foreground mb-1">Guest List</h1>
            <p className="text-muted-foreground">
              {stats.total} guests invited • {totalAttending} confirmed attending
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Guest</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Guest name"
                  value={newGuest.name}
                  onChange={e => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={newGuest.email}
                  onChange={e => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Phone (optional)"
                  value={newGuest.phone}
                  onChange={e => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Select 
                  value={newGuest.guest_group} 
                  onValueChange={(v: GuestGroup) => setNewGuest(prev => ({ ...prev, guest_group: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="coworkers">Coworkers</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newGuest.plus_one}
                    onChange={e => setNewGuest(prev => ({ ...prev, plus_one: e.target.checked }))}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">Plus one?</span>
                </label>
                {newGuest.plus_one && (
                  <Input
                    placeholder="Plus one name (optional)"
                    value={newGuest.plus_one_name}
                    onChange={e => setNewGuest(prev => ({ ...prev, plus_one_name: e.target.value }))}
                  />
                )}
                <Button onClick={addGuest} className="w-full">Add Guest</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Invited</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-olive" />
              <span className="text-sm text-muted-foreground">Confirmed</span>
            </div>
            <div className="font-serif text-2xl font-bold text-olive">{stats.confirmed}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-gold-dark" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="font-serif text-2xl font-bold text-gold-dark">{stats.pending}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Plus Ones</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">{stats.plusOnes}</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="friends">Friends</SelectItem>
              <SelectItem value="coworkers">Coworkers</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="RSVP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Guests List */}
        <div className="space-y-3">
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-soft transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium text-primary">
                {guest.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{guest.name}</span>
                  {guest.plus_one && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      +1{guest.plus_one_name && `: ${guest.plus_one_name}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{GROUP_LABELS[guest.guest_group]}</span>
                  {guest.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {guest.email}
                    </span>
                  )}
                </div>
              </div>

              <Select 
                value={guest.rsvp_status} 
                onValueChange={(v: RsvpStatus) => updateRsvp(guest.id, v)}
              >
                <SelectTrigger className={`w-[120px] ${RSVP_COLORS[guest.rsvp_status]}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => deleteGuest(guest.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {filteredGuests.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">
              {guests.length === 0 ? 'No guests yet' : 'No matching guests'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {guests.length === 0 
                ? 'Start building your guest list' 
                : 'Try adjusting your filters'}
            </p>
            {guests.length === 0 && (
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Your First Guest
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
