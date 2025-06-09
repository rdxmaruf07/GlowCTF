import { formatPoints } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStats {
  rank: number;
  totalPoints: number;
  challengesSolved: number;
  badgesEarned: number;
  streak: number;
}

interface StatsOverviewProps {
  stats?: UserStats;
  isLoading?: boolean;
}

export default function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-card hover:bg-card-hover transition neon-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">No Data Available</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p className="text-3xl font-bold text-white mr-2">--</p>
          <p className="text-muted-foreground font-medium text-sm">Stats unavailable</p>
        </Card>
      </div>
    );
  }

  const statsItems = [
    {
      title: "Current Rank",
      value: `#${stats.rank}`,
      change: stats.rank <= 10 ? "Top 10 rank" : null,
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary text-xl"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="m7.3 15 .7 9 4-4 4 4 .7-9"></path></svg>,
      changeColor: "text-green-500"
    },
    {
      title: "Total Points",
      value: formatPoints(stats.totalPoints),
      change: "+250 new",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 text-xl"><circle cx="12" cy="12" r="8"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>,
      changeColor: "text-green-500"
    },
    {
      title: "Challenges Solved",
      value: stats.challengesSolved,
      change: `of ${42} total`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 text-xl"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
      changeColor: "text-muted-foreground"
    },
    {
      title: "Badges Earned",
      value: stats.badgesEarned,
      change: "of 15 total",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent text-xl"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>,
      changeColor: "text-muted-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsItems.map((item, index) => (
        <Card key={index} className="p-5 bg-card hover:bg-card-hover transition neon-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">{item.title}</h3>
            {item.icon}
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-white mr-2">{item.value}</p>
            {item.change && (
              <p className={`${item.changeColor} font-medium text-sm`}>
                {item.changeColor === "text-green-500" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-0.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
                )}
                {item.change}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
