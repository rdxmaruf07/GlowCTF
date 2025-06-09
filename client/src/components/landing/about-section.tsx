import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award,
  Code,
  Shield,
  Target,
  Lightbulb
} from "lucide-react";
import { ScrollReveal, FloatingElement } from "@/components/ui/advanced-animations";
import { useGlobalAnimation } from "@/contexts/animation-context";

export default function AboutSection() {
  const { isGlobalAnimationEnabled } = useGlobalAnimation();
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

  const stats = [
    { icon: GraduationCap, label: "Students Trained", value: "1000+", color: "text-blue-500" },
    { icon: Award, label: "Certifications", value: "500+", color: "text-yellow-500" },
    { icon: Code, label: "Practice Labs", value: "200+", color: "text-green-500" },
    { icon: Users, label: "Study Groups", value: "50+", color: "text-purple-500" },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description: "Designed specifically for computer science and cybersecurity students to enhance their practical skills."
    },
    {
      icon: Shield,
      title: "Industry-Ready Skills",
      description: "Learn real-world cybersecurity techniques that prepare you for professional careers in the field."
    },
    {
      icon: Target,
      title: "Hands-On Learning",
      description: "Practice with realistic scenarios and challenges that mirror actual security incidents."
    },
    {
      icon: Lightbulb,
      title: "Innovation Hub",
      description: "Collaborate with peers, share knowledge, and develop innovative solutions to security challenges."
    }
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement duration={4} delay={0} range={15} isPlaying={isGlobalAnimationEnabled}>
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-xl" />
        </FloatingElement>
        <FloatingElement duration={5} delay={2} range={20} isPlaying={isGlobalAnimationEnabled}>
          <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-accent/10 blur-xl" />
        </FloatingElement>
      </div>

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
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <GraduationCap className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Learning Platform
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-bold mb-6"
          >
            About
            <span className="block gradient-text">GlowCTF</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            An innovative cybersecurity learning platform featuring hands-on challenges, 
            competitive environments, and practical skill development for students and professionals.
          </motion.p>
        </motion.div>

        {/* Stats Section */}
        <ScrollReveal className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="relative mb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-${stat.color.split('-')[1]}-500/20 to-${stat.color.split('-')[1]}-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                </div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={index * 0.2}
            >
              <div className="group p-6 rounded-xl bg-card/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mission Statement */}
        <ScrollReveal className="mt-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-4">
                Our Mission
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Making cybersecurity education accessible through practical, hands-on challenges 
                and competitive learning experiences.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}