import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";

// Define a placeholder image until real photos are added
// Define a placeholder image until real photos are added
const placeholderImage1 = "https://i.postimg.cc/hvPZdsNL/e6a89017-c87b-4cae-a9b0-cb9a661c04bd.jpg";
const placeholderImage2 = "https://i.postimg.cc/15Zt2ctK/Flux-Dev-A-humorous-404-error-illustration-featuring-a-whimsic-0.jpg";
const placeholderImage3 = "https://i.postimg.cc/NGRTK02p/Flux-Dev-Create-a-humorous-404-error-image-for-a-CST-boy-where-0.jpg";
const placeholderImage4 = "https://i.postimg.cc/tTCd3G0Y/Flux-Dev-Create-a-humorous-404-error-image-for-a-CST-boy-where-2.jpg";

// Team member interfaces
interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

// Team member data - photos will be added later
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Abdul Mark Khan",
    role: "Requirements & Backend",
    bio:  "Focus on backend development and requirements analysis. Key contributor to GlowCTF's challenge verification system.",
     photoUrl: placeholderImage1,
    socialLinks: {
      github: "https://github.com/rdxmaruf07",
      linkedin: "https://i.postimg.cc/Y0gXTxhg/Flux-Dev-a-humorous-404-error-illustration-featuring-a-bewilde-3.jpg",
      twitter: "https://i.postimg.cc/fWjq78Qn/Flux-Dev-Illustrate-a-humorous-404-error-concept-where-a-Twitt-0.jpg",
    },
  },
  {
    id: 2,
    name: "Debarjyoti Routh",
    role: "AI Integration & Frontend",
    bio: "Integrates AI models and connects them to the frontend. Develops dynamic features that use AI responses and ensures smooth client-server communication.",
    photoUrl: placeholderImage2,
    socialLinks: {
      github: "https://i.postimg.cc/W3ZtZDdS/Flux-Dev-Illustrate-a-humorous-404-error-image-where-a-cartoon-0.jpg",
      linkedin: "https://i.postimg.cc/Y0gXTxhg/Flux-Dev-a-humorous-404-error-illustration-featuring-a-bewilde-3.jpg",
      twitter: "https://i.postimg.cc/fWjq78Qn/Flux-Dev-Illustrate-a-humorous-404-error-concept-where-a-Twitt-0.jpg"
    },
  },
  {
    id: 3,
    name: "Rajat Ghorai",
    role: " UI/UX Designe & Frontend Support",
    bio: "Designs user-friendly interfaces and responsive layouts using Figma and Tailwind CSS. Enhances visual appeal and supports frontend implementation with a focus on user experience.",
    photoUrl: placeholderImage3,
    socialLinks: {
      github: "https://i.postimg.cc/W3ZtZDdS/Flux-Dev-Illustrate-a-humorous-404-error-image-where-a-cartoon-0.jpg",
      twitter: "https://i.postimg.cc/fWjq78Qn/Flux-Dev-Illustrate-a-humorous-404-error-concept-where-a-Twitt-0.jpg",
      linkedin: "https://i.postimg.cc/Y0gXTxhg/Flux-Dev-a-humorous-404-error-illustration-featuring-a-bewilde-3.jpg",
      
    },
  },
  {
    id: 4,
    name: "Ramji Barman",
    role: "Technical Writer & Documentation",
    bio:  "Creates and maintains all project documentation, including setup guides and API references.  Ensures clarity for developers, contributors, and users throughout the project lifecycle.",
    photoUrl: placeholderImage4,
    socialLinks: {
      github: "https://i.postimg.cc/W3ZtZDdS/Flux-Dev-Illustrate-a-humorous-404-error-image-where-a-cartoon-0.jpg",
      linkedin: "https://i.postimg.cc/Y0gXTxhg/Flux-Dev-a-humorous-404-error-illustration-featuring-a-bewilde-3.jpg",
      twitter: "https://i.postimg.cc/fWjq78Qn/Flux-Dev-Illustrate-a-humorous-404-error-concept-where-a-Twitt-0.jpg",
    },
  },
];

// Team member card component
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  return (
    <Card className="overflow-hidden border-border hover:border-primary transition-colors duration-300">
      <div className="aspect-square overflow-hidden">
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold">{member.name}</h3>
        <p className="text-primary mb-2">{member.role}</p>
        <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
        <div className="flex space-x-2">
          {member.socialLinks.github && (
            <Button variant="outline" size="icon" asChild>
              <a
                href={member.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
          )}
          {member.socialLinks.linkedin && (
            <Button variant="outline" size="icon" asChild>
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </Button>
          )}
          {member.socialLinks.twitter && (
            <Button variant="outline" size="icon" asChild>
              <a
                href={member.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
          )}
          {member.socialLinks.website && (
            <Button variant="outline" size="icon" asChild>
              <a
                href={member.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Website</span>
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function TeamPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-orbitron font-bold mb-4">
            Meet Our <span className="text-primary neon-glow">Team</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The GlowCTF Arena platform was built by a passionate team of
            cybersecurity enthusiasts and developers. Each team member brings
            unique skills and expertise to create this comprehensive CTF
            training platform.
          </p>
        </div>

        {/* Team section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>

        {/* Project details */}
        <div className="mt-20 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">About The Project</h2>
          <p className="text-muted-foreground mb-6">
            GlowCTF Arena is a comprehensive Capture The Flag (CTF)
            cybersecurity training platform designed to help security
            enthusiasts practice and improve their skills. The platform features
            multi-level challenges across different security domains,
            AI-assisted learning, team collaboration, and a badge achievement
            system.
          </p>
          <Button asChild>
            <a
              href="https://i.postimg.cc/W3ZtZDdS/Flux-Dev-Illustrate-a-humorous-404-error-image-where-a-cartoon-0.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
