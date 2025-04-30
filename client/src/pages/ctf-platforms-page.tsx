import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import PicoCTFChallengeList from "@/components/challenges/picoctf-challenge-list";
import TryHackMeChallengeList from "@/components/challenges/tryhackme-challenge-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CTFPlatformsPage() {
  const [activePlatform, setActivePlatform] = useState("picoctf");
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2">CTF Platforms</h1>
          <p className="text-muted-foreground">
            Practice challenges from popular CTF platforms and track your progress.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Platform Selection</CardTitle>
            <CardDescription>
              Choose a CTF platform to view and solve challenges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="picoctf">PicoCTF</TabsTrigger>
                <TabsTrigger value="tryhackme">TryHackMe</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="picoctf">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold font-orbitron text-white mb-2">PicoCTF Challenges</h2>
                    <p className="text-muted-foreground mb-4">
                      PicoCTF is a free computer security education program with original content built on a capture-the-flag framework.
                    </p>
                  </div>
                  <PicoCTFChallengeList />
                </TabsContent>
                
                <TabsContent value="tryhackme">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold font-orbitron text-white mb-2">TryHackMe Challenges</h2>
                    <p className="text-muted-foreground mb-4">
                      TryHackMe is an online platform for learning cyber security through hands-on exercises and labs.
                    </p>
                  </div>
                  <TryHackMeChallengeList />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Tracking Your Progress</CardTitle>
            <CardDescription>
              All your completed challenges and flags are saved for future reference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              When you submit a correct flag, your solution and the flag will be saved to a file called <code>flag.txt</code> in your profile.
              You can access this file at any time to review your past solutions and track your progress.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">Benefits of tracking your progress:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Review your past solutions to remember techniques</li>
                <li>Track which challenges you've completed</li>
                <li>Build a portfolio of your cybersecurity skills</li>
                <li>Earn badges based on your achievements</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}