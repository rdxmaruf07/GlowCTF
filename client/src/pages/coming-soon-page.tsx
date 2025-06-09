import ComingSoon from "@/components/ui/coming-soon";

export default function ComingSoonPage() {
  return (
    <ComingSoon 
      variant="page"
      title="Amazing Feature Coming Soon"
      subtitle="We're cooking up something incredible! Stay tuned for the next big update."
      showSocialMedia={true}
      showStats={true}
      showJokes={true}
    />
  );
}