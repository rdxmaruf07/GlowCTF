// Export all animation components and utilities
export * from '../advanced-animations';
export * from '../reactbits-animations';
export * from '../animation-selector';

// Export animation variants from lib
export * from '../../../lib/animations';

// Re-export commonly used animations with simpler names
export { 
  FloatingAnimation as Float,
  BlurBlink as Blur,
  PulsingGlow as Glow,
  Breathing as Breathe,
  Wobble,
  Shimmer,
  ElasticScale as Elastic
} from '../reactbits-animations';

export {
  FloatingElement as FloatElement,
  RevealText as Reveal,
  ScrollReveal as ScrollIn,
  MagneticButton as Magnetic,
  Typewriter as Type,
  GlitchText as Glitch,
  RippleButton as Ripple
} from '../advanced-animations';

// Animation presets for quick use
export const AnimationPresets = {
  // Movement animations
  float: { component: 'FloatingAnimation', props: { intensity: 'medium', direction: 'vertical' } },
  floatCircular: { component: 'FloatingAnimation', props: { intensity: 'medium', direction: 'circular' } },
  breathe: { component: 'Breathing', props: { intensity: 'medium', speed: 3 } },
  
  // Visual effects
  glow: { component: 'PulsingGlow', props: { intensity: 'medium', speed: 2 } },
  blur: { component: 'BlurBlink', props: { blurIntensity: 8, blinkSpeed: 1.5 } },
  shimmer: { component: 'Shimmer', props: { speed: 2 } },
  
  // Interactive
  wobble: { component: 'Wobble', props: { intensity: 'medium', trigger: 'hover' } },
  elastic: { component: 'ElasticScale', props: { trigger: 'hover', intensity: 1.05 } },
  magnetic: { component: 'MagneticButton', props: {} },
  ripple: { component: 'RippleButton', props: {} },
  
  // Text effects
  reveal: { component: 'RevealText', props: { delay: 0 } },
  typewriter: { component: 'Typewriter', props: { speed: 100 } },
  glitch: { component: 'GlitchText', props: {} },
  
  // Background effects
  liquidMorph: { component: 'LiquidMorph', props: { speed: 8 } },
  morphingShape: { component: 'MorphingShape', props: { size: 100, morphSpeed: 6 } },
  particleBurst: { component: 'ParticleBurst', props: { particleCount: 20 } }
};

// Animation categories for organization
export const AnimationCategories = {
  movement: ['float', 'floatCircular', 'breathe'],
  visualEffects: ['glow', 'blur', 'shimmer', 'liquidMorph', 'morphingShape'],
  interactive: ['wobble', 'elastic', 'magnetic', 'ripple', 'particleBurst'],
  text: ['reveal', 'typewriter', 'glitch'],
  background: ['liquidMorph', 'morphingShape']
};

// Quick animation utilities
export const quickAnimations = {
  // Apply floating animation to any element
  makeFloat: (element: React.ReactElement, options?: any) => ({
    ...element,
    props: {
      ...element.props,
      style: {
        ...element.props.style,
        animation: 'float 6s ease-in-out infinite'
      }
    }
  }),
  
  // Apply glow effect
  makeGlow: (element: React.ReactElement, color = 'rgba(59, 130, 246, 0.5)') => ({
    ...element,
    props: {
      ...element.props,
      style: {
        ...element.props.style,
        boxShadow: `0 0 20px 5px ${color}`,
        animation: 'pulse-glow 2s ease-in-out infinite alternate'
      }
    }
  })
};