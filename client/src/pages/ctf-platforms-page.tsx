import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import PicoCTFChallengeList from "@/components/challenges/picoctf-challenge-list";
import TryHackMeChallengeList from "@/components/challenges/tryhackme-challenge-list";
import ComingSoon from "@/components/ui/coming-soon";
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="picoctf">PicoCTF</TabsTrigger>
                <TabsTrigger value="tryhackme">TryHackMe</TabsTrigger>
                <TabsTrigger value="hackthebox">HackTheBox</TabsTrigger>
                <TabsTrigger value="overthewire">OverTheWire</TabsTrigger>
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

                <TabsContent value="hackthebox">
                  <ComingSoon 
                    variant="section"
                    title="HackTheBox Integration"
                    subtitle="We're working on integrating HackTheBox challenges! Get ready for some serious penetration testing practice."
                    showSocialMedia={true}
                    showStats={false}
                    showJokes={true}
                  />
                </TabsContent>

                <TabsContent value="overthewire">
                  <ComingSoon 
                    variant="section"
                    title="OverTheWire Wargames"
                    subtitle="OverTheWire wargames are coming soon! Perfect for learning the basics of security through fun challenges."
                    showSocialMedia={true}
                    showStats={false}
                    showJokes={true}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* More Platforms Coming Soon */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>More Platforms Coming Soon! 🚀</CardTitle>
            <CardDescription>
              We're constantly adding new CTF platforms to expand your learning opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-white mb-2">🎯 VulnHub</h3>
                <p className="text-sm text-muted-foreground">Vulnerable VMs for hands-on practice</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-white mb-2">🔐 CryptoHack</h3>
                <p className="text-sm text-muted-foreground">Modern cryptography challenges</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-white mb-2">🌐 PortSwigger Web Security</h3>
                <p className="text-sm text-muted-foreground">Web application security labs</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-white mb-2">🏴‍☠️ RootMe</h3>
                <p className="text-sm text-muted-foreground">Hacking challenges and learning</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-white mb-2">🎮 SmashTheStack</h3>
                <p className="text-sm text-muted-foreground">Binary exploitation wargames</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-white mb-2">🔬 Exploit Education</h3>
                <p className="text-sm text-muted-foreground">Memory corruption and exploitation</p>
              </div>
            </div>
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