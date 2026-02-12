import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ReadyToExploreStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function ReadyToExploreStep({ onComplete, onSkip }: ReadyToExploreStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center relative"
    >
      {/* Decorative sparkles */}
      <Sparkles className="absolute top-0 right-8 w-6 h-6 text-gold animate-pulse" />
      <Sparkles className="absolute top-20 left-4 w-4 h-4 text-primary/50 animate-pulse" />
      <Sparkles className="absolute bottom-40 right-4 w-5 h-5 text-gold/70 animate-pulse" />
      
      <p className="text-muted-foreground mb-2">Are you ready to start</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
        exploring venues now?
      </h1>

      {/* Image collage placeholder */}
      <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto mb-8">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`
              aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-gold/10
              ${i === 2 ? 'row-span-2' : ''}
              ${i === 4 ? 'col-span-1' : ''}
              flex items-center justify-center text-2xl
            `}
          >
            {['🏰', '💐', '👰', '🌅', '⛪', '🎊', '💒', '🌸', '✨', '🥂'][i]}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 justify-center max-w-md mx-auto">
        <Button
          size="lg"
          onClick={onComplete}
          className="flex-1 py-6 text-lg rounded-full"
        >
          Let's go!
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onSkip}
          className="flex-1 py-6 text-lg rounded-full"
        >
          Not right now
        </Button>
      </div>
    </motion.div>
  );
}
