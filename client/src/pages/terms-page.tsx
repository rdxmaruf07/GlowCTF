import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function TermsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Terms of Service"
        subtitle="Fair and transparent terms of service are being crafted to protect both users and the platform. Coming soon!"
        showSocialMedia={true}
        showStats={false}
        showJokes={true}
      />
    </AppLayout>
  );
}