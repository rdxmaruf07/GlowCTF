import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimationSelector, AnimationPresets } from "@/components/ui/animation-selector";
import { 
  FloatingAnimation,
  BlurBlink,
  PulsingGlow,
  MorphingShape,
  LiquidMorph,
  ParticleBurst,
  Breathing,
  Wobble,
  Shimmer,
  ElasticScale
} from "@/components/ui/reactbits-animations";
import { 
  FloatingElement,
  RevealText,
  ScrollReveal,
  MagneticButton,
  Typewriter,
  GlitchText,
  RippleButton
} from "@/components/ui/advanced-animations";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Sparkles, Zap, Waves, MousePointer, Type, Eye } from "lucide-react";

export default function AnimationDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string>("floating");

  const demoCards = [
    {
      id: "floating",
      title: "Floating Animation",
      description: "Smooth floating movement with customizable direction and intensity",
      icon: <Waves className="h-5 w-5" />,
      category: "Movement",
      component: (
        <FloatingAnimation intensity="medium" direction="circular" duration={6}>
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            Float
          </div>
        </FloatingAnimation>
      )
    },
    {
      id: "blurBlink",
      title: "Blur Blink",
      description: "Rhythmic blur effect that creates a mesmerizing blinking appearance",
      icon: <Eye className="h-5 w-5" />,
      category: "Visual Effects",
      component: (
        <BlurBlink blurIntensity={10} blinkSpeed={2} trigger="always">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            Blink
          </div>
        </BlurBlink>
      )
    },
    {
      id: "pulsingGlow",
      title: "Pulsing Glow",
      description: "Animated glow effect that pulses with beautiful colors",
      icon: <Sparkles className="h-5 w-5" />,
      category: "Visual Effects",
      component: (
        <PulsingGlow glowColor="rgba(236, 72, 153, 0.6)" intensity="high" speed={1.5}>
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            Glow
          </div>
        </PulsingGlow>
      )
    },
    {
      id: "wobble",
      title: "Wobble Effect",
      description: "Playful wobble animation triggered by hover interaction",
      icon: <MousePointer className="h-5 w-5" />,
      category: "Interactive",
      component: (
        <Wobble intensity="strong" speed={0.4} trigger="hover">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer">
            Hover
          </div>
        </Wobble>
      )
    },
    {
      id: "shimmer",
      title: "Shimmer Effect",
      description: "Elegant shimmer that sweeps across the element",
      icon: <Zap className="h-5 w-5" />,
      category: "Visual Effects",
      component: (
        <Shimmer speed={1.5} color="rgba(255, 255, 255, 0.4)">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            Shine
          </div>
        </Shimmer>
      )
    },
    {
      id: "breathing",
      title: "Breathing",
      description: "Gentle breathing animation with scale and opacity changes",
      icon: <Waves className="h-5 w-5" />,
      category: "Movement",
      component: (
        <Breathing intensity="medium" speed={4}>
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            Breathe
          </div>
        </Breathing>
      )
    }
  ];

  const textAnimations = [
    {
      title: "Reveal Text",
      component: <RevealText text="This text reveals word by word" className="text-2xl font-bold" />
    },
    {
      title: "Typewriter",
      component: <Typewriter text="This is a typewriter effect..." speed={80} className="text-xl" />
    },
    {
      title: "Glitch Text",
      component: <GlitchText text="Hover for glitch effect" className="text-xl font-bold cursor-pointer" />
    }
  ];

  const interactiveElements = [
    {
      title: "Magnetic Button",
      component: (
        <MagneticButton className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
          Magnetic Button
        </MagneticButton>
      )
    },
    {
      title: "Ripple Button",
      component: (
        <RippleButton className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium">
          Ripple Effect
        </RippleButton>
      )
    },
    {
      title: "Elastic Scale",
      component: (
        <ElasticScale trigger="hover" intensity={1.1}>
          <div className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium cursor-pointer">
            Elastic Hover
          </div>
        </ElasticScale>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <LiquidMorph className="opacity-30" />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                ReactBits Inspired Animations
              </Badge>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold">
              <RevealText text="Animation Showcase" className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore a comprehensive collection of smooth, interactive animations inspired by ReactBits
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="showcase" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="text">Text Effects</TabsTrigger>
            <TabsTrigger value="playground">Playground</TabsTrigger>
          </TabsList>

          {/* Showcase Tab */}
          <TabsContent value="showcase" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoCards.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {demo.icon}
                          <CardTitle className="text-lg">{demo.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {demo.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{demo.description}</p>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-32">
                      {demo.component}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Background Effects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  Background Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative h-48 rounded-lg overflow-hidden border">
                    <LiquidMorph />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-semibold bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                        Liquid Morph
                      </span>
                    </div>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden border flex items-center justify-center">
                    <MorphingShape size={120} className="opacity-60" />
                    <span className="text-lg font-semibold bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm z-10">
                      Morphing Shape
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactive Tab */}
          <TabsContent value="interactive" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interactiveElements.map((element, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-center text-lg">{element.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      {element.component}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Particle Burst Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Particle Burst Effect</CardTitle>
                <p className="text-sm text-muted-foreground">Click the button to trigger particle explosion</p>
              </CardHeader>
              <CardContent className="flex justify-center py-12">
                <ParticleBurstDemo />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Effects Tab */}
          <TabsContent value="text" className="space-y-8">
            <div className="space-y-8">
              {textAnimations.map((animation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        {animation.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                      {animation.component}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Playground Tab */}
          <TabsContent value="playground" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Animation Playground</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Experiment with different animations using the interactive controls
                </p>
              </CardHeader>
              <CardContent className="py-12">
                <div className="flex justify-center">
                  <AnimationSelector
                    defaultAnimation="floating"
                    showControls={true}
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl">
                      Demo
                    </div>
                  </AnimationSelector>
                </div>
              </CardContent>
            </Card>

            {/* Animation Presets */}
            <AnimationPresets />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Particle Burst Demo Component
function ParticleBurstDemo() {
  const [trigger, setTrigger] = useState(false);

  return (
    <div className="relative">
      <ParticleBurst 
        trigger={trigger} 
        particleCount={25} 
        colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]}
        onComplete={() => setTrigger(false)}
      />
      <Button
        onClick={() => setTrigger(true)}
        disabled={trigger}
        className="px-8 py-4 text-lg font-semibold"
      >
        {trigger ? "Exploding..." : "Trigger Burst"}
      </Button>
    </div>
  );
}