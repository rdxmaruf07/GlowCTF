import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function PartnershipsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Academic Partnerships"
        subtitle="Collaborate with GlowCTF! Partnership opportunities for universities, research institutions, and educational organizations!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}