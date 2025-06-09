import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function DocsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Documentation Hub"
        subtitle="Comprehensive guides, tutorials, and documentation are being crafted by our team of cybersecurity experts!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}