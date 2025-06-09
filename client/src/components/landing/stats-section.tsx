import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Trophy, Target, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 12500,
    label: "Active Users",
    suffix: "+",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Target,
    value: 850,
    label: "Challenges Solved",
    suffix: "+",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Trophy,
    value: 2400,
    label: "Badges Earned",
    suffix: "+",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Clock,
    value: 24,
    label: "Hours Support",
    suffix: "/7",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

function AnimatedCounter({ 
  value, 
  duration = 2000, 
  isInView 
}: { 
  value: number; 
  duration?: number; 
  isInView: boolean; 
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isInView]);

  return <span>{count.toLocaleString()}</span>;
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="stats" className="py-20 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
          >
            <Trophy className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-500">
              Platform Statistics
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-bold mb-6"
          >
            Platform
            <span className="block gradient-text">Statistics</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Real-time insights into our growing cybersecurity learning community.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="group relative"
            >
              <div className="text-center p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className={`w-16 h-16 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                
                <div className={`text-4xl font-bold ${stat.color} mb-2 font-orbitron`}>
                  <AnimatedCounter value={stat.value} isInView={isInView} />
                  {stat.suffix}
                </div>
                
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mt-16 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-2">50+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500 mb-2">4.9/5</div>
                <div className="text-muted-foreground">User Rating</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
