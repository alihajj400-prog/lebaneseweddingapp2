import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Heart,
  Save,
  Shield,
  Wallet,
  Users,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const { profile, updateProfile, user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    partner_name: '',
    wedding_date: '',
    phone: '',
  });

  // Sync form when profile loads/changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        partner_name: profile.partner_name || '',
        wedding_date: profile.wedding_date || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile({
      full_name: formData.full_name,
      partner_name: formData.partner_name,
      wedding_date: formData.wedding_date || null,
      phone: formData.phone,
    });

    if (error) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved!' });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="heading-section text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account and wedding details</p>
        </div>

        {/* Profile Settings */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card-elegant space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your personal information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Your Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner_name">Partner's Name</Label>
              <Input
                id="partner_name"
                name="partner_name"
                value={formData.partner_name}
                onChange={handleChange}
                placeholder="Your partner's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+961 XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wedding_date">Wedding Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wedding_date"
                  name="wedding_date"
                  type="date"
                  value={formData.wedding_date}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.form>

        {/* Wedding Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elegant"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-rose/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-burgundy" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-foreground">Wedding Details</h2>
              <p className="text-sm text-muted-foreground">Information about your big day</p>
            </div>
          </div>

          <div className="py-6">
            {profile?.wedding_date ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your wedding date</p>
                <p className="font-serif text-2xl font-medium text-foreground">
                  {new Date(profile.wedding_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {(() => {
                  const days = Math.ceil((new Date(profile.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return days > 0 ? (
                    <p className="text-sm text-primary mt-2">{days} days to go!</p>
                  ) : null;
                })()}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Set your wedding date above to see a countdown
              </p>
            )}
          </div>
        </motion.div>

        {/* Budget & Guest Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-elegant"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-foreground">Wedding Budget & Guests</h2>
              <p className="text-sm text-muted-foreground">Info shared with vendors when you inquire</p>
            </div>
          </div>

          <div className="py-4 space-y-4">
            <Link 
              to="/budget" 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Estimated Budget</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.estimated_budget_usd 
                      ? `$${profile.estimated_budget_usd.toLocaleString()} USD`
                      : 'Not set yet'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link 
              to="/guests" 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Guest Count</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.estimated_guests 
                      ? `${profile.estimated_guests} guests`
                      : 'Not set yet'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* Account Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elegant"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-olive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-olive" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-foreground">Account Security</h2>
              <p className="text-sm text-muted-foreground">Manage your account security settings</p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">
                  Your account email cannot be changed
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">
                  Reset your password via email
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={resetLoading}
                onClick={async () => {
                  if (!user?.email) return;
                  setResetLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/settings`,
                  });
                  if (error) {
                    toast({ title: 'Error', description: error.message, variant: 'destructive' });
                  } else {
                    toast({ title: 'Email sent!', description: 'Check your inbox for the password reset link.' });
                  }
                  setResetLoading(false);
                }}
              >
                {resetLoading ? 'Sending...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </motion.div>
        {/* Sign Out - visible on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:hidden"
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
