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
import { ExternalLink, Flag, Clock, Award, BookOpen, Download, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  // Mock PicoCTF challenges data
  const mockChallenges: PicoCTFChallenge[] = [
    // Easy challenges
    {
      id: "pico-1",
      title: "Obedient Cat",
      category: "General Skills",
      difficulty: "easy",
      description: "This file has a flag in plain sight (aka 'in-the-clear'). Download flag.",
      points: 5,
      flag_format: "picoCTF{...}",
      files: [{ name: "flag", url: "#" }]
    },
    {
      id: "pico-2", 
      title: "Python Wrangling",
      category: "General Skills",
      difficulty: "easy",
      description: "Python scripts are invoked kind of like programs in the Terminal... Can you run this Python script using this password to get the flag?",
      points: 10,
      flag_format: "picoCTF{...}",
      files: [
        { name: "ende.py", url: "#" },
        { name: "pw.txt", url: "#" },
        { name: "flag.txt.en", url: "#" }
      ]
    },
    {
      id: "pico-3",
      title: "Wave a flag",
      category: "General Skills", 
      difficulty: "easy",
      description: "Can you invoke help flags for a tool or binary? This program has extraordinarily helpful information...",
      points: 10,
      flag_format: "picoCTF{...}",
      files: [{ name: "warm", url: "#" }]
    },
    {
      id: "pico-4",
      title: "Nice netcat",
      category: "General Skills",
      difficulty: "easy", 
      description: "There is a nice program that you can talk to by using this command in a shell: $ nc mercury.picoctf.net 22902",
      points: 15,
      flag_format: "picoCTF{...}"
    },
    {
      id: "pico-5",
      title: "Static ain't always noise",
      category: "General Skills",
      difficulty: "easy",
      description: "Can you look at the data in this binary: static? This BASH script might help!",
      points: 20,
      flag_format: "picoCTF{...}",
      files: [
        { name: "static", url: "#" },
        { name: "ltdis.sh", url: "#" }
      ]
    },
    // Medium challenges
    {
      id: "pico-6",
      title: "Magikarp Ground Mission",
      category: "General Skills",
      difficulty: "medium",
      description: "Do you know how to move between directories and read files in the shell? Start the container, `ssh` to it, and then `ls` once connected to begin.",
      points: 30,
      flag_format: "picoCTF{...}"
    },
    {
      id: "pico-7",
      title: "First Grep",
      category: "General Skills",
      difficulty: "medium",
      description: "Can you find the flag in file? This would be really tedious to look through manually, something tells me there is a better way.",
      points: 100,
      flag_format: "picoCTF{...}",
      files: [{ name: "file", url: "#" }]
    },
    {
      id: "pico-8",
      title: "Big Zip",
      category: "General Skills",
      difficulty: "medium",
      description: "Unzip this archive and find the flag.",
      points: 100,
      flag_format: "picoCTF{...}",
      files: [{ name: "big-zip-files.zip", url: "#" }]
    },
    // Hard challenges
    {
      id: "pico-9",
      title: "Based",
      category: "General Skills",
      difficulty: "hard",
      description: "To get truly 1337, you must understand different data encodings, such as hexadecimal or binary. Can you get the flag from this program to prove you are on the way to becoming 1337?",
      points: 200,
      flag_format: "picoCTF{...}"
    },
    {
      id: "pico-10",
      title: "plumbing",
      category: "General Skills",
      difficulty: "hard", 
      description: "Sometimes you need to handle process data outside of a file. Can you find a way to keep the output from this program and search for the flag?",
      points: 200,
      flag_format: "picoCTF{...}"
    }
  ];

  // Use mock data instead of API call
  const challenges = mockChallenges;
  const isLoading = false;
  const error = null;
  
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Flag Submitted!",
        description: "Your flag has been submitted for review. This is a demo - no actual validation is performed.",
      });
      
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

  // Helper function to render the challenge grid
  const renderChallengeGrid = () => {
    if (filteredChallenges.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No PicoCTF challenges available for this difficulty level.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden hover:shadow-md transition-shadow border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-500" />
                {challenge.title}
              </CardTitle>
              <CardDescription className="flex items-center">
                <Badge variant="outline" className="mr-2 border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
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
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Award className="w-3 h-3 mr-1" />
                {challenge.points} pts
              </Badge>
              <Button size="sm" onClick={() => handleChallengeSelect(challenge)} className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Challenge
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {renderHeader()}
        <Tabs defaultValue="easy">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="easy" className="text-green-600">Easy</TabsTrigger>
            <TabsTrigger value="medium" className="text-yellow-600">Medium</TabsTrigger>
            <TabsTrigger value="hard" className="text-red-600">Hard</TabsTrigger>
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
      <div className="space-y-4">
        {renderHeader()}
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
      </div>
    );
  }

  // Always render the header first, regardless of loading state
  const renderHeader = () => (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">PicoCTF Challenges</h2>
      <p className="text-muted-foreground">
        Practice with real PicoCTF challenges. These are educational challenges from Carnegie Mellon University's cybersecurity competition.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderHeader()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="easy" className="text-green-600">Easy</TabsTrigger>
          <TabsTrigger value="medium" className="text-yellow-600">Medium</TabsTrigger>
          <TabsTrigger value="hard" className="text-red-600">Hard</TabsTrigger>
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
                <Trophy className="h-5 w-5 text-blue-500" />
                {selectedChallenge.title}
                <Badge variant="outline" className="ml-2 border-blue-300 text-blue-700">
                  {selectedChallenge.category}
                </Badge>
                <Badge className="ml-auto bg-blue-600">
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
              <Button onClick={handleOpenSubmitDialog} className="bg-blue-600 hover:bg-blue-700">
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
            <DialogTitle>Submit PicoCTF Flag</DialogTitle>
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
            <Button onClick={handleSubmitFlag} disabled={!flag || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}