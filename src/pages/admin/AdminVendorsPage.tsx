import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Eye, ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { format } from 'date-fns';

interface VendorRow {
  id: string;
  business_name: string;
  category: string;
  region: string;
  status: 'pending' | 'approved' | 'rejected';
  email: string | null;
  phone: string | null;
  created_at: string;
  starting_price_usd: number | null;
  is_sample: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price_asc', label: 'Price (low to high)' },
  { value: 'price_desc', label: 'Price (high to low)' },
] as const;

export default function AdminVendorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(() => searchParams.get('category') || 'all');
  const [regionFilter, setRegionFilter] = useState<string>(() => searchParams.get('region') || 'all');
  const [sort, setSort] = useState<string>('newest');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    vendor: VendorRow | null;
    action: 'approve' | 'reject' | 'delete';
  }>({ open: false, vendor: null, action: 'approve' });

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('vendors')
      .select('id, business_name, category, region, status, email, phone, created_at, starting_price_usd, is_sample')
      .order('created_at', { ascending: false })
      .range(0, 999);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }
    if (regionFilter !== 'all') {
      query = query.eq('region', regionFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setVendors([]);
    } else {
      setVendors((data as VendorRow[]) || []);
    }
    setLoading(false);
  }, [statusFilter, categoryFilter, regionFilter, toast]);

  useEffect(() => {
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const region = searchParams.get('region') || 'all';
    setStatusFilter(status);
    setCategoryFilter(category);
    setRegionFilter(region);
  }, [searchParams]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filteredVendors = vendors
    .filter((v) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        v.business_name?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q) ||
        v.region?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'name') return (a.business_name || '').localeCompare(b.business_name || '');
      if (sort === 'price_asc') return (a.starting_price_usd ?? 0) - (b.starting_price_usd ?? 0);
      if (sort === 'price_desc') return (b.starting_price_usd ?? 0) - (a.starting_price_usd ?? 0);
      return 0;
    });

  const handleAction = async () => {
    if (!actionDialog.vendor) return;

    if (actionDialog.action === 'delete') {
      const { error } = await supabase.from('vendors').delete().eq('id', actionDialog.vendor.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Vendor deleted', description: actionDialog.vendor.business_name });
        fetchVendors();
      }
    } else {
      const newStatus = actionDialog.action === 'approve' ? 'approved' : 'rejected';
      const { error } = await supabase
        .from('vendors')
        .update({ status: newStatus })
        .eq('id', actionDialog.vendor.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({
          title: actionDialog.action === 'approve' ? 'Vendor approved' : 'Vendor rejected',
          description: actionDialog.vendor.business_name,
        });
        fetchVendors();
      }
    }
    setActionDialog({ open: false, vendor: null, action: 'approve' });
  };

  const getCategoryLabel = (value: string) =>
    VENDOR_CATEGORIES.find((c) => c.value === value)?.label ?? value;
  const getRegionLabel = (value: string) =>
    LEBANESE_REGIONS.find((r) => r.value === value)?.label ?? value;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Vendor Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Search, filter, and manage all vendors</p>
          </div>
          <Button onClick={() => navigate('/admin/vendors/new')} size="sm" className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filters & search</CardTitle>
            <CardContent className="p-0 pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, category, region, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {VENDOR_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {LEBANESE_REGIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col gap-3 p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <p className="font-medium text-foreground">No vendors found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {vendors.length === 0
                    ? 'No vendors match the current filters.'
                    : 'Try adjusting search or filters.'}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/vendors/new')}>
                  <Plus className="w-4 h-4 mr-2" /> Add Vendor
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.business_name}</TableCell>
                        <TableCell>{getCategoryLabel(vendor.category)}</TableCell>
                        <TableCell>{getRegionLabel(vendor.region)}</TableCell>
                        <TableCell>
                          {vendor.starting_price_usd != null
                            ? `$${vendor.starting_price_usd.toLocaleString()}`
                            : '—'}
                        </TableCell>
                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {format(new Date(vendor.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View"
                            >
                              <a href={`/vendors/${vendor.id}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              onClick={() => navigate(`/admin/vendors/${vendor.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {vendor.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                                  onClick={() => setActionDialog({ open: true, vendor, action: 'approve' })}
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  onClick={() => setActionDialog({ open: true, vendor, action: 'reject' })}
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {vendor.status !== 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    vendor,
                                    action: vendor.status === 'approved' ? 'reject' : 'approve',
                                  })
                                }
                              >
                                {vendor.status === 'approved' ? 'Revoke' : 'Approve'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => setActionDialog({ open: true, vendor, action: 'delete' })}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'delete'
                ? 'Delete vendor'
                : actionDialog.action === 'approve'
                  ? 'Approve vendor'
                  : 'Reject vendor'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'delete' ? (
                <>Permanently delete <strong>{actionDialog.vendor?.business_name}</strong>? This cannot be undone.</>
              ) : (
                <>
                  {actionDialog.action === 'approve'
                    ? 'Approve'
                    : 'Reject'}{' '}
                  <strong>{actionDialog.vendor?.business_name}</strong>?
                  {actionDialog.action === 'approve'
                    ? ' They will be visible in the directory.'
                    : ' They will be removed from the directory.'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                actionDialog.action === 'reject' || actionDialog.action === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {actionDialog.action === 'delete' ? 'Delete' : actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
