import { motion } from 'framer-motion';
import { useState } from 'react';
import { OnboardingOption } from '../OnboardingOption';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Lightbulb } from 'lucide-react';

interface GuestCountStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

const guestOptions = [
  { label: '< 50', value: '<50' },
  { label: '50 - 100', value: '50-100' },
  { label: '100 - 150', value: '100-150' },
  { label: '150 - 200', value: '150-200' },
  { label: '200 - 300', value: '200-300' },
  { label: '> 300', value: '>300' },
];

export function GuestCountStep({ value, onChange }: GuestCountStepProps) {
  const [mode, setMode] = useState<'select' | 'enter'>('select');
  const [customValue, setCustomValue] = useState('');

  const handleCustomSubmit = () => {
    if (customValue) {
      onChange(customValue);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <p className="text-muted-foreground mb-2">About how many</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
        guests will you invite?
      </h1>
      
      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
        <Lightbulb className="w-4 h-4" />
        <p className="text-sm">Larger weddings cost more with more budget needed for catering, stationery etc.</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'select' | 'enter')} className="mb-8">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
          <TabsTrigger value="select">Select amount</TabsTrigger>
          <TabsTrigger value="enter">Enter number</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'select' ? (
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {guestOptions.map((option) => (
            <OnboardingOption
              key={option.value}
              label={option.label}
              selected={value === option.value}
              onClick={() => onChange(option.value)}
              className="py-3 text-base"
            />
          ))}
        </div>
      ) : (
        <div className="max-w-xs mx-auto">
          <Input
            type="number"
            placeholder="Enter number of guests"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onBlur={handleCustomSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            className="text-center text-lg py-6"
          />
        </div>
      )}
    </motion.div>
  );
}
