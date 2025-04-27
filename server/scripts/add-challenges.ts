import { db } from "../db";
import { challenges } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Array of 18 platform challenges (7 easy, 5 medium, 6 hard)
const platformChallenges = [
  // EASY CHALLENGES (7)
  {
    title: "Cookie Monster",
    description: "This website stores sensitive information in cookies. Inspect the browser cookies to find the flag.",
    difficulty: "easy",
    category: "web",
    points: 100,
    flag: "flag{cookies_are_not_secure_storage}",
    imageUrl: "https://i.imgur.com/XkuVxKh.png"
  },
  {
    title: "Base64 Basics",
    description: "Decode this base64 string to get the flag: ZmxhZ3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259",
    difficulty: "easy",
    category: "crypto",
    points: 50,
    flag: "flag{base64_is_not_encryption}",
    imageUrl: "https://i.imgur.com/YK3yXsZ.png"
  },
  {
    title: "Hidden in Plain Sight",
    description: "The flag is hidden in the HTML source code of this website. View the source to find it!",
    difficulty: "easy",
    category: "web",
    points: 75,
    flag: "flag{source_code_reveals_secrets}",
    imageUrl: "https://i.imgur.com/IaLkNOu.png"
  },
  {
    title: "Terminal Basics",
    description: "Use the 'ls -la' command to find a hidden file, then use 'cat' to read its contents.",
    difficulty: "easy",
    category: "linux",
    points: 100,
    flag: "flag{hidden_files_revealed}",
    imageUrl: "https://i.imgur.com/wST09XM.png"
  },
  {
    title: "Simple XSS",
    description: "Inject a simple alert script into the input field to trigger an XSS vulnerability.",
    difficulty: "easy",
    category: "web",
    points: 150,
    flag: "flag{alert_1_xss_success}",
    imageUrl: "https://i.imgur.com/lYdKuE4.png"
  },
  {
    title: "Password Policy",
    description: "Analyze this password policy and find the weakness: 'Must be exactly 8 lowercase letters'.",
    difficulty: "easy",
    category: "security",
    points: 125,
    flag: "flag{entropy_matters_more_than_rules}",
    imageUrl: "https://i.imgur.com/yROUN8I.png"
  },
  {
    title: "Metadata Extraction",
    description: "Download the image and extract its metadata to find the hidden flag.",
    difficulty: "easy",
    category: "forensics",
    points: 150,
    flag: "flag{exif_data_leaks_info}",
    imageUrl: "https://i.imgur.com/rMXapvG.png"
  },

  // MEDIUM CHALLENGES (5)
  {
    title: "SQL Injection 101",
    description: "The login form is vulnerable to SQL injection. Find a way to bypass authentication.",
    difficulty: "medium",
    category: "web",
    points: 250,
    flag: "flag{sql_injection_bypassed_auth}",
    imageUrl: "https://i.imgur.com/3wBj8QJ.png"
  },
  {
    title: "Broken Authentication",
    description: "The password reset functionality has a logic flaw. Find a way to reset anyone's password.",
    difficulty: "medium",
    category: "web",
    points: 300,
    flag: "flag{predictable_tokens_are_bad}",
    imageUrl: "https://i.imgur.com/eBQyMFW.png"
  },
  {
    title: "Caesar's Secret",
    description: "Decrypt this message encrypted with a Caesar cipher: 'iodj{urwdwlrq_flskhuv_duh_zhdn}'",
    difficulty: "medium",
    category: "crypto",
    points: 200,
    flag: "flag{rotation_ciphers_are_weak}",
    imageUrl: "https://i.imgur.com/7dJiQWu.png"
  },
  {
    title: "Network Packet Analysis",
    description: "Analyze the provided pcap file to find the exfiltrated data.",
    difficulty: "medium",
    category: "forensics",
    points: 350,
    flag: "flag{wireshark_reveals_all}",
    imageUrl: "https://i.imgur.com/o8Hc3h6.png"
  },
  {
    title: "Command Injection",
    description: "The ping utility on this web application is vulnerable to command injection. Execute commands to find the flag.",
    difficulty: "medium",
    category: "web",
    points: 300,
    flag: "flag{sanitize_user_input_always}",
    imageUrl: "https://i.imgur.com/nJO6e5T.png"
  },

  // HARD CHALLENGES (6)
  {
    title: "Advanced Buffer Overflow",
    description: "Exploit the buffer overflow vulnerability in this binary to get a shell.",
    difficulty: "hard",
    category: "binary",
    points: 500,
    flag: "flag{stack_smashing_detected}",
    imageUrl: "https://i.imgur.com/5PRJOsE.png"
  },
  {
    title: "Reverse Engineering",
    description: "Decompile this binary and figure out the correct input to get the flag.",
    difficulty: "hard",
    category: "binary",
    points: 450,
    flag: "flag{static_analysis_for_the_win}",
    imageUrl: "https://i.imgur.com/UG17WQq.png"
  },
  {
    title: "JWT Token Manipulation",
    description: "The API uses JWT tokens for authentication. Find and exploit the vulnerability in the token verification.",
    difficulty: "hard",
    category: "web",
    points: 400,
    flag: "flag{alg_none_attack_successful}",
    imageUrl: "https://i.imgur.com/VO554TA.png"
  },
  {
    title: "RSA Decryption Challenge",
    description: "You have the public key and a ciphertext. Find the vulnerability to decrypt the message.",
    difficulty: "hard",
    category: "crypto",
    points: 450,
    flag: "flag{weak_exponents_break_rsa}",
    imageUrl: "https://i.imgur.com/KvlAH3h.png"
  },
  {
    title: "Memory Forensics",
    description: "Analyze this memory dump to find evidence of the attacker's activity.",
    difficulty: "hard",
    category: "forensics",
    points: 500,
    flag: "flag{volatility_memory_analysis}",
    imageUrl: "https://i.imgur.com/TY4L4RZ.png"
  },
  {
    title: "Advanced Steganography",
    description: "The flag is hidden in this image using advanced steganography techniques. Extract it!",
    difficulty: "hard",
    category: "forensics",
    points: 400,
    flag: "flag{least_significant_bits}",
    imageUrl: "https://i.imgur.com/PQXd2lV.png"
  }
];

// Function to add challenges to the database
async function addChallenges() {
  console.log("Adding challenges to the database...");
  
  try {
    // Insert each challenge
    for (const challenge of platformChallenges) {
      const existingChallenge = await db.select({ 
        count: sql`count(*)` 
      })
      .from(challenges)
      .where(eq(challenges.title, challenge.title));
      
      const count = Number(existingChallenge[0].count);
      
      if (count === 0) {
        const result = await db.insert(challenges).values(challenge).returning();
        console.log(`Added challenge: ${challenge.title}`);
      } else {
        console.log(`Challenge already exists: ${challenge.title}`);
      }
    }
    
    console.log("All challenges added successfully!");
  } catch (error) {
    console.error("Error adding challenges:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Execute the function
addChallenges();