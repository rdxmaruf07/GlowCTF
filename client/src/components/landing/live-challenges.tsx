import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, 
  Shield, 
  Lock, 
  Search, 
  Globe, 
  Database,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Eye
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  points: number;
  solvers: number;
  attempts: number;
  timeLimit?: number;
  isNew: boolean;
  isHot: boolean;
  description: string;
  tags: string[];
}

interface LiveChallengeData {
  featured: Challenge[];
  trending: Challenge[];
  recentlyAdded: Challenge[];
}

export default function LiveChallenges() {
  const [challengeData, setChallengeData] = useState<LiveChallengeData>({
    featured: [],
    trending: [],
    recentlyAdded: []
  });

  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'recent'>('featured');
  const [liveStats, setLiveStats] = useState({
    totalAttempts: 0,
    activeSolvers: 0,
    challengesCompleted: 0
  });

  // Fetch real challenges data
  const fetchChallenges = async () => {
    try {
      const [challengesResponse, statsResponse] = await Promise.all([
        fetch('/api/landing/challenges'),
        fetch('/api/landing/stats')
      ]);
      
      if (challengesResponse.ok && statsResponse.ok) {
        const challenges = await challengesResponse.json();
        const stats = await statsResponse.json();
        
        setChallengeData({
          featured: challenges,
          trending: challenges.filter((c: any) => c.isHot),
          recentlyAdded: challenges.filter((c: any) => c.isNew)
        });
        
        setLiveStats({
          totalAttempts: challenges.reduce((sum: number, c: any) => sum + c.attempts, 0),
          activeSolvers: stats.activeUsers,
          challengesCompleted: stats.challengesSolved
        });
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchChallenges(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchChallenges();
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'web security':
        return Globe;
      case 'cryptography':
        return Lock;
      case 'forensics':
        return Search;
      case 'reverse engineering':
        return Code;
      case 'network security':
        return Shield;
      default:
        return Database;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Expert':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const tabs = [
    { id: 'featured', label: 'Featured', icon: CheckCircle },
    { id: 'trending', label: 'Trending', icon: AlertCircle },
    { id: 'recent', label: 'New', icon: Play }
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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Code className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-500">Live Challenges</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold mb-4">
            Active Challenge Arena
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Jump into live cybersecurity challenges being tackled by students worldwide right now.
          </p>
        </motion.div>

        {/* Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-card/30 border border-border">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Active Solvers:</span>
              <motion.span 
                className="font-bold text-blue-500"
                key={liveStats.activeSolvers}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {liveStats.activeSolvers}
              </motion.span>
            </div>

            <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-card/30 border border-border">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Total Attempts:</span>
              <motion.span 
                className="font-bold text-orange-500"
                key={liveStats.totalAttempts}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {liveStats.totalAttempts.toLocaleString()}
              </motion.span>
            </div>

            <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-card/30 border border-border">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed:</span>
              <motion.span 
                className="font-bold text-green-500"
                key={liveStats.challengesCompleted}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {liveStats.challengesCompleted}
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-1 p-1 bg-card/30 border border-border rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-white hover:bg-background/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Challenge Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="wait">
            {challengeData.featured.map((challenge, index) => {
              const CategoryIcon = getCategoryIcon(challenge.category);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CategoryIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                            {challenge.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{challenge.category}</p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col space-y-1">
                        {challenge.isNew && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500 rounded-full border border-green-500/30">
                            NEW
                          </span>
                        )}
                        {challenge.isHot && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-500 rounded-full border border-red-500/30">
                            HOT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {challenge.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-background/50 text-muted-foreground rounded border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Difficulty</div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Points</div>
                        <div className="font-bold text-primary">{challenge.points}</div>
                      </div>
                    </div>

                    {/* Live Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <motion.span 
                            className="text-green-500 font-medium"
                            key={challenge.solvers}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {challenge.solvers}
                          </motion.span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-blue-500" />
                          <motion.span 
                            className="text-blue-500 font-medium"
                            key={challenge.attempts}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {challenge.attempts}
                          </motion.span>
                        </div>
                      </div>

                      {challenge.timeLimit && (
                        <div className="flex items-center space-x-1 text-orange-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{challenge.timeLimit}m</span>
                        </div>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Join the Action?
            </h3>
            <p className="text-muted-foreground mb-4">
              Start solving challenges and compete with students worldwide.
            </p>
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
              Start Solving Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}