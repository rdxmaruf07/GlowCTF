import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function ContributorsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Contributors Hall of Fame"
        subtitle="Recognizing the amazing developers, security researchers, and community members who make GlowCTF possible!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}