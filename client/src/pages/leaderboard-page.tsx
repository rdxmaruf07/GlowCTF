import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/app-layout";
import LeaderboardTopUsers from "@/components/leaderboard/leaderboard-top-users";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Globe, Users } from "lucide-react";
import AnimatedPage from "@/components/ui/animated-page";
import { containerVariants, itemVariants, slideInVariants, slideInRightVariants } from "@/lib/animations";

export default function LeaderboardPage() {
  const [scopeFilter, setScopeFilter] = useState<'global' | 'friends'>('global');
  const [timeFilter, setTimeFilter] = useState<'all-time' | 'monthly' | 'weekly' | 'daily'>('all-time');
  
  // Fetch leaderboard data with proper query configuration
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
  
  // This is a mock function for the example, in real app it would fetch from API
  const currentUserRank = leaderboard && Array.isArray(leaderboard)
    ? leaderboard.find((entry: any) => entry.isCurrentUser)?.rank || 0
    : 0;
  
  return (
    <AppLayout>
      <AnimatedPage>
        <motion.div
          className="p-4 md:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8"
            variants={itemVariants}
          >
            <motion.div variants={slideInVariants}>
              <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Leaderboard</h1>
              <p className="text-muted-foreground">Top hackers ranked by points and achievements.</p>
            </motion.div>

            <motion.div
              className="mt-4 md:mt-0 flex items-center space-x-4"
              variants={slideInRightVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={scopeFilter === 'global' ? 'default' : 'outline'}
                  onClick={() => {
                    setScopeFilter('global');
                    // Note: Backend filtering not yet implemented
                  }}
                  className="transition-all duration-300"
                >
                  Global <Globe className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={scopeFilter === 'friends' ? 'default' : 'outline'}
                  onClick={() => {
                    setScopeFilter('friends');
                    // Note: Backend filtering not yet implemented
                  }}
                  className="transition-all duration-300 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Friends <Users className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Select
                  value={timeFilter}
                  onValueChange={(value: any) => {
                    setTimeFilter(value);
                    // Note: Backend filtering not yet implemented
                  }}
                  disabled
                >
                  <SelectTrigger className="w-[150px] border-border hover:border-primary/50 transition-colors opacity-50">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="daily">Today</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load leaderboard data. Please try refreshing the page.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {isLoading ? (
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="h-56 w-full md:w-1/3" />
                  <Skeleton className="h-64 w-full md:w-1/3" />
                  <Skeleton className="h-56 w-full md:w-1/3" />
                </div>
              </div>
              <Skeleton className="h-[400px] w-full" />
            </motion.div>
          ) : (
            <motion.div variants={containerVariants}>
              {/* Top 3 Players */}
              <motion.div variants={itemVariants}>
                <LeaderboardTopUsers
                  users={leaderboard && Array.isArray(leaderboard) ? leaderboard.slice(0, 3) : []}
                />
              </motion.div>

              {/* Leaderboard Table */}
              <motion.div variants={itemVariants}>
                <LeaderboardTable
                  users={leaderboard && Array.isArray(leaderboard) ? leaderboard.slice(3) : []}
                  currentUserRank={currentUserRank}
                />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatedPage>
    </AppLayout>
  );
}
