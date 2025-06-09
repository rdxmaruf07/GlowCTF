import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, GraduationCap, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";
import { 
  MagneticButton, 
  RevealText, 
  FloatingElement, 
  MorphingShape,
  Typewriter 
} from "@/components/ui/advanced-animations";
import { useGlobalAnimation } from "@/contexts/animation-context";

export default function HeroSection() {
  const { isGlobalAnimationEnabled } = useGlobalAnimation();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-15, 15, -15],
      x: [-5, 5, -5],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement duration={6} delay={0} range={25} isPlaying={isGlobalAnimationEnabled}>
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl" />
        </FloatingElement>
        <FloatingElement duration={8} delay={2} range={30} isPlaying={isGlobalAnimationEnabled}>
          <div className="absolute top-1/3 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-2xl" />
        </FloatingElement>
        <FloatingElement duration={5} delay={4} range={20} isPlaying={isGlobalAnimationEnabled}>
          <div className="absolute bottom-1/4 left-1/3 w-28 h-28 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl" />
        </FloatingElement>
        
        {/* Morphing Shapes */}
        <div className="absolute top-1/4 right-1/4">
          <MorphingShape isPlaying={isGlobalAnimationEnabled} />
        </div>
        <div className="absolute bottom-1/3 left-1/4">
          <MorphingShape isPlaying={isGlobalAnimationEnabled} />
        </div>
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-8 backdrop-blur-sm"
          >
            <GraduationCap className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Educational Cybersecurity Platform
            </span>
          </motion.div>

          {/* Main Heading with Enhanced Animation */}
          <motion.div
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-8xl font-orbitron font-bold mb-8"
          >
            <RevealText 
              text="Learn Cybersecurity" 
              className="block text-white mb-4"
              delay={0.5}
            />
            <div className="block">
              <span className="text-primary neon-glow">Through Practice</span>
            </div>
            <div className="block mt-4 text-2xl sm:text-3xl lg:text-4xl">
              <Typewriter 
                text="Build Skills. Solve Challenges. Secure the Future."
                className="gradient-text"
                speed={100}
                delay={2000}
              />
            </div>
          </motion.div>

          {/* Enhanced Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed"
          >
            Join fellow students and aspiring cybersecurity professionals in an innovative 
            learning environment. Practice with real-world scenarios, get AI-powered guidance, 
            and prepare for your career in cybersecurity.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <MagneticButton className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
              <Link href="/auth" className="flex items-center">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </MagneticButton>
            
            <MagneticButton className="border border-primary/50 hover:border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold bg-transparent hover:bg-primary/10 transition-all duration-300">
              <div className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </div>
            </MagneticButton>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <motion.div 
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:text-accent transition-colors duration-300">200+</div>
                <div className="text-muted-foreground group-hover:text-white transition-colors duration-300">Practice Labs</div>
                <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              </div>
            </motion.div>
            <motion.div 
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="text-4xl font-bold text-accent mb-2 group-hover:text-primary transition-colors duration-300">1000+</div>
                <div className="text-muted-foreground group-hover:text-white transition-colors duration-300">Students</div>
                <div className="absolute inset-0 rounded-lg bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              </div>
            </motion.div>
            <motion.div 
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="text-4xl font-bold text-green-500 mb-2 group-hover:text-blue-500 transition-colors duration-300">24/7</div>
                <div className="text-muted-foreground group-hover:text-white transition-colors duration-300">AI Tutoring</div>
                <div className="absolute inset-0 rounded-lg bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={isGlobalAnimationEnabled ? { y: [0, 15, 0] } : {}}
          transition={{ duration: 2.5, repeat: isGlobalAnimationEnabled ? Infinity : 0, ease: "easeInOut" }}
          className="w-8 h-12 border-2 border-primary/60 rounded-full flex justify-center relative"
        >
          <motion.div
            animate={isGlobalAnimationEnabled ? { y: [0, 16, 0], opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 2.5, repeat: isGlobalAnimationEnabled ? Infinity : 0, ease: "easeInOut" }}
            className="w-1.5 h-4 bg-gradient-to-b from-primary to-accent rounded-full mt-2"
          />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        </motion.div>
      </motion.div>
    </section>
  );
}