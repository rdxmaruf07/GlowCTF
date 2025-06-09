import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function EducatorsPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="For Educators"
        subtitle="Special tools, resources, and classroom management features designed specifically for cybersecurity educators and trainers!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}