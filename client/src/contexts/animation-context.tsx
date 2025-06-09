import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnimationContextType {
  isGlobalAnimationEnabled: boolean;
  toggleGlobalAnimation: () => void;
  stopGlobalAnimation: () => void;
  startGlobalAnimation: () => void;
  resetGlobalAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [isGlobalAnimationEnabled, setIsGlobalAnimationEnabled] = useState(true);

  const toggleGlobalAnimation = () => {
    setIsGlobalAnimationEnabled(prev => !prev);
  };

  const stopGlobalAnimation = () => {
    setIsGlobalAnimationEnabled(false);
  };

  const startGlobalAnimation = () => {
    setIsGlobalAnimationEnabled(true);
  };

  const resetGlobalAnimation = () => {
    setIsGlobalAnimationEnabled(false);
    setTimeout(() => setIsGlobalAnimationEnabled(true), 100);
  };

  return (
    <AnimationContext.Provider value={{
      isGlobalAnimationEnabled,
      toggleGlobalAnimation,
      stopGlobalAnimation,
      startGlobalAnimation,
      resetGlobalAnimation
    }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useGlobalAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useGlobalAnimation must be used within an AnimationProvider');
  }
  return context;
}