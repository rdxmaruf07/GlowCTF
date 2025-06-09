import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Code, Users, Zap, CheckCircle } from "lucide-react";

const highlights = [
  "Industry-standard CTF challenges",
  "AI-powered learning assistance",
  "Real-time collaboration tools",
  "Comprehensive skill tracking",
  "Global leaderboards",
  "24/7 community support"
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <Shield className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-500">
                About GlowCTF
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-bold mb-6"
            >
              The Future of
              <span className="block gradient-text">Cybersecurity Training</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
            >
              GlowCTF Arena is more than just a platform—it's a comprehensive ecosystem 
              designed to nurture the next generation of cybersecurity professionals. 
              Our innovative approach combines traditional CTF challenges with cutting-edge 
              AI assistance and collaborative learning environments.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{highlight}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-white">Security</div>
                <div className="text-xs text-muted-foreground">First</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Code className="w-6 h-6 text-accent" />
                </div>
                <div className="text-sm font-medium text-white">Hands-on</div>
                <div className="text-xs text-muted-foreground">Learning</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-sm font-medium text-white">Community</div>
                <div className="text-xs text-muted-foreground">Driven</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-sm font-medium text-white">AI</div>
                <div className="text-xs text-muted-foreground">Powered</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={imageVariants}
            className="relative"
          >
            <div className="relative">
              {/* Main card */}
              <div className="bg-card border border-border rounded-xl p-8 relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Challenge Progress</div>
                    <div className="text-sm text-muted-foreground">Web Security</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SQL Injection</span>
                    <span className="text-sm text-green-500">Completed</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">XSS Prevention</span>
                    <span className="text-sm text-primary">In Progress</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-3/4"></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CSRF Protection</span>
                    <span className="text-sm text-muted-foreground">Locked</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full w-1/4"></div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-accent/20 rounded-full blur-sm"
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/20 hexagon blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
