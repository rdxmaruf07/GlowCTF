import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function PrivacyPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Privacy Policy"
        subtitle="Your privacy matters! Our comprehensive privacy policy is being finalized by our legal team to ensure full transparency and compliance."
        showSocialMedia={true}
        showStats={false}
        showJokes={true}
      />
    </AppLayout>
  );
}