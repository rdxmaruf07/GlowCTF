import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Trophy, Target, Zap, Star, Medal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MilestoneCategory {
  name: string;
  icon: React.ReactNode;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  progress: number;
  total: number;
  completed: boolean;
  badgeId?: number;
}

interface MilestoneDisplayProps {
  userId: number;
}

export default function MilestoneDisplay({ userId }: MilestoneDisplayProps) {
  const [activeTab, setActiveTab] = useState<string>("achievements");
  
  // Fetch milestone data
  const { data: milestones, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}/milestones`],
    enabled: !!userId,
  });
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Track your progress towards earning badges</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="achievements">
            <TabsList className="mb-4">
              <TabsTrigger value="achievements">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Target className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="difficulty">
                <Zap className="h-4 w-4 mr-2" />
                Difficulty
              </TabsTrigger>
              <TabsTrigger value="points">
                <Star className="h-4 w-4 mr-2" />
                Points
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Track your progress towards earning badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-destructive">Failed to load milestone data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try refreshing the page
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If no milestones data yet, use mock data
  const milestoneData = milestones || {
    achievements: [
      {
        id: "solve-1",
        name: "Beginner",
        description: "Solve your first challenge",
        progress: 1,
        total: 1,
        completed: true,
        badgeId: 2
      },
      {
        id: "solve-5",
        name: "Apprentice",
        description: "Solve 5 challenges",
        progress: 3,
        total: 5,
        completed: false
      },
      {
        id: "solve-10",
        name: "Journeyman",
        description: "Solve 10 challenges",
        progress: 3,
        total: 10,
        completed: false
      },
      {
        id: "solve-25",
        name: "Expert",
        description: "Solve 25 challenges",
        progress: 3,
        total: 25,
        completed: false
      },
      {
        id: "solve-50",
        name: "Master",
        description: "Solve 50 challenges",
        progress: 3,
        total: 50,
        completed: false
      },
      {
        id: "solve-100",
        name: "Grandmaster",
        description: "Solve 100 challenges",
        progress: 3,
        total: 100,
        completed: false
      }
    ],
    categories: [
      {
        id: "category-Web-3",
        name: "Web Novice",
        description: "Solve 3 Web challenges",
        progress: 2,
        total: 3,
        completed: false
      },
      {
        id: "category-Web-5",
        name: "Web Expert",
        description: "Solve 5 Web challenges",
        progress: 2,
        total: 5,
        completed: false
      },
      {
        id: "category-Web-10",
        name: "Web Master",
        description: "Solve 10 Web challenges",
        progress: 2,
        total: 10,
        completed: false
      },
      {
        id: "category-Cryptography-3",
        name: "Cryptography Novice",
        description: "Solve 3 Cryptography challenges",
        progress: 1,
        total: 3,
        completed: false
      },
      {
        id: "category-Cryptography-5",
        name: "Cryptography Expert",
        description: "Solve 5 Cryptography challenges",
        progress: 1,
        total: 5,
        completed: false
      },
      {
        id: "category-Binary-3",
        name: "Binary Novice",
        description: "Solve 3 Binary challenges",
        progress: 0,
        total: 3,
        completed: false
      }
    ],
    difficulty: [
      {
        id: "difficulty-easy-3",
        name: "Easy Solver",
        description: "Solve 3 easy challenges",
        progress: 3,
        total: 3,
        completed: true,
        badgeId: 10
      },
      {
        id: "difficulty-easy-5",
        name: "Easy Expert",
        description: "Solve 5 easy challenges",
        progress: 3,
        total: 5,
        completed: false
      },
      {
        id: "difficulty-medium-3",
        name: "Medium Solver",
        description: "Solve 3 medium challenges",
        progress: 0,
        total: 3,
        completed: false
      },
      {
        id: "difficulty-hard-3",
        name: "Hard Solver",
        description: "Solve 3 hard challenges",
        progress: 0,
        total: 3,
        completed: false
      }
    ],
    points: [
      {
        id: "score-1000",
        name: "Point Hunter",
        description: "Earn 1,000 points",
        progress: 750,
        total: 1000,
        completed: false
      },
      {
        id: "score-5000",
        name: "Point Collector",
        description: "Earn 5,000 points",
        progress: 750,
        total: 5000,
        completed: false
      },
      {
        id: "score-10000",
        name: "Point Master",
        description: "Earn 10,000 points",
        progress: 750,
        total: 10000,
        completed: false
      }
    ]
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <CardDescription>Track your progress towards earning badges</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="achievements">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Target className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="difficulty">
              <Zap className="h-4 w-4 mr-2" />
              Difficulty
            </TabsTrigger>
            <TabsTrigger value="points">
              <Star className="h-4 w-4 mr-2" />
              Points
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="space-y-4">
            {milestoneData.achievements.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            {milestoneData.categories.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </TabsContent>
          
          <TabsContent value="difficulty" className="space-y-4">
            {milestoneData.difficulty.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </TabsContent>
          
          <TabsContent value="points" className="space-y-4">
            {milestoneData.points.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const progressPercentage = Math.min(100, Math.round((milestone.progress / milestone.total) * 100));
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-sm font-medium">{milestone.name}</h3>
          {milestone.completed && (
            <Badge variant="success" className="ml-2">
              <Award className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {milestone.progress} / {milestone.total}
        </span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <p className="text-xs text-muted-foreground">{milestone.description}</p>
    </div>
  );
}