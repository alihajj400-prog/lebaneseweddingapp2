import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit2,
  PieChart,
  TrendingUp,
  TrendingDown,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_BUDGET_CATEGORIES, USD_TO_LBP_RATE } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

interface BudgetCategory {
  id: string;
  name: string;
  estimated_usd: number;
  estimated_lbp: number;
  actual_usd: number;
  actual_lbp: number;
  notes: string | null;
}

export default function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'usd' | 'lbp'>('usd');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ actual_usd: 0, actual_lbp: 0 });
  const [newCategory, setNewCategory] = useState({ name: '', estimated_usd: 0 });

  useEffect(() => {
    if (user) {
      fetchBudget();
    }
  }, [user]);

  const [error, setError] = useState<Error | null>(null);

  const fetchBudget = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (fetchError) throw fetchError;
      
      if (data && data.length === 0) {
        await initializeDefaultBudget();
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error loading budget:', err);
      setError(err instanceof Error ? err : new Error('Failed to load budget'));
      toast({ title: 'Error loading budget', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultBudget = async () => {
    if (!user) return;

    const defaultItems = DEFAULT_BUDGET_CATEGORIES.map(item => ({
      user_id: user.id,
      name: item.name,
      estimated_usd: item.estimated_usd,
      estimated_lbp: item.estimated_usd * USD_TO_LBP_RATE,
      actual_usd: 0,
      actual_lbp: 0,
    }));

    const { data, error } = await supabase
      .from('budget_categories')
      .insert(defaultItems)
      .select();

    if (!error && data) {
      setCategories(data);
      toast({ title: 'Budget initialized!', description: 'Your wedding budget is ready.' });
    }
  };

  const addCategory = async () => {
    if (!user || !newCategory.name.trim()) return;

    const { data, error } = await supabase
      .from('budget_categories')
      .insert({
        user_id: user.id,
        name: newCategory.name,
        estimated_usd: newCategory.estimated_usd,
        estimated_lbp: newCategory.estimated_usd * USD_TO_LBP_RATE,
        actual_usd: 0,
        actual_lbp: 0,
      })
      .select()
      .single();

    if (!error && data) {
      setCategories(prev => [...prev, data]);
      setNewCategory({ name: '', estimated_usd: 0 });
      setDialogOpen(false);
      toast({ title: 'Category added!' });
    }
  };

  const startEdit = (cat: BudgetCategory) => {
    setEditingId(cat.id);
    setEditValues({ actual_usd: cat.actual_usd, actual_lbp: cat.actual_lbp });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('budget_categories')
      .update({
        actual_usd: editValues.actual_usd,
        actual_lbp: editValues.actual_lbp,
      })
      .eq('id', editingId);

    if (!error) {
      setCategories(prev => prev.map(c => 
        c.id === editingId 
          ? { ...c, actual_usd: editValues.actual_usd, actual_lbp: editValues.actual_lbp }
          : c
      ));
      setEditingId(null);
      toast({ title: 'Budget updated!' });
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id);

    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Category deleted' });
    }
  };

  const totalEstimated = categories.reduce((sum, c) => 
    sum + (currency === 'usd' ? c.estimated_usd : c.estimated_lbp), 0
  );
  const totalActual = categories.reduce((sum, c) => 
    sum + (currency === 'usd' ? c.actual_usd : c.actual_lbp), 0
  );
  const remaining = totalEstimated - totalActual;
  const percentUsed = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

  const formatAmount = (amount: number) => {
    if (currency === 'usd') {
      return `$${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} LBP`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="heading-section text-foreground mb-1">Budget Planner</h1>
            <p className="text-muted-foreground">Track your wedding expenses</p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setCurrency('usd')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  currency === 'usd' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card hover:bg-muted'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('lbp')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  currency === 'lbp' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card hover:bg-muted'
                }`}
              >
                LBP
              </button>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Budget Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Estimated amount (USD)"
                      className="pl-9"
                      value={newCategory.estimated_usd || ''}
                      onChange={e => setNewCategory(prev => ({ ...prev, estimated_usd: Number(e.target.value) }))}
                    />
                  </div>
                  <Button onClick={addCategory} className="w-full">Add Category</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elegant"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Budget</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {formatAmount(totalEstimated)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elegant"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gold-dark" />
              </div>
              <span className="text-sm text-muted-foreground">Spent</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">
              {formatAmount(totalActual)}
            </div>
            <span className="text-sm text-muted-foreground">{percentUsed}% of budget</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elegant"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                remaining >= 0 ? 'bg-olive/10' : 'bg-destructive/10'
              }`}>
                {remaining >= 0 ? (
                  <TrendingDown className="w-5 h-5 text-olive" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-destructive" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <div className={`font-serif text-2xl font-bold ${remaining >= 0 ? 'text-olive' : 'text-destructive'}`}>
              {formatAmount(Math.abs(remaining))}
              {remaining < 0 && ' over'}
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elegant"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-foreground">Budget Usage</span>
            <span className="text-primary font-bold">{percentUsed}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 100 ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-burgundy-light'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Categories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Category</th>
                  <th className="text-right p-4 font-medium text-foreground">Estimated</th>
                  <th className="text-right p-4 font-medium text-foreground">Actual</th>
                  <th className="text-right p-4 font-medium text-foreground">Difference</th>
                  <th className="text-right p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const estimated = currency === 'usd' ? cat.estimated_usd : cat.estimated_lbp;
                  const actual = currency === 'usd' ? cat.actual_usd : cat.actual_lbp;
                  const diff = estimated - actual;

                  return (
                    <tr key={cat.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{cat.name}</td>
                      <td className="p-4 text-right text-muted-foreground">{formatAmount(estimated)}</td>
                      <td className="p-4 text-right">
                        {editingId === cat.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              className="w-32 text-right"
                              value={currency === 'usd' ? editValues.actual_usd : editValues.actual_lbp}
                              onChange={e => setEditValues(prev => ({
                                ...prev,
                                [currency === 'usd' ? 'actual_usd' : 'actual_lbp']: Number(e.target.value)
                              }))}
                            />
                            <button onClick={saveEdit} className="p-1 text-primary hover:text-primary/80">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-foreground">{formatAmount(actual)}</span>
                        )}
                      </td>
                      <td className={`p-4 text-right font-medium ${diff >= 0 ? 'text-olive' : 'text-destructive'}`}>
                        {diff >= 0 ? '+' : ''}{formatAmount(diff)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr>
                  <td className="p-4 font-bold text-foreground">Total</td>
                  <td className="p-4 text-right font-bold text-foreground">{formatAmount(totalEstimated)}</td>
                  <td className="p-4 text-right font-bold text-foreground">{formatAmount(totalActual)}</td>
                  <td className={`p-4 text-right font-bold ${remaining >= 0 ? 'text-olive' : 'text-destructive'}`}>
                    {remaining >= 0 ? '+' : ''}{formatAmount(remaining)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Exchange Rate Note */}
        <p className="text-sm text-muted-foreground text-center">
          Exchange rate: 1 USD = {USD_TO_LBP_RATE.toLocaleString()} LBP (approximate)
        </p>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Failed to load budget"
            message={error.message}
            onRetry={fetchBudget}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
