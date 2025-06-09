import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  MapPin, 
  Users, 
  Trophy,
  Clock,
  Zap
} from "lucide-react";

interface ActivityPoint {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  users: number;
  recentActivity: string;
  timestamp: Date;
}

interface RegionStats {
  region: string;
  activeUsers: number;
  challengesSolved: number;
  topUniversity: string;
}

export default function GlobalActivityMap() {
  const [activityPoints, setActivityPoints] = useState<ActivityPoint[]>([
    {
      id: "1",
      country: "United States",
      city: "Boston",
      lat: 42.3601,
      lng: -71.0589,
      users: 234,
      recentActivity: "SQL Injection challenge solved",
      timestamp: new Date()
    },
    {
      id: "2",
      country: "United Kingdom",
      city: "London",
      lat: 51.5074,
      lng: -0.1278,
      users: 189,
      recentActivity: "Crypto puzzle completed",
      timestamp: new Date()
    },
    {
      id: "3",
      country: "Germany",
      city: "Berlin",
      lat: 52.5200,
      lng: 13.4050,
      users: 156,
      recentActivity: "Network forensics lab started",
      timestamp: new Date()
    },
    {
      id: "4",
      country: "Japan",
      city: "Tokyo",
      lat: 35.6762,
      lng: 139.6503,
      users: 198,
      recentActivity: "Reverse engineering challenge",
      timestamp: new Date()
    },
    {
      id: "5",
      country: "India",
      city: "Bangalore",
      lat: 12.9716,
      lng: 77.5946,
      users: 267,
      recentActivity: "Web security assessment",
      timestamp: new Date()
    },
    {
      id: "6",
      country: "Canada",
      city: "Toronto",
      lat: 43.6532,
      lng: -79.3832,
      users: 143,
      recentActivity: "Malware analysis completed",
      timestamp: new Date()
    }
  ]);

  const [regionStats] = useState<RegionStats[]>([
    {
      region: "North America",
      activeUsers: 1247,
      challengesSolved: 3456,
      topUniversity: "MIT"
    },
    {
      region: "Europe",
      activeUsers: 987,
      challengesSolved: 2890,
      topUniversity: "Cambridge"
    },
    {
      region: "Asia Pacific",
      activeUsers: 1534,
      challengesSolved: 4123,
      topUniversity: "Tokyo Tech"
    }
  ]);

  const [selectedPoint, setSelectedPoint] = useState<ActivityPoint | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time activity updates
  useEffect(() => {
    const activities = [
      "SQL Injection challenge solved",
      "Crypto puzzle completed",
      "Network forensics lab started",
      "Reverse engineering challenge",
      "Web security assessment",
      "Malware analysis completed",
      "Buffer overflow exploit found",
      "XSS vulnerability discovered",
      "Password cracking challenge",
      "Digital forensics investigation"
    ];

    const interval = setInterval(() => {
      setActivityPoints(prev => 
        prev.map(point => ({
          ...point,
          users: point.users + Math.floor(Math.random() * 5) - 2,
          recentActivity: Math.random() > 0.7 ? 
            activities[Math.floor(Math.random() * activities.length)] : 
            point.recentActivity,
          timestamp: Math.random() > 0.7 ? new Date() : point.timestamp
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getTimeZone = (city: string) => {
    const timeZones: { [key: string]: string } = {
      "Boston": "America/New_York",
      "London": "Europe/London",
      "Berlin": "Europe/Berlin",
      "Tokyo": "Asia/Tokyo",
      "Bangalore": "Asia/Kolkata",
      "Toronto": "America/Toronto"
    };
    
    return timeZones[city] || "UTC";
  };

  const getLocalTime = (city: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: getTimeZone(city),
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleTimeString();
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Globe className="w-4 h-4 text-blue-500 mr-2 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="text-sm font-medium text-blue-500">Global Activity</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold mb-4">
            Worldwide Learning Network
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See cybersecurity students and professionals learning together across the globe in real-time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* World Map Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative p-6 rounded-xl bg-card/30 border border-border backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Live Activity Map</h3>
                <div className="text-sm text-muted-foreground">
                  {currentTime.toLocaleTimeString()} UTC
                </div>
              </div>

              {/* Simplified World Map */}
              <div className="relative h-80 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-lg overflow-hidden">
                {/* World Map SVG Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 1000 500" className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Simplified continents */}
                    <path d="M 100 150 Q 200 100 300 150 L 350 200 Q 300 250 200 200 Q 150 180 100 150 Z" 
                          fill="currentColor" opacity="0.3" />
                    <path d="M 400 120 Q 500 80 600 120 L 650 180 Q 600 220 500 180 Q 450 160 400 120 Z" 
                          fill="currentColor" opacity="0.3" />
                    <path d="M 700 140 Q 800 100 900 140 L 950 200 Q 900 240 800 200 Q 750 180 700 140 Z" 
                          fill="currentColor" opacity="0.3" />
                  </svg>
                </div>

                {/* Activity Points */}
                {activityPoints.map((point, index) => (
                  <motion.div
                    key={point.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${((point.lng + 180) / 360) * 100}%`,
                      top: `${((90 - point.lat) / 180) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedPoint(point)}
                  >
                    {/* Pulse Animation */}
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 w-4 h-4 bg-primary rounded-full"
                      />
                      
                      {/* Main Point */}
                      <div className="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg">
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>

                      {/* User Count Badge */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-background/90 border border-border rounded text-xs font-medium text-white whitespace-nowrap">
                        {point.users} users
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {activityPoints.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = activityPoints[index - 1];
                    const x1 = ((prevPoint.lng + 180) / 360) * 100;
                    const y1 = ((90 - prevPoint.lat) / 180) * 100;
                    const x2 = ((point.lng + 180) / 360) * 100;
                    const y2 = ((90 - point.lat) / 180) * 100;
                    
                    return (
                      <motion.line
                        key={`line-${index}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="rgba(12, 255, 236, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: index * 0.5 }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Activity Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Regional Stats */}
            <div className="p-6 rounded-xl bg-card/30 border border-border backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Regional Activity</h3>
              <div className="space-y-4">
                {regionStats.map((region, index) => (
                  <motion.div
                    key={region.region}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{region.region}</span>
                      <span className="text-xs text-muted-foreground">{region.topUniversity}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Users: </span>
                        <span className="text-primary font-medium">{region.activeUsers}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Solved: </span>
                        <span className="text-green-500 font-medium">{region.challengesSolved}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="p-6 rounded-xl bg-card/30 border border-border backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                  {activityPoints.map((point) => (
                    <motion.div
                      key={`${point.id}-${point.timestamp.getTime()}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-3 rounded-lg bg-background/30 border border-border/50"
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white truncate">
                              {point.city}, {point.country}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getLocalTime(point.city)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {point.recentActivity}
                          </p>
                          <div className="flex items-center space-x-2 mt-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-blue-500" />
                              <span className="text-blue-500">{point.users}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-orange-500" />
                              <span className="text-orange-500">
                                {Math.floor((Date.now() - point.timestamp.getTime()) / 1000)}s ago
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Selected Point Details Modal */}
        <AnimatePresence>
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedPoint(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedPoint.city}, {selectedPoint.country}
                  </h3>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="text-muted-foreground hover:text-white"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="text-primary font-medium">{selectedPoint.users}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Local Time</span>
                    <span className="text-white">{getLocalTime(selectedPoint.city)}</span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Recent Activity</span>
                    <p className="text-white mt-1">{selectedPoint.recentActivity}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}