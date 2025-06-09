import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FloatingAnimation,
  FloatingDown,
  BlurBlink,
  PulsingGlow,
  MorphingShape,
  LiquidMorph,
  ParticleBurst,
  Breathing,
  Wobble,
  Shimmer,
  ElasticScale,
  AnimationControl
} from "./reactbits-animations";
import { 
  FloatingElement,
  RevealText,
  ScrollReveal,
  MagneticButton,
  Typewriter,
  GlitchText,
  RippleButton
} from "./advanced-animations";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";

// Animation type definitions
export type AnimationType = 
  | 'floating'
  | 'floatingDown'
  | 'blurBlink'
  | 'pulsingGlow'
  | 'morphingShape'
  | 'liquidMorph'
  | 'particleBurst'
  | 'breathing'
  | 'wobble'
  | 'shimmer'
  | 'elasticScale'
  | 'revealText'
  | 'scrollReveal'
  | 'magneticButton'
  | 'typewriter'
  | 'glitchText'
  | 'rippleButton';

interface AnimationConfig {
  name: string;
  description: string;
  category: 'Movement' | 'Visual Effects' | 'Interactive' | 'Text';
  component: ReactNode;
  props?: Record<string, any>;
}

interface AnimationSelectorProps {
  children: ReactNode;
  className?: string;
  showControls?: boolean;
  defaultAnimation?: AnimationType;
}

export function AnimationSelector({ 
  children, 
  className = "",
  showControls = true,
  defaultAnimation = 'floating'
}: AnimationSelectorProps) {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>(defaultAnimation);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(false);

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  // Animation configurations
  const animations: Record<AnimationType, AnimationConfig> = {
    floating: {
      name: "Floating",
      description: "Smooth floating movement with customizable direction and intensity",
      category: "Movement",
      component: (
        <FloatingAnimation 
          intensity="medium" 
          direction="vertical" 
          duration={4}
          isPlaying={isPlaying}
          onStop={handleStop}
          className={className}
        >
          {children}
        </FloatingAnimation>
      )
    },
    floatingDown: {
      name: "Floating Down",
      description: "Gentle downward floating motion with subtle bounce effect",
      category: "Movement",
      component: (
        <FloatingDown 
          intensity="medium" 
          duration={3}
          isPlaying={isPlaying}
          onStop={handleStop}
          className={className}
        >
          {children}
        </FloatingDown>
      )
    },
    blurBlink: {
      name: "Blur Blink",
      description: "Rhythmic blur effect that creates a blinking appearance",
      category: "Visual Effects",
      component: (
        <BlurBlink 
          blurIntensity={8} 
          blinkSpeed={1.5} 
          trigger="always"
          className={className}
        >
          {children}
        </BlurBlink>
      )
    },
    pulsingGlow: {
      name: "Pulsing Glow",
      description: "Animated glow effect that pulses with customizable colors",
      category: "Visual Effects",
      component: (
        <PulsingGlow 
          glowColor="rgba(59, 130, 246, 0.5)" 
          intensity="medium" 
          speed={2}
          className={className}
        >
          {children}
        </PulsingGlow>
      )
    },
    morphingShape: {
      name: "Morphing Shape",
      description: "Dynamic shape that morphs and changes colors continuously",
      category: "Visual Effects",
      component: (
        <div className={`relative ${className}`}>
          <MorphingShape size={80} morphSpeed={4} className="opacity-30" />
          {children}
        </div>
      )
    },
    liquidMorph: {
      name: "Liquid Morph",
      description: "Fluid background animation with morphing liquid shapes",
      category: "Visual Effects",
      component: (
        <div className={`relative ${className}`}>
          <LiquidMorph speed={6} className="opacity-20" />
          {children}
        </div>
      )
    },
    particleBurst: {
      name: "Particle Burst",
      description: "Explosive particle effect triggered on interaction",
      category: "Interactive",
      component: (
        <div className={`relative ${className}`} onClick={() => setBurstTrigger(!burstTrigger)}>
          <ParticleBurst 
            trigger={burstTrigger} 
            particleCount={15} 
            onComplete={() => setBurstTrigger(false)}
          />
          {children}
        </div>
      )
    },
    breathing: {
      name: "Breathing",
      description: "Gentle breathing animation with scale and opacity changes",
      category: "Movement",
      component: (
        <Breathing 
          intensity="medium" 
          speed={3}
          className={className}
        >
          {children}
        </Breathing>
      )
    },
    wobble: {
      name: "Wobble",
      description: "Playful wobble effect triggered by hover or click",
      category: "Interactive",
      component: (
        <Wobble 
          intensity="medium" 
          speed={0.5} 
          trigger="hover"
          className={className}
        >
          {children}
        </Wobble>
      )
    },
    shimmer: {
      name: "Shimmer",
      description: "Elegant shimmer effect that sweeps across the element",
      category: "Visual Effects",
      component: (
        <Shimmer 
          speed={2} 
          color="rgba(255, 255, 255, 0.3)"
          className={className}
        >
          {children}
        </Shimmer>
      )
    },
    elasticScale: {
      name: "Elastic Scale",
      description: "Bouncy elastic scaling animation with spring physics",
      category: "Interactive",
      component: (
        <ElasticScale 
          trigger="hover" 
          intensity={1.05}
          className={className}
        >
          {children}
        </ElasticScale>
      )
    },
    revealText: {
      name: "Reveal Text",
      description: "Staggered text reveal animation word by word",
      category: "Text",
      component: (
        <RevealText 
          text={typeof children === 'string' ? children : "Animated Text"} 
          className={className}
        />
      )
    },
    scrollReveal: {
      name: "Scroll Reveal",
      description: "Animation triggered when element enters viewport",
      category: "Movement",
      component: (
        <ScrollReveal 
          direction="up" 
          delay={0}
          className={className}
        >
          {children}
        </ScrollReveal>
      )
    },
    magneticButton: {
      name: "Magnetic Button",
      description: "Interactive button that follows mouse movement",
      category: "Interactive",
      component: (
        <MagneticButton className={className}>
          {children}
        </MagneticButton>
      )
    },
    typewriter: {
      name: "Typewriter",
      description: "Classic typewriter effect with blinking cursor",
      category: "Text",
      component: (
        <Typewriter 
          text={typeof children === 'string' ? children : "Typewriter Effect"} 
          speed={100} 
          className={className}
        />
      )
    },
    glitchText: {
      name: "Glitch Text",
      description: "Digital glitch effect on hover with color distortion",
      category: "Text",
      component: (
        <GlitchText 
          text={typeof children === 'string' ? children : "Glitch Effect"} 
          className={className}
        />
      )
    },
    rippleButton: {
      name: "Ripple Button",
      description: "Material design ripple effect on click",
      category: "Interactive",
      component: (
        <RippleButton className={className}>
          {children}
        </RippleButton>
      )
    }
  };

  const currentAnimation = animations[selectedAnimation];

  const groupedAnimations = Object.entries(animations).reduce((acc, [key, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ key: key as AnimationType, ...config });
    return acc;
  }, {} as Record<string, Array<{ key: AnimationType } & AnimationConfig>>);

  return (
    <div className="relative">
      {/* Animation Display */}
      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            key={selectedAnimation}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentAnimation.component}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static fallback when paused */}
      {!isPlaying && (
        <div className={className}>
          {children}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-50"
        >
          <Card className="w-80 bg-background/95 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Animation Controls</CardTitle>
                <div className="flex gap-1">
                  <AnimationControl
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    onStop={handleStop}
                    onReset={handleReset}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setBurstTrigger(!burstTrigger)}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Animation Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentAnimation.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentAnimation.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentAnimation.description}
                </p>
              </div>

              {/* Animation Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Animation</label>
                <Select value={selectedAnimation} onValueChange={(value) => setSelectedAnimation(value as AnimationType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedAnimations).map(([category, anims]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {anims.map((anim) => (
                          <SelectItem key={anim.key} value={anim.key}>
                            {anim.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAnimation('floating')}
                  className="text-xs"
                >
                  Floating
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAnimation('floatingDown')}
                  className="text-xs"
                >
                  Float Down
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAnimation('blurBlink')}
                  className="text-xs"
                >
                  Blur Blink
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAnimation('pulsingGlow')}
                  className="text-xs"
                >
                  Glow
                </Button>
              </div>

              {/* Advanced Settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 border-t border-border pt-3"
                  >
                    <div className="text-sm font-medium">Advanced Settings</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnimation('particleBurst')}
                        className="text-xs"
                      >
                        Particle Burst
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnimation('liquidMorph')}
                        className="text-xs"
                      >
                        Liquid Morph
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnimation('wobble')}
                        className="text-xs"
                      >
                        Wobble
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnimation('shimmer')}
                        className="text-xs"
                      >
                        Shimmer
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// Preset animation combinations
export function AnimationPresets() {
  const presets = [
    {
      name: "Floating Glow",
      description: "Combines floating movement with pulsing glow",
      component: (
        <FloatingAnimation intensity="medium" direction="vertical">
          <PulsingGlow intensity="medium" speed={2}>
            <div className="w-32 h-32 bg-primary/20 rounded-lg flex items-center justify-center">
              Floating Glow
            </div>
          </PulsingGlow>
        </FloatingAnimation>
      )
    },
    {
      name: "Breathing Shimmer",
      description: "Breathing animation with shimmer overlay",
      component: (
        <Breathing intensity="subtle" speed={4}>
          <Shimmer speed={3}>
            <div className="w-32 h-32 bg-accent/20 rounded-lg flex items-center justify-center">
              Breathing Shimmer
            </div>
          </Shimmer>
        </Breathing>
      )
    },
    {
      name: "Wobble Blur",
      description: "Interactive wobble with blur blink effect",
      component: (
        <Wobble trigger="hover" intensity="medium">
          <BlurBlink trigger="hover" blurIntensity={6}>
            <div className="w-32 h-32 bg-green-500/20 rounded-lg flex items-center justify-center cursor-pointer">
              Wobble Blur
            </div>
          </BlurBlink>
        </Wobble>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Animation Presets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {presets.map((preset, index) => (
          <Card key={index} className="p-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{preset.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{preset.description}</p>
            </CardHeader>
            <CardContent className="flex justify-center">
              {preset.component}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}