import { createConnection } from "../mysql-db";
import * as schema from "../../shared/mysql-schema";
import { MySQLTable } from "drizzle-orm/mysql-core";

async function runMigration() {
  try {
    console.log("Starting MySQL database migration...");
    
    const conn = await createConnection();
    
    // Create tables in the correct order to avoid foreign key constraints issues
    const tables = [
      { name: "users", schema: schema.users },
      { name: "challenges", schema: schema.challenges },
      { name: "badges", schema: schema.badges },
      { name: "completed_challenges", schema: schema.completedChallenges },
      { name: "user_badges", schema: schema.userBadges },
      { name: "chatbot_keys", schema: schema.chatbotKeys },
      { name: "chat_history", schema: schema.chatHistory },
      { name: "contests", schema: schema.contests },
      { name: "contest_challenges", schema: schema.contestChallenges },
      { name: "external_flag_submissions", schema: schema.externalFlagSubmissions },
    ];

    for (const table of tables) {
      const exists = await checkTableExists(conn, table.name);
      if (!exists) {
        console.log(`Creating ${table.name} table...`);
        await createTable(conn, table.schema as MySQLTable);
      } else {
        console.log(`Table ${table.name} already exists.`);
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

async function checkTableExists(conn: any, tableName: string): Promise<boolean> {
  const [rows] = await conn.execute(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = ?
  `, [tableName]);
  
  return rows.length > 0;
}

async function createTable(conn: any, table: MySQLTable): Promise<void> {
  const { name, columns } = table;
  
  // Generate column definitions
  const columnDefinitions = Object.keys(columns).map(columnName => {
    const column = columns[columnName];
    const type = column.dataType;
    const constraints = [];
    
    if (column.primaryKey) {
      constraints.push("PRIMARY KEY");
    }
    
    if (column.autoincrement) {
      constraints.push("AUTO_INCREMENT");
    }
    
    if (column.notNull) {
      constraints.push("NOT NULL");
    }
    
    if (column.unique) {
      constraints.push("UNIQUE");
    }
    
    if (column.default) {
      if (column.default === "now()") {
        constraints.push("DEFAULT CURRENT_TIMESTAMP");
      } else {
        constraints.push(`DEFAULT ${column.default}`);
      }
    }
    
    return `\`${columnName}\` ${type} ${constraints.join(" ")}`;
  }).join(",\n  ");
  
  // Create table SQL
  const sql = `
  CREATE TABLE \`${name}\` (
    ${columnDefinitions}
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await conn.execute(sql);
  } catch (error: any) {
    console.error(`Error creating table ${name}:`, error.message);
    throw error;
  }
}

runMigration();