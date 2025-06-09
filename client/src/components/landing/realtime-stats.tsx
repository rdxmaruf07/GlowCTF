import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trophy, 
  Target, 
  Clock, 
  Activity,
  TrendingUp,
  Zap,
  Globe
} from "lucide-react";

interface RealtimeData {
  activeUsers: number;
  challengesSolved: number;
  ongoingChallenges: number;
  totalPoints: number;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    challenge: string;
    timestamp: Date;
    points: number;
  }>;
}

export default function RealtimeStats() {
  const [data, setData] = useState<RealtimeData>({
    activeUsers: 0,
    challengesSolved: 0,
    ongoingChallenges: 0,
    totalPoints: 0,
    recentActivity: []
  });

  const [isLive, setIsLive] = useState(true);

  // Fetch real data from API
  const fetchStats = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/landing/stats'),
        fetch('/api/landing/activity')
      ]);
      
      if (statsResponse.ok && activityResponse.ok) {
        const stats = await statsResponse.json();
        const activity = await activityResponse.json();
        
        setData(prev => ({
          activeUsers: stats.activeUsers,
          challengesSolved: stats.challengesSolved,
          ongoingChallenges: stats.ongoingChallenges,
          totalPoints: stats.totalPoints,
          recentActivity: activity.slice(0, 5).map((item: any) => ({
            id: item.id,
            user: item.user,
            action: item.action,
            challenge: item.challenge,
            timestamp: new Date(item.timestamp),
            points: item.points
          }))
        }));
      }
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchStats(); // Initial fetch
    
    const interval = setInterval(() => {
      if (isLive) {
        fetchStats();
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const stats = [
    {
      icon: Users,
      label: "Active Users",
      value: data.activeUsers.toLocaleString(),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+12%"
    },
    {
      icon: Trophy,
      label: "Challenges Solved",
      value: data.challengesSolved.toLocaleString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+8%"
    },
    {
      icon: Target,
      label: "Ongoing Challenges",
      value: data.ongoingChallenges.toString(),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: "Live"
    },
    {
      icon: Zap,
      label: "Total Points Earned",
      value: (data.totalPoints / 1000000).toFixed(1) + "M",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "+15%"
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-medium text-green-500">Live Statistics</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold mb-4">
            Real-Time Platform Activity
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch our community in action as students and professionals tackle cybersecurity challenges around the clock.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 font-medium">{stat.trend}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <motion.div 
                    className="text-2xl font-bold text-white"
                    key={stat.value}
                    initial={{ scale: 1.1, color: "#0cffec" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>

                {/* Pulse effect for active stats */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card/30 border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isLive 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                  }`}
                >
                  {isLive ? 'Live' : 'Paused'}
                </button>
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {data.recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {activity.user.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium text-primary">{activity.user}</span>
                          <span className="text-muted-foreground"> {activity.action} </span>
                          <span className="font-medium text-white">{activity.challenge}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {activity.action === "solved" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30"
                      >
                        <Trophy className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">
                          +{activity.points}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {data.recentActivity.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Waiting for activity...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Live Challenges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-white">Active This Hour</h4>
              </div>
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {Math.floor(data.activeUsers * 0.3)}
              </div>
              <div className="text-sm text-muted-foreground">Users solving challenges</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-white">Success Rate</h4>
              </div>
              <div className="text-2xl font-bold text-green-500 mb-1">73%</div>
              <div className="text-sm text-muted-foreground">Challenges completed</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-white">Avg. Solve Time</h4>
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-1">24m</div>
              <div className="text-sm text-muted-foreground">Per challenge</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}