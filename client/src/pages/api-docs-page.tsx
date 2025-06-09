import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function ApiDocsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="API Reference"
        subtitle="Complete API documentation with examples, endpoints, and integration guides coming soon! Perfect for developers building on GlowCTF."
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}