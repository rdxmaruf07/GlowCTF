import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, ReactNode } from "react";

// Enhanced Floating Animation (inspired by reactbits)
interface FloatingAnimationProps {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  direction?: 'vertical' | 'horizontal' | 'circular' | 'random' | 'down' | 'up';
  duration?: number;
  delay?: number;
  className?: string;
  isPlaying?: boolean;
  onStop?: () => void;
}

export function FloatingAnimation({ 
  children, 
  intensity = 'medium',
  direction = 'vertical',
  duration = 4,
  delay = 0,
  className = "",
  isPlaying = true,
  onStop
}: FloatingAnimationProps) {
  const intensityMap = {
    subtle: { range: 10, rotation: 2 },
    medium: { range: 20, rotation: 5 },
    strong: { range: 35, rotation: 10 }
  };

  const { range, rotation } = intensityMap[intensity];

  const getAnimationProps = () => {
    if (!isPlaying) {
      return {
        y: 0,
        x: 0,
        rotate: 0
      };
    }

    switch (direction) {
      case 'vertical':
        return {
          y: [-range, range, -range],
          rotate: [-rotation, rotation, -rotation]
        };
      case 'horizontal':
        return {
          x: [-range, range, -range],
          rotate: [-rotation, rotation, -rotation]
        };
      case 'circular':
        return {
          x: [-range, range, 0, -range],
          y: [-range, 0, range, -range],
          rotate: [0, 90, 180, 270, 360]
        };
      case 'random':
        return {
          x: [-range, range/2, -range/2, range, -range],
          y: [-range/2, range, -range, range/2, -range/2],
          rotate: [-rotation, rotation, -rotation/2, rotation/2, -rotation]
        };
      case 'down':
        return {
          y: [0, range * 2, 0],
          rotate: [-rotation/2, rotation/2, -rotation/2]
        };
      case 'up':
        return {
          y: [0, -range * 2, 0],
          rotate: [-rotation/2, rotation/2, -rotation/2]
        };
      default:
        return {
          y: [-range, range, -range]
        };
    }
  };

  return (
    <motion.div
      className={className}
      animate={getAnimationProps()}
      transition={{
        duration,
        repeat: isPlaying ? Infinity : 0,
        ease: "easeInOut",
        delay,
      }}
      onAnimationComplete={() => {
        if (!isPlaying && onStop) {
          onStop();
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Blur Blinking Animation
interface BlurBlinkProps {
  children: ReactNode;
  blurIntensity?: number;
  blinkSpeed?: number;
  className?: string;
  trigger?: 'hover' | 'always' | 'inView';
}

export function BlurBlink({ 
  children, 
  blurIntensity = 8,
  blinkSpeed = 1.5,
  className = "",
  trigger = 'always'
}: BlurBlinkProps) {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const [isHovered, setIsHovered] = useState(false);

  const shouldAnimate = () => {
    switch (trigger) {
      case 'hover':
        return isHovered;
      case 'inView':
        return isInView;
      case 'always':
      default:
        return true;
    }
  };

  const blinkVariants = {
    normal: {
      filter: "blur(0px)",
      opacity: 1,
    },
    blurred: {
      filter: `blur(${blurIntensity}px)`,
      opacity: 0.7,
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={blinkVariants}
      animate={shouldAnimate() ? ["normal", "blurred", "normal"] : "normal"}
      transition={{
        duration: blinkSpeed,
        repeat: shouldAnimate() ? Infinity : 0,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  );
}

// Pulsing Glow Animation
interface PulsingGlowProps {
  children: ReactNode;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  speed?: number;
  className?: string;
}

export function PulsingGlow({ 
  children, 
  glowColor = "rgba(59, 130, 246, 0.5)",
  intensity = 'medium',
  speed = 2,
  className = ""
}: PulsingGlowProps) {
  const intensityMap = {
    low: { blur: 10, spread: 5 },
    medium: { blur: 20, spread: 10 },
    high: { blur: 30, spread: 15 }
  };

  const { blur, spread } = intensityMap[intensity];

  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 ${blur}px ${spread}px ${glowColor}`,
          `0 0 ${blur * 1.5}px ${spread * 1.5}px ${glowColor}`,
          `0 0 ${blur}px ${spread}px ${glowColor}`
        ]
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Morphing Shape Animation
interface MorphingShapeProps {
  size?: number;
  colors?: string[];
  morphSpeed?: number;
  className?: string;
}

export function MorphingShape({ 
  size = 100,
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"],
  morphSpeed = 6,
  className = ""
}: MorphingShapeProps) {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, morphSpeed * 1000);

    return () => clearInterval(interval);
  }, [colors.length, morphSpeed]);

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(45deg, ${colors[currentColorIndex]}, ${colors[(currentColorIndex + 1) % colors.length]})`,
      }}
      animate={{
        scale: [1, 1.3, 0.8, 1.1, 1],
        rotate: [0, 120, 240, 360],
        borderRadius: ["20%", "50%", "30%", "40%", "20%"],
        x: [-20, 20, -10, 10, -20],
        y: [-10, 10, -20, 20, -10],
      }}
      transition={{
        duration: morphSpeed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Liquid Morphing Background
interface LiquidMorphProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

export function LiquidMorph({ 
  className = "",
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4"],
  speed = 8
}: LiquidMorphProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-30 blur-3xl"
          style={{
            background: color,
            width: `${200 + index * 50}px`,
            height: `${200 + index * 50}px`,
          }}
          animate={{
            x: [
              Math.random() * 400 - 200,
              Math.random() * 400 - 200,
              Math.random() * 400 - 200,
              Math.random() * 400 - 200,
            ],
            y: [
              Math.random() * 400 - 200,
              Math.random() * 400 - 200,
              Math.random() * 400 - 200,
              Math.random() * 400 - 200,
            ],
            scale: [1, 1.5, 0.8, 1.2, 1],
          }}
          transition={{
            duration: speed + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Particle Burst Animation
interface ParticleBurstProps {
  trigger?: boolean;
  particleCount?: number;
  colors?: string[];
  size?: number;
  className?: string;
  onComplete?: () => void;
}

export function ParticleBurst({ 
  trigger = false,
  particleCount = 20,
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"],
  size = 4,
  className = "",
  onComplete
}: ParticleBurstProps) {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: (360 / particleCount) * i,
    distance: Math.random() * 200 + 100,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {trigger && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: particle.color,
              left: '50%',
              top: '50%',
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
              y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              if (particle.id === particles.length - 1) {
                onComplete?.();
              }
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Breathing Animation
interface BreathingProps {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: number;
  className?: string;
}

export function Breathing({ 
  children, 
  intensity = 'medium',
  speed = 3,
  className = ""
}: BreathingProps) {
  const intensityMap = {
    subtle: { scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] },
    medium: { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] },
    strong: { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }
  };

  const { scale, opacity } = intensityMap[intensity];

  return (
    <motion.div
      className={className}
      animate={{
        scale,
        opacity,
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Wobble Animation
interface WobbleProps {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: number;
  trigger?: 'hover' | 'always' | 'click';
  className?: string;
}

export function Wobble({ 
  children, 
  intensity = 'medium',
  speed = 0.5,
  trigger = 'hover',
  className = ""
}: WobbleProps) {
  const [isActive, setIsActive] = useState(trigger === 'always');
  const [clickCount, setClickCount] = useState(0);

  const intensityMap = {
    subtle: { rotate: [-1, 1, -1], scale: [1, 1.01, 1] },
    medium: { rotate: [-3, 3, -3], scale: [1, 1.03, 1] },
    strong: { rotate: [-5, 5, -5], scale: [1, 1.05, 1] }
  };

  const { rotate, scale } = intensityMap[intensity];

  const handleClick = () => {
    if (trigger === 'click') {
      setClickCount(prev => prev + 1);
      setIsActive(true);
      setTimeout(() => setIsActive(false), speed * 1000);
    }
  };

  return (
    <motion.div
      className={className}
      animate={isActive ? { rotate, scale } : { rotate: 0, scale: 1 }}
      transition={{
        duration: speed,
        repeat: isActive ? 3 : 0,
        ease: "easeInOut",
      }}
      onMouseEnter={() => trigger === 'hover' && setIsActive(true)}
      onMouseLeave={() => trigger === 'hover' && setIsActive(false)}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  );
}

// Shimmer Effect
interface ShimmerProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  className?: string;
}

export function Shimmer({ 
  children, 
  color = "rgba(255, 255, 255, 0.3)",
  speed = 2,
  className = ""
}: ShimmerProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  );
}

// Elastic Scale Animation
interface ElasticScaleProps {
  children: ReactNode;
  trigger?: 'hover' | 'inView' | 'always';
  intensity?: number;
  className?: string;
}

export function ElasticScale({ 
  children, 
  trigger = 'hover',
  intensity = 1.1,
  className = ""
}: ElasticScaleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const [isHovered, setIsHovered] = useState(false);

  const shouldAnimate = () => {
    switch (trigger) {
      case 'hover':
        return isHovered;
      case 'inView':
        return isInView;
      case 'always':
      default:
        return true;
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={shouldAnimate() ? { scale: intensity } : { scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  );
}

// Floating Down Animation (specific implementation)
interface FloatingDownProps {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number;
  className?: string;
  isPlaying?: boolean;
  onStop?: () => void;
}

export function FloatingDown({ 
  children, 
  intensity = 'medium',
  duration = 3,
  className = "",
  isPlaying = true,
  onStop
}: FloatingDownProps) {
  const intensityMap = {
    subtle: { range: 15, rotation: 1 },
    medium: { range: 30, rotation: 3 },
    strong: { range: 50, rotation: 5 }
  };

  const { range, rotation } = intensityMap[intensity];

  return (
    <motion.div
      className={className}
      animate={isPlaying ? {
        y: [0, range, range * 0.7, range * 1.2, 0],
        rotate: [-rotation, rotation, -rotation/2, rotation/2, 0],
        scale: [1, 0.98, 1.02, 0.99, 1]
      } : {
        y: 0,
        rotate: 0,
        scale: 1
      }}
      transition={{
        duration,
        repeat: isPlaying ? Infinity : 0,
        ease: "easeInOut",
        times: [0, 0.3, 0.5, 0.8, 1]
      }}
      onAnimationComplete={() => {
        if (!isPlaying && onStop) {
          onStop();
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Animation Control Component
interface AnimationControlProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onReset?: () => void;
  className?: string;
}

export function AnimationControl({ 
  isPlaying, 
  onPlay, 
  onStop, 
  onReset,
  className = ""
}: AnimationControlProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        onClick={isPlaying ? onStop : onPlay}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <motion.div
            className="w-3 h-3 bg-primary rounded-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <motion.div
            className="w-0 h-0 border-l-[6px] border-l-primary border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
      
      {onReset && (
        <motion.button
          onClick={onReset}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>
      )}
    </div>
  );
}