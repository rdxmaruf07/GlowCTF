import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
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
  WifiOff,
  Clock,
  Construction,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  showSocialMedia?: boolean;
  showStats?: boolean;
  showJokes?: boolean;
  variant?: "page" | "section" | "card";
  className?: string;
}

export default function ComingSoon({ 
  title = "Coming Soon",
  subtitle = "We're working hard to bring you something amazing!",
  showSocialMedia = true,
  showStats = true,
  showJokes = true,
  variant = "section",
  className = ""
}: ComingSoonProps) {
  const [currentJoke, setCurrentJoke] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [clickCount, setClickCount] = useState(0);

  const jokes = [
    "🚧 Under construction! Our developers are caffeinating... ☕",
    "⚡ Loading awesomeness... Please wait while we debug reality! 🐛",
    "🎮 This feature is in another castle! 🏰",
    "🤖 Our AI is still learning how to build this... 🧠",
    "🔥 Coming soon™ (We promise it's not just a meme!) 😄",
    "🚀 Launching soon! T-minus... calculating... ⏰",
    "💻 404: Feature not found, but our humor is! 😂",
    "🎯 Target acquired: Amazing feature incoming! 🎪",
    "🔧 Currently being assembled by code ninjas! 🥷",
    "✨ Magic is happening behind the scenes! 🎭"
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

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  useEffect(() => {
    if (showJokes) {
      const interval = setInterval(() => {
        setCurrentJoke((prev) => (prev + 1) % jokes.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showJokes]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleEasterEgg = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 9) {
      alert("🎉 Easter egg found! You're persistent! 🎉");
      setClickCount(0);
    }
  };

  const containerClass = variant === "page" 
    ? "min-h-screen w-full flex flex-col items-center justify-center bg-background cyber-grid relative overflow-hidden"
    : variant === "section"
    ? "w-full py-16 relative"
    : "w-full relative";

  const cardClass = variant === "page"
    ? "w-full max-w-4xl mx-4"
    : "w-full max-w-2xl mx-auto";

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
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
            <div className={`w-3 h-3 ${
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

      {/* Network Status Indicator (only for page variant) */}
      {variant === "page" && (
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
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative z-10 ${cardClass}`}
      >
        <Card className="w-full border-border bg-card/80 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center">
            {/* Main Icon */}
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="mb-6"
              onClick={handleEasterEgg}
              style={{ cursor: 'pointer' }}
            >
              <Construction className="h-16 w-16 text-primary mx-auto mb-4" />
            </motion.div>

            {/* Animated Icons */}
            <div className="flex justify-center gap-4 mb-6">
              <motion.div variants={bounceVariants} animate="animate">
                <Clock className="h-6 w-6 text-blue-500" />
              </motion.div>
              <motion.div variants={bounceVariants} animate="animate" transition={{ delay: 0.2 }}>
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </motion.div>
              <motion.div variants={bounceVariants} animate="animate" transition={{ delay: 0.4 }}>
                <Rocket className="h-6 w-6 text-green-500" />
              </motion.div>
              <motion.div variants={bounceVariants} animate="animate" transition={{ delay: 0.6 }}>
                <Code className="h-6 w-6 text-purple-500" />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              {title} 🚀
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8"
            >
              {subtitle}
            </motion.p>

            {/* Rotating Jokes */}
            {showJokes && (
              <motion.div
                key={currentJoke}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <p className="text-md text-muted-foreground leading-relaxed italic">
                  {jokes[currentJoke]}
                </p>
              </motion.div>
            )}

            {/* Fun Stats */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-primary/10 rounded-lg p-4">
                  <Coffee className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Coffee Cups</p>
                  <p className="text-xl font-bold text-white">∞</p>
                </div>
                <div className="bg-accent/10 rounded-lg p-4">
                  <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-xl font-bold text-white">75%</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Security</p>
                  <p className="text-xl font-bold text-white">MAX</p>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <Gamepad2 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-xl font-bold text-white">{clickCount}/10</p>
                </div>
              </motion.div>
            )}

            {/* Social Media Links */}
            {showSocialMedia && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Stay connected while we build! 🌐
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
            )}

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>updates@glowctf.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1-800-COMING-SOON</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Development Lab, Cloud</span>
              </div>
            </motion.div>

            {/* Fun Footer Messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground italic">
                "Great things take time, but awesome things are worth the wait!" 🚀
              </p>
              <p className="text-xs text-muted-foreground">
                Built with <Heart className="inline h-3 w-3 text-red-500" /> and lots of <Coffee className="inline h-3 w-3 text-amber-500" />
              </p>
              <p className="text-xs text-muted-foreground">
                <Star className="inline h-3 w-3 text-yellow-500" /> Pro tip: Click the construction icon above! <Star className="inline h-3 w-3 text-yellow-500" />
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}