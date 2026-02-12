import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  FileText,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
  CalendarDays,
  Lock,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface VendorData {
  id: string;
  business_name: string;
  status: 'pending' | 'approved' | 'rejected';
  shortlist_count: number;
  subscription_plan: string | null;
}

interface Analytics {
  totalViews: number;
  uniqueViews: number;
  brochureRequests: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  requestsThisMonth: number;
}

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    uniqueViews: 0,
    brochureRequests: 0,
    viewsThisWeek: 0,
    viewsThisMonth: 0,
    requestsThisMonth: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch vendor profile
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id, business_name, status, shortlist_count, subscription_plan')
      .eq('user_id', user.id)
      .maybeSingle();

    if (vendorData) {
      setVendor(vendorData as VendorData);
      await Promise.all([
        fetchAnalytics(vendorData.id),
        fetchRecentLeads(vendorData.id),
      ]);
    }
    setLoading(false);
  };

  const fetchAnalytics = async (vendorId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Fetch all views
    const { data: viewsData } = await supabase
      .from('vendor_views')
      .select('session_id, viewed_at')
      .eq('vendor_id', vendorId);

    const views = viewsData || [];
    const uniqueSessions = new Set(views.map(v => v.session_id));
    const viewsThisMonth = views.filter(v => new Date(v.viewed_at) >= startOfMonth).length;
    const viewsThisWeek = views.filter(v => new Date(v.viewed_at) >= startOfWeek).length;

    // Fetch brochure requests
    const { count: totalRequests } = await supabase
      .from('brochure_requests')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    const { count: requestsThisMonth } = await supabase
      .from('brochure_requests')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .gte('created_at', startOfMonth.toISOString());

    setAnalytics({
      totalViews: views.length,
      uniqueViews: uniqueSessions.size,
      brochureRequests: totalRequests || 0,
      viewsThisWeek,
      viewsThisMonth,
      requestsThisMonth: requestsThisMonth || 0,
    });
  };

  const fetchRecentLeads = async (vendorId: string) => {
    const { data } = await supabase
      .from('brochure_requests')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentLeads(data || []);
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

  if (!vendor) {
    return (
      <VendorPortalLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Vendor Profile</h2>
          <p className="text-muted-foreground">Please complete your vendor registration.</p>
        </div>
      </VendorPortalLayout>
    );
  }

  const inquiryRate = analytics.totalViews > 0 
    ? ((analytics.brochureRequests / analytics.totalViews) * 100).toFixed(1)
    : '0';

  const isPaidPlan = vendor?.subscription_plan === 'pro' || vendor?.subscription_plan === 'featured';

  return (
    <VendorPortalLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {vendor.business_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your vendor dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            {vendor.status === 'approved' ? (
              <Badge className="bg-accent/20 text-accent-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                Profile Live
              </Badge>
            ) : vendor.status === 'pending' ? (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>
            ) : (
              <Badge variant="destructive">
                Needs Updates
              </Badge>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {isPaidPlan ? 'Page Views This Week' : 'Total Page Views'}
                </CardDescription>
                <CardTitle className="text-4xl font-bold">
                  {isPaidPlan ? analytics.viewsThisWeek : analytics.totalViews}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPaidPlan ? (
                  <p className="text-sm text-muted-foreground">
                    {analytics.totalViews} total • {analytics.uniqueViews} unique
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Upgrade for detailed analytics
                  </p>
                )}
              </CardContent>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quote Requests
                </CardDescription>
                <CardTitle className="text-4xl font-bold">
                  {analytics.brochureRequests}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPaidPlan ? (
                  <p className="text-sm text-muted-foreground">
                    {analytics.requestsThisMonth} this month
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Upgrade for monthly breakdown
                  </p>
                )}
              </CardContent>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Shortlists
                </CardDescription>
                <CardTitle className="text-4xl font-bold">
                  {vendor.shortlist_count}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Couples interested in you
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Inquiry Rate
                </CardDescription>
                <CardTitle className="text-4xl font-bold">
                  {inquiryRate}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visitors requesting info
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your vendor profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/vendor/profile">
                <Button variant="outline" className="w-full justify-between">
                  Edit Business Profile
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/vendor/images">
                <Button variant="outline" className="w-full justify-between">
                  Manage Portfolio Images
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/vendor/brochure">
                <Button variant="outline" className="w-full justify-between">
                  Upload Brochure
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/vendor/promotions">
                <Button className="w-full justify-between">
                  Promote Your Listing
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest inquiries from couples</CardDescription>
              </div>
              <Link to="/vendor/leads">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No leads yet</p>
                  <p className="text-sm">Inquiries will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">New Quote Request</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{lead.contact_method || 'Contact'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorPortalLayout>
  );
}
