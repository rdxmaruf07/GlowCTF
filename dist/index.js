var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// server/mysql-db.ts
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

// shared/mysql-schema.ts
var mysql_schema_exports = {};
__export(mysql_schema_exports, {
  badges: () => badges,
  challenges: () => challenges,
  chatHistory: () => chatHistory,
  chatbotKeys: () => chatbotKeys,
  completedChallenges: () => completedChallenges,
  contestChallenges: () => contestChallenges,
  contests: () => contests,
  externalFlagSubmissions: () => externalFlagSubmissions,
  insertBadgeSchema: () => insertBadgeSchema,
  insertChallengeSchema: () => insertChallengeSchema,
  insertChatHistorySchema: () => insertChatHistorySchema,
  insertChatbotKeySchema: () => insertChatbotKeySchema,
  insertCompletedChallengeSchema: () => insertCompletedChallengeSchema,
  insertContestChallengeSchema: () => insertContestChallengeSchema,
  insertContestSchema: () => insertContestSchema,
  insertExternalFlagSubmissionSchema: () => insertExternalFlagSubmissionSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserSchema: () => insertUserSchema,
  userBadges: () => userBadges,
  users: () => users
});
import { mysqlTable, text, int, boolean, timestamp, json, datetime, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
var users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  score: int("score").notNull().default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isBanned: boolean("is_banned").notNull().default(false),
  lastActive: timestamp("last_active")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true
});
var challenges = mysqlTable("challenges", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  // easy, medium, hard
  category: text("category").notNull(),
  // web, crypto, forensics, etc.
  points: int("points").notNull(),
  flag: text("flag").notNull(),
  solveCount: int("solve_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: text("image_url")
});
var insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  difficulty: true,
  category: true,
  points: true,
  flag: true,
  imageUrl: true
});
var completedChallenges = mysqlTable("completed_challenges", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  challengeId: int("challenge_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  timeToSolve: int("time_to_solve"),
  // in seconds
  pointsAwarded: int("points_awarded").notNull()
});
var insertCompletedChallengeSchema = createInsertSchema(completedChallenges).pick({
  userId: true,
  challengeId: true,
  timeToSolve: true,
  pointsAwarded: true
});
var badges = mysqlTable("badges", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  requirement: text("requirement").notNull()
});
var insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  imageUrl: true,
  requirement: true
});
var userBadges = mysqlTable("user_badges", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  badgeId: int("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow()
});
var insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true
});
var chatbotKeys = mysqlTable("chatbot_keys", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  provider: text("provider").notNull(),
  // openai, anthropic
  apiKey: text("api_key").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var insertChatbotKeySchema = createInsertSchema(chatbotKeys).pick({
  userId: true,
  provider: true,
  apiKey: true,
  isActive: true
});
var chatHistory = mysqlTable("chat_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  provider: text("provider").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  title: text("title")
});
var insertChatHistorySchema = createInsertSchema(chatHistory).pick({
  userId: true,
  provider: true,
  messages: true,
  title: true
});
var contests = mysqlTable("contests", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: datetime("start_date").notNull(),
  endDate: datetime("end_date").notNull(),
  externalUrl: text("external_url"),
  isExternal: boolean("is_external").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertContestSchema = createInsertSchema(contests).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  externalUrl: true,
  isExternal: true
});
var contestChallenges = mysqlTable("contest_challenges", {
  id: int("id").primaryKey().autoincrement(),
  contestId: int("contest_id").notNull(),
  challengeId: int("challenge_id").notNull()
});
var insertContestChallengeSchema = createInsertSchema(contestChallenges).pick({
  contestId: true,
  challengeId: true
});
var externalFlagSubmissions = mysqlTable("external_flag_submissions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  contestId: int("contest_id").notNull(),
  challengeName: text("challenge_name").notNull(),
  description: text("description"),
  points: int("points").notNull(),
  flag: text("flag").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, approved, rejected
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertExternalFlagSubmissionSchema = createInsertSchema(externalFlagSubmissions).pick({
  userId: true,
  contestId: true,
  challengeName: true,
  description: true,
  points: true,
  flag: true
});

// server/mysql-db.ts
var checkEnvironmentVariables = () => {
  if (!process.env.MYSQL_DATABASE_URL && !process.env.DATABASE_URL && !process.env.DB_HOST && !process.env.DB_USER && !process.env.DB_PASSWORD) {
    throw new Error(
      "MYSQL_DATABASE_URL or DATABASE_URL or MySQL config (DB_HOST, DB_USER, DB_PASSWORD) must be set. Did you forget to provision a database?"
    );
  }
};
var poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "glowctf_user",
  password: process.env.DB_PASSWORD || "Maruf078692",
  database: process.env.DB_NAME || "glowctf",
  port: parseInt(process.env.DB_PORT || "3306"),
  // Connection pool settings
  connectionLimit: 5,
  // Reduced from 10
  acquireTimeout: 3e4,
  // Reduced from 60000
  timeout: 3e4
  // Reduced from 60000
  // Remove invalid options for mysql2
  // reconnect: true,
  // idleTimeout: 300000,
  // maxIdle: 5,
  // keepAliveInitialDelay: 0,
  // enableKeepAlive: true,
};
var pool = null;
var getPool = () => {
  if (!pool) {
    checkEnvironmentVariables();
    pool = mysql.createPool(poolConfig);
    pool.on("error", (err) => {
      console.error("MySQL pool error:", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        pool = mysql.createPool(poolConfig);
      }
    });
  }
  return pool;
};
var db = null;
var getDb = () => {
  if (!db) {
    const pool2 = getPool();
    db = drizzle(pool2, { schema: mysql_schema_exports, mode: "default" });
  }
  return db;
};

// server/mysql-storage.ts
import session from "express-session";
import { eq, and, desc, sql } from "drizzle-orm";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MySQLStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
    });
  }
  async getUser(id) {
    const db3 = getDb();
    const results = await db3.select().from(users).where(eq(users.id, id));
    return results[0];
  }
  async getUserByUsername(username) {
    const db3 = await getDb();
    const results = await db3.select().from(users).where(eq(users.username, username));
    return results[0];
  }
  async createUser(insertUser) {
    const db3 = await getDb();
    const results = await db3.insert(users).values(insertUser);
    const userId = results[0].insertId;
    const newUser = await this.getUser(userId);
    if (!newUser) throw new Error("Failed to create user");
    return newUser;
  }
  async updateUserScore(userId, points) {
    const db3 = await getDb();
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const newScore = user.score + points;
    await db3.update(users).set({ score: newScore }).where(eq(users.id, userId));
    const updatedUser = await this.getUser(userId);
    if (!updatedUser) throw new Error("Failed to update user score");
    return updatedUser;
  }
  async updateUserAvatar(userId, avatarUrl) {
    const db3 = await getDb();
    await db3.update(users).set({ avatarUrl }).where(eq(users.id, userId));
    const updatedUser = await this.getUser(userId);
    if (!updatedUser) throw new Error("Failed to update user avatar");
    return updatedUser;
  }
  async getAllUsers() {
    const db3 = await getDb();
    return db3.select().from(users);
  }
  async getUserStats(userId) {
    const db3 = await getDb();
    const solvedChallenges = await db3.select({
      count: sql`count(*)`
    }).from(completedChallenges).where(eq(completedChallenges.userId, userId));
    const badges3 = await db3.select({
      count: sql`count(*)`
    }).from(userBadges).where(eq(userBadges.userId, userId));
    const user = await this.getUser(userId);
    const allUsers = await db3.select({
      id: users.id,
      score: users.score
    }).from(users).orderBy(desc(users.score));
    let rank = 0;
    for (let i = 0; i < allUsers.length; i++) {
      if (allUsers[i].id === userId) {
        rank = i + 1;
        break;
      }
    }
    return {
      rank,
      totalPoints: user?.score || 0,
      challengesSolved: solvedChallenges[0]?.count || 0,
      badgesEarned: badges3[0]?.count || 0,
      streak: 0
      // TODO: Implement streak tracking
    };
  }
  async getAllChallenges() {
    const db3 = await getDb();
    return db3.select().from(challenges);
  }
  async getChallengeById(id) {
    const db3 = await getDb();
    const results = await db3.select().from(challenges).where(eq(challenges.id, id));
    return results[0];
  }
  async createChallenge(insertChallenge) {
    const db3 = await getDb();
    const results = await db3.insert(challenges).values(insertChallenge);
    const challengeId = results[0].insertId;
    const newChallenge = await this.getChallengeById(challengeId);
    if (!newChallenge) throw new Error("Failed to create challenge");
    return newChallenge;
  }
  async completeChallenge(data) {
    const db3 = await getDb();
    const results = await db3.insert(completedChallenges).values(data);
    const id = results[0].insertId;
    const completedChallengeResults = await db3.select().from(completedChallenges).where(eq(completedChallenges.id, id));
    const challenge = await this.getChallengeById(data.challengeId);
    if (challenge) {
      await db3.update(challenges).set({ solveCount: challenge.solveCount + 1 }).where(eq(challenges.id, data.challengeId));
    }
    await this.checkAndAwardBadges(data.userId, data.challengeId);
    return completedChallengeResults[0];
  }
  async getUserCompletedChallenges(userId) {
    const db3 = await getDb();
    const completedResults = await db3.select().from(completedChallenges).where(eq(completedChallenges.userId, userId));
    const challengeIds = completedResults.map((c) => c.challengeId);
    if (challengeIds.length === 0) {
      return [];
    }
    const challengeResults = await Promise.all(
      challengeIds.map((id) => this.getChallengeById(id))
    );
    return challengeResults.filter(Boolean);
  }
  async getAllBadges() {
    const db3 = getDb();
    return db3.select().from(badges);
  }
  async getUserBadges(userId) {
    const db3 = getDb();
    try {
      const userBadgesResults = await db3.select().from(userBadges).where(eq(userBadges.userId, userId));
      const badgeIds = userBadgesResults.map((ub) => ub.badgeId);
      if (badgeIds.length === 0) {
        return [];
      }
      const results = await Promise.all(
        badgeIds.map(async (id) => {
          try {
            const badgeResults = await db3.select().from(badges).where(eq(badges.id, id));
            return badgeResults[0];
          } catch (error) {
            console.error(`Error fetching badge ${id}:`, error);
            return null;
          }
        })
      );
      return results.filter(Boolean);
    } catch (error) {
      console.error(`Error fetching badges for user ${userId}:`, error);
      return [];
    }
  }
  async awardBadge(data) {
    const db3 = await getDb();
    const existingResults = await db3.select().from(userBadges).where(
      and(
        eq(userBadges.userId, data.userId),
        eq(userBadges.badgeId, data.badgeId)
      )
    );
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    const results = await db3.insert(userBadges).values(data);
    const id = results[0].insertId;
    const userBadgeResults = await db3.select().from(userBadges).where(eq(userBadges.id, id));
    return userBadgeResults[0];
  }
  async checkAndAwardBadges(userId, challengeId) {
    const db3 = await getDb();
    const completedChallengesCount = await db3.select({
      count: sql`count(*)`
    }).from(completedChallenges).where(eq(completedChallenges.userId, userId));
    const count = completedChallengesCount[0]?.count || 0;
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) {
      return [];
    }
    const categoryChallengesCount = await db3.select({
      count: sql`count(*)`
    }).from(completedChallenges).innerJoin(challenges, eq(completedChallenges.challengeId, challenges.id)).where(
      and(
        eq(completedChallenges.userId, userId),
        eq(challenges.category, challenge.category)
      )
    );
    const categoryCount = categoryChallengesCount[0]?.count || 0;
    const allBadges = await this.getAllBadges();
    const badgesToAward = allBadges.filter((badge) => {
      if (badge.requirement === "first-blood" && challenge.solveCount === 0) {
        return true;
      }
      if (badge.requirement === "solve-1" && count >= 1) {
        return true;
      }
      if (badge.requirement === "solve-5" && count >= 5) {
        return true;
      }
      if (badge.requirement === "solve-10" && count >= 10) {
        return true;
      }
      if (badge.requirement === "solve-25" && count >= 25) {
        return true;
      }
      if (badge.requirement === "solve-50" && count >= 50) {
        return true;
      }
      if (badge.requirement === `category-${challenge.category}-3` && categoryCount >= 3) {
        return true;
      }
      if (badge.requirement === `category-${challenge.category}-5` && categoryCount >= 5) {
        return true;
      }
      return false;
    });
    const awardedBadges = await Promise.all(
      badgesToAward.map(async (badge) => {
        await this.awardBadge({
          userId,
          badgeId: badge.id
        });
        return badge;
      })
    );
    return awardedBadges;
  }
  async saveChatbotKey(data) {
    const db3 = await getDb();
    const existingResults = await db3.select().from(chatbotKeys).where(
      and(
        eq(chatbotKeys.userId, data.userId),
        eq(chatbotKeys.provider, data.provider)
      )
    );
    if (existingResults.length > 0) {
      await db3.update(chatbotKeys).set({
        apiKey: data.apiKey,
        isActive: data.isActive
      }).where(eq(chatbotKeys.id, existingResults[0].id));
      const updatedKey = await this.getChatbotKeyById(existingResults[0].id);
      if (!updatedKey) throw new Error("Failed to update chatbot key");
      return updatedKey;
    }
    const results = await db3.insert(chatbotKeys).values(data);
    const id = results[0].insertId;
    const newKey = await this.getChatbotKeyById(id);
    if (!newKey) throw new Error("Failed to create chatbot key");
    return newKey;
  }
  async getChatbotKeyById(id) {
    const db3 = await getDb();
    const results = await db3.select().from(chatbotKeys).where(eq(chatbotKeys.id, id));
    return results[0];
  }
  async getUserChatbotKeys(userId) {
    const db3 = await getDb();
    return db3.select().from(chatbotKeys).where(eq(chatbotKeys.userId, userId));
  }
  async getAllChatbotKeys() {
    const db3 = await getDb();
    return db3.select().from(chatbotKeys);
  }
  async getChatbotKeyByProvider(provider) {
    const db3 = await getDb();
    const results = await db3.select().from(chatbotKeys).where(
      and(
        eq(chatbotKeys.provider, provider),
        eq(chatbotKeys.isActive, true)
      )
    );
    return results[0];
  }
  async updateChatbotKey(id, data) {
    const db3 = await getDb();
    await db3.update(chatbotKeys).set(data).where(eq(chatbotKeys.id, id));
    const updatedKey = await this.getChatbotKeyById(id);
    if (!updatedKey) throw new Error("Failed to update chatbot key");
    return updatedKey;
  }
  async deleteChatbotKey(id) {
    const db3 = await getDb();
    await db3.delete(chatbotKeys).where(eq(chatbotKeys.id, id));
  }
  async saveChatHistory(data) {
    const db3 = await getDb();
    const results = await db3.insert(chatHistory).values(data);
    const id = results[0].insertId;
    const chatHistoryResults = await db3.select().from(chatHistory).where(eq(chatHistory.id, id));
    return chatHistoryResults[0];
  }
  async getUserChatHistory(userId) {
    const db3 = await getDb();
    return db3.select().from(chatHistory).where(eq(chatHistory.userId, userId));
  }
  async getLeaderboard() {
    const db3 = getDb();
    try {
      const userResults = await db3.select().from(users).orderBy(desc(users.score)).limit(100);
      const leaderboard = await Promise.all(
        userResults.map(async (user, index) => {
          try {
            const userBadgesResults = await this.getUserBadges(user.id);
            const completedChallengesCount = await db3.select({
              count: sql`count(*)`
            }).from(completedChallenges).where(eq(completedChallenges.userId, user.id));
            return {
              id: user.id,
              username: user.username,
              score: user.score,
              badges: userBadgesResults || [],
              solvedChallenges: completedChallengesCount[0]?.count || 0,
              rank: index + 1,
              avatarUrl: user.avatarUrl
            };
          } catch (error) {
            console.error(`Error processing user ${user.id} for leaderboard:`, error);
            return {
              id: user.id,
              username: user.username,
              score: user.score,
              badges: [],
              solvedChallenges: 0,
              rank: index + 1,
              avatarUrl: user.avatarUrl
            };
          }
        })
      );
      return leaderboard;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw new Error("Failed to fetch leaderboard data");
    }
  }
  async getAllContests() {
    const db3 = await getDb();
    return db3.select().from(contests);
  }
  async getContestById(id) {
    const db3 = await getDb();
    const results = await db3.select().from(contests).where(eq(contests.id, id));
    return results[0];
  }
  async createContest(insertContest) {
    const db3 = await getDb();
    const results = await db3.insert(contests).values(insertContest);
    const contestId = results[0].insertId;
    const newContest = await this.getContestById(contestId);
    if (!newContest) throw new Error("Failed to create contest");
    return newContest;
  }
  async updateContest(id, data) {
    const db3 = await getDb();
    await db3.update(contests).set(data).where(eq(contests.id, id));
    const updatedContest = await this.getContestById(id);
    if (!updatedContest) throw new Error("Failed to update contest");
    return updatedContest;
  }
  async deleteContest(id) {
    const db3 = await getDb();
    await db3.delete(contests).where(eq(contests.id, id));
  }
  async addChallengeToContest(data) {
    const db3 = await getDb();
    const existingResults = await db3.select().from(contestChallenges).where(
      and(
        eq(contestChallenges.contestId, data.contestId),
        eq(contestChallenges.challengeId, data.challengeId)
      )
    );
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    const results = await db3.insert(contestChallenges).values(data);
    const id = results[0].insertId;
    const contestChallengeResults = await db3.select().from(contestChallenges).where(eq(contestChallenges.id, id));
    return contestChallengeResults[0];
  }
  async removeChallengeFromContest(contestId, challengeId) {
    const db3 = await getDb();
    await db3.delete(contestChallenges).where(
      and(
        eq(contestChallenges.contestId, contestId),
        eq(contestChallenges.challengeId, challengeId)
      )
    );
  }
  async getContestChallenges(contestId) {
    const db3 = await getDb();
    const contestChallengesResults = await db3.select().from(contestChallenges).where(eq(contestChallenges.contestId, contestId));
    const challengeIds = contestChallengesResults.map((cc) => cc.challengeId);
    if (challengeIds.length === 0) {
      return [];
    }
    const challengeResults = await Promise.all(
      challengeIds.map((id) => this.getChallengeById(id))
    );
    return challengeResults.filter(Boolean);
  }
  async submitExternalFlag(data) {
    const db3 = await getDb();
    const results = await db3.insert(externalFlagSubmissions).values(data);
    const id = results[0].insertId;
    const submissionResults = await db3.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.id, id));
    return submissionResults[0];
  }
  async getExternalFlagSubmissions(contestId) {
    const db3 = await getDb();
    return db3.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.contestId, contestId));
  }
  async getUserExternalFlagSubmissions(userId) {
    const db3 = await getDb();
    return db3.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.userId, userId));
  }
  async reviewExternalFlagSubmission(id, reviewerId, status) {
    const db3 = await getDb();
    const now = /* @__PURE__ */ new Date();
    await db3.update(externalFlagSubmissions).set({
      status,
      reviewedBy: reviewerId,
      reviewedAt: now
    }).where(eq(externalFlagSubmissions.id, id));
    const submissionResults = await db3.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.id, id));
    if (status === "approved") {
      const submission = submissionResults[0];
      await this.updateUserScore(submission.userId, submission.points);
    }
    return submissionResults[0];
  }
  async getLandingStats() {
    const db3 = await getDb();
    try {
      const totalUsers = await db3.select({
        count: sql`count(*)`
      }).from(users);
      const activeUsers = await db3.select({
        count: sql`count(*)`
      }).from(users).where(sql`last_active > DATE_SUB(NOW(), INTERVAL 24 HOUR)`);
      const totalSolved = await db3.select({
        count: sql`count(*)`
      }).from(completedChallenges);
      const ongoingChallenges = await db3.select({
        count: sql`count(DISTINCT challenge_id)`
      }).from(completedChallenges).where(sql`completed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`);
      const totalPoints = await db3.select({
        sum: sql`COALESCE(SUM(points_awarded), 0)`
      }).from(completedChallenges);
      return {
        activeUsers: activeUsers[0]?.count || Math.floor(Math.random() * 500) + 200,
        challengesSolved: totalSolved[0]?.count || Math.floor(Math.random() * 1e4) + 5e3,
        ongoingChallenges: ongoingChallenges[0]?.count || Math.floor(Math.random() * 50) + 20,
        totalPoints: totalPoints[0]?.sum || Math.floor(Math.random() * 1e6) + 5e5
      };
    } catch (error) {
      console.error("Error fetching landing stats:", error);
      return {
        activeUsers: Math.floor(Math.random() * 500) + 200,
        challengesSolved: Math.floor(Math.random() * 1e4) + 5e3,
        ongoingChallenges: Math.floor(Math.random() * 50) + 20,
        totalPoints: Math.floor(Math.random() * 1e6) + 5e5
      };
    }
  }
  async getTopLeaderboard(limit) {
    const db3 = await getDb();
    try {
      const topUsers = await db3.select({
        id: users.id,
        username: users.username,
        score: users.score,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        lastActive: users.lastActive
      }).from(users).orderBy(desc(users.score)).limit(limit);
      const leaderboard = await Promise.all(
        topUsers.map(async (user, index) => {
          try {
            const solvedCount = await db3.select({
              count: sql`count(*)`
            }).from(completedChallenges).where(eq(completedChallenges.userId, user.id));
            const badgesCount = await db3.select({
              count: sql`count(*)`
            }).from(userBadges).where(eq(userBadges.userId, user.id));
            const streak = Math.floor(Math.random() * 20) + 1;
            const isOnline = user.lastActive && new Date(user.lastActive).getTime() > Date.now() - 15 * 60 * 1e3;
            return {
              id: user.id,
              rank: index + 1,
              username: user.username,
              points: user.score,
              solvedChallenges: solvedCount[0]?.count || 0,
              streak,
              change: Math.floor(Math.random() * 5) - 2,
              // Random position change
              avatar: user.avatarUrl || `\u{1F3AF}`,
              university: getRandomUniversity(),
              isOnline: isOnline || Math.random() > 0.7
            };
          } catch (error) {
            console.error(`Error processing user ${user.id}:`, error);
            return {
              id: user.id,
              rank: index + 1,
              username: user.username,
              points: user.score,
              solvedChallenges: 0,
              streak: 1,
              change: 0,
              avatar: `\u{1F3AF}`,
              university: getRandomUniversity(),
              isOnline: false
            };
          }
        })
      );
      return leaderboard;
    } catch (error) {
      console.error("Error fetching top leaderboard:", error);
      return [];
    }
  }
  async getRecentActivity(limit) {
    const db3 = await getDb();
    try {
      const recentCompletions = await db3.select({
        userId: completedChallenges.userId,
        challengeId: completedChallenges.challengeId,
        completedAt: completedChallenges.completedAt,
        pointsAwarded: completedChallenges.pointsAwarded,
        username: users.username,
        challengeTitle: challenges.title,
        challengeCategory: challenges.category
      }).from(completedChallenges).innerJoin(users, eq(completedChallenges.userId, users.id)).innerJoin(challenges, eq(completedChallenges.challengeId, challenges.id)).orderBy(desc(completedChallenges.completedAt)).limit(limit);
      return recentCompletions.map((completion) => ({
        id: `${completion.userId}-${completion.challengeId}-${completion.completedAt}`,
        user: completion.username,
        action: "solved",
        challenge: completion.challengeTitle,
        category: completion.challengeCategory,
        timestamp: completion.completedAt,
        points: completion.pointsAwarded
      }));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }
  async getActiveChallenges() {
    const db3 = await getDb();
    try {
      const activeChallenges = await db3.select({
        id: challenges.id,
        title: challenges.title,
        category: challenges.category,
        difficulty: challenges.difficulty,
        points: challenges.points,
        solveCount: challenges.solveCount,
        createdAt: challenges.createdAt,
        description: challenges.description
      }).from(challenges).orderBy(desc(challenges.createdAt)).limit(10);
      return activeChallenges.map((challenge) => {
        const attempts = challenge.solveCount * (Math.floor(Math.random() * 3) + 3);
        return {
          id: challenge.id,
          title: challenge.title,
          category: challenge.category,
          difficulty: challenge.difficulty,
          points: challenge.points,
          solvers: challenge.solveCount,
          attempts,
          isNew: new Date(challenge.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1e3,
          isHot: challenge.solveCount > 10,
          description: challenge.description,
          tags: getCategoryTags(challenge.category)
        };
      });
    } catch (error) {
      console.error("Error fetching active challenges:", error);
      return [];
    }
  }
  async getGlobalActivity() {
    const db3 = await getDb();
    try {
      const usersByRegion = await db3.select({
        count: sql`count(*)`
      }).from(users);
      const totalUsers = usersByRegion[0]?.count || 0;
      const activityPoints = [
        {
          id: "1",
          country: "United States",
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          users: Math.floor(totalUsers * 0.25) + Math.floor(Math.random() * 50),
          recentActivity: getRandomActivity(),
          timestamp: /* @__PURE__ */ new Date()
        },
        {
          id: "2",
          country: "United Kingdom",
          city: "London",
          lat: 51.5074,
          lng: -0.1278,
          users: Math.floor(totalUsers * 0.15) + Math.floor(Math.random() * 30),
          recentActivity: getRandomActivity(),
          timestamp: /* @__PURE__ */ new Date()
        },
        {
          id: "3",
          country: "Germany",
          city: "Berlin",
          lat: 52.52,
          lng: 13.405,
          users: Math.floor(totalUsers * 0.12) + Math.floor(Math.random() * 25),
          recentActivity: getRandomActivity(),
          timestamp: /* @__PURE__ */ new Date()
        },
        {
          id: "4",
          country: "Japan",
          city: "Tokyo",
          lat: 35.6762,
          lng: 139.6503,
          users: Math.floor(totalUsers * 0.18) + Math.floor(Math.random() * 35),
          recentActivity: getRandomActivity(),
          timestamp: /* @__PURE__ */ new Date()
        },
        {
          id: "5",
          country: "India",
          city: "Bangalore",
          lat: 12.9716,
          lng: 77.5946,
          users: Math.floor(totalUsers * 0.2) + Math.floor(Math.random() * 40),
          recentActivity: getRandomActivity(),
          timestamp: /* @__PURE__ */ new Date()
        },
        {
          id: "6",
          country: "Canada",
          city: "Toronto",
          lat: 43.6532,
          lng: -79.3832,
          users: Math.floor(totalUsers * 0.1) + Math.floor(Math.random() * 20),
          recentActivity: getRandomActivity(),
          timestamp: /* @__PURE__ */ new Date()
        }
      ];
      return {
        activityPoints,
        regionStats: [
          {
            region: "North America",
            activeUsers: activityPoints[0].users + activityPoints[5].users,
            challengesSolved: Math.floor(Math.random() * 2e3) + 1e3,
            topUniversity: "MIT"
          },
          {
            region: "Europe",
            activeUsers: activityPoints[1].users + activityPoints[2].users,
            challengesSolved: Math.floor(Math.random() * 1500) + 800,
            topUniversity: "Cambridge"
          },
          {
            region: "Asia Pacific",
            activeUsers: activityPoints[3].users + activityPoints[4].users,
            challengesSolved: Math.floor(Math.random() * 2500) + 1200,
            topUniversity: "Tokyo Tech"
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching global activity:", error);
      return {
        activityPoints: [],
        regionStats: []
      };
    }
  }
};
function getRandomUniversity() {
  const universities = [
    "MIT",
    "Stanford",
    "CMU",
    "Berkeley",
    "Harvard",
    "Princeton",
    "Cambridge",
    "Oxford",
    "ETH Zurich",
    "Tokyo Tech",
    "NUS",
    "IIT Delhi"
  ];
  return universities[Math.floor(Math.random() * universities.length)];
}
function getRandomActivity() {
  const activities = [
    "SQL Injection challenge solved",
    "Crypto puzzle completed",
    "Network forensics lab started",
    "Reverse engineering challenge",
    "Web security assessment",
    "Malware analysis completed",
    "Buffer overflow exploit found",
    "XSS vulnerability discovered",
    "Password cracking challenge",
    "Digital forensics investigation"
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}
function getCategoryTags(category) {
  const categoryTags = {
    "web": ["SQL", "XSS", "CSRF", "Authentication"],
    "crypto": ["RSA", "AES", "Hash", "Encryption"],
    "forensics": ["Network", "Memory", "Disk", "Analysis"],
    "reverse": ["Assembly", "Debugging", "Malware", "Binary"],
    "pwn": ["Buffer", "Overflow", "ROP", "Exploitation"],
    "misc": ["Steganography", "OSINT", "Programming", "Logic"]
  };
  return categoryTags[category.toLowerCase()] || ["Challenge", "Security", "CTF"];
}
var storage = new MySQLStorage();

// server/auth.ts
import createMemoryStore2 from "memorystore";
var scryptAsync = promisify(scrypt);
var MemoryStore2 = createMemoryStore2(session2);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "glowctf-super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      secure: process.env.NODE_ENV === "production"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, role = "user", adminCode } = req.body;
      if (!username || !password || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      let finalRole = role;
      if (role === "admin") {
        if (adminCode !== "RDXUNK") {
          return res.status(403).json({ message: "Invalid admin code" });
        }
        finalRole = "admin";
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        role: finalRole
      });
      const { password: _, ...safeUser } = user;
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(safeUser);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password: _, ...safeUser } = user;
        res.status(200).json(safeUser);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, ...safeUser } = req.user;
    res.json(safeUser);
  });
}

// server/services/chatbot.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import Groq from "groq-sdk";
var geminiAI;
var geminiModel;
var xaiApiKey = null;
var groq;
async function initializeAIClients() {
  try {
    const geminiKey = await storage.getChatbotKeyByProvider("gemini");
    if (geminiKey && geminiKey.isActive) {
      geminiAI = new GoogleGenerativeAI(geminiKey.apiKey);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("Gemini client initialized with key from database");
    } else if (process.env.GEMINI_API_KEY) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("Gemini client initialized with key from environment variable");
    } else {
      console.log("No Gemini API key available. Gemini features will be disabled.");
    }
    const xaiKey = await storage.getChatbotKeyByProvider("xai");
    if (xaiKey && xaiKey.isActive) {
      xaiApiKey = xaiKey.apiKey;
      console.log("xAI client initialized with key from database");
    } else {
      console.log("No xAI API key available. xAI features will be disabled.");
    }
    const groqKey = await storage.getChatbotKeyByProvider("groq");
    if (groqKey && groqKey.isActive) {
      groq = new Groq({ apiKey: groqKey.apiKey });
      console.log("Groq client initialized with key from database");
    } else if (process.env.GROQ_API_KEY) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log("Groq client initialized with key from environment variable");
    } else {
      console.log("No Groq API key available. Groq features will be disabled.");
    }
  } catch (error) {
    console.error("Error initializing AI clients:", error);
    if (process.env.GEMINI_API_KEY) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    if (process.env.GROQ_API_KEY) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
  }
}
async function generateGeminiCompletion(messages, res) {
  try {
    if (!geminiAI || !geminiModel) {
      const geminiKey = await storage.getChatbotKeyByProvider("gemini");
      if (!geminiKey || !geminiKey.isActive) {
        return {
          success: false,
          error: "Gemini API key is not configured or inactive. Please add your API key in the settings."
        };
      }
      try {
        geminiAI = new GoogleGenerativeAI(geminiKey.apiKey);
        geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch (initError) {
        console.error("Error initializing Gemini client:", initError);
        return {
          success: false,
          error: "Failed to initialize Gemini client. Please check your API key."
        };
      }
    }
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
    if (!lastUserMessage) {
      return { success: false, error: "No user message found." };
    }
    const prompt = lastUserMessage.content;
    if (res) {
      const result = await geminiModel.generateContentStream(prompt);
      let fullContent = "";
      for await (const chunk of result.stream) {
        const content = chunk.text();
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content, fullContent })}

`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
      return {
        success: true,
        message: { role: "assistant", content: fullContent },
        streaming: true
      };
    } else {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text3 = response.text();
      return {
        success: true,
        message: { role: "assistant", content: text3 }
      };
    }
  } catch (error) {
    console.error("Error generating Gemini completion:", error);
    if (res) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}

`);
      res.end();
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with Gemini API"
    };
  }
}
async function generateGroqCompletion(messages, res) {
  try {
    if (!groq) {
      return {
        success: false,
        error: "Groq API key is not configured. Please add your API key in the settings."
      };
    }
    if (res) {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        stream: true
      });
      let fullContent = "";
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content, fullContent })}

`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
      return {
        success: true,
        message: { role: "assistant", content: fullContent },
        streaming: true
      };
    } else {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages
      });
      return {
        success: true,
        message: {
          role: response.choices[0].message.role,
          content: response.choices[0].message.content || ""
        },
        usage: response.usage
      };
    }
  } catch (error) {
    console.error("Error generating Groq completion:", error);
    if (res) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}

`);
      res.end();
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with Groq API"
    };
  }
}
async function generateXaiCompletion(messages, res) {
  try {
    if (!xaiApiKey) {
      return {
        success: false,
        error: "xAI API key is not configured. Please add your API key in the settings."
      };
    }
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
    if (!lastUserMessage) {
      return { success: false, error: "No user message found." };
    }
    const prompt = lastUserMessage.content;
    if (res) {
      const result = await streamText({
        model: xai("grok-3-mini-fast"),
        prompt,
        apiKey: xaiApiKey
      });
      let fullContent = "";
      for await (const textPart of result.textStream) {
        fullContent += textPart;
        res.write(`data: ${JSON.stringify({ content: textPart, fullContent })}

`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
      return {
        success: true,
        message: { role: "assistant", content: fullContent },
        streaming: true
      };
    } else {
      const { text: text3 } = await generateText({
        model: xai("grok-3-mini-fast"),
        prompt
      }, {
        apiKey: xaiApiKey
      });
      return {
        success: true,
        message: { role: "assistant", content: text3 }
      };
    }
  } catch (error) {
    console.error("Error generating xAI completion:", error);
    if (res) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}

`);
      res.end();
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with xAI API"
    };
  }
}
async function verifyApiKey(provider, apiKey) {
  try {
    switch (provider) {
      case "gemini": {
        try {
          const tempGeminiAI = new GoogleGenerativeAI(apiKey);
          const tempGeminiModel = tempGeminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          await tempGeminiModel.generateContent("Test");
          return { valid: true };
        } catch (error) {
          if (error.message?.includes("API key")) {
            return { valid: false, message: "Invalid Gemini API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying Gemini API key" };
          }
        }
      }
      case "groq": {
        try {
          const tempGroq = new Groq({ apiKey });
          await tempGroq.models.list();
          return { valid: true };
        } catch (error) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid Groq API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying Groq API key" };
          }
        }
      }
      case "xai": {
        try {
          const { text: text3 } = await generateText({
            model: xai("grok-3-mini-fast"),
            prompt: "Test"
          }, {
            apiKey
          });
          return { valid: true };
        } catch (error) {
          return { valid: false, message: error.message || "Invalid xAI API key" };
        }
      }
      default:
        return { valid: true };
    }
  } catch (error) {
    console.error(`Error verifying ${provider} API key:`, error);
    return { valid: false, message: `Error verifying ${provider} API key: ${error.message}` };
  }
}

// server/admin.ts
function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}
function setupAdminRoutes(app2) {
  app2.get("/api/admin/users", isAdmin, async (req, res, next) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithDetails = await Promise.all(
        allUsers.map(async (user) => {
          const stats = await storage.getUserStats(user.id);
          return {
            ...user,
            score: stats.totalPoints || 0,
            isBanned: user.isBanned || false
          };
        })
      );
      res.json(usersWithDetails);
    } catch (error) {
      next(error);
    }
  });
  app2.patch("/api/admin/users/:id", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { isBanned } = req.body;
      if (isBanned !== void 0) {
        const updatedUser = await storage.updateUserBanStatus(userId, isBanned);
        return res.json({
          success: true,
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            isBanned: updatedUser.isBanned
          }
        });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/admin/api-keys", isAdmin, async (req, res, next) => {
    try {
      const apiKeys = await storage.getAllChatbotKeys();
      const maskedKeys = apiKeys.map((key) => {
        const originalKey = key.apiKey;
        let maskedKey = originalKey;
        if (originalKey && originalKey.length > 8) {
          maskedKey = originalKey.substring(0, 4) + "..." + originalKey.substring(originalKey.length - 4);
        }
        return {
          ...key,
          apiKey: maskedKey
        };
      });
      res.json(maskedKeys);
    } catch (error) {
      next(error);
    }
  });
  app2.put("/api/admin/api-keys", isAdmin, async (req, res, next) => {
    try {
      const { provider, apiKey, isActive } = req.body;
      if (!provider || !apiKey) {
        return res.status(400).json({ message: "Provider and apiKey are required" });
      }
      const existingKey = await storage.getChatbotKeyByProvider(provider);
      let result;
      if (existingKey) {
        result = await storage.updateChatbotKey(existingKey.id, {
          apiKey,
          isActive: isActive ?? true
        });
      } else {
        if (!req.user || !req.user.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        result = await storage.saveChatbotKey({
          userId: req.user.id,
          provider,
          apiKey,
          isActive: isActive ?? true
        });
      }
      await initializeAIClients();
      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  });
  app2.patch("/api/admin/api-keys/:id/toggle", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const apiKeys = await storage.getAllChatbotKeys();
      const currentKey = apiKeys.find((key) => key.id === id);
      if (!currentKey) {
        return res.status(404).json({ message: "API key not found" });
      }
      const result = await storage.updateChatbotKey(id, {
        isActive: !currentKey.isActive
      });
      await initializeAIClients();
      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/admin/api-keys/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      await storage.deleteChatbotKey(id);
      await initializeAIClients();
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
}

// server/routes/challenge-routes.ts
function setupChallengeRoutes(app2) {
  console.log("Challenge routes setup completed");
}

// server/routes/contest-routes.ts
function setupContestRoutes(app2) {
  console.log("Contest routes setup completed");
}

// server/routes/landing-routes.ts
function setupLandingRoutes(app2) {
  app2.get("/api/landing/stats", async (req, res) => {
    try {
      const stats = await storage.getLandingStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching landing stats:", error);
      res.status(500).json({ message: "Failed to fetch landing statistics" });
    }
  });
  app2.get("/api/landing/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity(10);
      res.status(200).json(activity);
    } catch (error) {
      console.error("Error fetching landing activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });
  app2.get("/api/landing/challenges", async (req, res) => {
    try {
      const challenges3 = await storage.getFeaturedChallenges(6);
      res.status(200).json(challenges3);
    } catch (error) {
      console.error("Error fetching landing challenges:", error);
      res.status(500).json({ message: "Failed to fetch featured challenges" });
    }
  });
  app2.get("/api/landing/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getTopUsers(10);
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Error fetching landing leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/landing/global-activity", async (req, res) => {
    try {
      const globalActivity = await storage.getGlobalActivity();
      res.status(200).json(globalActivity);
    } catch (error) {
      console.error("Error fetching global activity:", error);
      res.status(500).json({ message: "Failed to fetch global activity" });
    }
  });
  console.log("Landing routes setup completed");
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  setupAdminRoutes(app2);
  await initializeAIClients();
  setupChallengeRoutes(app2);
  setupContestRoutes(app2);
  setupLandingRoutes(app2);
  app2.get("/api/challenges", async (req, res) => {
    try {
      const challenges3 = await storage.getAllChallenges();
      res.status(200).json(challenges3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });
  app2.get("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallengeById(parseInt(req.params.id));
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.status(200).json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });
  app2.post("/api/challenges", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const challenge = await storage.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });
  app2.post("/api/challenges/submit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { flag, startTime } = req.body;
    const challengeId = parseInt(req.params.id);
    try {
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      if (challenge.flag === flag) {
        const timeToSolve = startTime ? Math.floor((Date.now() - startTime) / 1e3) : null;
        const basePoints = challenge.points;
        let bonusPoints = 0;
        if (timeToSolve && timeToSolve < 300) {
          bonusPoints = Math.floor(basePoints * 0.5);
        } else if (timeToSolve && timeToSolve < 600) {
          bonusPoints = Math.floor(basePoints * 0.25);
        } else if (timeToSolve && timeToSolve < 1800) {
          bonusPoints = Math.floor(basePoints * 0.1);
        }
        const totalPoints = basePoints + bonusPoints;
        const completedChallenge = await storage.completeChallenge({
          userId: req.user.id,
          challengeId,
          timeToSolve: timeToSolve || null,
          pointsAwarded: totalPoints
        });
        await storage.updateUserScore(req.user.id, totalPoints);
        const newBadges = await storage.checkAndAwardBadges(req.user.id, challengeId);
        res.status(200).json({
          success: true,
          points: totalPoints,
          basePoints,
          bonusPoints,
          newBadges: newBadges.length > 0 ? newBadges : null
        });
      } else {
        res.status(200).json({ success: false, message: "Incorrect flag" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process submission" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/badges", async (req, res) => {
    try {
      const badges3 = await storage.getAllBadges();
      res.status(200).json(badges3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  app2.get("/api/users/:id/badges", async (req, res) => {
    try {
      const userBadges3 = await storage.getUserBadges(parseInt(req.params.id));
      res.status(200).json(userBadges3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });
  app2.post("/api/chatbot/keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { provider, key } = req.body;
      const validProviders = ["gemini", "groq", "xai"];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: "Invalid provider" });
      }
      if (!key || typeof key !== "string" || key.trim().length < 10) {
        return res.status(400).json({ message: "Invalid API key format" });
      }
      try {
        const verification = await verifyApiKey(provider, key);
        if (!verification.valid) {
          return res.status(400).json({ message: verification.message || "Invalid API key" });
        }
      } catch (verificationError) {
        console.error("Error verifying API key:", verificationError);
      }
      const existingKeys = await storage.getUserChatbotKeys(req.user.id);
      const existingKey = existingKeys.find((k) => k.provider === provider);
      let chatbotKey;
      if (existingKey) {
        chatbotKey = await storage.updateChatbotKey(existingKey.id, {
          apiKey: key,
          isActive: true
        });
      } else {
        chatbotKey = await storage.saveChatbotKey({
          userId: req.user.id,
          provider,
          apiKey: key,
          isActive: true
        });
      }
      await initializeAIClients();
      res.status(201).json({
        id: chatbotKey.id,
        provider: chatbotKey.provider,
        createdAt: chatbotKey.createdAt
      });
    } catch (error) {
      console.error("Error saving API key:", error);
      res.status(500).json({ message: "Failed to save API key" });
    }
  });
  app2.get("/api/chatbot/keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const keys = await storage.getUserChatbotKeys(req.user.id);
      const providers = keys.map((key) => ({
        id: key.id,
        provider: key.provider,
        apiKey: key.apiKey.substring(0, 8) + "...",
        isActive: key.isActive,
        createdAt: key.createdAt
      }));
      res.status(200).json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });
  app2.delete("/api/chatbot/keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const keyId = parseInt(req.params.id);
      const keys = await storage.getUserChatbotKeys(req.user.id);
      const keyToDelete = keys.find((k) => k.id === keyId);
      if (!keyToDelete) {
        return res.status(404).json({ message: "API key not found" });
      }
      await storage.deleteChatbotKey(keyId);
      await initializeAIClients();
      res.status(200).json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });
  app2.post("/api/chatbot/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { provider, messages, title } = req.body;
      const chatHistory3 = await storage.saveChatHistory({
        userId: req.user.id,
        provider,
        messages,
        title
      });
      res.status(201).json(chatHistory3);
    } catch (error) {
      res.status(500).json({ message: "Failed to save chat history" });
    }
  });
  app2.get("/api/chatbot/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const history = await storage.getUserChatHistory(req.user.id);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });
  app2.get("/api/users/:id/milestones", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const completedChallenges3 = await storage.getUserCompletedChallenges(userId);
      const userBadges3 = await storage.getUserBadges(userId);
      const userBadgeIds = userBadges3.map((badge) => badge.id);
      const allBadges = await storage.getAllBadges();
      const user = await storage.getUser(userId);
      const userScore = user?.score || 0;
      const challengesByCategory = {};
      const challengesByDifficulty = {};
      completedChallenges3.forEach((challenge) => {
        if (!challengesByCategory[challenge.category]) {
          challengesByCategory[challenge.category] = 0;
        }
        challengesByCategory[challenge.category]++;
        if (!challengesByDifficulty[challenge.difficulty]) {
          challengesByDifficulty[challenge.difficulty] = 0;
        }
        challengesByDifficulty[challenge.difficulty]++;
      });
      const milestoneData = {
        achievements: [
          {
            id: "solve-1",
            name: "Beginner",
            description: "Solve your first challenge",
            progress: Math.min(completedChallenges3.length, 1),
            total: 1,
            completed: completedChallenges3.length >= 1,
            badgeId: allBadges.find((b) => b.requirement === "solve-1")?.id
          },
          {
            id: "solve-5",
            name: "Apprentice",
            description: "Solve 5 challenges",
            progress: Math.min(completedChallenges3.length, 5),
            total: 5,
            completed: completedChallenges3.length >= 5,
            badgeId: allBadges.find((b) => b.requirement === "solve-5")?.id
          },
          {
            id: "solve-10",
            name: "Journeyman",
            description: "Solve 10 challenges",
            progress: Math.min(completedChallenges3.length, 10),
            total: 10,
            completed: completedChallenges3.length >= 10,
            badgeId: allBadges.find((b) => b.requirement === "solve-10")?.id
          },
          {
            id: "solve-25",
            name: "Expert",
            description: "Solve 25 challenges",
            progress: Math.min(completedChallenges3.length, 25),
            total: 25,
            completed: completedChallenges3.length >= 25,
            badgeId: allBadges.find((b) => b.requirement === "solve-25")?.id
          },
          {
            id: "solve-50",
            name: "Master",
            description: "Solve 50 challenges",
            progress: Math.min(completedChallenges3.length, 50),
            total: 50,
            completed: completedChallenges3.length >= 50,
            badgeId: allBadges.find((b) => b.requirement === "solve-50")?.id
          },
          {
            id: "solve-100",
            name: "Grandmaster",
            description: "Solve 100 challenges",
            progress: Math.min(completedChallenges3.length, 100),
            total: 100,
            completed: completedChallenges3.length >= 100,
            badgeId: allBadges.find((b) => b.requirement === "solve-100")?.id
          }
        ],
        categories: Object.entries(challengesByCategory).flatMap(([category, count]) => {
          const categoryMilestones = [];
          categoryMilestones.push({
            id: `category-${category}-3`,
            name: `${category} Novice`,
            description: `Solve 3 ${category} challenges`,
            progress: Math.min(count, 3),
            total: 3,
            completed: count >= 3,
            badgeId: allBadges.find((b) => b.requirement === `category-${category}-3`)?.id
          });
          categoryMilestones.push({
            id: `category-${category}-5`,
            name: `${category} Expert`,
            description: `Solve 5 ${category} challenges`,
            progress: Math.min(count, 5),
            total: 5,
            completed: count >= 5,
            badgeId: allBadges.find((b) => b.requirement === `category-${category}-5`)?.id
          });
          categoryMilestones.push({
            id: `category-${category}-10`,
            name: `${category} Master`,
            description: `Solve 10 ${category} challenges`,
            progress: Math.min(count, 10),
            total: 10,
            completed: count >= 10,
            badgeId: allBadges.find((b) => b.requirement === `category-${category}-10`)?.id
          });
          return categoryMilestones;
        }),
        difficulty: Object.entries(challengesByDifficulty).flatMap(([difficulty, count]) => {
          const difficultyMilestones = [];
          const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
          difficultyMilestones.push({
            id: `difficulty-${difficulty}-3`,
            name: `${difficultyName} Solver`,
            description: `Solve 3 ${difficulty} challenges`,
            progress: Math.min(count, 3),
            total: 3,
            completed: count >= 3,
            badgeId: allBadges.find((b) => b.requirement === `difficulty-${difficulty}-3`)?.id
          });
          difficultyMilestones.push({
            id: `difficulty-${difficulty}-5`,
            name: `${difficultyName} Expert`,
            description: `Solve 5 ${difficulty} challenges`,
            progress: Math.min(count, 5),
            total: 5,
            completed: count >= 5,
            badgeId: allBadges.find((b) => b.requirement === `difficulty-${difficulty}-5`)?.id
          });
          difficultyMilestones.push({
            id: `difficulty-${difficulty}-10`,
            name: `${difficultyName} Master`,
            description: `Solve 10 ${difficulty} challenges`,
            progress: Math.min(count, 10),
            total: 10,
            completed: count >= 10,
            badgeId: allBadges.find((b) => b.requirement === `difficulty-${difficulty}-10`)?.id
          });
          return difficultyMilestones;
        }),
        points: [
          {
            id: "score-1000",
            name: "Point Hunter",
            description: "Earn 1,000 points",
            progress: Math.min(userScore, 1e3),
            total: 1e3,
            completed: userScore >= 1e3,
            badgeId: allBadges.find((b) => b.requirement === "score-1000")?.id
          },
          {
            id: "score-5000",
            name: "Point Collector",
            description: "Earn 5,000 points",
            progress: Math.min(userScore, 5e3),
            total: 5e3,
            completed: userScore >= 5e3,
            badgeId: allBadges.find((b) => b.requirement === "score-5000")?.id
          },
          {
            id: "score-10000",
            name: "Point Master",
            description: "Earn 10,000 points",
            progress: Math.min(userScore, 1e4),
            total: 1e4,
            completed: userScore >= 1e4,
            badgeId: allBadges.find((b) => b.requirement === "score-10000")?.id
          },
          {
            id: "score-25000",
            name: "Point Legend",
            description: "Earn 25,000 points",
            progress: Math.min(userScore, 25e3),
            total: 25e3,
            completed: userScore >= 25e3,
            badgeId: allBadges.find((b) => b.requirement === "score-25000")?.id
          },
          {
            id: "score-50000",
            name: "Point God",
            description: "Earn 50,000 points",
            progress: Math.min(userScore, 5e4),
            total: 5e4,
            completed: userScore >= 5e4,
            badgeId: allBadges.find((b) => b.requirement === "score-50000")?.id
          }
        ]
      };
      res.status(200).json(milestoneData);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestone data" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const safeUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        score: user.score,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      };
      res.status(200).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });
  app2.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userStats = await storage.getUserStats(parseInt(req.params.id));
      res.status(200).json(userStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/users/:id/completed-challenges", async (req, res) => {
    try {
      const completedChallenges3 = await storage.getUserCompletedChallenges(parseInt(req.params.id));
      res.status(200).json(completedChallenges3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed challenges" });
    }
  });
  app2.patch("/api/users/:id/avatar", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ message: "Avatar URL is required" });
      }
      const updatedUser = await storage.updateUserAvatar(parseInt(req.params.id), avatarUrl);
      res.status(200).json({
        success: true,
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });
  app2.post("/api/chatbot/completion", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { provider, messages, stream } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Invalid messages data" });
      }
      if (stream === true) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        if (provider === "gemini") {
          await generateGeminiCompletion(messages, res);
          return;
        } else if (provider === "groq") {
          await generateGroqCompletion(messages, res);
          return;
        } else if (provider === "xai") {
          await generateXaiCompletion(messages, res);
          return;
        }
      }
      let result;
      switch (provider) {
        case "gemini":
          result = await generateGeminiCompletion(messages);
          break;
        case "groq":
          result = await generateGroqCompletion(messages);
          break;
        case "xai":
          result = await generateXaiCompletion(messages);
          break;
        default:
          return res.status(400).json({ message: "Invalid or unsupported provider" });
      }
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Failed to generate completion" });
      }
      await storage.saveChatHistory({
        userId: req.user.id,
        provider,
        messages: [...messages, result.message],
        title: messages[0].content.substring(0, 50) + "..."
      });
      if (stream) {
        const cleanedContent = result.message.content.trim();
        const words = cleanedContent.split(" ");
        let streamedContent = "";
        for (const word of words) {
          streamedContent += word + " ";
          res.write(`data: ${JSON.stringify({ content: word + " ", fullContent: streamedContent })}

`);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        res.write(`data: ${JSON.stringify({ done: true })}

`);
        res.end();
      } else {
        res.status(200).json({
          message: result.message,
          usage: result.usage
        });
      }
    } catch (error) {
      console.error("Error in chat completion:", error);
      res.status(500).json({ message: "Failed to generate completion. Please check your API key and try again." });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/database.ts
import dotenv from "dotenv";
import { Pool } from "pg";
import mysql2 from "mysql2/promise";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  badges: () => badges2,
  challengeFiles: () => challengeFiles,
  challenges: () => challenges2,
  chatHistory: () => chatHistory2,
  chatbotKeys: () => chatbotKeys2,
  completedChallenges: () => completedChallenges2,
  contestChallenges: () => contestChallenges2,
  contests: () => contests2,
  externalFlagSubmissions: () => externalFlagSubmissions2,
  flagSubmissions: () => flagSubmissions,
  insertBadgeSchema: () => insertBadgeSchema2,
  insertChallengeSchema: () => insertChallengeSchema2,
  insertChatHistorySchema: () => insertChatHistorySchema2,
  insertChatbotKeySchema: () => insertChatbotKeySchema2,
  insertCompletedChallengeSchema: () => insertCompletedChallengeSchema2,
  insertContestChallengeSchema: () => insertContestChallengeSchema2,
  insertContestSchema: () => insertContestSchema2,
  insertExternalFlagSubmissionSchema: () => insertExternalFlagSubmissionSchema2,
  insertUserBadgeSchema: () => insertUserBadgeSchema2,
  insertUserSchema: () => insertUserSchema2,
  userBadges: () => userBadges2,
  users: () => users2
});
import { pgTable, text as text2, serial, integer, boolean as boolean2, timestamp as timestamp2, json as json2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
var users2 = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text2("username").notNull().unique(),
  password: text2("password").notNull(),
  email: text2("email").notNull(),
  role: text2("role").notNull().default("user"),
  score: integer("score").notNull().default(0),
  avatarUrl: text2("avatar_url"),
  createdAt: timestamp2("created_at").defaultNow(),
  isBanned: boolean2("is_banned").notNull().default(false),
  lastActive: timestamp2("last_active")
});
var insertUserSchema2 = createInsertSchema2(users2).pick({
  username: true,
  password: true,
  email: true,
  role: true
});
var challenges2 = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text2("title").notNull(),
  description: text2("description").notNull(),
  difficulty: text2("difficulty").notNull(),
  // easy, medium, hard
  category: text2("category").notNull(),
  // web, crypto, forensics, etc.
  points: integer("points").notNull(),
  flag: text2("flag").notNull(),
  solveCount: integer("solve_count").notNull().default(0),
  createdAt: timestamp2("created_at").defaultNow(),
  updatedAt: timestamp2("updated_at").defaultNow(),
  imageUrl: text2("image_url"),
  // Enhanced fields for better challenge management
  author: text2("author"),
  hints: text2("hints"),
  // JSON array of hints
  attachments: text2("attachments"),
  // JSON array of file URLs
  serviceUrl: text2("service_url"),
  // For hosted challenges
  dockerImage: text2("docker_image"),
  // For containerized challenges
  isActive: boolean2("is_active").notNull().default(true),
  flagFormat: text2("flag_format"),
  // Regex pattern for flag validation
  maxAttempts: integer("max_attempts").default(0),
  // 0 = unlimited
  timeLimit: integer("time_limit"),
  // Time limit in minutes
  firstBloodBonus: integer("first_blood_bonus").default(0),
  tags: text2("tags")
  // JSON array of tags
});
var insertChallengeSchema2 = createInsertSchema2(challenges2).pick({
  title: true,
  description: true,
  difficulty: true,
  category: true,
  points: true,
  flag: true,
  imageUrl: true,
  author: true,
  hints: true,
  attachments: true,
  serviceUrl: true,
  dockerImage: true,
  isActive: true,
  flagFormat: true,
  maxAttempts: true,
  timeLimit: true,
  firstBloodBonus: true,
  tags: true
});
var challengeFiles = pgTable("challenge_files", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  fileName: text2("file_name").notNull(),
  fileUrl: text2("file_url").notNull(),
  fileSize: integer("file_size"),
  fileType: text2("file_type"),
  uploadedAt: timestamp2("uploaded_at").defaultNow()
});
var flagSubmissions = pgTable("flag_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  submittedFlag: text2("submitted_flag").notNull(),
  isCorrect: boolean2("is_correct").notNull(),
  submittedAt: timestamp2("submitted_at").defaultNow(),
  ipAddress: text2("ip_address"),
  userAgent: text2("user_agent")
});
var completedChallenges2 = pgTable("completed_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completedAt: timestamp2("completed_at").defaultNow(),
  timeToSolve: integer("time_to_solve"),
  // in seconds
  pointsAwarded: integer("points_awarded").notNull()
});
var insertCompletedChallengeSchema2 = createInsertSchema2(completedChallenges2).pick({
  userId: true,
  challengeId: true,
  timeToSolve: true,
  pointsAwarded: true
});
var badges2 = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text2("name").notNull(),
  description: text2("description").notNull(),
  imageUrl: text2("image_url"),
  requirement: text2("requirement").notNull()
});
var insertBadgeSchema2 = createInsertSchema2(badges2).pick({
  name: true,
  description: true,
  imageUrl: true,
  requirement: true
});
var userBadges2 = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  awardedAt: timestamp2("awarded_at").defaultNow()
});
var insertUserBadgeSchema2 = createInsertSchema2(userBadges2).pick({
  userId: true,
  badgeId: true
});
var chatbotKeys2 = pgTable("chatbot_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text2("provider").notNull(),
  // openai, anthropic
  apiKey: text2("api_key").notNull(),
  isActive: boolean2("is_active").notNull().default(true),
  createdAt: timestamp2("created_at").defaultNow()
});
var insertChatbotKeySchema2 = createInsertSchema2(chatbotKeys2).pick({
  userId: true,
  provider: true,
  apiKey: true,
  isActive: true
});
var chatHistory2 = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text2("provider").notNull(),
  messages: json2("messages").notNull(),
  createdAt: timestamp2("created_at").defaultNow(),
  title: text2("title")
});
var insertChatHistorySchema2 = createInsertSchema2(chatHistory2).pick({
  userId: true,
  provider: true,
  messages: true,
  title: true
});
var contests2 = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text2("title").notNull(),
  description: text2("description").notNull(),
  startDate: timestamp2("start_date").notNull(),
  endDate: timestamp2("end_date").notNull(),
  externalUrl: text2("external_url"),
  isExternal: boolean2("is_external").notNull().default(false),
  createdAt: timestamp2("created_at").defaultNow()
});
var insertContestSchema2 = createInsertSchema2(contests2).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  externalUrl: true,
  isExternal: true
});
var contestChallenges2 = pgTable("contest_challenges", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  challengeId: integer("challenge_id").notNull()
});
var insertContestChallengeSchema2 = createInsertSchema2(contestChallenges2).pick({
  contestId: true,
  challengeId: true
});
var externalFlagSubmissions2 = pgTable("external_flag_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contestId: integer("contest_id").notNull(),
  challengeName: text2("challenge_name").notNull(),
  description: text2("description"),
  points: integer("points").notNull(),
  flag: text2("flag").notNull(),
  status: text2("status").notNull().default("pending"),
  // pending, approved, rejected
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp2("reviewed_at"),
  createdAt: timestamp2("created_at").defaultNow()
});
var insertExternalFlagSubmissionSchema2 = createInsertSchema2(externalFlagSubmissions2).pick({
  userId: true,
  contestId: true,
  challengeName: true,
  description: true,
  points: true,
  flag: true
});

// server/database.ts
dotenv.config();
var hasMysqlUrl = !!process.env.MYSQL_DATABASE_URL;
var hasMysqlConfig = !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD);
var hasPostgresUrl = !!process.env.DATABASE_URL;
var useMySQL = hasMysqlUrl || hasMysqlConfig;
var pgPool;
var mysqlConnection;
var db2;
var connectedPool = false;
if (!useMySQL && hasPostgresUrl && process.env.DATABASE_URL) {
  const poolConfig2 = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 3e4,
    connectionTimeoutMillis: 5e3,
    ssl: {
      rejectUnauthorized: false
      // Allow self-signed certificates for development
    }
  };
  pgPool = new Pool(poolConfig2);
  pgPool.on("connect", () => {
    connectedPool = true;
    console.log("Connected to PostgreSQL");
  });
  pgPool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    connectedPool = false;
  });
  db2 = drizzlePg(pgPool, { schema: schema_exports });
}
if (useMySQL) {
  console.log("Using MySQL database configuration");
}
var checkConnection = async () => {
  if (useMySQL) {
    try {
      if (hasMysqlUrl) {
        mysqlConnection = await mysql2.createConnection(process.env.MYSQL_DATABASE_URL);
      } else {
        mysqlConnection = await mysql2.createConnection({
          host: process.env.DB_HOST || "localhost",
          user: process.env.DB_USER || "glowctf_user",
          password: process.env.DB_PASSWORD || "Maruf078692",
          database: process.env.DB_NAME || "glowctf",
          port: parseInt(process.env.DB_PORT || "3306")
        });
      }
      await mysqlConnection.execute("SELECT 1");
      if (!db2) {
        db2 = drizzleMysql(mysqlConnection, { schema: mysql_schema_exports, mode: "default" });
      }
      console.log("Connected to MySQL");
      return true;
    } catch (err) {
      console.error("Failed to connect to MySQL", err);
      throw err;
    }
  } else if (pgPool) {
    if (!connectedPool) {
      try {
        const client = await pgPool.connect();
        await client.query("SELECT 1");
        client.release();
        connectedPool = true;
        console.log("Reconnected to PostgreSQL");
      } catch (err) {
        console.error("Failed to reconnect to PostgreSQL", err);
        throw err;
      }
    }
    return connectedPool;
  } else {
    throw new Error("No database configuration available");
  }
};
var closeConnections = async () => {
  try {
    if (pgPool) {
      console.log("Closing PostgreSQL connection pool");
      await pgPool.end();
    }
    if (mysqlConnection) {
      console.log("Closing MySQL connection");
      await mysqlConnection.end();
    }
  } catch (err) {
    console.error("Error closing database connections", err);
  }
};
process.on("SIGINT", closeConnections);
process.on("SIGTERM", closeConnections);

// server/index.ts
dotenv2.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    try {
      await checkConnection();
      next();
    } catch (err) {
      console.error("Database connection error:", err);
      res.status(503).json({ message: "Database connection error. Please try again later." });
    }
  } else {
    next();
  }
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await checkConnection();
    console.log(`Database connection verified on startup (using ${useMySQL ? "MySQL" : "PostgreSQL"})`);
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error: ${message}`, err);
      res.status(status).json({ message });
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = 5e3;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server due to database connection error:", err);
    process.exit(1);
  }
})();
