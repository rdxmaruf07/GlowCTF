import { db } from "../db";
import { challenges } from "@shared/schema";
import { sql } from "drizzle-orm";

const challengeData = [
  // Easy challenges (7)
  {
    title: "Welcome Hacker",
    description: "Find the flag hidden in the HTML source code of the home page.",
    category: "Web",
    difficulty: "easy",
    points: 100,
    flag: "flag{welcome_to_glowctf_arena}",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
  },
  {
    title: "Base64 Basics",
    description: "Decode this Base64 string to find the flag: ZmxhZ3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259",
    category: "Cryptography",
    difficulty: "easy",
    points: 100,
    flag: "flag{base64_is_not_encryption}",
    imageUrl: "https://images.unsplash.com/photo-1526378800651-c32d170fe6f8"
  },
  {
    title: "HTTP Headers",
    description: "Find the flag hidden in the HTTP response headers.",
    category: "Web",
    difficulty: "easy",
    points: 150,
    flag: "flag{headers_tell_all}",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
  },
  {
    title: "Inspect Element",
    description: "Use your browser's developer tools to find a hidden element with the flag.",
    category: "Web",
    difficulty: "easy",
    points: 100,
    flag: "flag{inspector_gadget}",
    imageUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051"
  },
  {
    title: "Caesar's Secret",
    description: "Decode this Caesar cipher to find the flag: iodj{urwdwlrqbflskhuv_duh_fodvvlf}",
    category: "Cryptography",
    difficulty: "easy",
    points: 150,
    flag: "flag{rotation_ciphers_are_classic}",
    imageUrl: "https://images.unsplash.com/photo-1533630757306-cbadb934bcb1"
  },
  {
    title: "Cookie Monster",
    description: "Find the flag stored in a browser cookie.",
    category: "Web",
    difficulty: "easy",
    points: 200,
    flag: "flag{cookies_are_tasty_and_useful}",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e"
  },
  {
    title: "String Search",
    description: "Download the text file and find the hidden flag among thousands of random strings.",
    category: "Forensics",
    difficulty: "easy",
    points: 200,
    flag: "flag{needle_in_a_haystack}",
    imageUrl: "https://images.unsplash.com/photo-1555532538-dcdbd01d373d"
  },
  
  // Medium challenges (5)
  {
    title: "SQL Injection 101",
    description: "The login form is vulnerable to SQL injection. Can you bypass it?",
    category: "Web",
    difficulty: "medium",
    points: 300,
    flag: "flag{bobby_tables_says_hi}",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
  },
  {
    title: "XOR Encoding",
    description: "The flag has been XOR encoded with the key 'CTF'. Decode it: 021D11041D04070E1C51010B10440159071102095A",
    category: "Cryptography",
    difficulty: "medium",
    points: 350,
    flag: "flag{xor_is_reversible}",
    imageUrl: "https://images.unsplash.com/photo-1580894912989-0bc892f4efd0"
  },
  {
    title: "Broken Authentication",
    description: "The reset password functionality has a vulnerability. Can you exploit it to gain access?",
    category: "Web",
    difficulty: "medium",
    points: 400,
    flag: "flag{reset_tokens_matter}",
    imageUrl: "https://images.unsplash.com/photo-1528845922818-cc5462be9f8e"
  },
  {
    title: "Metadata Extraction",
    description: "Download the image and extract its metadata to find the hidden flag.",
    category: "Forensics",
    difficulty: "medium",
    points: 350,
    flag: "flag{exif_data_exposed}",
    imageUrl: "https://images.unsplash.com/photo-1507457379470-08b800bebc67"
  },
  {
    title: "Reverse Engineering Basics",
    description: "Download the binary file and reverse engineer it to find the flag.",
    category: "Reverse Engineering",
    difficulty: "medium",
    points: 450,
    flag: "flag{static_analysis_works}",
    imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2"
  },
  
  // Hard challenges (6)
  {
    title: "Advanced Buffer Overflow",
    description: "Exploit a buffer overflow vulnerability in the provided service to get the flag.",
    category: "Binary Exploitation",
    difficulty: "hard",
    points: 500,
    flag: "flag{stack_smashing_detected}",
    imageUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e"
  },
  {
    title: "Secure Shell",
    description: "Find a way to bypass the SSH authentication to access the server.",
    category: "Network",
    difficulty: "hard",
    points: 550,
    flag: "flag{private_key_extraction}",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8"
  },
  {
    title: "Rootkit Detection",
    description: "Analyze the provided system image to detect and identify the rootkit.",
    category: "Forensics",
    difficulty: "hard",
    points: 600,
    flag: "flag{hidden_in_plain_sight}",
    imageUrl: "https://images.unsplash.com/photo-1562690868-60bbe7293e94"
  },
  {
    title: "Advanced Web Exploitation",
    description: "Combine multiple vulnerabilities to achieve a complete takeover of the web application.",
    category: "Web",
    difficulty: "hard",
    points: 650,
    flag: "flag{chain_of_vulnerabilities}",
    imageUrl: "https://images.unsplash.com/photo-1563420565624-789e480ab8e7"
  },
  {
    title: "Memory Forensics",
    description: "Analyze the memory dump to find evidence of the attack and retrieve the flag.",
    category: "Forensics",
    difficulty: "hard",
    points: 700,
    flag: "flag{volatile_memory_analysis}",
    imageUrl: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6"
  },
  {
    title: "Zero-Day Exploit",
    description: "Find and exploit an unknown vulnerability in the custom service.",
    category: "Binary Exploitation",
    difficulty: "hard",
    points: 750,
    flag: "flag{day_zero_reached}",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"
  }
];

async function addChallenges() {
  try {
    console.log("Adding challenge data...");
    
    // Get all existing challenge titles
    const existingChallengesResult = await db.execute(sql`SELECT title FROM challenges`);
    const existingTitles = new Set(existingChallengesResult.rows.map((row: any) => row.title));
    
    for (const challenge of challengeData) {
      // Check if challenge already exists
      if (existingTitles.has(challenge.title)) {
        console.log(`Challenge "${challenge.title}" already exists, skipping.`);
        continue;
      }
      
      // Add the challenge
      await db.execute(sql`
        INSERT INTO challenges (title, description, category, difficulty, points, flag, image_url, solve_count, created_at)
        VALUES (
          ${challenge.title},
          ${challenge.description},
          ${challenge.category},
          ${challenge.difficulty},
          ${challenge.points},
          ${challenge.flag},
          ${challenge.imageUrl},
          0,
          NOW()
        )
      `);
      
      console.log(`Added challenge: ${challenge.title} (${challenge.difficulty}, ${challenge.category}, ${challenge.points} points)`);
    }
    
    console.log("Challenge data added successfully!");
  } catch (error) {
    console.error("Error adding challenge data:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addChallenges();