import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { format } from 'date-fns';

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  region: string;
  status: 'pending' | 'approved' | 'rejected';
  email: string | null;
  phone: string | null;
  created_at: string;
  starting_price_usd: number | null;
}

export default function AdminVendorsPage() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    vendor: Vendor | null;
    action: 'approve' | 'reject';
  }>({ open: false, vendor: null, action: 'approve' });

  useEffect(() => {
    fetchVendors();
  }, [activeTab]);

  const fetchVendors = async () => {
    setLoading(true);
    let query = supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeTab !== 'all') {
      query = query.eq('status', activeTab as any);
    }

    const { data, error } = await query;

    if (!error && data) {
      setVendors(data as Vendor[]);
    }
    setLoading(false);
  };

  const handleAction = async () => {
    if (!actionDialog.vendor) return;

    const newStatus = actionDialog.action === 'approve' ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('vendors')
      .update({ status: newStatus })
      .eq('id', actionDialog.vendor.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update vendor status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: actionDialog.action === 'approve' ? 'Vendor Approved' : 'Vendor Rejected',
        description: `${actionDialog.vendor.business_name} has been ${newStatus}`,
      });
      fetchVendors();
    }

    setActionDialog({ open: false, vendor: null, action: 'approve' });
  };

  const getCategoryLabel = (value: string) =>
    VENDOR_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getRegionLabel = (value: string) =>
    LEBANESE_REGIONS.find((r) => r.value === value)?.label || value;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Vendor Management</h2>
          <p className="text-muted-foreground">Review and manage vendor applications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {activeTab === 'all' ? 'All Vendors' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Vendors`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {activeTab !== 'all' ? activeTab : ''} vendors found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.business_name}</TableCell>
                          <TableCell>{getCategoryLabel(vendor.category)}</TableCell>
                          <TableCell>{getRegionLabel(vendor.region)}</TableCell>
                          <TableCell>
                            {vendor.starting_price_usd
                              ? `$${vendor.starting_price_usd.toLocaleString()}`
                              : '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(vendor.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="View vendor"
                              >
                                <a href={`/vendors/${vendor.id}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              {vendor.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() =>
                                      setActionDialog({ open: true, vendor, action: 'approve' })
                                    }
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      setActionDialog({ open: true, vendor, action: 'reject' })
                                    }
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {vendor.status !== 'pending' && (
                                <Button
                                  variant="outline"
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionDialog.action}{' '}
              <strong>{actionDialog.vendor?.business_name}</strong>?
              {actionDialog.action === 'approve'
                ? ' They will be visible in the vendor directory.'
                : ' They will be removed from the vendor directory.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                actionDialog.action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
