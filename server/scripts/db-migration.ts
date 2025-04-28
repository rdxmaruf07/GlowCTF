
import { db } from "../db";
import { 
  users,
  challenges,
  completedChallenges,
  badges,
  userBadges,
  chatbotKeys,
  chatHistory,
  contests,
  contestChallenges,
  externalFlagSubmissions
} from "@shared/schema";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting database migration...");
    
    // Create tables in the correct order to avoid foreign key constraints issues
    const tables = [
      { name: "users", schema: users },
      { name: "challenges", schema: challenges },
      { name: "completed_challenges", schema: completedChallenges },
      { name: "badges", schema: badges },
      { name: "user_badges", schema: userBadges },
      { name: "chatbot_keys", schema: chatbotKeys },
      { name: "chat_history", schema: chatHistory },
      { name: "contests", schema: contests },
      { name: "contest_challenges", schema: contestChallenges },
      { name: "external_flag_submissions", schema: externalFlagSubmissions }
    ];

    for (const table of tables) {
      const exists = await checkTableExists(table.name);
      if (!exists) {
        console.log(`Creating ${table.name} table...`);
        await createTable(table.name);
      } else {
        console.log(`Table ${table.name} already exists.`);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = ${tableName}
    );
  `);
  
  return result.rows[0]?.exists === true;
}

async function createTable(tableName: string) {
  switch (tableName) {
    case "users":
      await db.execute(sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          score INTEGER NOT NULL DEFAULT 0,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
    case "challenges":
      await db.execute(sql`
        CREATE TABLE challenges (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          category TEXT NOT NULL,
          points INTEGER NOT NULL,
          flag TEXT NOT NULL,
          solve_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          image_url TEXT
        )
      `);
      break;
    case "completed_challenges":
      await db.execute(sql`
        CREATE TABLE completed_challenges (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          challenge_id INTEGER NOT NULL,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          time_to_solve INTEGER,
          points_awarded INTEGER NOT NULL
        )
      `);
      break;
    case "badges":
      await db.execute(sql`
        CREATE TABLE badges (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT,
          requirement TEXT NOT NULL
        )
      `);
      break;
    case "user_badges":
      await db.execute(sql`
        CREATE TABLE user_badges (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          badge_id INTEGER NOT NULL,
          awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
    case "chatbot_keys":
      await db.execute(sql`
        CREATE TABLE chatbot_keys (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          provider TEXT NOT NULL,
          api_key TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
    case "chat_history":
      await db.execute(sql`
        CREATE TABLE chat_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          provider TEXT NOT NULL,
          messages JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          title TEXT
        )
      `);
      break;
    case "contests":
      await db.execute(sql`
        CREATE TABLE contests (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          external_url TEXT,
          is_external BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
    case "contest_challenges":
      await db.execute(sql`
        CREATE TABLE contest_challenges (
          id SERIAL PRIMARY KEY,
          contest_id INTEGER NOT NULL,
          challenge_id INTEGER NOT NULL
        )
      `);
      break;
    case "external_flag_submissions":
      await db.execute(sql`
        CREATE TABLE external_flag_submissions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          contest_id INTEGER NOT NULL,
          challenge_name TEXT NOT NULL,
          description TEXT,
          points INTEGER NOT NULL,
          flag TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          reviewed_by INTEGER,
          reviewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
  }
}

runMigration();
