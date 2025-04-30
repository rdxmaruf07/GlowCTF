import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  score: integer("score").notNull().default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isBanned: boolean("is_banned").notNull().default(false),
  lastActive: timestamp("last_active"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

// Challenges schema
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  category: text("category").notNull(), // web, crypto, forensics, etc.
  points: integer("points").notNull(),
  flag: text("flag").notNull(),
  solveCount: integer("solve_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: text("image_url"),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  difficulty: true,
  category: true,
  points: true,
  flag: true,
  imageUrl: true,
});

// Completed challenges schema
export const completedChallenges = pgTable("completed_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  timeToSolve: integer("time_to_solve"), // in seconds
  pointsAwarded: integer("points_awarded").notNull(),
});

export const insertCompletedChallengeSchema = createInsertSchema(completedChallenges).pick({
  userId: true,
  challengeId: true,
  timeToSolve: true,
  pointsAwarded: true,
});

// Badges schema
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  requirement: text("requirement").notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  imageUrl: true,
  requirement: true,
});

// User badges schema
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
});

// Chatbot API keys schema
export const chatbotKeys = pgTable("chatbot_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // openai, anthropic
  apiKey: text("api_key").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatbotKeySchema = createInsertSchema(chatbotKeys).pick({
  userId: true,
  provider: true,
  apiKey: true,
  isActive: true,
});

// Chat history schema
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  title: text("title"),
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).pick({
  userId: true,
  provider: true,
  messages: true,
  title: true,
});

// Contest schema
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  externalUrl: text("external_url"),
  isExternal: boolean("is_external").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContestSchema = createInsertSchema(contests).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  externalUrl: true,
  isExternal: true
});

// Contest challenges schema
export const contestChallenges = pgTable("contest_challenges", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
});

export const insertContestChallengeSchema = createInsertSchema(contestChallenges).pick({
  contestId: true,
  challengeId: true
});

// External flag submissions
export const externalFlagSubmissions = pgTable("external_flag_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contestId: integer("contest_id").notNull(),
  challengeName: text("challenge_name").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  flag: text("flag").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExternalFlagSubmissionSchema = createInsertSchema(externalFlagSubmissions).pick({
  userId: true,
  contestId: true,
  challengeName: true,
  description: true,
  points: true,
  flag: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertCompletedChallenge = z.infer<typeof insertCompletedChallengeSchema>;
export type CompletedChallenge = typeof completedChallenges.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export type InsertChatbotKey = z.infer<typeof insertChatbotKeySchema>;
export type ChatbotKey = typeof chatbotKeys.$inferSelect;

export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;

export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contests.$inferSelect;

export type InsertContestChallenge = z.infer<typeof insertContestChallengeSchema>;
export type ContestChallenge = typeof contestChallenges.$inferSelect;

export type InsertExternalFlagSubmission = z.infer<typeof insertExternalFlagSubmissionSchema>;
export type ExternalFlagSubmission = typeof externalFlagSubmissions.$inferSelect;
