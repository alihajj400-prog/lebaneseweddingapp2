import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarDays, DollarSign, Mail, Phone, MessageCircle, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState } from '@/components/common/EmptyState';

interface Lead {
  id: string;
  created_at: string;
  contact_method: string | null;
  message: string | null;
  user_id: string;
  status: 'new' | 'contacted' | 'booked' | 'lost';
  wedding_date: string | null;
  guest_count: number | null;
  budget_range: string | null;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', icon: Star, color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', icon: Phone, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'booked', label: 'Booked', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', icon: XCircle, color: 'bg-red-100 text-red-800' },
];

export default function VendorLeadsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;

    // First get vendor ID
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (vendorData) {
      setVendorId(vendorData.id);
      const { data: leadsData } = await supabase
        .from('brochure_requests')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      setLeads((leadsData || []) as Lead[]);
    }
    setLoading(false);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('brochure_requests')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    } else {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead
        )
      );
      toast({ title: 'Status updated' });
    }
  };

  const getContactIcon = (method: string | null) => {
    switch (method) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <Badge variant="secondary" className={statusOption.color}>
        {statusOption.label}
      </Badge>
    );
  };

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
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Leads & Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            View all inquiries from interested couples
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Total Inquiries</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {leads.filter(l => {
                    const date = new Date(l.created_at);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {leads.filter(l => {
                    const date = new Date(l.created_at);
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return date >= weekAgo;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Inquiries</CardTitle>
              <CardDescription>
                Couples who have requested information about your services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No inquiries yet"
                  description="When couples request more information about your services, they'll appear here. Make sure your profile is complete and attractive!"
                  action={{
                    label: 'Edit Profile',
                    href: '/vendor/profile',
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {leads.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(lead.status)}
                            <Badge variant="outline" className="capitalize">
                              {getContactIcon(lead.contact_method)}
                              <span className="ml-1">{lead.contact_method || 'Contact'}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(lead.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          {/* Lead Details */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            {lead.wedding_date && (
                              <div>
                                <span className="text-muted-foreground">Wedding Date:</span>
                                <p className="font-medium">{new Date(lead.wedding_date).toLocaleDateString()}</p>
                              </div>
                            )}
                            {lead.guest_count && (
                              <div>
                                <span className="text-muted-foreground">Guests:</span>
                                <p className="font-medium">{lead.guest_count}</p>
                              </div>
                            )}
                            {lead.budget_range && (
                              <div>
                                <span className="text-muted-foreground">Budget:</span>
                                <p className="font-medium">{lead.budget_range}</p>
                              </div>
                            )}
                          </div>

                          {lead.message && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {lead.message}
                            </p>
                          )}
                        </div>

                        {/* Status Selector */}
                        <div className="flex-shrink-0">
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  <span className="flex items-center gap-2">
                                    <option.icon className="w-3 h-3" />
                                    {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorPortalLayout>
  );
}
