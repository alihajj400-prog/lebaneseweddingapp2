import { motion } from 'framer-motion';
import { useState } from 'react';
import { OnboardingOption } from '../OnboardingOption';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface BudgetStepProps {
  value: number | null;
  onChange: (value: number) => void;
}

const budgetOptions = [
  { label: '$10K', value: 10000 },
  { label: '$20K', value: 20000 },
  { label: '$30K*', value: 30000, note: true },
  { label: '$40K', value: 40000 },
  { label: '$50K', value: 50000 },
  { label: '$75K', value: 75000 },
  { label: '$100K', value: 100000 },
  { label: '> $100K', value: 150000 },
];

export function BudgetStep({ value, onChange }: BudgetStepProps) {
  const [mode, setMode] = useState<'select' | 'enter'>('select');
  const [customValue, setCustomValue] = useState('');

  const handleCustomSubmit = () => {
    const num = parseInt(customValue.replace(/[^0-9]/g, ''));
    if (num > 0) {
      onChange(num);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <p className="text-muted-foreground mb-2">And how much is your</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
        total wedding budget?
      </h1>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'select' | 'enter')} className="mb-8">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
          <TabsTrigger value="select">Select amount</TabsTrigger>
          <TabsTrigger value="enter">Enter number</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'select' ? (
        <>
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-4">
            {budgetOptions.map((option) => (
              <OnboardingOption
                key={option.value}
                label={option.label}
                selected={value === option.value}
                onClick={() => onChange(option.value)}
                className="py-3 text-base"
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">* Average Lebanese wedding cost</p>
        </>
      ) : (
        <div className="max-w-xs mx-auto">
          <Input
            type="text"
            placeholder="Enter amount in USD"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onBlur={handleCustomSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            className="text-center text-lg py-6"
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground mt-6">
        You can always change this later
      </p>
    </motion.div>
  );
}
