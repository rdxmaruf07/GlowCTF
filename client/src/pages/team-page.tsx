import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiGithub, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";

// Define team member type
interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  social: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
}

export default function TeamPage() {
  // This would typically be fetched from an API
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: "Team Member Name",
      role: "Project Lead",
      bio: "Add your bio information here. This section will display details about your role, expertise, and contributions to the GlowCTF Arena project.",
      photoUrl: "",
      social: {
        github: "https://github.com/rdxmaruf",
        instagram: "https://instagram.com/rdxmaruf",
        facebook: "https://facebook.com/rdxscf",
      },
    },
    // Add more team members as needed
  ]);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Meet Our Team</h1>
          <p className="text-muted-foreground">The talented people behind GlowCTF Arena</p>
        </div>

        <Tabs defaultValue="members" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="about">About the Project</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About GlowCTF Arena</CardTitle>
                <CardDescription>Our mission and vision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  GlowCTF Arena is a comprehensive Capture The Flag (CTF) platform designed for cybersecurity enthusiasts, 
                  students, and professionals to practice and enhance their skills in a safe, engaging environment.
                </p>
                <p>
                  Our platform integrates cutting-edge AI assistants to provide guidance and support, helping users 
                  learn as they tackle increasingly complex challenges across various security domains.
                </p>
                <p>
                  Founded in 2023, we aim to make cybersecurity education more accessible and interactive, fostering 
                  a community of ethical hackers and security professionals.
                </p>
                <div className="mt-6 space-y-2">
                  <h4 className="text-lg font-semibold">Key Features:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Progressive learning paths for all skill levels</li>
                    <li>AI-powered assistance for hints and learning</li>
                    <li>Integration with PicoCTF challenges</li>
                    <li>Team-based collaborative CTF challenges</li>
                    <li>Daily rotating challenges to keep skills sharp</li>
                    <li>Detailed learning resources and writeups</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
      <div className="aspect-square w-full bg-muted relative overflow-hidden">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-5xl font-bold text-primary/40 font-orbitron">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{member.name}</CardTitle>
        <CardDescription>{member.role}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
        <div className="flex space-x-3">
          {member.social.github && (
            <a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiGithub className="h-5 w-5" />
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiLinkedin className="h-5 w-5" />
            </a>
          )}
          {/* Twitter link removed */}
          {member.social.instagram && (
            <a
              href={member.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiInstagram className="h-5 w-5" />
            </a>
          )}
          {member.social.facebook && (
            <a
              href={member.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiFacebook className="h-5 w-5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}