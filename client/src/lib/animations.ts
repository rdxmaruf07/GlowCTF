import { Variants } from "framer-motion";

// Common animation variants for consistent use across pages
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export const slideInVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const bounceInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export const rotateInVariants: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const hoverLift = {
  y: -5,
  transition: { duration: 0.2 }
};

export const hoverGlow = {
  boxShadow: "0 0 20px rgba(12, 255, 236, 0.3)",
  transition: { duration: 0.2 }
};

// Loading animations
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const spinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Page transition variants
export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// Utility function to create staggered animations
export const createStaggerVariants = (staggerDelay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

// Utility function for entrance animations
export const createEntranceVariants = (direction: 'up' | 'down' | 'left' | 'right' = 'up'): Variants => {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return {
    hidden: { opacity: 0, ...directions[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };
};

// ReactBits-inspired animation variants
export const floatingVariants: Variants = {
  animate: {
    y: [-20, 20, -20],
    x: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const blurBlinkVariants: Variants = {
  animate: {
    filter: ["blur(0px)", "blur(8px)", "blur(0px)"],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const pulsingGlowVariants: Variants = {
  animate: {
    boxShadow: [
      "0 0 20px 5px rgba(59, 130, 246, 0.3)",
      "0 0 30px 15px rgba(59, 130, 246, 0.5)",
      "0 0 20px 5px rgba(59, 130, 246, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const breathingVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const wobbleVariants: Variants = {
  hover: {
    rotate: [-3, 3, -3],
    scale: [1, 1.03, 1],
    transition: {
      duration: 0.5,
      repeat: 3,
      ease: "easeInOut",
    },
  },
};

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Utility function to create floating animation with custom parameters
export const createFloatingVariants = (
  range: number = 20,
  duration: number = 4,
  direction: 'vertical' | 'horizontal' | 'circular' = 'vertical'
): Variants => {
  const animations = {
    vertical: {
      y: [-range, range, -range],
      rotate: [-2, 2, -2],
    },
    horizontal: {
      x: [-range, range, -range],
      rotate: [-2, 2, -2],
    },
    circular: {
      x: [-range, range, 0, -range],
      y: [-range, 0, range, -range],
      rotate: [0, 90, 180, 270, 360],
    },
  };

  return {
    animate: {
      ...animations[direction],
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };
};

// Utility function to create blur blink animation
export const createBlurBlinkVariants = (
  blurIntensity: number = 8,
  speed: number = 1.5
): Variants => ({
  animate: {
    filter: [`blur(0px)`, `blur(${blurIntensity}px)`, `blur(0px)`],
    opacity: [1, 0.7, 1],
    transition: {
      duration: speed,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

// Utility function to create pulsing glow animation
export const createPulsingGlowVariants = (
  color: string = "rgba(59, 130, 246, 0.5)",
  intensity: number = 20
): Variants => ({
  animate: {
    boxShadow: [
      `0 0 ${intensity}px 5px ${color}`,
      `0 0 ${intensity * 1.5}px ${intensity * 0.75}px ${color}`,
      `0 0 ${intensity}px 5px ${color}`
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});
