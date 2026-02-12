import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Store,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RecommendedVendors } from '@/components/dashboard/RecommendedVendors';

interface DashboardStats {
  tasksCompleted: number;
  totalTasks: number;
  budgetUsed: number;
  totalBudget: number;
  guestsConfirmed: number;
  totalGuests: number;
  shortlistedVendors: number;
}

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    budgetUsed: 0,
    totalBudget: 0,
    guestsConfirmed: 0,
    totalGuests: 0,
    shortlistedVendors: 0,
  });
  const [loading, setLoading] = useState(true);

  // Calculate days until wedding
  const daysUntilWedding = profile?.wedding_date
    ? Math.ceil((new Date(profile.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch checklist stats
      const { data: checklistData } = await supabase
        .from('checklist_items')
        .select('is_completed')
        .eq('user_id', user.id);

      const tasksCompleted = checklistData?.filter(t => t.is_completed).length || 0;
      const totalTasks = checklistData?.length || 0;

      // Fetch budget stats
      const { data: budgetData } = await supabase
        .from('budget_categories')
        .select('estimated_usd, actual_usd')
        .eq('user_id', user.id);

      const totalBudget = budgetData?.reduce((sum, b) => sum + (Number(b.estimated_usd) || 0), 0) || 0;
      const budgetUsed = budgetData?.reduce((sum, b) => sum + (Number(b.actual_usd) || 0), 0) || 0;

      // Fetch guest stats
      const { data: guestData } = await supabase
        .from('guests')
        .select('rsvp_status')
        .eq('user_id', user.id);

      const totalGuests = guestData?.length || 0;
      const guestsConfirmed = guestData?.filter(g => g.rsvp_status === 'confirmed').length || 0;

      // Fetch shortlist count
      const { count: shortlistCount } = await supabase
        .from('shortlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        tasksCompleted,
        totalTasks,
        budgetUsed,
        totalBudget,
        guestsConfirmed,
        totalGuests,
        shortlistedVendors: shortlistCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = stats.totalTasks > 0 
    ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) 
    : 0;

  const quickActions = [
    { href: '/checklist', icon: CheckCircle2, label: 'View Checklist', color: 'bg-primary/10 text-primary' },
    { href: '/budget', icon: DollarSign, label: 'Manage Budget', color: 'bg-gold/10 text-gold-dark' },
    { href: '/guests', icon: Users, label: 'Guest List', color: 'bg-rose/10 text-burgundy' },
    { href: '/vendors', icon: Store, label: 'Find Vendors', color: 'bg-olive/10 text-olive' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="heading-section text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 💕
          </h1>
          <p className="text-muted-foreground">
            {profile?.partner_name
              ? `Planning your wedding with ${profile.partner_name}`
              : "Let's continue planning your perfect wedding"}
          </p>
        </div>

        {/* Wedding Countdown */}
        {daysUntilWedding !== null && daysUntilWedding > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Heart className="w-8 h-8 fill-gold text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold mb-1">Your Big Day</h2>
                  <p className="text-primary-foreground/80">
                    {new Date(profile?.wedding_date || '').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="font-serif text-5xl font-bold text-gold mb-1">
                  {daysUntilWedding}
                </div>
                <div className="text-primary-foreground/80 text-sm">days to go</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Set Wedding Date CTA */}
        {!profile?.wedding_date && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Set Your Wedding Date</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your wedding date to see a countdown and timeline
                  </p>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="outline">Set Date</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elegant"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-medium text-foreground">Planning Progress</h3>
              <p className="text-sm text-muted-foreground">
                {stats.tasksCompleted} of {stats.totalTasks} tasks completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-serif font-bold text-primary">{progressPercent}%</span>
            </div>
          </div>
          <div className="progress-wedding">
            <div 
              className="progress-wedding-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Tasks</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {stats.tasksCompleted}/{stats.totalTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gold-dark" />
              </div>
              <span className="text-sm text-muted-foreground">Budget</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              ${stats.budgetUsed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of ${stats.totalBudget.toLocaleString()} spent
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rose/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-burgundy" />
              </div>
              <span className="text-sm text-muted-foreground">Guests</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {stats.guestsConfirmed}/{stats.totalGuests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">confirmed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-olive/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-olive" />
              </div>
              <span className="text-sm text-muted-foreground">Shortlist</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {stats.shortlistedVendors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">vendors saved</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-serif text-xl font-medium text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Link
                  to={action.href}
                  className="block p-5 bg-card rounded-xl border border-border hover:shadow-soft hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-foreground text-sm">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommended Vendors */}
        {!loading && stats.totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RecommendedVendors />
          </motion.div>
        )}

        {/* Empty State for New Users */}
        {stats.totalTasks === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <Heart className="w-16 h-16 mx-auto text-primary/30 mb-4" />
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">
              Ready to Start Planning?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Begin your wedding planning journey by adding your checklist and budget items.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/checklist">
                <Button className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Start Checklist
                </Button>
              </Link>
              <Link to="/budget">
                <Button variant="outline" className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  Set Budget
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
