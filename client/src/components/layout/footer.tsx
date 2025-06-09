import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Shield, 
  Users, 
  Trophy, 
  Instagram,
  Youtube,
  Facebook,
  Twitch,
  MessageCircle,
  Heart,
  Coffee,
  Star,
  Zap
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Challenges", href: "/challenges" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Practice", href: "/practice" },
      { name: "Milestones", href: "/milestones" }
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Blog", href: "/blog" }
    ],
    community: [
      { name: "Discord", href: "/discord" },
      { name: "Forums", href: "/forums" },
      { name: "Events", href: "/events" },
      { name: "Contributors", href: "/contributors" }
    ],
    academic: [
      { name: "For Educators", href: "/educators" },
      { name: "Curriculum", href: "/curriculum" },
      { name: "Research", href: "/research" },
      { name: "Partnerships", href: "/partnerships" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/glowctf", label: "GitHub", color: "hover:text-gray-400" },
    { icon: Twitter, href: "https://twitter.com/glowctf", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Instagram, href: "https://instagram.com/glowctf", label: "Instagram", color: "hover:text-pink-400" },
    { icon: Youtube, href: "https://youtube.com/glowctf", label: "YouTube", color: "hover:text-red-500" },
    { icon: Linkedin, href: "https://linkedin.com/company/glowctf", label: "LinkedIn", color: "hover:text-blue-600" },
    { icon: Facebook, href: "https://facebook.com/glowctf", label: "Facebook", color: "hover:text-blue-500" },
    { icon: Twitch, href: "https://twitch.tv/glowctf", label: "Twitch", color: "hover:text-purple-500" },
    { icon: MessageCircle, href: "/discord", label: "Discord", color: "hover:text-indigo-400" },
    { icon: Mail, href: "mailto:contact@glowctf.com", label: "Email", color: "hover:text-green-400" }
  ];

  return (
    <footer className="relative bg-background border-t border-border">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  GlowCTF
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Empowering the next generation of cybersecurity professionals through hands-on learning and competitive challenges.
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-primary/10 transition-all duration-300 hover:scale-110 ${social.color}`}
                    asChild
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <social.icon className="w-5 h-5" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-primary" />
                Platform
              </h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                Community
              </h3>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Academic Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Academic</h3>
              <ul className="space-y-3">
                {footerLinks.academic.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              © {currentYear} GlowCTF. All rights reserved. Made with <Heart className="inline h-3 w-3 text-red-500" /> and lots of <Coffee className="inline h-3 w-3 text-amber-500" />
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}