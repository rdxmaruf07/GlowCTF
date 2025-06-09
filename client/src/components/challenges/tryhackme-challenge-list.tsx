import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Flag, Clock, Award, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TryHackMeChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  points: number;
  hints?: string[];
  roomUrl?: string;
}

export default function TryHackMeChallengeList() {
  const { toast } = useToast();
  const [selectedChallenge, setSelectedChallenge] = useState<TryHackMeChallenge | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [flag, setFlag] = useState("");
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("easy");
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Fetch TryHackMe challenges
  const { data: challenges, isLoading, error } = useQuery({
    queryKey: ["/api/tryhackme/challenges"],
  });
  
  // Filter challenges by difficulty
  const filteredChallenges = challenges?.filter(
    (challenge: TryHackMeChallenge) => challenge.difficulty === activeTab
  ) || [];
  
  const handleStartChallenge = (challenge: TryHackMeChallenge) => {
    setSelectedChallenge(challenge);
    setStartTime(Date.now());
  };
  
  const handleOpenSubmitDialog = () => {
    setIsSubmitDialogOpen(true);
  };
  
  const handleCloseSubmitDialog = () => {
    setIsSubmitDialogOpen(false);
    setFlag("");
    setSolution("");
  };
  
  const handleSubmitFlag = async () => {
    if (!selectedChallenge || !flag) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", `/api/tryhackme/submit/${selectedChallenge.id}`, {
        flag,
        startTime,
        solution: solution.trim() ? solution : undefined
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Flag correct!",
          description: `You earned ${result.points} points (${result.basePoints} + ${result.bonusPoints} bonus)`,
          variant: "success",
        });
        
        if (result.newBadges && result.newBadges.length > 0) {
          toast({
            title: "New badge earned!",
            description: `You earned the ${result.newBadges[0].name} badge!`,
            variant: "success",
          });
        }
        
        handleCloseSubmitDialog();
      } else {
        toast({
          title: "Incorrect flag",
          description: "The submitted flag is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit flag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        Failed to load TryHackMe challenges. Please try again later.
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge: TryHackMeChallenge) => (
          <Card key={challenge.id} className="overflow-hidden border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <Badge variant={
                  challenge.difficulty === 'easy' ? 'outline' : 
                  challenge.difficulty === 'medium' ? 'secondary' : 'destructive'
                }>
                  {challenge.difficulty}
                </Badge>
              </div>
              <CardDescription>{challenge.category}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Award className="h-4 w-4 mr-1" />
                <span>{challenge.points} points</span>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(challenge.roomUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Room
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  handleStartChallenge(challenge);
                  handleOpenSubmitDialog();
                }}
              >
                <Flag className="h-4 w-4 mr-2" />
                Submit Flag
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Submit Flag Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Flag for {selectedChallenge?.title}</DialogTitle>
            <DialogDescription>
              Enter the flag you found and optionally document your solution process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="flag" className="text-sm font-medium">
                Flag
              </label>
              <Input
                id="flag"
                placeholder="flag{...}"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="solution" className="text-sm font-medium">
                Solution (Optional)
              </label>
              <Textarea
                id="solution"
                placeholder="Document your solution process here..."
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Your solution will be saved to help you remember how you solved this challenge.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSubmitDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFlag} disabled={!flag || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Flag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}