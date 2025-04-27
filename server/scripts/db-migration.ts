import { db } from "../db";
import { 
  contests, 
  contestChallenges, 
  externalFlagSubmissions,
  challenges,
  users
} from "@shared/schema";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting database migration...");
    
    // Check if the contests table exists
    const contentsTableExists = await checkTableExists('contests');
    if (!contentsTableExists) {
      console.log("Creating contests table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS contests (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          external_url TEXT,
          is_external BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Contests table created successfully.");
    } else {
      console.log("Contests table already exists.");
    }
    
    // Check if the contest_challenges table exists
    const contestChallengesTableExists = await checkTableExists('contest_challenges');
    if (!contestChallengesTableExists) {
      console.log("Creating contest_challenges table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS contest_challenges (
          id SERIAL PRIMARY KEY,
          contest_id INTEGER NOT NULL,
          challenge_id INTEGER NOT NULL
        )
      `);
      console.log("Contest challenges table created successfully.");
    } else {
      console.log("Contest challenges table already exists.");
    }
    
    // Check if the external_flag_submissions table exists
    const externalFlagSubmissionsTableExists = await checkTableExists('external_flag_submissions');
    if (!externalFlagSubmissionsTableExists) {
      console.log("Creating external_flag_submissions table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS external_flag_submissions (
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
      console.log("External flag submissions table created successfully.");
    } else {
      console.log("External flag submissions table already exists.");
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

// Run the migration script
runMigration();