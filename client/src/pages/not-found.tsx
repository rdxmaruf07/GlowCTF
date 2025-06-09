import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Home, 
  ArrowLeft, 
  Coffee, 
  Zap, 
  Skull, 
  Gamepad2,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Twitch,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Heart,
  Star,
  Rocket,
  Bug,
  Shield,
  Terminal,
  Code,
  Wifi,
  WifiOff
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [currentJoke, setCurrentJoke] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [clickCount, setClickCount] = useState(0);

  const jokes = [
    "404: Page not found, but my sense of humor is still here! 😄",
    "This page is more lost than a hacker without coffee ☕",
    "Error 404: Page went to get milk and never came back 🥛",
    "Oops! This page got pwned by the void 💀",
    "404: Even our AI couldn't find this page 🤖",
    "This page is in another castle 🏰",
    "Page.exe has stopped working (and so has my patience) 💻",
    "404: This page is social distancing... permanently 😷",
    "Congratulations! You found our secret 404 page! 🎉",
    "This page is currently being debugged by rubber ducks 🦆"
  ];

  const socialLinks = [
    { icon: Github, label: "GitHub", url: "https://github.com", color: "hover:text-gray-400" },
    { icon: Twitter, label: "Twitter", url: "https://twitter.com", color: "hover:text-blue-400" },
    { icon: Instagram, label: "Instagram", url: "https://instagram.com", color: "hover:text-pink-400" },
    { icon: Youtube, label: "YouTube", url: "https://youtube.com", color: "hover:text-red-500" },
    { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com", color: "hover:text-blue-600" },
    { icon: Facebook, label: "Facebook", url: "https://facebook.com", color: "hover:text-blue-500" },
    { icon: Twitch, label: "Twitch", url: "https://twitch.tv", color: "hover:text-purple-500" },
    { icon: MessageCircle, label: "Discord", url: "https://discord.com", color: "hover:text-indigo-400" },
  ];

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

  const bounceVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJoke((prev) => (prev + 1) % jokes.length);
    }, 3000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleEasterEgg = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 9) {
      alert("🎉 Konami Code activated! You're a true hacker! 🎉");
      setClickCount(0);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background cyber-grid relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: i * 0.3 }}
          >
            <div className={`w-4 h-4 ${
              i % 4 === 0
                ? "bg-primary/20 rounded-full"
                : i % 4 === 1
                ? "bg-accent/20 hexagon"
                : i % 4 === 2
                ? "bg-green-500/20 rotate-45"
                : "bg-purple-500/20 rounded-sm"
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Network Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl mx-4"
      >
        <Card className="w-full border-border bg-card/80 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center">
            {/* 404 Number with glitch effect */}
            <motion.div
              variants={glitchVariants}
              initial="initial"
              animate="animate"
              className="mb-6"
              onClick={handleEasterEgg}
              style={{ cursor: 'pointer' }}
            >
              <h1 className="text-8xl font-orbitron font-bold gradient-text mb-2">
                404
              </h1>
            </motion.div>

            {/* Animated Icons */}
            <div className="flex justify-center gap-4 mb-6">
              <motion.div variants={bounceVariants} animate="animate">
                <Skull className="h-8 w-8 text-red-500" />
              </motion.div>
              <motion.div variants={bounceVariants} animate="animate" transition={{ delay: 0.2 }}>
                <Bug className="h-8 w-8 text-yellow-500" />
              </motion.div>
              <motion.div variants={bounceVariants} animate="animate" transition={{ delay: 0.4 }}>
                <Terminal className="h-8 w-8 text-green-500" />
              </motion.div>
              <motion.div variants={bounceVariants} animate="animate" transition={{ delay: 0.6 }}>
                <Code className="h-8 w-8 text-blue-500" />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Oops! Page Not Found 🤖
            </motion.h2>

            {/* Rotating Jokes */}
            <motion.div
              key={currentJoke}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                {jokes[currentJoke]}
              </p>
            </motion.div>

            {/* Fun Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-primary/10 rounded-lg p-4">
                <Coffee className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Coffees Consumed</p>
                <p className="text-xl font-bold text-white">∞</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-4">
                <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Bugs Fixed</p>
                <p className="text-xl font-bold text-white">404</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Security Level</p>
                <p className="text-xl font-bold text-white">OVER 9000</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4">
                <Gamepad2 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Easter Eggs</p>
                <p className="text-xl font-bold text-white">{clickCount}/10</p>
              </div>
            </motion.div>

            {/* Social Media Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Follow us while you're lost! 🌐
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 text-muted-foreground transition-all duration-300 ${social.color} hover:scale-110 hover:bg-muted/40`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <social.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{social.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>help@glowctf.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1-800-404-HELP</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Cyberspace, Internet</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
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
              <Button variant="secondary" onClick={() => window.location.reload()}>
                <Rocket className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </motion.div>

            {/* Fun Footer Messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground italic">
                "In the world of hacking, even 404s can be an adventure!" 🚀
              </p>
              <p className="text-xs text-muted-foreground">
                Made with <Heart className="inline h-3 w-3 text-red-500" /> and lots of <Coffee className="inline h-3 w-3 text-amber-500" />
              </p>
              <p className="text-xs text-muted-foreground">
                <Star className="inline h-3 w-3 text-yellow-500" /> Pro tip: Try clicking the 404 number above! <Star className="inline h-3 w-3 text-yellow-500" />
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
