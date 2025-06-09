import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/app-layout";
import PracticeCard from "@/components/practice/practice-card";
import ComingSoon from "@/components/ui/coming-soon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PRACTICE_VULNERABILITIES } from "@/lib/constants";
import VulnerablePage from "@/components/practice/vulnerable-page";
import AnimatedPage from "@/components/ui/animated-page";
import { containerVariants, itemVariants, staggerContainerVariants, cardVariants } from "@/lib/animations";

export default function PracticePage() {
  const [selectedVulnerability, setSelectedVulnerability] = useState<string | null>(null);

  return (
    <AppLayout>
      <AnimatedPage>
        <motion.div
          className="p-4 md:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8"
            variants={itemVariants}
          >
            <div>
              <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Practice Arena</h1>
              <p className="text-muted-foreground">Hone your skills on vulnerable practice environments.</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Alert className="mb-6 bg-accent/10 border-accent hover:bg-accent/15 transition-colors duration-300">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-white">
                These are controlled environments designed for learning. Practice ethical hacking techniques in a safe sandbox.
              </AlertDescription>
            </Alert>
          </motion.div>

          {selectedVulnerability ? (
            // Show the selected vulnerability practice page
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <VulnerablePage
                vulnerability={PRACTICE_VULNERABILITIES.find(v => v.id === selectedVulnerability)!}
                onBack={() => setSelectedVulnerability(null)}
              />
            </motion.div>
          ) : (
            // Show the list of vulnerabilities to practice
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {PRACTICE_VULNERABILITIES.map((vulnerability, index) => (
                  <motion.div
                    key={vulnerability.id}
                    variants={cardVariants}
                    whileHover="hover"
                    custom={index}
                  >
                    <PracticeCard
                      vulnerability={vulnerability}
                      onSelect={() => setSelectedVulnerability(vulnerability.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Coming Soon Section */}
              <motion.div
                className="mt-12"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <ComingSoon 
                  variant="section"
                  title="Advanced Practice Labs"
                  subtitle="More sophisticated practice environments are coming soon! Including Docker containers, network simulations, and real-world scenarios."
                  showSocialMedia={false}
                  showStats={false}
                  showJokes={true}
                />
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatedPage>
    </AppLayout>
  );
}