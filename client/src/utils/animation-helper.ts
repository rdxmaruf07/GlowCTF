import { ReactElement, cloneElement } from 'react';

// Animation helper types
export type AnimationName = 
  | 'float' 
  | 'floatDown'
  | 'blur' 
  | 'glow' 
  | 'breathe' 
  | 'wobble' 
  | 'shimmer' 
  | 'elastic'
  | 'none';

export interface AnimationOptions {
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
  trigger?: 'always' | 'hover' | 'click' | 'inView';
  color?: string;
  direction?: 'vertical' | 'horizontal' | 'circular';
}

// Default animation configurations
const animationConfigs = {
  float: {
    className: 'animate-float',
    style: {
      animation: 'float 6s ease-in-out infinite'
    }
  },
  floatDown: {
    className: 'animate-float-down',
    style: {
      animation: 'float-down 3s ease-in-out'
    }
  },
  blur: {
    className: 'animate-blur-blink',
    style: {
      animation: 'blur-blink 1.5s ease-in-out infinite'
    }
  },
  glow: {
    className: 'animate-pulse-glow',
    style: {
      animation: 'pulse-glow 2s ease-in-out infinite alternate'
    }
  },
  breathe: {
    className: 'animate-breathing',
    style: {
      animation: 'breathing 3s ease-in-out infinite'
    }
  },
  wobble: {
    className: 'animate-wobble-hover',
    style: {
      transition: 'transform 0.2s ease'
    }
  },
  shimmer: {
    className: 'animate-shimmer',
    style: {
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s linear infinite'
    }
  },
  elastic: {
    className: 'animate-elastic-hover',
    style: {
      transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  none: {
    className: '',
    style: {}
  }
};

// Intensity modifiers
const intensityModifiers = {
  subtle: {
    animationDuration: '8s',
    transform: 'scale(1.01)',
    filter: 'blur(2px)'
  },
  medium: {
    animationDuration: '4s',
    transform: 'scale(1.05)',
    filter: 'blur(5px)'
  },
  strong: {
    animationDuration: '2s',
    transform: 'scale(1.1)',
    filter: 'blur(10px)'
  }
};

// Speed modifiers
const speedModifiers = {
  slow: '8s',
  normal: '4s',
  fast: '2s'
};

/**
 * Apply animation to a React element
 */
export function applyAnimation(
  element: ReactElement,
  animation: AnimationName,
  options: AnimationOptions = {}
): ReactElement {
  if (animation === 'none') {
    return element;
  }

  const config = animationConfigs[animation];
  const {
    intensity = 'medium',
    speed = 'normal',
    trigger = 'always',
    color,
    direction = 'vertical'
  } = options;

  // Build animation styles
  let animationStyle = { ...config.style };
  
  // Apply intensity
  if (intensity !== 'medium') {
    const modifier = intensityModifiers[intensity];
    animationStyle = {
      ...animationStyle,
      animationDuration: modifier.animationDuration
    };
  }

  // Apply speed
  if (speed !== 'normal') {
    animationStyle = {
      ...animationStyle,
      animationDuration: speedModifiers[speed]
    };
  }

  // Apply color for glow animations
  if (animation === 'glow' && color) {
    animationStyle = {
      ...animationStyle,
      boxShadow: `0 0 20px 5px ${color}`
    };
  }

  // Build className
  let className = config.className;
  if (trigger === 'hover') {
    className += ' hover:animate-active';
  }

  // Clone element with new props
  return cloneElement(element, {
    ...element.props,
    className: `${element.props.className || ''} ${className}`.trim(),
    style: {
      ...element.props.style,
      ...animationStyle
    }
  });
}

/**
 * Create animation wrapper component
 */
export function createAnimationWrapper(
  animation: AnimationName,
  options: AnimationOptions = {}
) {
  return function AnimationWrapper({ children, className = '', ...props }: any) {
    const config = animationConfigs[animation];
    const {
      intensity = 'medium',
      speed = 'normal',
      trigger = 'always'
    } = options;

    let animationStyle = { ...config.style };
    
    if (intensity !== 'medium') {
      const modifier = intensityModifiers[intensity];
      animationStyle = {
        ...animationStyle,
        animationDuration: modifier.animationDuration
      };
    }

    if (speed !== 'normal') {
      animationStyle = {
        ...animationStyle,
        animationDuration: speedModifiers[speed]
      };
    }

    let wrapperClassName = `${className} ${config.className}`.trim();
    if (trigger === 'hover') {
      wrapperClassName += ' hover:animate-active';
    }

    return (
      <div 
        className={wrapperClassName}
        style={animationStyle}
        {...props}
      >
        {children}
      </div>
    );
  };
}

/**
 * Animation presets for common use cases
 */
export const AnimationPresets = {
  // Sidebar animations
  floatingSidebar: (element: ReactElement) => 
    applyAnimation(element, 'float', { intensity: 'subtle', speed: 'slow' }),
  
  glowingSidebar: (element: ReactElement) => 
    applyAnimation(element, 'glow', { intensity: 'medium', color: 'rgba(59, 130, 246, 0.3)' }),
  
  breathingSidebar: (element: ReactElement) => 
    applyAnimation(element, 'breathe', { intensity: 'subtle', speed: 'slow' }),

  // Button animations
  wobbleButton: (element: ReactElement) => 
    applyAnimation(element, 'wobble', { trigger: 'hover', intensity: 'medium' }),
  
  elasticButton: (element: ReactElement) => 
    applyAnimation(element, 'elastic', { trigger: 'hover' }),

  // Card animations
  floatingCard: (element: ReactElement) => 
    applyAnimation(element, 'float', { intensity: 'subtle', direction: 'vertical' }),
  
  shimmerCard: (element: ReactElement) => 
    applyAnimation(element, 'shimmer', { speed: 'slow' }),

  // Text animations
  blinkingText: (element: ReactElement) => 
    applyAnimation(element, 'blur', { intensity: 'subtle', speed: 'slow' })
};

/**
 * Batch apply animations to multiple elements
 */
export function batchApplyAnimations(
  elements: ReactElement[],
  animations: (AnimationName | { name: AnimationName; options?: AnimationOptions })[],
  staggerDelay: number = 0.1
): ReactElement[] {
  return elements.map((element, index) => {
    const animationConfig = animations[index % animations.length];
    const animation = typeof animationConfig === 'string' 
      ? animationConfig 
      : animationConfig.name;
    const options = typeof animationConfig === 'object' 
      ? animationConfig.options 
      : {};

    // Add stagger delay
    const staggeredOptions = {
      ...options,
      style: {
        ...options,
        animationDelay: `${index * staggerDelay}s`
      }
    };

    return applyAnimation(element, animation, staggeredOptions);
  });
}

/**
 * Random animation selector
 */
export function getRandomAnimation(): AnimationName {
  const animations: AnimationName[] = ['float', 'floatDown', 'blur', 'glow', 'breathe', 'wobble', 'shimmer', 'elastic'];
  return animations[Math.floor(Math.random() * animations.length)];
}

/**
 * Animation sequence builder
 */
export class AnimationSequence {
  private animations: Array<{
    animation: AnimationName;
    options: AnimationOptions;
    duration: number;
  }> = [];

  add(animation: AnimationName, options: AnimationOptions = {}, duration: number = 2000) {
    this.animations.push({ animation, options, duration });
    return this;
  }

  build() {
    return this.animations;
  }

  apply(element: ReactElement) {
    // For now, just apply the first animation
    // In a real implementation, you'd use a state machine or animation library
    if (this.animations.length > 0) {
      const first = this.animations[0];
      return applyAnimation(element, first.animation, first.options);
    }
    return element;
  }
}

/**
 * Quick animation utilities
 */
export const quickAnimate = {
  float: (element: ReactElement) => applyAnimation(element, 'float'),
  floatDown: (element: ReactElement) => applyAnimation(element, 'floatDown'),
  glow: (element: ReactElement) => applyAnimation(element, 'glow'),
  blur: (element: ReactElement) => applyAnimation(element, 'blur'),
  breathe: (element: ReactElement) => applyAnimation(element, 'breathe'),
  wobble: (element: ReactElement) => applyAnimation(element, 'wobble'),
  shimmer: (element: ReactElement) => applyAnimation(element, 'shimmer'),
  elastic: (element: ReactElement) => applyAnimation(element, 'elastic'),
  random: (element: ReactElement) => applyAnimation(element, getRandomAnimation())
};