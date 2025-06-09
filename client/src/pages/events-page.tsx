import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function EventsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Cybersecurity Events"
        subtitle="Live CTF competitions, workshops, webinars, and networking events. Join the global cybersecurity community!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}