import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  const glitchVariants = {
    initial: { x: 0 },
    animate: {
      x: [-2, 2, -2, 2, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background cyber-grid relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: i * 0.5 }}
          >
            <div className={`w-4 h-4 ${
              i % 3 === 0
                ? "bg-primary/20 rounded-full"
                : i % 3 === 1
                ? "bg-accent/20 hexagon"
                : "bg-green-500/20 rotate-45"
            }`} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="w-full max-w-lg mx-4 border-border bg-card/80 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center">
            {/* 404 Number with glitch effect */}
            <motion.div
              variants={glitchVariants}
              initial="initial"
              animate="animate"
              className="mb-6"
            >
              <h1 className="text-8xl font-orbitron font-bold gradient-text mb-2">
                404
              </h1>
            </motion.div>

            {/* Error icon with pulse */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-4"
            >
              <AlertCircle className="h-16 w-16 text-accent" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Page Not Found
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground mb-8 leading-relaxed"
            >
              Looks like this page got lost in cyberspace. The URL you're looking for doesn't exist
              or has been moved to a different dimension.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild className="group">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </motion.div>

            {/* Fun message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-muted-foreground mt-6 italic"
            >
              "In the world of hacking, even 404s can be an adventure!" 🚀
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
