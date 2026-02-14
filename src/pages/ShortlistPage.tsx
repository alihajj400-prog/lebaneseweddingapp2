import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bookmark, 
  Trash2, 
  MapPin,
  Phone,
  Instagram,
  ExternalLink,
  MessageSquare,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Link } from 'react-router-dom';

interface ShortlistItem {
  id: string;
  vendor_id: string;
  notes: string | null;
  vendor: {
    id: string;
    business_name: string;
    category: string;
    region: string;
    description: string | null;
    starting_price_usd: number | null;
    phone: string | null;
    whatsapp: string | null;
    instagram: string | null;
    portfolio_images: string[];
  };
}

export default function ShortlistPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    if (user) {
      fetchShortlist();
    }
  }, [user]);

  const fetchShortlist = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('shortlist')
        .select(`
          id,
          vendor_id,
          notes,
          vendor:vendors (
            id,
            business_name,
            category,
            region,
            description,
            starting_price_usd,
            phone,
            whatsapp,
            instagram,
            portfolio_images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      if (data) {
        setItems(data as unknown as ShortlistItem[]);
      }
    } catch (err) {
      console.error('Error fetching shortlist:', err);
      setError(err instanceof Error ? err : new Error('Failed to load shortlist'));
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (id: string) => {
    const { error } = await supabase
      .from('shortlist')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: 'Removed from shortlist' });
    } else {
      toast({ title: 'Could not remove from shortlist', variant: 'destructive' });
    }
  };

  const startEditNotes = (item: ShortlistItem) => {
    setEditingNotes(item.id);
    setNotesValue(item.notes || '');
  };

  const saveNotes = async (id: string) => {
    const { error } = await supabase
      .from('shortlist')
      .update({ notes: notesValue })
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, notes: notesValue } : i));
      setEditingNotes(null);
      toast({ title: 'Notes saved!' });
    } else {
      toast({ title: 'Could not save notes', variant: 'destructive' });
    }
  };

  const getCategoryLabel = (value: string) => 
    VENDOR_CATEGORIES.find(c => c.value === value)?.label || value;
  
  const getRegionLabel = (value: string) => 
    LEBANESE_REGIONS.find(r => r.value === value)?.label || value;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="heading-section text-foreground mb-1">Your Shortlist</h1>
          <p className="text-muted-foreground">
            {items.length} vendor{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Shortlist Items */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-64 h-48 md:h-auto bg-muted flex-shrink-0">
                  {item.vendor.portfolio_images?.[0] ? (
                    <img 
                      src={item.vendor.portfolio_images[0]} 
                      alt={item.vendor.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-foreground mb-1">
                        {item.vendor.business_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded-full">
                          {getCategoryLabel(item.vendor.category)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getRegionLabel(item.vendor.region)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromShortlist(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {item.vendor.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.vendor.description}
                    </p>
                  )}

                  {item.vendor.starting_price_usd && (
                    <p className="text-sm font-medium text-primary mb-4">
                      Starting from ${item.vendor.starting_price_usd.toLocaleString()}
                    </p>
                  )}

                  {/* Contact */}
                  <div className="flex items-center gap-3 mb-4">
                    {item.vendor.phone && (
                      <a
                        href={`tel:${item.vendor.phone}`}
                        className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    {item.vendor.whatsapp && (
                      <a
                        href={`https://wa.me/${item.vendor.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {item.vendor.instagram && (
                      <a
                        href={`https://instagram.com/${item.vendor.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Your Notes</span>
                    </div>
                    
                    {editingNotes === item.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={notesValue}
                          onChange={e => setNotesValue(e.target.value)}
                          placeholder="Add notes about this vendor..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNotes(item.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.notes ? (
                          <p className="text-sm text-muted-foreground mb-2">{item.notes}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground/60 italic mb-2">No notes yet</p>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => startEditNotes(item)}>
                          {item.notes ? 'Edit Notes' : 'Add Notes'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <EmptyState
            icon={Bookmark}
            title="No vendors saved yet"
            description="Browse vendors and save your favorites to compare them later. Your shortlist makes it easy to keep track of vendors you're interested in."
            action={{
              label: 'Browse Vendors',
              href: '/vendors',
            }}
          />
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            title="Failed to load shortlist"
            message={error.message}
            onRetry={fetchShortlist}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
