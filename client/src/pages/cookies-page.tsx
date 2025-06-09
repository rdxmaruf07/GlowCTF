import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function CookiesPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Cookie Policy"
        subtitle="Learn about how we use cookies to enhance your experience. Our detailed cookie policy is being baked to perfection! 🍪"
        showSocialMedia={true}
        showStats={false}
        showJokes={true}
      />
    </AppLayout>
  );
}