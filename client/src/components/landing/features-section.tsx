import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Shield, 
  Brain, 
  Trophy, 
  Users, 
  Code, 
  Zap,
  Target,
  BookOpen,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Multi-Level Challenges",
    description: "From beginner-friendly to expert-level cybersecurity challenges across web, crypto, forensics, and more.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Get personalized hints and explanations from multiple AI assistants including GPT, Claude, and Gemini.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Earn badges, climb leaderboards, and showcase your cybersecurity expertise to the community.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Form teams, share knowledge, and tackle challenges together in a collaborative environment.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Code,
    title: "Practice Arena",
    description: "Dedicated practice environment with sandboxed challenges and real-world scenarios.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Live leaderboards, instant feedback, and real-time challenge updates keep you engaged.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Target,
    title: "Skill Tracking",
    description: "Monitor your progress across different security domains and identify areas for improvement.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Access curated learning materials, writeups, and tutorials to enhance your skills.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Connect with cybersecurity enthusiasts worldwide and participate in global competitions.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

export default function FeaturesSection() {
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Zap className="w-4 h-4 text-accent mr-2" />
            <span className="text-sm font-medium text-accent">
              Powerful Features
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-bold mb-6"
          >
            Everything You Need to
            <span className="block gradient-text">Excel in Cybersecurity</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Our comprehensive platform provides all the tools, challenges, and support 
            you need to master cybersecurity skills and advance your career.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
