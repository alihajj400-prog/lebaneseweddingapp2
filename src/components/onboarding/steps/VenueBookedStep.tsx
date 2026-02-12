import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface VenueBookedStepProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function VenueBookedStep({ value, onChange }: VenueBookedStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <p className="text-muted-foreground mb-2">Have you</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
        booked your venue?
      </h1>

      {/* Decorative image placeholder - using gradient background */}
      <div className="w-full max-w-md mx-auto aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-gold/20 mb-8 flex items-center justify-center">
        <span className="text-6xl">💒</span>
      </div>

      <div className="flex gap-4 justify-center max-w-md mx-auto">
        <Button
          variant={value === false ? "default" : "outline"}
          size="lg"
          onClick={() => onChange(false)}
          className="flex-1 py-6 text-lg rounded-full"
        >
          No
        </Button>
        <Button
          variant={value === true ? "default" : "outline"}
          size="lg"
          onClick={() => onChange(true)}
          className="flex-1 py-6 text-lg rounded-full"
        >
          Yes
        </Button>
      </div>
    </motion.div>
  );
}
