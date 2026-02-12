import { motion } from 'framer-motion';
import { OnboardingOption } from '../OnboardingOption';

interface WeddingDayStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export function WeddingDayStep({ value, onChange }: WeddingDayStepProps) {
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
      <p className="text-muted-foreground mb-8">Choose 1</p>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {days.map((day) => (
          <OnboardingOption
            key={day}
            label={day}
            selected={value === day.toLowerCase()}
            onClick={() => onChange(day.toLowerCase())}
            className={day === 'Sunday' ? 'col-span-2 max-w-[200px] mx-auto' : ''}
          />
        ))}
      </div>
    </motion.div>
  );
}
