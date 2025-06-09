import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function ResearchPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Research & Innovation"
        subtitle="Cutting-edge cybersecurity research, whitepapers, and collaboration opportunities with academic institutions worldwide!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}