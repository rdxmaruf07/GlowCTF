import { motion } from 'framer-motion';

interface GreetingProps {
  onSuggestedQuestion?: (question: string) => void;
}

// Split text animation component inspired by reactbits.dev
const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(' ');
  
  return (
    <div className={`flex flex-wrap justify-center gap-x-2 ${className}`}>
      {words.map((word, wordIndex) => (
        <div key={wordIndex} className="flex">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: (wordIndex * word.length + charIndex) * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: (wordIndex * word.length + word.length) * 0.05
              }}
              className="inline-block"
            >
              &nbsp;
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
};

export function Greeting({ onSuggestedQuestion }: GreetingProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto w-full text-center">
        <SplitText 
          text="How can I assist you today?"
          className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6"
        />
        <motion.p 
          className="text-muted-foreground text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          I'm your AI-powered CTF assistant, ready to help you with challenges and cybersecurity concepts.
        </motion.p>
      </div>
    </div>
  );
}