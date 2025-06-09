import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'data' | 'security' | 'education';
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(60, Math.floor(window.innerWidth / 15));
      const colors = [
        'rgba(12, 255, 236, 0.6)', // Primary cyan
        'rgba(255, 107, 107, 0.6)', // Accent red
        'rgba(34, 197, 94, 0.6)',   // Green
        'rgba(59, 130, 246, 0.6)',  // Blue
        'rgba(168, 85, 247, 0.6)',  // Purple
      ];
      const types: Array<'data' | 'security' | 'education'> = ['data', 'security', 'education'];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: types[Math.floor(Math.random() * types.length)],
        });
      }

      particlesRef.current = particles;
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position with slight randomness
        particle.x += particle.vx + Math.sin(Date.now() * 0.001 + index) * 0.1;
        particle.y += particle.vy + Math.cos(Date.now() * 0.001 + index) * 0.1;

        // Wrap around edges
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        // Draw particle based on type
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        if (particle.type === 'data') {
          // Draw data nodes as circles
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          
          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
          ctx.fill();
        } else if (particle.type === 'security') {
          // Draw security elements as shields
          ctx.translate(particle.x, particle.y);
          ctx.rotate(Date.now() * 0.001 + index);
          ctx.beginPath();
          ctx.moveTo(0, -particle.size);
          ctx.lineTo(particle.size * 0.8, -particle.size * 0.3);
          ctx.lineTo(particle.size * 0.8, particle.size * 0.5);
          ctx.lineTo(0, particle.size);
          ctx.lineTo(-particle.size * 0.8, particle.size * 0.5);
          ctx.lineTo(-particle.size * 0.8, -particle.size * 0.3);
          ctx.closePath();
          ctx.fillStyle = particle.color;
          ctx.fill();
        } else {
          // Draw education elements as books/squares
          ctx.translate(particle.x, particle.y);
          ctx.rotate(Date.now() * 0.0005 + index);
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
        }
        
        ctx.restore();

        // Draw enhanced connections
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index >= otherIndex) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = 0.15 * (1 - distance / 120);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            // Create gradient line
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y, 
              otherParticle.x, otherParticle.y
            );
            gradient.addColorStop(0, particle.color.replace(/[\d\.]+\)$/g, `${opacity})`));
            gradient.addColorStop(1, otherParticle.color.replace(/[\d\.]+\)$/g, `${opacity})`));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    createParticles();
    drawParticles();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "transparent" }}
      />
      
      {/* Enhanced floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Binary code rain effect */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`binary-${i}`}
            className="absolute text-primary/20 font-mono text-xs select-none"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              opacity: 0
            }}
            animate={{
              y: window.innerHeight + 50,
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            {Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join('')}
          </motion.div>
        ))}

        {/* Floating educational icons */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 0,
              scale: 0.3
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: [0, 360],
              scale: [0.3, 0.8, 0.3],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          >
            <div 
              className={`w-6 h-6 ${
                i % 4 === 0 
                  ? "bg-gradient-to-br from-primary/30 to-primary/10 rounded-full" 
                  : i % 4 === 1 
                  ? "bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg rotate-45" 
                  : i % 4 === 2
                  ? "bg-gradient-to-br from-green-500/30 to-green-500/10 rounded-full"
                  : "bg-gradient-to-br from-blue-500/30 to-blue-500/10 rounded-lg"
              } backdrop-blur-sm border border-white/10`}
            />
          </motion.div>
        ))}

        {/* Cybersecurity themed elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`cyber-${i}`}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          >
            <div className="w-8 h-8 border-2 border-primary/30 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-primary/40 rounded-full animate-pulse" />
            </div>
          </motion.div>
        ))}

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(12, 255, 236, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(12, 255, 236, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </>
  );
}
