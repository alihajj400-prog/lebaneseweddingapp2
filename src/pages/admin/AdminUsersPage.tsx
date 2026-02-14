import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Search, ExternalLink, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type UserRole = 'couple' | 'vendor' | 'admin';

interface UserRow {
  id: string;
  user_id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  wedding_date: string | null;
  partner_name: string | null;
  created_at: string;
  vendor_id: string | null;
  vendor_business_name: string | null;
}

const ROLE_OPTIONS: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: 'couple', label: 'Couple' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'admin', label: 'Admin' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'oldest', label: 'Oldest first' },
] as const;

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(() => searchParams.get('role') || 'all');
  const [sort, setSort] = useState<string>('newest');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, role, phone, wedding_date, partner_name, created_at')
      .order('created_at', { ascending: false })
      .range(0, 999);

    if (profilesError) {
      toast({ title: 'Error', description: profilesError.message, variant: 'destructive' });
      setUsers([]);
      setLoading(false);
      return;
    }

    const profiles = (profilesData ?? []) as UserRow[];
    const userIds = profiles.map((p) => p.user_id);
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('id, user_id, business_name')
      .in('user_id', userIds);

    const vendorByUserId = new Map<string | null, { id: string; business_name: string }>();
    (vendorsData ?? []).forEach((v: { id: string; user_id: string; business_name: string }) => {
      vendorByUserId.set(v.user_id, { id: v.id, business_name: v.business_name });
    });

    const rows: UserRow[] = profiles.map((p) => {
      const vendor = vendorByUserId.get(p.user_id);
      return {
        ...p,
        vendor_id: vendor?.id ?? null,
        vendor_business_name: vendor?.business_name ?? null,
      };
    });
    setUsers(rows);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const role = searchParams.get('role') || 'all';
    setRoleFilter(role);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users
    .filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        (u.full_name ?? '').toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q) ||
        (u.partner_name ?? '').toLowerCase().includes(q) ||
        (u.vendor_business_name ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === 'name') return (a.full_name || '').localeCompare(b.full_name || '');
      return 0;
    });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">Admin</Badge>;
      case 'vendor':
        return <Badge className="bg-primary/10 text-primary">Vendor</Badge>;
      case 'couple':
      default:
        return <Badge variant="secondary">Couple</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">User Management</h2>
            <p className="text-muted-foreground">Manage registered users and couples</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage registered users and couples</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filters & search</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, partner, vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg text-foreground mb-2">No users found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {search || roleFilter !== 'all'
                    ? 'Try adjusting search or filters.'
                    : 'No registered users yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Wedding date</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.full_name || '—'}
                        </TableCell>
                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                        <TableCell className="text-muted-foreground">{u.phone || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.wedding_date ? format(new Date(u.wedding_date), 'MMM d, yyyy') : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.partner_name || '—'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(u.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {u.vendor_id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={`/vendors/${u.vendor_id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View vendor
                              </a>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
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
    </AdminLayout>
  );
}
