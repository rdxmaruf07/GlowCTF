import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Trophy, 
  Users, 
  Zap, 
  Star,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Notification {
  id: string;
  type: 'achievement' | 'challenge' | 'user' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'low' | 'medium' | 'high';
}

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Generate random notifications
  const generateNotification = (): Notification => {
    const types = [
      {
        type: 'achievement' as const,
        titles: ['New Record!', 'Achievement Unlocked!', 'Milestone Reached!'],
        messages: [
          'CyberAce_2024 just solved 100 challenges!',
          'SecureStudent earned the "SQL Master" badge!',
          'HackMaster_Pro completed their first CTF!',
          'InfoSec_Ninja reached 10,000 points!'
        ],
        icon: Trophy,
        color: 'text-yellow-500',
        priority: 'high' as const
      },
      {
        type: 'challenge' as const,
        titles: ['New Challenge!', 'Challenge Updated!', 'Hot Challenge!'],
        messages: [
          'New crypto challenge "RSA Breakdown" is now live!',
          'Web security lab updated with new scenarios!',
          'Network forensics challenge trending now!',
          'Advanced malware analysis challenge added!'
        ],
        icon: Zap,
        color: 'text-blue-500',
        priority: 'medium' as const
      },
      {
        type: 'user' as const,
        titles: ['New Member!', 'Community Growth!', 'Welcome!'],
        messages: [
          '50 new students joined this hour!',
          'University of Cambridge team created!',
          'MIT cybersecurity club is now active!',
          '1000+ users online right now!'
        ],
        icon: Users,
        color: 'text-green-500',
        priority: 'low' as const
      },
      {
        type: 'system' as const,
        titles: ['System Update!', 'New Feature!', 'Maintenance!'],
        messages: [
          'AI tutoring system enhanced with new models!',
          'Real-time collaboration features added!',
          'Performance improvements deployed!',
          'New learning paths available!'
        ],
        icon: AlertCircle,
        color: 'text-purple-500',
        priority: 'medium' as const
      }
    ];

    const selectedType = types[Math.floor(Math.random() * types.length)];
    const title = selectedType.titles[Math.floor(Math.random() * selectedType.titles.length)];
    const message = selectedType.messages[Math.floor(Math.random() * selectedType.messages.length)];

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedType.type,
      title,
      message,
      timestamp: new Date(),
      icon: selectedType.icon,
      color: selectedType.color,
      priority: selectedType.priority
    };
  };

  // Add new notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = generateNotification();
      setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Keep only 5 notifications
    }, 6000 + Math.random() * 4000); // Random interval between 6-10 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-remove notifications after 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => 
          Date.now() - notification.timestamp.getTime() < 15000
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'medium':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'low':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-border bg-card/50';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsVisible(true)}
          className="p-3 bg-primary/20 border border-primary/30 rounded-full backdrop-blur-sm hover:bg-primary/30 transition-colors"
        >
          <Bell className="w-5 h-5 text-primary" />
          {notifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 bg-card/90 border border-border rounded-t-lg backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">Live Updates</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin bg-card/90 border-x border-border backdrop-blur-sm">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 border-b border-border last:border-b-0 ${getPriorityStyles(notification.priority)} hover:bg-background/50 transition-colors`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                  <notification.icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white truncate">
                      {notification.title}
                    </h4>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-muted-foreground hover:text-white transition-colors ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                    
                    {notification.priority === 'high' && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-500 font-medium">Priority</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar for auto-removal */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-2 bg-card/90 border border-t-0 border-border rounded-b-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {notifications.length} active notification{notifications.length !== 1 ? 's' : ''}
            </span>
            
            <button
              onClick={() => setNotifications([])}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}