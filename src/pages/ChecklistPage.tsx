import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2,
  ChevronDown,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_CHECKLIST_ITEMS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  due_months_before: number | null;
  is_completed: boolean;
  is_custom: boolean;
  category: string | null;
  completed_at: string | null;
}

const CATEGORY_DOTS: Record<string, string> = {
  Planning: 'bg-blue-500',
  Venue: 'bg-purple-500',
  Attire: 'bg-pink-500',
  Photography: 'bg-amber-500',
  Entertainment: 'bg-rose-500',
  Food: 'bg-orange-500',
  Decor: 'bg-teal-500',
  Beauty: 'bg-fuchsia-500',
  Guests: 'bg-indigo-500',
  Honeymoon: 'bg-cyan-500',
  Stationery: 'bg-lime-500',
  Transport: 'bg-slate-500',
  Jewelry: 'bg-yellow-500',
  Other: 'bg-gray-500',
};

export default function ChecklistPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Planning');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([12, 10, 8]));

  useEffect(() => {
    if (user) {
      fetchChecklist();
    }
  }, [user]);

  const fetchChecklist = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('due_months_before', { ascending: false });

      if (fetchError) throw fetchError;
      
      if (data && data.length === 0) {
        await initializeDefaultChecklist();
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error('Error loading checklist:', err);
      setError(err instanceof Error ? err : new Error('Failed to load checklist'));
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultChecklist = async () => {
    if (!user) return;

    const defaultItems = DEFAULT_CHECKLIST_ITEMS.map(item => ({
      user_id: user.id,
      title: item.title,
      category: item.category,
      due_months_before: item.due_months_before,
      is_completed: false,
      is_custom: false,
    }));

    const { data, error } = await supabase
      .from('checklist_items')
      .insert(defaultItems)
      .select();

    if (!error && data) {
      setItems(data);
      toast({ title: 'Checklist ready!', description: 'Your wedding timeline is set.' });
    }
  };

  const toggleItem = async (item: ChecklistItem) => {
    const newCompleted = !item.is_completed;
    
    const { error } = await supabase
      .from('checklist_items')
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq('id', item.id);

    if (!error) {
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : i
      ));
      
      if (newCompleted) {
        toast({ title: '🎉 Done!', description: 'One step closer to your day.' });
      }
    }
  };

  const addCustomTask = async () => {
    if (!user || !newTaskTitle.trim()) return;

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        user_id: user.id,
        title: newTaskTitle,
        category: newTaskCategory,
        is_custom: true,
        is_completed: false,
      })
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [data, ...prev]);
      setNewTaskTitle('');
      setDialogOpen(false);
      toast({ title: 'Task added!' });
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: 'Task deleted' });
    }
  };

  const toggleSection = (month: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const groupedByMonth = items.reduce((acc, item) => {
    const month = item.due_months_before ?? -1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<number, ChecklistItem[]>);

  const completedCount = items.filter(i => i.is_completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const getMonthLabel = (months: number) => {
    if (months === 12) return '12 months before';
    if (months === 10) return '10 months before';
    if (months === 8) return '8 months before';
    if (months === 6) return '6 months before';
    if (months === 4) return '4 months before';
    if (months === 3) return '3 months before';
    if (months === 2) return '2 months before';
    if (months === 1) return '1 month before';
    if (months === 0) return 'Final week';
    return 'Custom tasks';
  };

  const getCategoryDot = (category: string | null) => {
    return category ? (CATEGORY_DOTS[category] || CATEGORY_DOTS.Other) : CATEGORY_DOTS.Other;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
              Checklist
            </h1>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{items.length} tasks done
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                />
                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Venue">Venue</SelectItem>
                    <SelectItem value="Attire">Attire</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Decor">Decor</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Guests">Guests</SelectItem>
                    <SelectItem value="Honeymoon">Honeymoon</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addCustomTask} className="w-full">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
        >
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                strokeWidth="6"
                fill="none"
                className="stroke-muted"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                strokeWidth="6"
                fill="none"
                className="stroke-primary"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 176" }}
                animate={{ strokeDasharray: `${(progressPercent / 100) * 176} 176` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {progressPercent === 100 ? (
                <PartyPopper className="w-5 h-5 text-primary" />
              ) : (
                <span className="text-sm font-bold text-foreground">{progressPercent}%</span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">
              {progressPercent === 100 ? 'All done! 🎉' : 'Keep going!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {progressPercent === 100 
                ? 'Your wedding is perfectly planned'
                : `${items.length - completedCount} tasks remaining`}
            </p>
          </div>
          {progressPercent > 0 && progressPercent < 100 && (
            <Sparkles className="w-5 h-5 text-primary/50" />
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Collapsible Timeline Sections */}
        {!loading && (
          <div className="space-y-2">
            {Object.entries(groupedByMonth)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([month, monthItems]) => {
                const monthNum = Number(month);
                const completedInSection = monthItems.filter(i => i.is_completed).length;
                const isExpanded = expandedSections.has(monthNum);

                return (
                  <Collapsible
                    key={month}
                    open={isExpanded}
                    onOpenChange={() => toggleSection(monthNum)}
                  >
                    <CollapsibleTrigger asChild>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                          "bg-card border border-border hover:bg-muted/50",
                          isExpanded && "rounded-b-none border-b-0"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                            completedInSection === monthItems.length
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {completedInSection === monthItems.length ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              `${completedInSection}/${monthItems.length}`
                            )}
                          </div>
                          <span className="font-medium text-foreground text-sm">
                            {getMonthLabel(monthNum)}
                          </span>
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </motion.button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="bg-card border border-t-0 border-border rounded-b-lg overflow-hidden">
                        {monthItems.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className={cn(
                              "group flex items-start gap-3 px-4 py-3 transition-colors",
                              idx !== monthItems.length - 1 && "border-b border-border/50",
                              item.is_completed ? "bg-muted/30" : "hover:bg-muted/20"
                            )}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleItem(item)}
                              className="flex-shrink-0 mt-0.5"
                            >
                              {item.is_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-2 h-2 rounded-full flex-shrink-0",
                                  getCategoryDot(item.category)
                                )} />
                                <p className={cn(
                                  "text-sm leading-tight",
                                  item.is_completed 
                                    ? "text-muted-foreground line-through" 
                                    : "text-foreground"
                                )}>
                                  {item.title}
                                </p>
                              </div>
                              {item.category && (
                                <span className="text-[11px] text-muted-foreground ml-4">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            {/* Delete (custom only) */}
                            {item.is_custom && (
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground mb-1">
              No tasks yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Your wedding checklist will appear here
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            title="Failed to load checklist"
            message={error.message}
            onRetry={fetchChecklist}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
