import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Configure platform settings</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Construction className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground max-w-sm">
                Admin settings are under development. Check back soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
