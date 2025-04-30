import { db } from "../db";
import { badges } from "@shared/schema";

async function addBadges() {
  console.log("Adding badges...");
  
  // Define badge categories
  const achievementBadges = [
    {
      name: "First Blood",
      description: "First to solve a challenge",
      imageUrl: "https://i.imgur.com/8JLRwPS.jpg",
      requirement: "first-blood"
    },
    {
      name: "Beginner",
      description: "Solve your first challenge",
      imageUrl: "https://i.imgur.com/vN6YxFp.jpg",
      requirement: "solve-1"
    },
    {
      name: "Apprentice",
      description: "Solve 5 challenges",
      imageUrl: "https://i.imgur.com/5dLmgIZ.jpg",
      requirement: "solve-5"
    },
    {
      name: "Journeyman",
      description: "Solve 10 challenges",
      imageUrl: "https://i.imgur.com/KzGk9Tg.jpg",
      requirement: "solve-10"
    },
    {
      name: "Expert",
      description: "Solve 25 challenges",
      imageUrl: "https://i.imgur.com/H9xsVl4.jpg",
      requirement: "solve-25"
    },
    {
      name: "Master",
      description: "Solve 50 challenges",
      imageUrl: "https://i.imgur.com/1J7URSM.jpg",
      requirement: "solve-50"
    },
    {
      name: "Grandmaster",
      description: "Solve 100 challenges",
      imageUrl: "https://i.imgur.com/3GXh03F.jpg",
      requirement: "solve-100"
    }
  ];
  
  // Score milestone badges
  const scoreBadges = [
    {
      name: "Point Hunter",
      description: "Earn 1,000 points",
      imageUrl: "https://i.imgur.com/4KbKUYs.jpg",
      requirement: "score-1000"
    },
    {
      name: "Point Collector",
      description: "Earn 5,000 points",
      imageUrl: "https://i.imgur.com/7MnAHAc.jpg",
      requirement: "score-5000"
    },
    {
      name: "Point Master",
      description: "Earn 10,000 points",
      imageUrl: "https://i.imgur.com/9XdUdGJ.jpg",
      requirement: "score-10000"
    },
    {
      name: "Point Legend",
      description: "Earn 25,000 points",
      imageUrl: "https://i.imgur.com/LZpYQr3.jpg",
      requirement: "score-25000"
    },
    {
      name: "Point God",
      description: "Earn 50,000 points",
      imageUrl: "https://i.imgur.com/Qn3XZYJ.jpg",
      requirement: "score-50000"
    }
  ];
  
  // Category specialist badges
  const categories = ["Web", "Cryptography", "Forensics", "Binary", "Reverse Engineering", "OSINT"];
  const categoryBadges = categories.flatMap(category => [
    {
      name: `${category} Novice`,
      description: `Solve 3 ${category} challenges`,
      imageUrl: `https://i.imgur.com/vN6YxFp.jpg`,
      requirement: `category-${category}-3`
    },
    {
      name: `${category} Expert`,
      description: `Solve 5 ${category} challenges`,
      imageUrl: `https://i.imgur.com/5dLmgIZ.jpg`,
      requirement: `category-${category}-5`
    },
    {
      name: `${category} Master`,
      description: `Solve 10 ${category} challenges`,
      imageUrl: `https://i.imgur.com/KzGk9Tg.jpg`,
      requirement: `category-${category}-10`
    }
  ]);
  
  // Difficulty milestone badges
  const difficulties = ["easy", "medium", "hard"];
  const difficultyBadges = difficulties.flatMap(difficulty => [
    {
      name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Solver`,
      description: `Solve 3 ${difficulty} challenges`,
      imageUrl: `https://i.imgur.com/H9xsVl4.jpg`,
      requirement: `difficulty-${difficulty}-3`
    },
    {
      name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Expert`,
      description: `Solve 5 ${difficulty} challenges`,
      imageUrl: `https://i.imgur.com/1J7URSM.jpg`,
      requirement: `difficulty-${difficulty}-5`
    },
    {
      name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Master`,
      description: `Solve 10 ${difficulty} challenges`,
      imageUrl: `https://i.imgur.com/3GXh03F.jpg`,
      requirement: `difficulty-${difficulty}-10`
    }
  ]);
  
  // Combine all badges
  const allBadges = [
    ...achievementBadges,
    ...scoreBadges,
    ...categoryBadges,
    ...difficultyBadges
  ];
  
  // Insert badges
  for (const badge of allBadges) {
    try {
      // Check if badge already exists
      const existingBadges = await db
        .select()
        .from(badges)
        .where(sql => sql`${badges.name} = ${badge.name}`);
      
      if (existingBadges.length === 0) {
        await db.insert(badges).values(badge);
        console.log(`Added badge: ${badge.name}`);
      } else {
        console.log(`Badge already exists: ${badge.name}`);
      }
    } catch (error) {
      console.error(`Error adding badge ${badge.name}:`, error);
    }
  }
  
  console.log("Finished adding badges");
}

// Run the function if this script is executed directly
if (require.main === module) {
  addBadges()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { addBadges };