import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { FileDown, Award, ExternalLink, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { getDifficultyColor } from "@/lib/utils";

// Types
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

interface SubmissionResponse {
  success: boolean;
  message?: string;
  points?: number;
  basePoints?: number;
  bonusPoints?: number;
  newBadges?: { id: number; name: string; description: string }[];
}

// Form schema
const flagSubmissionSchema = z.object({
  flag: z.string().min(1, "Flag is required")
});

type FlagSubmissionValues = z.infer<typeof flagSubmissionSchema>;

export default function PicoCTFChallengeList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<PicoCTFChallenge | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Query to fetch PicoCTF challenges
  const { data: challenges = [], isLoading, error } = useQuery<PicoCTFChallenge[]>({
    queryKey: ['/api/picoctf/challenges'],
    enabled: !!user
  });

  // Admin import form
  const importForm = useForm({
    defaultValues: {
      selectedChallenges: [] as string[]
    }
  });

  // Flag submission form
  const form = useForm<FlagSubmissionValues>({
    resolver: zodResolver(flagSubmissionSchema),
    defaultValues: {
      flag: ""
    }
  });

  // Effects
  useEffect(() => {
    if (selectedChallenge) {
      setStartTime(Date.now());
    }
  }, [selectedChallenge]);

  // Handle flag submission
  const onSubmit = async (values: FlagSubmissionValues) => {
    if (!selectedChallenge) return;
    
    try {
      const response = await apiRequest("POST", `/api/picoctf/submit/${selectedChallenge.id}`, {
        flag: values.flag,
        startTime
      });
      
      const result: SubmissionResponse = await response.json();
      
      setSubmissionResult(result);
      
      if (result.success) {
        setShowSuccessAlert(true);
        form.reset();
      } else {
        toast({
          title: "Incorrect Flag",
          description: "The submitted flag is incorrect. Try again!",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit flag. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle admin import
  const handleImport = async () => {
    try {
      const challengesToImport = challenges.filter(
        (challenge: PicoCTFChallenge) => importForm.getValues().selectedChallenges.includes(challenge.id)
      );
      
      const response = await apiRequest("POST", "/api/picoctf/import", {
        challenges: challengesToImport
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.count} PicoCTF challenges.`,
          variant: "default"
        });
        importForm.reset();
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import challenges. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get unique categories
  const categories = challenges 
    ? ['all', ...Array.from(new Set(challenges.map((c: PicoCTFChallenge) => c.category)))]
    : ['all'];

  // Filter challenges by category and search
  const filteredChallenges = challenges 
    ? challenges.filter((challenge: PicoCTFChallenge) => {
        const matchesCategory = activeCategory === 'all' || challenge.category === activeCategory;
        const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Failed to load challenges</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">PicoCTF Challenges</h2>
        <p className="text-muted-foreground mb-6">
          Test your skills against challenges from the popular PicoCTF competition.
        </p>

        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search challenges..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Tabs 
            defaultValue="all" 
            className="w-full"
            value={activeCategory}
            onValueChange={setActiveCategory}
          >
            <TabsList className="w-full overflow-x-auto flex flex-nowrap">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="whitespace-nowrap"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Admin import option */}
        {user?.role === 'admin' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mb-4">
                Import to Platform
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Import PicoCTF Challenges</DialogTitle>
                <DialogDescription>
                  Select challenges to import into the GlowCTF platform.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 max-h-96 overflow-y-auto">
                {challenges.map((challenge: PicoCTFChallenge) => (
                  <div key={challenge.id} className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id={`challenge-${challenge.id}`}
                      value={challenge.id}
                      {...importForm.register('selectedChallenges')}
                    />
                    <Label htmlFor={`challenge-${challenge.id}`} className="flex-1 cursor-pointer">
                      {challenge.title} ({challenge.points} pts)
                    </Label>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button onClick={handleImport}>Import Selected</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Challenge grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge: PicoCTFChallenge) => {
          const { bgColor, textColor } = getDifficultyColor(challenge.difficulty);
          
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="h-full hover:shadow-md transition-shadow neon-border flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${bgColor} ${textColor}`}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline">{challenge.points} pts</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
                  <Badge variant="secondary">{challenge.category}</Badge>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    {challenge.description.length > 120
                      ? `${challenge.description.substring(0, 120)}...`
                      : challenge.description}
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="default" 
                        onClick={() => setSelectedChallenge(challenge)}
                      >
                        View Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${bgColor} ${textColor}`}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{challenge.points} pts</Badge>
                          <Badge variant="secondary">{challenge.category}</Badge>
                        </div>
                        <DialogTitle className="text-2xl">{challenge.title}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="mb-4 whitespace-pre-line text-muted-foreground">
                          {challenge.description}
                        </p>
                        
                        {challenge.files && challenge.files.length > 0 && (
                          <>
                            <h4 className="font-semibold mb-2">Files</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {challenge.files.map((file, index) => (
                                <a
                                  key={index}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                  <FileDown className="h-4 w-4" />
                                  <span>{file.name}</span>
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {challenge.hints && challenge.hints.length > 0 && (
                          <>
                            <h4 className="font-semibold mb-2">Hints</h4>
                            <ul className="list-disc list-inside mb-4 space-y-1">
                              {challenge.hints.map((hint, index) => (
                                <li key={index} className="text-muted-foreground">
                                  {hint}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        
                        <Separator className="my-4" />
                        
                        <h4 className="font-semibold mb-2">Submit Flag</h4>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="flag"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Flag
                                    {challenge.flag_format && (
                                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                                        Format: {challenge.flag_format}
                                      </span>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="flag{...}" 
                                      {...field}
                                      className="font-mono"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                              Submit Flag
                            </Button>
                          </form>
                        </Form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Success alert */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Challenge Completed!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <p className="mb-4">
                Congratulations! You've successfully solved this challenge.
              </p>
              
              <div className="bg-card p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Base points:</span>
                  <span className="font-semibold">{submissionResult?.basePoints} pts</span>
                </div>
                
                {(submissionResult?.bonusPoints || 0) > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Time bonus:
                    </span>
                    <span className="text-primary font-semibold">+{submissionResult?.bonusPoints} pts</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center font-bold">
                  <span>Total earned:</span>
                  <span className="text-lg gradient-text">{submissionResult?.points} pts</span>
                </div>
              </div>
              
              {submissionResult?.newBadges && submissionResult.newBadges.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary" />
                    New Badges Earned
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {submissionResult.newBadges.map(badge => (
                      <Badge key={badge.id} className="py-1 px-2 badge-glow">
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}