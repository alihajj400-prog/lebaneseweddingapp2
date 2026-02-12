import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { WeddingYearStep } from '@/components/onboarding/steps/WeddingYearStep';
import { WeddingMonthStep } from '@/components/onboarding/steps/WeddingMonthStep';
import { WeddingDayStep } from '@/components/onboarding/steps/WeddingDayStep';
import { BudgetStep } from '@/components/onboarding/steps/BudgetStep';
import { GuestCountStep } from '@/components/onboarding/steps/GuestCountStep';
import { VenueBookedStep } from '@/components/onboarding/steps/VenueBookedStep';
import { ReadyToExploreStep } from '@/components/onboarding/steps/ReadyToExploreStep';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  weddingYear: string | null;
  weddingMonth: string | null;
  weddingDay: string | null;
  budget: number | null;
  guestCount: string | null;
  venueBooked: boolean | null;
}

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    weddingYear: null,
    weddingMonth: null,
    weddingDay: null,
    budget: null,
    guestCount: null,
    venueBooked: null,
  });

  // Redirect if already completed onboarding
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async (goToVendors = false) => {
    if (!user) return;

    try {
      // Build wedding date from selections
      let weddingDate = null;
      if (data.weddingYear && data.weddingMonth) {
        const monthMap: Record<string, number> = {
          january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
          spring: 3, summer: 6, fall: 9, winter: 11
        };
        const month = monthMap[data.weddingMonth] ?? 5;
        const year = parseInt(data.weddingYear) || new Date().getFullYear() + 1;
        weddingDate = new Date(year, month, 15).toISOString().split('T')[0];
      }

      const { error } = await updateProfile({
        wedding_date: weddingDate,
        estimated_budget_usd: data.budget,
        estimated_guests: data.guestCount,
        venue_booked: data.venueBooked,
        preferred_wedding_day: data.weddingDay,
        preferred_wedding_month: data.weddingMonth,
        onboarding_completed: true,
      });

      if (error) throw error;

      toast({
        title: 'Welcome aboard! 🎉',
        description: 'Your wedding planning journey begins now.',
      });

      navigate(goToVendors ? '/vendors' : '/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    // Auto-advance after selection (with small delay for visual feedback)
    setTimeout(() => {
      if (currentStep < TOTAL_STEPS - 1) {
        handleNext();
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
          onSkip={currentStep < TOTAL_STEPS ? handleSkip : undefined}
          canGoBack={currentStep > 1}
        />

        <div className="flex-1 flex items-center justify-center w-full py-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <WeddingYearStep
                key="year"
                value={data.weddingYear}
                onChange={(v) => updateData('weddingYear', v)}
              />
            )}
            {currentStep === 2 && (
              <WeddingMonthStep
                key="month"
                value={data.weddingMonth}
                onChange={(v) => updateData('weddingMonth', v)}
              />
            )}
            {currentStep === 3 && (
              <WeddingDayStep
                key="day"
                value={data.weddingDay}
                onChange={(v) => updateData('weddingDay', v)}
              />
            )}
            {currentStep === 4 && (
              <BudgetStep
                key="budget"
                value={data.budget}
                onChange={(v) => updateData('budget', v)}
              />
            )}
            {currentStep === 5 && (
              <GuestCountStep
                key="guests"
                value={data.guestCount}
                onChange={(v) => updateData('guestCount', v)}
              />
            )}
            {currentStep === 6 && (
              <VenueBookedStep
                key="venue"
                value={data.venueBooked}
                onChange={(v) => {
                  setData(prev => ({ ...prev, venueBooked: v }));
                  setTimeout(handleNext, 300);
                }}
              />
            )}
            {currentStep === 7 && (
              <ReadyToExploreStep
                key="explore"
                onComplete={() => completeOnboarding(true)}
                onSkip={() => completeOnboarding(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
