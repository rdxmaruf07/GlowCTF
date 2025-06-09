import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Lock, Unlock, Eye, Coffee, Bot, Heart, Code, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { FloatingAnimation, PulsingGlow, Breathing, AnimationControl } from "@/components/ui/reactbits-animations";
import { useGlobalAnimation } from "@/contexts/animation-context";

interface SecretTruthPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecretTruthPage({ isOpen, onClose }: SecretTruthPageProps) {
  const { isGlobalAnimationEnabled } = useGlobalAnimation();
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const correctPin = "1337"; // Classic hacker PIN
  const maxAttempts = 3;

  useEffect(() => {
    if (isUnlocked) {
      // Trigger animation phases
      const timer1 = setTimeout(() => setAnimationPhase(1), 500);
      const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
      const timer3 = setTimeout(() => setAnimationPhase(3), 2500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isUnlocked]);

  const handlePinSubmit = () => {
    if (pin === correctPin) {
      setIsUnlocked(true);
    } else {
      setAttempts(prev => prev + 1);
      setPin("");
      if (attempts >= maxAttempts - 1) {
        setShowHint(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePinSubmit();
    }
  };

  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        {!isUnlocked ? (
          <div className="p-8 text-center">
            <PulsingGlow 
              glowColor="rgba(239, 68, 68, 0.3)" 
              intensity="medium" 
              speed={2}
              isPlaying={isGlobalAnimationEnabled}
            >
              <Lock className="h-16 w-16 mx-auto mb-6 text-red-500" />
            </PulsingGlow>
            
            <h2 className="text-2xl font-bold mb-4">🔒 Secret Access Required</h2>
            <p className="text-muted-foreground mb-6">
              Enter the PIN to unlock the truth about GlowCTF
            </p>
            
            <div className="max-w-xs mx-auto space-y-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-center text-lg tracking-widest"
                maxLength={4}
              />
              
              <Button onClick={handlePinSubmit} className="w-full">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Secret
              </Button>
              
              {attempts > 0 && (
                <p className="text-red-500 text-sm">
                  Incorrect PIN. Attempts: {attempts}/{maxAttempts}
                </p>
              )}
              
              {showHint && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
                  <p className="text-yellow-600 dark:text-yellow-400">
                    💡 Hint: It's a classic number in hacker culture... Think "leet speak"
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <CardHeader className="text-center pb-6">
              <FloatingAnimation 
                intensity="subtle" 
                direction="vertical" 
                duration={6}
                isPlaying={isGlobalAnimationEnabled && animationPhase >= 1}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  ✨ Truth About GlowCTF ✨
                </CardTitle>
              </FloatingAnimation>
            </CardHeader>

            <CardContent className="space-y-6">
              <Breathing 
                intensity="subtle" 
                speed={4}
                isPlaying={isGlobalAnimationEnabled}
              >
                <div className={`transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <p className="text-lg leading-relaxed">
                    So... you've stumbled upon <strong>GlowCTF</strong> and you're probably wondering, 
                    "Who built this thing?" Was it a team of elite hackers in a secret underground bunker? 
                    A funded startup? Maybe aliens?
                  </p>
                  
                  <p className="text-lg leading-relaxed mt-4">
                    Nope. Just <strong>me</strong> — one person, a keyboard, too much caffeine, and a slightly overworked laptop.
                  </p>
                </div>
              </Breathing>

              <div className={`transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-blue-500" />
                  Meet the Creator (That's Me 👋)
                </h3>
                
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
                  <p className="leading-relaxed">
                    Hi, I'm the one and only creator of GlowCTF. No big team. No corporate budget. 
                    Just passion, sleep deprivation, and an unhealthy obsession with bugs — the digital kind, 
                    not the flying ones (although those are annoying too).
                  </p>
                  
                  <p className="leading-relaxed mt-4">
                    I built everything you see here: the challenges, the design, the platform... all of it. 
                    If there's a bug, blame me. If it works perfectly, still blame me — but in a nice way.
                  </p>
                </div>
              </div>

              <div className={`transition-all duration-1000 delay-1000 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Bot className="h-6 w-6 text-green-500" />
                  Rdxbot: My Loyal Digital Sidekick
                </h3>
                
                <PulsingGlow 
                  glowColor="rgba(34, 197, 94, 0.2)" 
                  intensity="low" 
                  speed={3}
                  isPlaying={isGlobalAnimationEnabled}
                >
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                    <p className="leading-relaxed">
                      Now, I didn't do it <em>entirely</em> alone. I had help from <strong>Rdxbot</strong>, 
                      my trusty AI assistant.
                    </p>
                    
                    <p className="leading-relaxed mt-4">
                      Think of Rdxbot as that friend who helps with homework but disappears when it's time to present. 
                      It helped me automate tasks, write scripts, and test challenges — basically, it did the boring stuff 
                      while I looked cool.
                    </p>
                    
                    <p className="leading-relaxed mt-4">
                      Rdxbot is basically the Robin to my Batman. Except it doesn't wear tights. Probably.
                    </p>
                  </div>
                </PulsingGlow>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Why Did I Create GlowCTF?
                  </h3>
                  
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-500" />
                      I love cybersecurity.
                    </li>
                    <li className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      I love challenges.
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      And let's be honest, there just weren't enough places to flex those hacking muscles 
                      without feeling like you're stuck in a 2004 hacker movie.
                    </li>
                  </ul>
                  
                  <p className="text-sm">
                    So I created GlowCTF — a place for real learning, real fun, and 
                    <strong> real "why is this not working!?" moments</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Fun Features</h3>
                  <p className="text-sm text-muted-foreground">(a.k.a. Things That Took Me Forever to Build)</p>
                  
                  <ul className="space-y-2 text-sm">
                    <li>✅ Original challenges with realistic scenarios</li>
                    <li>✅ Progressive difficulty so you don't rage-quit (hopefully)</li>
                    <li>✅ A clean, no-nonsense platform</li>
                    <li>✅ Occasional hidden easter eggs... maybe 👀</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold mb-4">In Conclusion: The Truth</h3>
                
                <p className="leading-relaxed">
                  GlowCTF wasn't built by a company. It was built by one passionate hacker (me) with a little 
                  robotic help. No fluff, no filler — just raw effort, curiosity, and a desire to give back 
                  to the hacking community.
                </p>
                
                <p className="leading-relaxed mt-4 font-semibold">
                  Thanks for playing. Now go break stuff — responsibly, of course. 🔥
                </p>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
}