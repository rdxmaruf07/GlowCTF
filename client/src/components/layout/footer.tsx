import React from "react";
import { SiGithub, SiInstagram, SiFacebook } from "react-icons/si";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 px-8 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-orbitron text-lg mb-1 gradient-text">GlowCTF Arena</h3>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Team ARDR. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-6 md:gap-8">
            <a 
              href="https://github.com/rdxmaruf/GlowCTF" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <SiGithub className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </a>
            
            <a 
              href="https://instagram.com/rdxmaruf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <SiInstagram className="h-5 w-5" />
              <span className="text-sm">Instagram</span>
            </a>
            
            <a 
              href="https://facebook.com/rdxscf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <SiFacebook className="h-5 w-5" />
              <span className="text-sm">Facebook</span>
            </a>
          </div>
          
          <div className="mt-4 md:mt-0">
            <a 
              href="https://secureway.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Developed by Team ARDR</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}