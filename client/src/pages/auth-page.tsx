import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Redirect } from "wouter";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LockKeyholeOpen, User, Code, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  role: z.enum(["user", "admin", "hacker"]).default("user"),
  adminCode: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useAuth();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<string>("user");
  
  // Initialize forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
      adminCode: "",
    },
  });
  
  // Update role in register form when user selects a role button
  useEffect(() => {
    registerForm.setValue("role", activeRole as any);
    
    // Clear admin code if not admin role
    if (activeRole !== "admin") {
      registerForm.setValue("adminCode", "");
    }
  }, [activeRole, registerForm]);
  
  // Handle form submissions
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Validate admin code if role is admin
    if (data.role === "admin" && (!data.adminCode || data.adminCode.trim() === "")) {
      toast({
        title: "Admin Code Required",
        description: "Please enter the admin secret code to register as an admin",
        variant: "destructive"
      });
      return;
    }
    
    registerMutation.mutate(data, {
      onError: (error: any) => {
        if (error.message === "Invalid admin code") {
          toast({
            title: "Invalid Admin Code",
            description: "The admin code you entered is incorrect",
            variant: "destructive"
          });
        }
      }
    });
  };
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="flex flex-col justify-center">
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary neon-glow">Glow</span>CTF Arena
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your training ground for capture-the-flag challenges and cybersecurity skills
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                <LockKeyholeOpen size={20} />
              </div>
              <div>
                <h3 className="font-medium text-white">Multi-Level Challenges</h3>
                <p className="text-muted-foreground text-sm">From beginner-friendly to expert-level cybersecurity challenges</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mr-4 flex-shrink-0">
                <Code size={20} />
              </div>
              <div>
                <h3 className="font-medium text-white">AI-Assisted Learning</h3>
                <p className="text-muted-foreground text-sm">Get help from multiple AI assistants for your hacking journey</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.21 13.89 7 23l9-9-8.99-9-.8 9.09"/><path d="M10.59 5.91c.87-.9 2.8-.91 3.67 0 1.4 1.44-.92 4.54.4 6.45 2.25 3.25 5.63 1.32 6.78 3.43 1.37 2.52-1.96 4.7-2.31 7.2-.22 1.53-.74 3.2-2.39 3.93-1.76.78-3.09-.27-4.73-1.34-1.44-.94-3.59-.73-4.4-2.5-1.25-2.71 3.88-5.18 2.64-7.82-1.56-3.34-4.53-1.31-5.62-3.1-1.32-2.16.62-4.2 1.62-6.13.58-1.12 2.44-1.96 3.5-1.06Z"/></svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Badge System</h3>
                <p className="text-muted-foreground text-sm">Earn achievements and climb the global leaderboard</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Form */}
        <div>
          <Card className="border-border shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="font-orbitron text-2xl">Access GlowCTF</CardTitle>
              <CardDescription>Login to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="remember" className="rounded bg-background border-border" />
                          <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
                        </div>
                        <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      {/* Role Selection */}
                      <div className="space-y-2 mb-4">
                        <Label>Select your role</Label>
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            type="button"
                            variant={activeRole === "user" ? "default" : "outline"}
                            className={`flex flex-col h-20 items-center justify-center ${activeRole === "user" ? "border-primary" : ""}`}
                            onClick={() => setActiveRole("user")}
                          >
                            <User className="h-6 w-6 mb-1" />
                            <span className="text-xs">User</span>
                          </Button>
                          
                          <Button
                            type="button"
                            variant={activeRole === "admin" ? "default" : "outline"}
                            className={`flex flex-col h-20 items-center justify-center ${activeRole === "admin" ? "border-primary" : ""}`}
                            onClick={() => setActiveRole("admin")}
                          >
                            <LockKeyholeOpen className="h-6 w-6 mb-1" />
                            <span className="text-xs">Admin</span>
                          </Button>
                          
                          <Button
                            type="button"
                            variant={activeRole === "hacker" ? "default" : "outline"}
                            className={`flex flex-col h-20 items-center justify-center ${activeRole === "hacker" ? "border-primary" : ""}`}
                            onClick={() => setActiveRole("hacker")}
                          >
                            <Code className="h-6 w-6 mb-1" />
                            <span className="text-xs">Hacker</span>
                          </Button>
                        </div>
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Admin Code Field - only shown when Admin role is selected */}
                      {activeRole === "admin" && (
                        <FormField
                          control={registerForm.control}
                          name="adminCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center">
                                  Admin Code
                                  <span className="ml-2 text-yellow-500">
                                    <AlertCircle size={16} />
                                  </span>
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter admin secret code" {...field} />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Required for admin registration
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
