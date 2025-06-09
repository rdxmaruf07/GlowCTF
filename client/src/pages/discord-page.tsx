import { useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function DiscordPage() {
  useEffect(() => {
    // Redirect to Discord after 3 seconds
    const timer = setTimeout(() => {
      window.open("https://discord.gg/glowctf", "_blank");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Joining Discord Server..."
        subtitle="You'll be redirected to our Discord server in 3 seconds! Join our amazing community of cybersecurity enthusiasts! 🚀"
        showSocialMedia={true}
        showStats={false}
        showJokes={true}
      />
    </AppLayout>
  );
}