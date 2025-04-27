import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import LeaderboardTopUsers from "@/components/leaderboard/leaderboard-top-users";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Globe, Users } from "lucide-react";

export default function LeaderboardPage() {
  const [scopeFilter, setScopeFilter] = useState<'global' | 'friends'>('global');
  const [timeFilter, setTimeFilter] = useState<'all-time' | 'monthly' | 'weekly' | 'daily'>('all-time');
  
  // Fetch leaderboard data
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['/api/leaderboard', scopeFilter, timeFilter],
  });
  
  // This is a mock function for the example, in real app it would fetch from API
  const currentUserRank = leaderboard?.find((entry: any) => entry.isCurrentUser)?.rank || 0;
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">Top hackers ranked by points and achievements.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Button 
              variant={scopeFilter === 'global' ? 'default' : 'outline'} 
              onClick={() => setScopeFilter('global')}
            >
              Global <Globe className="ml-1 h-4 w-4" />
            </Button>
            
            <Button 
              variant={scopeFilter === 'friends' ? 'default' : 'outline'} 
              onClick={() => setScopeFilter('friends')}
            >
              Friends <Users className="ml-1 h-4 w-4" />
            </Button>
            
            <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load leaderboard data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-56 w-full md:w-1/3" />
                <Skeleton className="h-64 w-full md:w-1/3" />
                <Skeleton className="h-56 w-full md:w-1/3" />
              </div>
            </div>
            <Skeleton className="h-[400px] w-full" />
          </>
        ) : (
          <>
            {/* Top 3 Players */}
            <LeaderboardTopUsers users={leaderboard?.slice(0, 3)} />
            
            {/* Leaderboard Table */}
            <LeaderboardTable 
              users={leaderboard?.slice(3)} 
              currentUserRank={currentUserRank}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
