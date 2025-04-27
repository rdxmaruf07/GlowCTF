import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

interface Activity {
  id: number;
  type: 'challenge' | 'badge' | 'leaderboard';
  title: string;
  description: string;
  timestamp: Date;
  icon: JSX.Element;
}

interface RecentActivityProps {
  userId?: number;
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading activities
  useEffect(() => {
    const timer = setTimeout(() => {
      // This is example data - in a real app, you would fetch from API
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'challenge',
          title: 'Challenge Completed',
          description: 'You solved "Hidden in Plain Sight"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: (
            <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          )
        },
        {
          id: 2,
          type: 'badge',
          title: 'Badge Unlocked',
          description: 'You earned the "Brainiac" badge',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          icon: (
            <div className="w-8 h-8 rounded-full bg-accent bg-opacity-20 flex items-center justify-center text-accent mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
            </div>
          )
        },
        {
          id: 3,
          type: 'leaderboard',
          title: 'Leaderboard Update',
          description: 'You moved up to #7 position',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          icon: (
            <div className="w-8 h-8 rounded-full bg-amber-500 bg-opacity-20 flex items-center justify-center text-amber-500 mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4zM6 15.5h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"></path></svg>
            </div>
          )
        }
      ];
      
      setActivities(mockActivities);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="w-8 h-8 rounded-full mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-orbitron text-xl font-bold text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-orbitron text-xl font-bold text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              {activity.icon}
              <div>
                <p className="text-white font-medium">{activity.title}</p>
                <p className="text-muted-foreground text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
