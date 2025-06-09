import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Crown,
  Star,
  Zap
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  points: number;
  solvedChallenges: number;
  streak: number;
  change: number; // Position change
  avatar: string;
  university?: string;
  isOnline: boolean;
}

export default function LiveLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: "1",
      rank: 1,
      username: "CyberAce",
      points: 2850,
      solvedChallenges: 45,
      streak: 12,
      change: 2,
      avatar: "🏆",
      university: "MIT",
      isOnline: true
    },
    {
      id: "2", 
      rank: 2,
      username: "SecurityPro",
      points: 2720,
      solvedChallenges: 42,
      streak: 8,
      change: -1,
      avatar: "🎯",
      university: "Stanford",
      isOnline: true
    },
    {
      id: "3",
      rank: 3,
      username: "HackMaster",
      points: 2650,
      solvedChallenges: 38,
      streak: 15,
      change: 1,
      avatar: "⚡",
      university: "CMU",
      isOnline: false
    },
    {
      id: "4",
      rank: 4,
      username: "CryptoNinja",
      points: 2480,
      solvedChallenges: 35,
      streak: 6,
      change: 0,
      avatar: "🔐",
      university: "Berkeley",
      isOnline: true
    },
    {
      id: "5",
      rank: 5,
      username: "WebWarrior",
      points: 2350,
      solvedChallenges: 33,
      streak: 9,
      change: 3,
      avatar: "🌐",
      university: "Harvard",
      isOnline: false
    },
    {
      id: "6",
      rank: 6,
      username: "ForensicFox",
      points: 2180,
      solvedChallenges: 29,
      streak: 4,
      change: -2,
      avatar: "🔍",
      university: "Princeton",
      isOnline: true
    },
    {
      id: "7",
      rank: 7,
      username: "BinaryBeast",
      points: 2050,
      solvedChallenges: 27,
      streak: 7,
      change: 1,
      avatar: "🤖",
      university: "Caltech",
      isOnline: false
    },
    {
      id: "8",
      rank: 8,
      username: "NetNinja",
      points: 1920,
      solvedChallenges: 24,
      streak: 3,
      change: 0,
      avatar: "🥷",
      university: "Georgia Tech",
      isOnline: true
    }
  ]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => 
        prev.map(entry => ({
          ...entry,
          points: entry.points + Math.floor(Math.random() * 10) - 5,
          change: Math.floor(Math.random() * 5) - 2,
          isOnline: Math.random() > 0.3
        }))
      );
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="w-3 h-3 mr-1" />
          <span className="text-xs">{change}</span>
        </div>
      );
    }
    return <div className="w-8" />; // Placeholder for no change
  };

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-500">Live Rankings</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold mb-4">
            Global Leaderboard
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            See how you stack up against cybersecurity students and professionals worldwide.
          </p>

          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card/30 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2">Points</div>
                <div className="col-span-2">Solved</div>
                <div className="col-span-2">Streak</div>
                <div className="col-span-1">Change</div>
              </div>
            </div>

            {/* Leaderboard Entries */}
            <div className="divide-y divide-border">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-muted-foreground">Loading leaderboard data...</div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-6 hover:bg-background/50 transition-colors ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5' : ''
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Rank */}
                        <div className="col-span-1 flex items-center">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Student Info */}
                        <div className="col-span-4 flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">
                              {entry.avatar}
                            </div>
                            {entry.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          
                          <div>
                            <div className="font-medium text-white flex items-center space-x-2">
                              <span>{entry.username}</span>
                              {entry.rank === 1 && <Star className="w-4 h-4 text-yellow-500" />}
                            </div>
                            {entry.university && (
                              <div className="text-xs text-muted-foreground">{entry.university}</div>
                            )}
                          </div>
                        </div>

                        {/* Points */}
                        <div className="col-span-2">
                          <motion.div 
                            className="font-bold text-primary"
                            key={entry.points}
                            initial={{ scale: 1.1, color: "#0cffec" }}
                            animate={{ scale: 1, color: "hsl(var(--primary))" }}
                            transition={{ duration: 0.3 }}
                          >
                            {entry.points.toLocaleString()}
                          </motion.div>
                        </div>

                        {/* Solved Challenges */}
                        <div className="col-span-2">
                          <div className="text-white font-medium">{entry.solvedChallenges}</div>
                        </div>

                        {/* Streak */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-500 font-medium">{entry.streak}</span>
                          </div>
                        </div>

                        {/* Change */}
                        <div className="col-span-1">
                          {getChangeIndicator(entry.change)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-border">
              <div className="text-center text-sm text-muted-foreground">
                <span>Want to see your name here? </span>
                <button className="text-primary hover:underline font-medium">
                  Join the competition →
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          <div className="text-center p-4 rounded-lg bg-card/20 border border-border">
            <div className="text-2xl font-bold text-yellow-500 mb-1">
              {leaderboard[0]?.points?.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-muted-foreground">Top Score</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-card/20 border border-border">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {leaderboard.reduce((sum, entry) => sum + entry.solvedChallenges, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Solved</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-card/20 border border-border">
            <div className="text-2xl font-bold text-blue-500 mb-1">
              {leaderboard.filter(entry => entry.isOnline).length}
            </div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}