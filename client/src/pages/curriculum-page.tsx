import AppLayout from "@/components/layout/app-layout";
import ComingSoon from "@/components/ui/coming-soon";

export default function CurriculumPage() {
  return (
    <AppLayout>
      <ComingSoon 
        variant="page"
        title="Cybersecurity Curriculum"
        subtitle="Structured learning paths, course materials, and assessment tools aligned with industry standards and academic requirements!"
        showSocialMedia={true}
        showStats={true}
        showJokes={true}
      />
    </AppLayout>
  );
}