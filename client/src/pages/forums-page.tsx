import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function ForumsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Community Forums"
        subtitle="Connect with fellow hackers, share knowledge, discuss challenges, and build the cybersecurity community together!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}