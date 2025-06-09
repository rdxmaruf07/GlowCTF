interface SimpleChatbotLayoutProps {
  children: React.ReactNode;
}

export default function SimpleChatbotLayout({ children }: SimpleChatbotLayoutProps) {
  return (
    <div className="h-screen w-full bg-background">
      {children}
    </div>
  );
}