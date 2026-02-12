import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Users, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingVendors: 0,
    approvedVendors: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch vendor counts
    const { count: totalVendors } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    const { count: pendingVendors } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approvedVendors } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Fetch user count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'couple');

    setStats({
      totalVendors: totalVendors || 0,
      pendingVendors: pendingVendors || 0,
      approvedVendors: approvedVendors || 0,
      totalUsers: totalUsers || 0,
    });
  };

  const statCards = [
    {
      title: 'Total Vendors',
      value: stats.totalVendors,
      icon: Store,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingVendors,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Approved Vendors',
      value: stats.approvedVendors,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Registered Couples',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="text-muted-foreground">Here's an overview of your platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats.pendingVendors > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800">
                  You have <strong>{stats.pendingVendors}</strong> vendor{stats.pendingVendors !== 1 ? 's' : ''} waiting for approval.{' '}
                  <a href="/admin/vendors" className="underline font-medium">Review now →</a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
