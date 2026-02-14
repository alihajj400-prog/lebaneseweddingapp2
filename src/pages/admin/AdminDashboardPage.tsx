import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Store, Users, CheckCircle, Clock, UserPlus, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { format, subDays, parseISO } from 'date-fns';

const CHART_COLORS = ['hsl(var(--primary))', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

function groupByDate<T extends { created_at: string }>(rows: T[], days = 30): { date: string; count: number }[] {
  const end = new Date();
  const start = subDays(end, days);
  const map = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    map.set(format(d, 'yyyy-MM-dd'), 0);
  }
  rows.forEach((r) => {
    const date = r.created_at?.slice(0, 10);
    if (date && map.has(date)) map.set(date, (map.get(date) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([date, count]) => ({ date: format(parseISO(date), 'MMM d'), count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    pendingVendors: 0,
    newUsers7: 0,
    newUsers30: 0,
    newVendors7: 0,
    newVendors30: 0,
  });
  const [usersOverTime, setUsersOverTime] = useState<{ date: string; count: number }[]>([]);
  const [vendorsOverTime, setVendorsOverTime] = useState<{ date: string; count: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [byRegion, setByRegion] = useState<{ name: string; count: number }[]>([]);
  const [recentVendors, setRecentVendors] = useState<{ id: string; business_name: string; status: string; created_at: string }[]>([]);
  const [recentUsers, setRecentUsers] = useState<{ id: string; full_name: string | null; created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const [
        profilesCountRes,
        vendorsCountRes,
        pendingCountRes,
        profilesForChartRes,
        vendorsForChartRes,
        recentVendorsRes,
        recentProfilesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
        supabase.from('vendors').select('id, category, region, status, created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
        supabase.from('vendors').select('id, business_name, status, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalUsers = profilesCountRes.count ?? 0;
      const totalVendors = vendorsCountRes.count ?? 0;
      const pendingVendors = pendingCountRes.count ?? 0;
      const profiles = (profilesForChartRes.data ?? []) as { created_at: string }[];
      const vendors = (vendorsForChartRes.data ?? []) as { id: string; category: string; region: string; status: string; created_at: string }[];
      const newUsers7 = profiles.filter((p) => p.created_at >= sevenDaysAgo).length;
      const newUsers30 = profiles.length;
      const newVendors7 = vendors.filter((v) => v.created_at >= sevenDaysAgo).length;
      const newVendors30 = vendors.length;

      setStats({
        totalUsers,
        totalVendors,
        pendingVendors,
        newUsers7,
        newUsers30,
        newVendors7,
        newVendors30,
      });

      setUsersOverTime(groupByDate(profiles));
      setVendorsOverTime(groupByDate(vendors));

      const catCount = new Map<string, number>();
      vendors.forEach((v) => catCount.set(v.category, (catCount.get(v.category) ?? 0) + 1));
      setByCategory(
        Array.from(catCount.entries())
          .map(([key, value]) => ({
            name: VENDOR_CATEGORIES.find((c) => c.value === key)?.label ?? key,
            value,
          }))
          .filter((c) => c.value > 0)
          .sort((a, b) => b.value - a.value)
      );

      const regionCount = new Map<string, number>();
      vendors.forEach((v) => regionCount.set(v.region, (regionCount.get(v.region) ?? 0) + 1));
      setByRegion(
        Array.from(regionCount.entries()).map(([name, count]) => ({
          name: LEBANESE_REGIONS.find((r) => r.value === name)?.label ?? name,
          count,
        })).sort((a, b) => b.count - a.count)
      );

      setRecentVendors((recentVendorsRes.data ?? []) as typeof recentVendors);
      setRecentUsers((recentProfilesRes.data ?? []) as typeof recentUsers);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-16 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Platform overview and analytics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total users</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total vendors</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending approval</CardTitle>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New (7d / 30d)</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newUsers7 + stats.newVendors7} / {stats.newUsers30 + stats.newVendors30}</div>
              <p className="text-xs text-muted-foreground mt-1">Users + vendors</p>
            </CardContent>
          </Card>
        </div>

        {stats.pendingVendors > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-amber-800 dark:text-amber-200">
                  <strong>{stats.pendingVendors}</strong> vendor{stats.pendingVendors !== 1 ? 's' : ''} waiting for approval.
                </p>
                <Button asChild size="sm" variant="outline" className="border-amber-300 dark:border-amber-700">
                  <Link to="/admin/vendors?status=pending">Review →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users over time (30 days)</CardTitle>
              <CardDescription>New signups by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vendors created (30 days)</CardTitle>
              <CardDescription>New vendors by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Vendors" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vendors by category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                {byCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory.slice(0, 8)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {byCategory.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vendors by region</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                {byRegion.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byRegion} layout="vertical" margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Vendors" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent vendor activity</CardTitle>
              <CardDescription>Latest vendor applications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVendors.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No vendors yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentVendors.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-2 text-sm">
                      <Link to={`/admin/vendors/${v.id}/edit`} className="font-medium hover:underline truncate">
                        {v.business_name}
                      </Link>
                      <Badge
                        variant="secondary"
                        className={
                          v.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30'
                            : v.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                        }
                      >
                        {v.status}
                      </Badge>
                      <span className="text-muted-foreground shrink-0">{format(new Date(v.created_at), 'MMM d')}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/admin/vendors">View all vendors</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent user signups</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No users yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentUsers.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium truncate">{u.full_name || 'No name'}</span>
                      <span className="text-muted-foreground shrink-0">{format(new Date(u.created_at), 'MMM d')}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/admin/users">View users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
