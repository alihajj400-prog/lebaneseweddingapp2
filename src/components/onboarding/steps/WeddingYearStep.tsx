import { motion } from 'framer-motion';
import { OnboardingOption } from '../OnboardingOption';

interface WeddingYearStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

const currentYear = new Date().getFullYear();
const years = [
  currentYear.toString(),
  (currentYear + 1).toString(),
  (currentYear + 2).toString(),
  (currentYear + 3).toString(),
  (currentYear + 4).toString(),
  (currentYear + 5).toString(),
];

export function WeddingYearStep({ value, onChange }: WeddingYearStepProps) {
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
      <p className="text-muted-foreground mb-8">Select year</p>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {years.map((year) => (
          <OnboardingOption
            key={year}
            label={year}
            selected={value === year}
            onClick={() => onChange(year)}
          />
        ))}
        <OnboardingOption
          label="Other"
          selected={value === 'other'}
          onClick={() => onChange('other')}
          className="col-span-2"
        />
      </div>
    </motion.div>
  );
}
