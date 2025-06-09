import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";
import { MagneticButton, ScrollReveal } from "@/components/ui/advanced-animations";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
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

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-green-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-8 backdrop-blur-sm"
          >
            <GraduationCap className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Start Your Learning Journey
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-6xl font-orbitron font-bold mb-6"
          >
            Ready to Master
            <span className="block gradient-text">Cybersecurity Skills?</span>
            <span className="block text-white">Join Us Today!</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Join thousands of students and professionals who are building their cybersecurity 
            expertise with our comprehensive learning platform. Start your journey with our 
            free educational resources and hands-on practice labs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <MagneticButton className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
              <Link href="/auth" className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </MagneticButton>
            
            <MagneticButton className="border border-primary/50 hover:border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold bg-transparent hover:bg-primary/10 transition-all duration-300">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Join Study Groups
              </div>
            </MagneticButton>
          </motion.div>

          {/* Educational Benefits */}
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div 
                className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm group hover:border-primary/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Free Learning Resources</h3>
                <p className="text-muted-foreground text-sm">Access comprehensive tutorials, guides, and practice materials at no cost</p>
              </motion.div>

              <motion.div 
                className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm group hover:border-accent/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Collaborative Learning</h3>
                <p className="text-muted-foreground text-sm">Connect with peers, form study groups, and learn together</p>
              </motion.div>

              <motion.div 
                className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm group hover:border-green-500/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Academic Support</h3>
                <p className="text-muted-foreground text-sm">AI-powered tutoring and instant help when you need it</p>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Educational Features */}
          <motion.div
            variants={itemVariants}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center sm:justify-start">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              <span className="text-muted-foreground">100% Free for Students</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <div className="w-2 h-2 bg-accent rounded-full mr-3" />
              <span className="text-muted-foreground">Instant Access</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <span className="text-muted-foreground">No Prerequisites</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/6 w-8 h-8 border-2 border-primary/30 rounded-full"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [360, 180, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/6 w-6 h-6 bg-accent/30 rounded-lg rotate-45"
        />
        <motion.div
          animate={{
            y: [-15, 15, -15],
            x: [-10, 10, -10],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/3 left-1/5 w-4 h-4 bg-green-500/30 rounded-full"
        />
      </div>
    </section>
  );
}
