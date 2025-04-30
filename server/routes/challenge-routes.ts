import { Express } from "express";
import { storage } from "../mysql-storage";
import { isAdmin } from "../admin";
import { insertChallengeSchema } from "@shared/mysql-schema";

// Array of 30 platform challenges (10 easy, 10 medium, 10 hard)
const platformChallenges = [
  // EASY CHALLENGES (10)
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
  {
    title: "HTTP Headers Investigation",
    description: "The flag is hidden in one of the HTTP response headers. Use developer tools to inspect the headers.",
    difficulty: "easy",
    category: "web",
    points: 100,
    flag: "flag{headers_contain_secrets}",
    imageUrl: "https://i.imgur.com/JKLmZgD.png"
  },
  {
    title: "Binary to ASCII",
    description: "Convert this binary string to ASCII to get the flag: 01100110 01101100 01100001 01100111 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01011111 01100011 01101111 01101110 01110110 01100101 01110010 01110011 01101001 01101111 01101110 01111101",
    difficulty: "easy",
    category: "crypto",
    points: 75,
    flag: "flag{binary_conversion}",
    imageUrl: "https://i.imgur.com/8Zd7MNL.png"
  },
  {
    title: "Robots.txt Exploration",
    description: "Check the robots.txt file of the website to find hidden directories that might contain the flag.",
    difficulty: "easy",
    category: "web",
    points: 100,
    flag: "flag{robots_cant_stop_humans}",
    imageUrl: "https://i.imgur.com/pMZVSQm.png"
  },

  // MEDIUM CHALLENGES (10)
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
  {
    title: "Vigenère Cipher",
    description: "Decrypt this message encrypted with a Vigenère cipher. The key is 'CRYPTO': 'wlrt{mzxvoigl_gzxjigj_fvi_hkvqrxvk}'",
    difficulty: "medium",
    category: "crypto",
    points: 250,
    flag: "flag{vigenere_ciphers_are_crackable}",
    imageUrl: "https://i.imgur.com/KvlAH3h.png"
  },
  {
    title: "Directory Traversal",
    description: "The file download functionality is vulnerable to directory traversal. Access sensitive files outside the intended directory.",
    difficulty: "medium",
    category: "web",
    points: 275,
    flag: "flag{never_trust_user_input_paths}",
    imageUrl: "https://i.imgur.com/3wBj8QJ.png"
  },
  {
    title: "Firmware Analysis",
    description: "Extract and analyze the provided IoT device firmware to find hardcoded credentials.",
    difficulty: "medium",
    category: "binary",
    points: 325,
    flag: "flag{hardcoded_secrets_in_firmware}",
    imageUrl: "https://i.imgur.com/UG17WQq.png"
  },
  {
    title: "Secure Cookie Bypass",
    description: "The application uses secure cookies for authentication. Find a way to bypass the protection.",
    difficulty: "medium",
    category: "web",
    points: 300,
    flag: "flag{httponly_and_secure_needed}",
    imageUrl: "https://i.imgur.com/XkuVxKh.png"
  },
  {
    title: "Hash Cracking",
    description: "Crack this MD5 hash to find the flag: 5f4dcc3b5aa765d61d8327deb882cf99",
    difficulty: "medium",
    category: "crypto",
    points: 275,
    flag: "flag{password_hashes_must_be_salted}",
    imageUrl: "https://i.imgur.com/YK3yXsZ.png"
  },

  // HARD CHALLENGES (10)
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
  },
  {
    title: "Kernel Exploitation",
    description: "Exploit a kernel vulnerability to escalate privileges and obtain the flag.",
    difficulty: "hard",
    category: "binary",
    points: 550,
    flag: "flag{kernel_privilege_escalation}",
    imageUrl: "https://i.imgur.com/5PRJOsE.png"
  },
  {
    title: "Advanced Web Cache Poisoning",
    description: "Exploit web cache poisoning to perform an attack that affects other users.",
    difficulty: "hard",
    category: "web",
    points: 475,
    flag: "flag{cache_poisoning_at_scale}",
    imageUrl: "https://i.imgur.com/nJO6e5T.png"
  },
  {
    title: "Blockchain Smart Contract Vulnerability",
    description: "Analyze the smart contract code to find and exploit a vulnerability.",
    difficulty: "hard",
    category: "blockchain",
    points: 525,
    flag: "flag{reentrancy_attack_successful}",
    imageUrl: "https://i.imgur.com/VO554TA.png"
  },
  {
    title: "Advanced Cryptanalysis",
    description: "Break this custom encryption algorithm by finding its mathematical weakness.",
    difficulty: "hard",
    category: "crypto",
    points: 500,
    flag: "flag{custom_crypto_always_fails}",
    imageUrl: "https://i.imgur.com/KvlAH3h.png"
  }
];

export function setupChallengeRoutes(app: Express) {
  // Get all challenges
  app.get("/api/challenges", async (req, res, next) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      next(error);
    }
  });
  
  // Get challenge by ID
  app.get("/api/challenges/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getChallengeById(id);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      next(error);
    }
  });
  
  // Submit a challenge flag
  app.post("/api/challenges/:id/submit", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to submit flags" });
      }
      
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      const { flag, startTime } = req.body;
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      if (!flag) {
        return res.status(400).json({ message: "Flag is required" });
      }
      
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if the user has already completed this challenge
      const completedChallenges = await storage.getUserCompletedChallenges(userId);
      const alreadyCompleted = completedChallenges.some(c => c.id === challengeId);
      
      if (alreadyCompleted) {
        return res.status(400).json({ message: "You have already completed this challenge" });
      }
      
      // Check if the flag is correct
      if (flag !== challenge.flag) {
        return res.status(200).json({ success: false, message: "Incorrect flag. Try again!" });
      }
      
      // Calculate time to solve if startTime was provided
      let timeToSolve = null;
      if (startTime) {
        timeToSolve = Math.floor((Date.now() - startTime) / 1000);
      }
      
      // Calculate bonus points based on solve time
      let bonusPoints = 0;
      if (timeToSolve) {
        if (timeToSolve < 300) { // Under 5 minutes
          bonusPoints = Math.floor(challenge.points * 0.3);
        } else if (timeToSolve < 600) { // Under 10 minutes
          bonusPoints = Math.floor(challenge.points * 0.2);
        } else if (timeToSolve < 1800) { // Under 30 minutes
          bonusPoints = Math.floor(challenge.points * 0.1);
        }
      }
      
      const totalPoints = challenge.points + bonusPoints;
      
      // Record the completion
      await storage.completeChallenge({
        userId,
        challengeId,
        timeToSolve,
        pointsAwarded: totalPoints
      });
      
      // Update user's score
      await storage.updateUserScore(userId, totalPoints);
      
      // Check for and award badges
      const earnedBadges = await storage.checkAndAwardBadges(userId, challengeId);
      
      res.json({
        success: true,
        message: "Congratulations! Flag is correct.",
        points: totalPoints,
        basePoints: challenge.points,
        bonusPoints,
        newBadges: earnedBadges
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get hints for a challenge
  app.get("/api/challenges/:id/hints", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to get hints" });
      }
      
      const challengeId = parseInt(req.params.id);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // In a real implementation, hints would be stored in the database
      // For now, we'll generate some generic hints based on the challenge
      const hints = [
        `Look carefully at the ${challenge.category} techniques that might be applicable.`,
        `The challenge title "${challenge.title}" contains a clue.`,
        `For ${challenge.difficulty} challenges, consider using specialized tools for ${challenge.category}.`
      ];
      
      res.json({ hints });
    } catch (error) {
      next(error);
    }
  });
  
  // Team collaboration - Get team notes
  app.get("/api/challenges/:id/team-notes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view team notes" });
      }
      
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      // In a real implementation, we would fetch notes from the database
      // For now, we'll return mock data
      const mockNotes = [
        {
          id: 1,
          userId: userId,
          username: req.user.username,
          content: "I think we need to look at the HTTP headers for this challenge.",
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          userId: userId + 1,
          username: "teammate1",
          content: "I found something interesting in the source code. There's a hidden comment with a base64 string.",
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 3,
          userId: userId,
          username: req.user.username,
          content: "Good catch! Let me try to decode it.",
          createdAt: new Date(Date.now() - 900000).toISOString()
        }
      ];
      
      res.json(mockNotes);
    } catch (error) {
      next(error);
    }
  });
  
  // Team collaboration - Add team note
  app.post("/api/challenges/:id/team-notes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to add team notes" });
      }
      
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Note content is required" });
      }
      
      // In a real implementation, we would save the note to the database
      // For now, we'll just return a success response
      const newNote = {
        id: Math.floor(Math.random() * 1000),
        userId,
        username: req.user.username,
        content,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newNote);
    } catch (error) {
      next(error);
    }
  });
  
  // Team collaboration - Get team members
  app.get("/api/challenges/:id/team-members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view team members" });
      }
      
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      // In a real implementation, we would fetch team members from the database
      // For now, we'll return mock data
      const mockMembers = [
        {
          id: userId,
          username: req.user.username,
          isOnline: true
        },
        {
          id: userId + 1,
          username: "teammate1",
          isOnline: true
        },
        {
          id: userId + 2,
          username: "teammate2",
          isOnline: false
        }
      ];
      
      res.json(mockMembers);
    } catch (error) {
      next(error);
    }
  });
  
  // Team collaboration - Invite team member
  app.post("/api/challenges/:id/invite", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to invite team members" });
      }
      
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      const { username } = req.body;
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // In a real implementation, we would check if the user exists and send an invitation
      // For now, we'll just return a success response
      res.json({ success: true, message: `Invitation sent to ${username}` });
    } catch (error) {
      next(error);
    }
  });
  
  // Add challenges (admin only)
  app.post("/api/admin/challenges/seed", isAdmin, async (req, res, next) => {
    try {
      const results = [];
      
      for (const challenge of platformChallenges) {
        try {
          // Check if challenge with this title already exists
          const challenges = await storage.getAllChallenges();
          const exists = challenges.some(c => c.title === challenge.title);
          
          if (exists) {
            results.push({ title: challenge.title, status: "skipped", message: "Challenge already exists" });
            continue;
          }
          
          // Create the challenge
          const newChallenge = await storage.createChallenge(challenge);
          results.push({ title: challenge.title, status: "created", id: newChallenge.id });
        } catch (error: any) {
          results.push({ 
            title: challenge.title, 
            status: "error", 
            message: error.message || "Unknown error occurred" 
          });
        }
      }
      
      res.json({
        success: true,
        message: `Processed ${results.length} challenges`,
        results
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new challenge (admin only)
  app.post("/api/admin/challenges", isAdmin, async (req, res, next) => {
    try {
      const { title, description, difficulty, category, points, flag, imageUrl } = req.body;
      
      if (!title || !description || !difficulty || !category || !points || !flag) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const challenge = await storage.createChallenge({
        title,
        description,
        difficulty,
        category,
        points,
        flag,
        imageUrl
      });
      
      res.status(201).json(challenge);
    } catch (error) {
      next(error);
    }
  });
}