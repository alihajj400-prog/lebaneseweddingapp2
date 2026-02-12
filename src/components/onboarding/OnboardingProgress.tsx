import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
}

export function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  onBack, 
  onSkip,
  canGoBack 
}: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex items-center justify-between w-full mb-8">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <div className="flex-1 mx-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {onSkip && (
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      )}
    </div>
  );
}
