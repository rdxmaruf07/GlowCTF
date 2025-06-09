import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronUp } from "lucide-react";

// Scroll Progress Indicator
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-green-500 origin-left z-50"
      style={{ scaleX }}
    />
  );
}

// Scroll to Top Button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <motion.button
      className={`fixed bottom-8 right-8 z-40 p-3 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full shadow-lg backdrop-blur-sm border border-primary/20 ${
        isVisible ? "block" : "hidden"
      }`}
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <ChevronUp className="w-6 h-6" />
    </motion.button>
  );
}

// Parallax Container
interface ParallaxContainerProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export function ParallaxContainer({ 
  children, 
  offset = 50, 
  className = "" 
}: ParallaxContainerProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div
      className={`parallax-bg ${className}`}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}

// Scroll Reveal Animation
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
}

export function ScrollReveal({ 
  children, 
  className = "", 
  direction = "up", 
  delay = 0,
  duration = 0.6 
}: ScrollRevealProps) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "-50px"
      }
    );

    const element = document.getElementById(`scroll-reveal-${Math.random()}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      id={`scroll-reveal-${Math.random()}`}
      className={className}
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered Children Animation
interface StaggeredChildrenProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredChildren({ 
  children, 
  className = "", 
  staggerDelay = 0.1 
}: StaggeredChildrenProps) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "-50px"
      }
    );

    const element = document.getElementById(`staggered-${Math.random()}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div id={`staggered-${Math.random()}`} className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ 
            duration: 0.6, 
            delay: index * staggerDelay,
            ease: "easeOut" 
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Smooth Section Transitions
interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  snapToSection?: boolean;
}

export function Section({ 
  children, 
  id, 
  className = "", 
  snapToSection = false 
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${className} ${snapToSection ? 'scroll-snap-section' : ''}`}
    >
      {children}
    </section>
  );
}

// Navigation Dots for Sections
interface NavigationDotsProps {
  sections: Array<{ id: string; label: string }>;
  className?: string;
}

export function NavigationDots({ sections, className = "" }: NavigationDotsProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-20% 0px -20% 0px"
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`fixed right-8 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
      <div className="flex flex-col space-y-3">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="group relative"
            title={label}
          >
            <div
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                activeSection === id
                  ? "bg-primary border-primary scale-125"
                  : "bg-transparent border-primary/50 hover:border-primary"
              }`}
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-background/90 border border-border rounded px-2 py-1 text-xs whitespace-nowrap backdrop-blur-sm">
                {label}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Scroll-triggered Counter Animation
interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 2, 
  className = "", 
  suffix = "",
  prefix = ""
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${Math.random()}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const startValue = from;
    const endValue = to;
    const totalDuration = duration * 1000;

    const updateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, from, to, duration]);

  return (
    <span id={`counter-${Math.random()}`} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}