import { Challenge } from "@shared/schema";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDifficultyColor, formatPoints } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Loader2, HelpCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TeamCollaboration from "./team-collaboration";

interface ChallengeCardProps {
  challenge: Challenge;
  inModal?: boolean;
}

interface SubmissionResponse {
  success: boolean;
  message?: string;
  points?: number;
  basePoints?: number;
  bonusPoints?: number;
  newBadges?: { id: number; name: string; description: string }[];
}

export default function ChallengeCard({ challenge, inModal = false }: ChallengeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [flag, setFlag] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showTeamCollaboration, setShowTeamCollaboration] = useState(false);
  const { toast } = useToast();
  
  // Styling for difficulty badge
  const difficultyColor = getDifficultyColor(challenge.difficulty);
  
  // Submit flag mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST", 
        `/api/challenges/submit/${challenge.id}`, 
        { flag, startTime }
      );
      return res.json() as Promise<SubmissionResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Flag Captured!",
          description: `You earned ${data.points} points${data.bonusPoints ? ` (includes ${data.bonusPoints} bonus points)` : ''}`,
          variant: "default",
        });
        
        // Show badge notifications if any
        if (data.newBadges && data.newBadges.length > 0) {
          data.newBadges.forEach(badge => {
            toast({
              title: `New Badge Unlocked: ${badge.name}`,
              description: badge.description,
              variant: "default",
            });
          });
        }
        
        // Invalidate relevant queries to update UI
        queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        // Close dialog
        setIsDialogOpen(false);
        setFlag("");
      } else {
        toast({
          title: "Incorrect Flag",
          description: data.message || "The submitted flag is incorrect. Try again!",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Submission Error",
        description: `There was an error submitting the flag: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Fetch hints
  const { data: hintsData, isLoading: hintsLoading } = useQuery({
    queryKey: [`/api/challenges/${challenge.id}/hints`, challenge.id],
    enabled: showHints,
    staleTime: Infinity,
  });
  
  // Open challenge dialog and record start time
  const handleOpenChallenge = () => {
    setStartTime(Date.now());
    setIsDialogOpen(true);
  };
  
  // Handle flag submission
  const handleSubmit = () => {
    if (!flag.trim()) {
      toast({
        title: "Empty Flag",
        description: "Please enter a flag",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate();
  };
  
  // If in modal view, just render the content without the card
  if (inModal) {
    return (
      <div className="space-y-4">
        <div className="prose prose-invert max-w-none">
          <h2 className="font-mono text-xl font-medium text-white mb-2">{challenge.title}</h2>
          <p className="text-muted-foreground">{challenge.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline">{challenge.category}</Badge>
          <Badge variant="secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-amber-500"><circle cx="12" cy="12" r="8"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            {formatPoints(challenge.points)} points
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          {challenge.solveCount} solves
        </div>
        
        {/* Hints Section */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="hints">
            <AccordionTrigger 
              onClick={() => setShowHints(true)}
              className="text-primary hover:text-primary/80"
            >
              <div className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Need a hint?
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {hintsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading hints...</span>
                </div>
              ) : hintsData?.hints && hintsData.hints.length > 0 ? (
                <ul className="space-y-2 pl-5 list-disc text-muted-foreground">
                  {hintsData.hints.map((hint: string, index: number) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No hints available for this challenge.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Team Collaboration Toggle */}
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setShowTeamCollaboration(!showTeamCollaboration)}
          >
            <Users className="h-4 w-4" />
            {showTeamCollaboration ? "Hide Team Collaboration" : "Show Team Collaboration"}
          </Button>
        </div>
        
        {/* Team Collaboration Section */}
        {showTeamCollaboration && (
          <TeamCollaboration challengeId={challenge.id} />
        )}
        
        <div className="mt-6">
          <Input
            placeholder="Enter flag (e.g., flag{...})"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            className="mb-4"
            disabled={submitMutation.isPending}
          />
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Flag"
            )}
          </Button>
        </div>
      </div>
    );
  }
  
  // Full card view
  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition duration-300 border-border hover:border-primary">
        <div className="h-40 relative">
          {challenge.imageUrl ? (
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${challenge.imageUrl})` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground opacity-20"><path d="M21 9V6a2 2 0 0 0-2-2H9"></path><path d="M3 14v3a2 2 0 0 0 2 2h14"></path><path d="m9 14 5-11"></path><path d="m9 18-5-11"></path><path d="m10 14-5-2"></path><path d="M15 11v.01"></path><path d="M15 14v.01"></path><path d="M18 16v.01"></path></svg>
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute top-3 left-3">
            <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary">{challenge.category}</Badge>
          </div>
        </div>
        
        <CardContent className="p-5">
          <h3 className="font-mono text-lg font-medium text-white mb-2">{challenge.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{challenge.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span className="text-muted-foreground text-xs">{challenge.solveCount} solves</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mr-1"><circle cx="12" cy="12" r="8"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
              <span className="text-amber-500 text-xs font-medium">{formatPoints(challenge.points)} pts</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-5 pb-5 pt-0">
          <Button 
            onClick={handleOpenChallenge} 
            className="w-full bg-background text-primary border border-primary hover:bg-primary hover:bg-opacity-10 transition"
          >
            View Challenge
          </Button>
        </CardFooter>
      </Card>
      
      {/* Challenge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{challenge.title}</DialogTitle>
            <DialogDescription>
              Try to find the flag and submit it to earn points
            </DialogDescription>
          </DialogHeader>
          
          <ChallengeCard challenge={challenge} inModal={true} />
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}