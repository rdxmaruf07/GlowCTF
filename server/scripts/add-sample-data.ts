import { getDb } from "../mysql-db";
import { challenges, completedChallenges, users } from "../../shared/mysql-schema";

async function addSampleData() {
  const db = await getDb();
  
  console.log("Adding sample challenges...");
  
  // Add sample challenges
  const sampleChallenges = [
    {
      title: "Basic SQL Injection",
      description: "Find and exploit a SQL injection vulnerability in the login form.",
      category: "web",
      difficulty: "easy",
      points: 100,
      flag: "flag{sql_injection_basic}",
      solveCount: 0,
      isActive: true
    },
    {
      title: "XSS Challenge",
      description: "Exploit a cross-site scripting vulnerability to steal cookies.",
      category: "web", 
      difficulty: "medium",
      points: 200,
      flag: "flag{xss_cookie_theft}",
      solveCount: 0,
      isActive: true
    },
    {
      title: "Caesar Cipher",
      description: "Decrypt this message encrypted with a Caesar cipher.",
      category: "crypto",
      difficulty: "easy", 
      points: 150,
      flag: "flag{caesar_cipher_solved}",
      solveCount: 0,
      isActive: true
    },
    {
      title: "Buffer Overflow",
      description: "Exploit a buffer overflow vulnerability to gain shell access.",
      category: "pwn",
      difficulty: "hard",
      points: 300,
      flag: "flag{buffer_overflow_pwned}",
      solveCount: 0,
      isActive: true
    },
    {
      title: "Network Forensics",
      description: "Analyze the network capture to find the hidden flag.",
      category: "forensics",
      difficulty: "medium",
      points: 250,
      flag: "flag{network_analysis_complete}",
      solveCount: 0,
      isActive: true
    }
  ];

  try {
    for (const challenge of sampleChallenges) {
      const result = await db.insert(challenges).values(challenge);
      console.log(`Added challenge: ${challenge.title} (ID: ${result[0].insertId})`);
    }

    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);

    // Get all challenges
    const allChallenges = await db.select().from(challenges);
    console.log(`Found ${allChallenges.length} challenges`);

    // Add some completed challenges to make the data more realistic
    console.log("Adding sample completed challenges...");
    
    if (allUsers.length > 0 && allChallenges.length > 0) {
      // User 1 (RdxMaruF) solves 3 challenges
      const user1 = allUsers[0];
      await db.insert(completedChallenges).values({
        userId: user1.id,
        challengeId: allChallenges[0].id, // Basic SQL Injection
        pointsAwarded: allChallenges[0].points,
        completedAt: new Date()
      });
      
      await db.insert(completedChallenges).values({
        userId: user1.id,
        challengeId: allChallenges[2].id, // Caesar Cipher
        pointsAwarded: allChallenges[2].points,
        completedAt: new Date()
      });

      await db.insert(completedChallenges).values({
        userId: user1.id,
        challengeId: allChallenges[4].id, // Network Forensics
        pointsAwarded: allChallenges[4].points,
        completedAt: new Date()
      });

      // Update user score
      const totalPoints = allChallenges[0].points + allChallenges[2].points + allChallenges[4].points;
      await db.update(users).set({ score: totalPoints }).where({ id: user1.id });
      console.log(`Updated ${user1.username} score to ${totalPoints}`);

      // User 2 (rdxunk) solves 2 challenges
      if (allUsers.length > 1) {
        const user2 = allUsers[1];
        await db.insert(completedChallenges).values({
          userId: user2.id,
          challengeId: allChallenges[0].id, // Basic SQL Injection
          pointsAwarded: allChallenges[0].points,
          completedAt: new Date()
        });

        await db.insert(completedChallenges).values({
          userId: user2.id,
          challengeId: allChallenges[1].id, // XSS Challenge
          pointsAwarded: allChallenges[1].points,
          completedAt: new Date()
        });

        const user2Points = allChallenges[0].points + allChallenges[1].points;
        await db.update(users).set({ score: user2Points }).where({ id: user2.id });
        console.log(`Updated ${user2.username} score to ${user2Points}`);
      }

      // User 3 (Ramji) solves 1 challenge
      if (allUsers.length > 2) {
        const user3 = allUsers[2];
        await db.insert(completedChallenges).values({
          userId: user3.id,
          challengeId: allChallenges[2].id, // Caesar Cipher
          pointsAwarded: allChallenges[2].points,
          completedAt: new Date()
        });

        await db.update(users).set({ score: allChallenges[2].points }).where({ id: user3.id });
        console.log(`Updated ${user3.username} score to ${allChallenges[2].points}`);
      }

      // Update challenge solve counts
      await db.update(challenges).set({ solveCount: 3 }).where({ id: allChallenges[0].id }); // SQL Injection
      await db.update(challenges).set({ solveCount: 1 }).where({ id: allChallenges[1].id }); // XSS
      await db.update(challenges).set({ solveCount: 2 }).where({ id: allChallenges[2].id }); // Caesar
      await db.update(challenges).set({ solveCount: 1 }).where({ id: allChallenges[4].id }); // Forensics

      console.log("Sample data added successfully!");
    }

  } catch (error) {
    console.error("Error adding sample data:", error);
  }
}

addSampleData().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});