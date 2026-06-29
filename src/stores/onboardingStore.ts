import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  onboardingComplete: boolean;
  currentStep: number;
  showOnboarding: boolean;
  dismissedFeatures: string[];
  completedSteps: number[];
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  dismissFeature: (key: string) => void;
  resetOnboarding: () => void;
  goToStep: (step: number) => void;
  closeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      currentStep: 0,
      showOnboarding: false,
      dismissedFeatures: [],
      completedSteps: [],
      startOnboarding: () => set({ showOnboarding: true, currentStep: 0 }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 4) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      skipOnboarding: () => set({ showOnboarding: false, onboardingComplete: true, completedSteps: [] }),
      completeOnboarding: () => set({ showOnboarding: false, onboardingComplete: true, completedSteps: [0, 1, 2, 3, 4] }),
      dismissFeature: (key) => set((s) => ({ dismissedFeatures: [...s.dismissedFeatures, key] })),
      resetOnboarding: () => set({ onboardingComplete: false, currentStep: 0, showOnboarding: false, completedSteps: [] }),
      closeOnboarding: () => set({ showOnboarding: false }),
      goToStep: (step) => set({ currentStep: step }),
    }),
    { name: 'px-onboarding', partialize: (state) => ({ onboardingComplete: state.onboardingComplete, dismissedFeatures: state.dismissedFeatures }) },
  ),
);
