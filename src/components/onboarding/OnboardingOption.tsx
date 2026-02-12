import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function OnboardingOption({ label, selected, onClick, className }: OnboardingOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "px-6 py-4 rounded-2xl border-2 text-lg font-medium transition-all duration-200",
        selected 
          ? "border-primary bg-primary/5 text-primary" 
          : "border-border bg-background text-foreground hover:border-primary/50",
        className
      )}
    >
      {label}
    </motion.button>
  );
}
