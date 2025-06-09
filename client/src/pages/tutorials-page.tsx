import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function TutorialsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Interactive Tutorials"
        subtitle="Step-by-step tutorials covering everything from basic cybersecurity concepts to advanced penetration testing techniques!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}