import { motion } from 'framer-motion';
import { useState } from 'react';
import { OnboardingOption } from '../OnboardingOption';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeddingMonthStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

const seasons = [
  { label: 'Spring', value: 'spring', months: 'Mar - May' },
  { label: 'Summer', value: 'summer', months: 'Jun - Aug' },
  { label: 'Fall', value: 'fall', months: 'Sep - Nov' },
  { label: 'Winter', value: 'winter', months: 'Dec - Feb' },
];

export function WeddingMonthStep({ value, onChange }: WeddingMonthStepProps) {
  const [mode, setMode] = useState<'month' | 'season'>('month');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <p className="text-muted-foreground mb-2">What's your ideal</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
        wedding date?
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        💡 Save money by marrying in the off-peak season
      </p>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'month' | 'season')} className="mb-8">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="season">Season</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'month' ? (
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {months.map((month) => (
            <OnboardingOption
              key={month}
              label={month}
              selected={value === month.toLowerCase()}
              onClick={() => onChange(month.toLowerCase())}
              className="py-3 text-base"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {seasons.map((season) => (
            <OnboardingOption
              key={season.value}
              label={season.label}
              selected={value === season.value}
              onClick={() => onChange(season.value)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
