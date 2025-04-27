import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Flag, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddChallengeFormProps {
  onBack: () => void;
}

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  difficulty: z.enum(["easy", "medium", "hard"], { 
    required_error: "Please select a difficulty level" 
  }),
  category: z.string().min(2, { message: "Please select or enter a category" }),
  points: z.coerce.number().int().min(100, { message: "Points must be at least 100" }),
  flag: z.string().min(5, { message: "Flag must be at least 5 characters" }),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddChallengeForm({ onBack }: AddChallengeFormProps) {
  const { toast } = useToast();
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  // Define the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      category: "",
      points: 250,
      flag: "flag{",
      imageUrl: "",
    },
  });
  
  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/challenges", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge created",
        description: "The new challenge has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      onBack();
    },
    onError: (error) => {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  const onSubmit = (values: FormValues) => {
    createChallengeMutation.mutate(values);
  };
  
  // Predefined categories
  const categories = [
    "Web", "Cryptography", "Binary", "Forensics", "Reverse Engineering", 
    "OSINT", "Steganography", "Networking", "Mobile"
  ];
  
  // Set points based on difficulty
  const updatePointsByDifficulty = (difficulty: string) => {
    let points = 250;
    
    switch (difficulty) {
      case "easy":
        points = 250;
        break;
      case "medium":
        points = 500;
        break;
      case "hard":
        points = 1000;
        break;
    }
    
    form.setValue("points", points);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Challenge</h2>
          <p className="text-muted-foreground">
            Create a new CTF challenge for users to solve.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>
            Fill in the information for your new challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Hidden in Plain Sight" {...field} />
                      </FormControl>
                      <FormDescription>
                        A catchy, descriptive title for your challenge.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  {isCustomCategory ? (
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Custom Category" 
                        value={form.getValues().category}
                        onChange={(e) => form.setValue("category", e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCustomCategory(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Select
                        onValueChange={(value) => form.setValue("category", value)}
                        defaultValue={form.getValues().category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCustomCategory(true)}
                      >
                        Custom
                      </Button>
                    </div>
                  )}
                  {form.formState.errors.category && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                
                {/* Difficulty */}
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Difficulty Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            updatePointsByDifficulty(value);
                          }}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="easy" />
                            </FormControl>
                            <FormLabel className="text-green-500">Easy</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="medium" />
                            </FormControl>
                            <FormLabel className="text-accent">Medium</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="hard" />
                            </FormControl>
                            <FormLabel className="text-amber-500">Hard</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Points */}
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Point value is typically based on difficulty.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Challenge Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the challenge, provide context, and give subtle hints..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the challenge and provide any necessary context.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Flag */}
                <FormField
                  control={form.control}
                  name="flag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Flag className="h-4 w-4 mr-1" />
                        Flag
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="flag{something_here}" {...field} />
                      </FormControl>
                      <FormDescription>
                        The flag that users need to find (e.g., flag&#123;secret_value&#125;).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL to an image for the challenge card.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ensure your challenge is solvable and the flag format is consistent.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createChallengeMutation.isPending}
                >
                  {createChallengeMutation.isPending ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create Challenge
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
