import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Zap, Star, Award, Medal } from "lucide-react";
import MilestoneDisplay from "@/components/milestones/milestone-display";
import AppLayout from "@/components/layout/app-layout";
import AnimatedPage from "@/components/ui/animated-page";
import { containerVariants, itemVariants, staggerContainerVariants, cardVariants } from "@/lib/animations";

export default function MilestonesPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Protected route should handle this, but just in case
  }

  return (
    <AppLayout>
      <AnimatedPage>
        <motion.div
          className="container mx-auto py-6 max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex flex-col space-y-6">
            <motion.div variants={itemVariants}>
              <h1 className="font-orbitron text-3xl font-bold text-white">Achievement Milestones</h1>
              <p className="text-muted-foreground mt-2">
                Track your progress towards earning badges and see what achievements you can unlock next.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainerVariants}
            >
              <motion.div className="md:col-span-3" variants={cardVariants}>
                <Card className="border-border hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-6 w-6 text-primary" />
                      Achievement System
                    </CardTitle>
                    <CardDescription>
                      Complete challenges and earn points to unlock badges. Each badge has specific requirements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        variants={staggerContainerVariants}
                      >
                        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
                          <Card className="border-border hover:border-yellow-500/50 transition-all duration-300">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                                Challenge Badges
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Earn badges by completing a specific number of challenges. Start with the Beginner badge and work your way up to Grandmaster.
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
                          <Card className="border-border hover:border-blue-500/50 transition-all duration-300">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Target className="h-5 w-5 mr-2 text-blue-500" />
                                Category Badges
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Specialize in specific categories like Web, Cryptography, or Forensics to earn category-specific badges.
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
                          <Card className="border-border hover:border-red-500/50 transition-all duration-300">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Zap className="h-5 w-5 mr-2 text-red-500" />
                                Difficulty Badges
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Challenge yourself with increasingly difficult problems. Earn badges for completing easy, medium, and hard challenges.
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
                          <Card className="border-border hover:border-green-500/50 transition-all duration-300">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Star className="h-5 w-5 mr-2 text-green-500" />
                                Point Badges
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Accumulate points to earn prestigious point-based badges. The more points you earn, the higher the badge tier.
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div className="md:col-span-3" variants={cardVariants}>
                <Card className="border-border hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Medal className="mr-2 h-6 w-6 text-primary" />
                      Your Milestone Progress
                    </CardTitle>
                    <CardDescription>
                      Track your progress towards each milestone and see what you need to achieve next.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MilestoneDisplay userId={user.id} />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatedPage>
    </AppLayout>
  );
}