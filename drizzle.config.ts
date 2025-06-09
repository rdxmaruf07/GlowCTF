
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./shared/mysql-schema.ts",
  out: "./migrations",
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || '0.0.0.0',
    user: process.env.DB_USER || 'glowctf_user',
    password: process.env.DB_PASSWORD || 'Maruf078692',
    database: process.env.DB_NAME || 'glowctf',
    port: parseInt(process.env.DB_PORT || '3306')
  }
});
