import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function BlogPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="GlowCTF Blog"
        subtitle="Latest cybersecurity insights, CTF writeups, industry news, and expert analysis from our community of security professionals!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}