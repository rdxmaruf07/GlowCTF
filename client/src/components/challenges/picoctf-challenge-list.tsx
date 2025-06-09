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
import { ExternalLink, Flag, Clock, Award, BookOpen, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PicoCTFChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  points: number;
  hints?: string[];
  files?: { name: string; url: string }[];
  flag_format?: string;
}

export default function PicoCTFChallengeList() {
  const { toast } = useToast();
  const [selectedChallenge, setSelectedChallenge] = useState<PicoCTFChallenge | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [flag, setFlag] = useState("");
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("easy");
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Fetch PicoCTF challenges
  const { data: challenges = [], isLoading, error } = useQuery({
    queryKey: ["/api/picoctf/challenges"],
  });
  
  // Filter challenges by difficulty
  const filteredChallenges = challenges.filter(
    (challenge: PicoCTFChallenge) => challenge.difficulty === activeTab
  );

  // Handle challenge selection
  const handleChallengeSelect = (challenge: PicoCTFChallenge) => {
    setSelectedChallenge(challenge);
    if (!startTime) {
      setStartTime(Date.now());
    }
  };

  // Handle closing the challenge dialog
  const handleCloseDialog = () => {
    setSelectedChallenge(null);
  };

  // Handle opening the submit dialog
  const handleOpenSubmitDialog = () => {
    setIsSubmitDialogOpen(true);
  };

  // Handle closing the submit dialog
  const handleCloseSubmitDialog = () => {
    setIsSubmitDialogOpen(false);
    setFlag("");
    setSolution("");
  };

  // Handle flag submission
  const handleSubmitFlag = async () => {
    if (!selectedChallenge) return;
    
    setIsSubmitting(true);
    
    try {
      const endTime = Date.now();
      const timeSpent = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
      
      const response = await apiRequest("POST", "/api/picoctf/submit", {
        challengeId: selectedChallenge.id,
        flag,
        solution,
        timeSpent,
      });
      
      const result = await response.json();
      
      if (result.correct) {
        toast({
          title: "Correct Flag!",
          description: "Congratulations! You've solved the challenge.",
        });
        setStartTime(null);
      } else {
        toast({
          title: "Incorrect Flag",
          description: "The submitted flag is incorrect. Try again!",
          variant: "destructive",
        });
      }
      
      handleCloseSubmitDialog();
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting your flag.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="easy">
          <TabsList>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p>An error occurred while loading the challenges. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="easy" className="mt-4">
          {renderChallengeGrid()}
        </TabsContent>
        <TabsContent value="medium" className="mt-4">
          {renderChallengeGrid()}
        </TabsContent>
        <TabsContent value="hard" className="mt-4">
          {renderChallengeGrid()}
        </TabsContent>
      </Tabs>

      {/* Challenge Details Dialog */}
      {selectedChallenge && (
        <Dialog open={!!selectedChallenge} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedChallenge.title}
                <Badge variant="outline" className="ml-2">
                  {selectedChallenge.category}
                </Badge>
                <Badge className="ml-auto">
                  <Award className="w-3 h-3 mr-1" />
                  {selectedChallenge.points} pts
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {startTime && (
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Timer started
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" /> Description
                </h4>
                <div className="text-sm prose prose-sm max-w-none">
                  {selectedChallenge.description}
                </div>
              </div>
              
              {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Hints</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {selectedChallenge.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedChallenge.files && selectedChallenge.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Files</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChallenge.files.map((file, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {file.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedChallenge.flag_format && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Flag Format</h4>
                  <code className="text-xs bg-muted p-1 rounded">
                    {selectedChallenge.flag_format}
                  </code>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
              <Button onClick={handleOpenSubmitDialog}>
                <Flag className="w-4 h-4 mr-2" />
                Submit Flag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Flag Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Flag</DialogTitle>
            <DialogDescription>
              Enter the flag you found and a brief explanation of your solution.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="flag" className="text-sm font-medium">
                Flag
              </label>
              <Input
                id="flag"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder={selectedChallenge?.flag_format || "picoCTF{flag}"}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="solution" className="text-sm font-medium">
                Solution (optional)
              </label>
              <Textarea
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Explain how you solved this challenge..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSubmitDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFlag} disabled={!flag || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Helper function to render the challenge grid
  function renderChallengeGrid() {
    if (filteredChallenges.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No challenges available for this difficulty level.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <CardDescription className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {challenge.category}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {challenge.description.substring(0, 100)}
                {challenge.description.length > 100 ? "..." : ""}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge variant="secondary">
                <Award className="w-3 h-3 mr-1" />
                {challenge.points} pts
              </Badge>
              <Button size="sm" onClick={() => handleChallengeSelect(challenge)}>
                View Challenge
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}