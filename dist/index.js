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
var db2 = null;
var getDb = () => {
  if (!db2) {
    const pool2 = getPool();
    db2 = drizzle(pool2, { schema: mysql_schema_exports, mode: "default" });
  }
  return db2;
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
    const db4 = getDb();
    const results = await db4.select().from(users).where(eq(users.id, id));
    return results[0];
  }
  async getUserByUsername(username) {
    const db4 = await getDb();
    const results = await db4.select().from(users).where(eq(users.username, username));
    return results[0];
  }
  async createUser(insertUser) {
    const db4 = await getDb();
    const results = await db4.insert(users).values(insertUser);
    const userId = results[0].insertId;
    return this.getUser(userId);
  }
  async updateUserScore(userId, points) {
    const db4 = await getDb();
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const newScore = user.score + points;
    await db4.update(users).set({ score: newScore }).where(eq(users.id, userId));
    return this.getUser(userId);
  }
  async getAllUsers() {
    const db4 = await getDb();
    return db4.select().from(users);
  }
  async getUserStats(userId) {
    const db4 = await getDb();
    const solvedChallenges = await db4.select({
      count: sql`count(*)`
    }).from(completedChallenges).where(eq(completedChallenges.userId, userId));
    const badges3 = await db4.select({
      count: sql`count(*)`
    }).from(userBadges).where(eq(userBadges.userId, userId));
    const user = await this.getUser(userId);
    const allUsers = await db4.select({
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
    const db4 = await getDb();
    return db4.select().from(challenges);
  }
  async getChallengeById(id) {
    const db4 = await getDb();
    const results = await db4.select().from(challenges).where(eq(challenges.id, id));
    return results[0];
  }
  async createChallenge(insertChallenge) {
    const db4 = await getDb();
    const results = await db4.insert(challenges).values(insertChallenge);
    const challengeId = results[0].insertId;
    return this.getChallengeById(challengeId);
  }
  async completeChallenge(data) {
    const db4 = await getDb();
    const results = await db4.insert(completedChallenges).values(data);
    const id = results[0].insertId;
    const completedChallengeResults = await db4.select().from(completedChallenges).where(eq(completedChallenges.id, id));
    const challenge = await this.getChallengeById(data.challengeId);
    if (challenge) {
      await db4.update(challenges).set({ solveCount: challenge.solveCount + 1 }).where(eq(challenges.id, data.challengeId));
    }
    await this.checkAndAwardBadges(data.userId, data.challengeId);
    return completedChallengeResults[0];
  }
  async getUserCompletedChallenges(userId) {
    const db4 = await getDb();
    const completedResults = await db4.select().from(completedChallenges).where(eq(completedChallenges.userId, userId));
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
    const db4 = getDb();
    return db4.select().from(badges);
  }
  async getUserBadges(userId) {
    const db4 = getDb();
    try {
      const userBadgesResults = await db4.select().from(userBadges).where(eq(userBadges.userId, userId));
      const badgeIds = userBadgesResults.map((ub) => ub.badgeId);
      if (badgeIds.length === 0) {
        return [];
      }
      const results = await Promise.all(
        badgeIds.map(async (id) => {
          try {
            const badgeResults = await db4.select().from(badges).where(eq(badges.id, id));
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
    const db4 = await getDb();
    const existingResults = await db4.select().from(userBadges).where(
      and(
        eq(userBadges.userId, data.userId),
        eq(userBadges.badgeId, data.badgeId)
      )
    );
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    const results = await db4.insert(userBadges).values(data);
    const id = results[0].insertId;
    const userBadgeResults = await db4.select().from(userBadges).where(eq(userBadges.id, id));
    return userBadgeResults[0];
  }
  async checkAndAwardBadges(userId, challengeId) {
    const db4 = await getDb();
    const completedChallengesCount = await db4.select({
      count: sql`count(*)`
    }).from(completedChallenges).where(eq(completedChallenges.userId, userId));
    const count = completedChallengesCount[0]?.count || 0;
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) {
      return [];
    }
    const categoryChallengesCount = await db4.select({
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
    const db4 = await getDb();
    const existingResults = await db4.select().from(chatbotKeys).where(
      and(
        eq(chatbotKeys.userId, data.userId),
        eq(chatbotKeys.provider, data.provider)
      )
    );
    if (existingResults.length > 0) {
      await db4.update(chatbotKeys).set({
        apiKey: data.apiKey,
        isActive: data.isActive
      }).where(eq(chatbotKeys.id, existingResults[0].id));
      return this.getChatbotKeyById(existingResults[0].id);
    }
    const results = await db4.insert(chatbotKeys).values(data);
    const id = results[0].insertId;
    return this.getChatbotKeyById(id);
  }
  async getChatbotKeyById(id) {
    const db4 = await getDb();
    const results = await db4.select().from(chatbotKeys).where(eq(chatbotKeys.id, id));
    return results[0];
  }
  async getUserChatbotKeys(userId) {
    const db4 = await getDb();
    return db4.select().from(chatbotKeys).where(eq(chatbotKeys.userId, userId));
  }
  async getAllChatbotKeys() {
    const db4 = await getDb();
    return db4.select().from(chatbotKeys);
  }
  async getChatbotKeyByProvider(provider) {
    const db4 = await getDb();
    const results = await db4.select().from(chatbotKeys).where(
      and(
        eq(chatbotKeys.provider, provider),
        eq(chatbotKeys.isActive, true)
      )
    );
    return results[0];
  }
  async updateChatbotKey(id, data) {
    const db4 = await getDb();
    await db4.update(chatbotKeys).set(data).where(eq(chatbotKeys.id, id));
    return this.getChatbotKeyById(id);
  }
  async deleteChatbotKey(id) {
    const db4 = await getDb();
    await db4.delete(chatbotKeys).where(eq(chatbotKeys.id, id));
  }
  async saveChatHistory(data) {
    const db4 = await getDb();
    const results = await db4.insert(chatHistory).values(data);
    const id = results[0].insertId;
    const chatHistoryResults = await db4.select().from(chatHistory).where(eq(chatHistory.id, id));
    return chatHistoryResults[0];
  }
  async getUserChatHistory(userId) {
    const db4 = await getDb();
    return db4.select().from(chatHistory).where(eq(chatHistory.userId, userId));
  }
  async getLeaderboard() {
    const db4 = getDb();
    try {
      const userResults = await db4.select().from(users).orderBy(desc(users.score)).limit(100);
      const leaderboard = await Promise.all(
        userResults.map(async (user, index) => {
          try {
            const userBadgesResults = await this.getUserBadges(user.id);
            const completedChallengesCount = await db4.select({
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
    const db4 = await getDb();
    return db4.select().from(contests);
  }
  async getContestById(id) {
    const db4 = await getDb();
    const results = await db4.select().from(contests).where(eq(contests.id, id));
    return results[0];
  }
  async createContest(insertContest) {
    const db4 = await getDb();
    const results = await db4.insert(contests).values(insertContest);
    const contestId = results[0].insertId;
    return this.getContestById(contestId);
  }
  async updateContest(id, data) {
    const db4 = await getDb();
    await db4.update(contests).set(data).where(eq(contests.id, id));
    return this.getContestById(id);
  }
  async deleteContest(id) {
    const db4 = await getDb();
    await db4.delete(contests).where(eq(contests.id, id));
  }
  async addChallengeToContest(data) {
    const db4 = await getDb();
    const existingResults = await db4.select().from(contestChallenges).where(
      and(
        eq(contestChallenges.contestId, data.contestId),
        eq(contestChallenges.challengeId, data.challengeId)
      )
    );
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    const results = await db4.insert(contestChallenges).values(data);
    const id = results[0].insertId;
    const contestChallengeResults = await db4.select().from(contestChallenges).where(eq(contestChallenges.id, id));
    return contestChallengeResults[0];
  }
  async removeChallengeFromContest(contestId, challengeId) {
    const db4 = await getDb();
    await db4.delete(contestChallenges).where(
      and(
        eq(contestChallenges.contestId, contestId),
        eq(contestChallenges.challengeId, challengeId)
      )
    );
  }
  async getContestChallenges(contestId) {
    const db4 = await getDb();
    const contestChallengesResults = await db4.select().from(contestChallenges).where(eq(contestChallenges.contestId, contestId));
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
    const db4 = await getDb();
    const results = await db4.insert(externalFlagSubmissions).values(data);
    const id = results[0].insertId;
    const submissionResults = await db4.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.id, id));
    return submissionResults[0];
  }
  async getExternalFlagSubmissions(contestId) {
    const db4 = await getDb();
    return db4.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.contestId, contestId));
  }
  async getUserExternalFlagSubmissions(userId) {
    const db4 = await getDb();
    return db4.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.userId, userId));
  }
  async reviewExternalFlagSubmission(id, reviewerId, status) {
    const db4 = await getDb();
    const now = /* @__PURE__ */ new Date();
    await db4.update(externalFlagSubmissions).set({
      status,
      reviewedBy: reviewerId,
      reviewedAt: now
    }).where(eq(externalFlagSubmissions.id, id));
    const submissionResults = await db4.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.id, id));
    if (status === "approved") {
      const submission = submissionResults[0];
      await this.updateUserScore(submission.userId, submission.points);
    }
    return submissionResults[0];
  }
};
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
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
var openai;
var anthropic;
var geminiAI;
var geminiModel;
var together;
async function initializeAIClients() {
  try {
    const openaiKey = await storage.getChatbotKeyByProvider("openai");
    if (openaiKey && openaiKey.isActive) {
      openai = new OpenAI({ apiKey: openaiKey.apiKey });
      console.log("OpenAI client initialized with key from database");
    } else if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log("OpenAI client initialized with key from environment variable");
    } else {
      console.log("No OpenAI API key available. OpenAI features will be disabled.");
    }
    const anthropicKey = await storage.getChatbotKeyByProvider("anthropic");
    if (anthropicKey && anthropicKey.isActive) {
      anthropic = new Anthropic({ apiKey: anthropicKey.apiKey });
      console.log("Anthropic client initialized with key from database");
    } else if (process.env.ANTHROPIC_API_KEY) {
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log("Anthropic client initialized with key from environment variable");
    } else {
      console.log("No Anthropic API key available. Anthropic features will be disabled.");
    }
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
    const groqKey = await storage.getChatbotKeyByProvider("groq");
    if (groqKey && groqKey.isActive) {
      console.log("Groq API key found in database, but Groq SDK is not installed");
    } else if (process.env.GROQ_API_KEY) {
      console.log("Groq API key found in environment, but Groq SDK is not installed");
    } else {
      console.log("No Groq API key available. Groq features will be disabled.");
    }
    const togetherKey = await storage.getChatbotKeyByProvider("together");
    if (togetherKey && togetherKey.isActive) {
      together = new OpenAI({
        apiKey: togetherKey.apiKey,
        baseURL: "https://api.together.xyz/v1"
      });
      console.log("Together.ai client initialized with key from database");
    } else if (process.env.TOGETHER_API_KEY) {
      together = new OpenAI({
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: "https://api.together.xyz/v1"
      });
      console.log("Together.ai client initialized with key from environment variable");
    } else {
      console.log("No Together.ai API key available. Together.ai features will be disabled.");
    }
    console.log("AIML and OpenRouter will be initialized on demand");
  } catch (error) {
    console.error("Error initializing AI clients:", error);
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    if (process.env.GROQ_API_KEY) {
      console.log("Groq API key found in environment, but Groq SDK is not installed");
    }
    if (process.env.TOGETHER_API_KEY) {
      together = new OpenAI({
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: "https://api.together.xyz/v1"
      });
    }
  }
}
async function generateOpenAICompletion(messages, res) {
  try {
    if (!openai) {
      return {
        success: false,
        error: "OpenAI API key is not configured. Please add your API key in the settings."
      };
    }
    if (res) {
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
          temperature: 0.7,
          max_tokens: 1e3,
          stream: true
        });
        let fullContent = "";
        for await (const chunk of stream) {
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
          message: {
            role: "assistant",
            content: fullContent
          },
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          },
          streaming: true
        };
      } catch (streamError) {
        console.error("Error in OpenAI stream:", streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message || "Stream error" })}

`);
        res.end();
        throw streamError;
      }
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 1e3
      });
      return {
        success: true,
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content || ""
        },
        usage: completion.usage
      };
    }
  } catch (error) {
    console.error("Error generating OpenAI completion:", error);
    if (error.code === "invalid_api_key") {
      return {
        success: false,
        error: "Invalid OpenAI API key. Please check your API key and try again."
      };
    } else if (error.code === "insufficient_quota") {
      return {
        success: false,
        error: "You've exceeded your OpenAI API quota. Please check your billing details or use a different API key."
      };
    } else if (error.code === "rate_limit_exceeded") {
      return {
        success: false,
        error: "OpenAI API rate limit exceeded. Please try again later."
      };
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with OpenAI API"
    };
  }
}
async function generateAnthropicCompletion(messages) {
  try {
    if (!anthropic) {
      return {
        success: false,
        error: "Anthropic API key is not configured. Please add your API key in the settings."
      };
    }
    const completion = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1e3,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content
      }))
    });
    let textContent = "";
    try {
      const content = completion.content[0];
      if (content.type === "text") {
        textContent = content.text;
      } else {
        textContent = JSON.stringify(content);
      }
    } catch (err) {
      textContent = "Could not parse response content";
    }
    return {
      success: true,
      message: {
        role: "assistant",
        content: textContent
      },
      usage: {
        prompt_tokens: completion.usage.input_tokens,
        completion_tokens: completion.usage.output_tokens,
        total_tokens: completion.usage.input_tokens + completion.usage.output_tokens
      }
    };
  } catch (error) {
    console.error("Error generating Anthropic completion:", error);
    if (error.status === 401) {
      return {
        success: false,
        error: "Invalid Anthropic API key. Please check your API key and try again."
      };
    } else if (error.status === 429) {
      return {
        success: false,
        error: "You've exceeded your Anthropic API rate limit. Please try again later."
      };
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with Anthropic API"
    };
  }
}
async function generateGeminiCompletion(messages) {
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
    let prompt = "";
    if (messages.length === 1) {
      prompt = messages[0].content;
    } else {
      const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
      if (lastUserMessage) {
        prompt = lastUserMessage.content;
      } else {
        return {
          success: false,
          error: "No user message found in the conversation."
        };
      }
    }
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text3 = response.text();
      return {
        success: true,
        message: {
          role: "assistant",
          content: text3
        },
        usage: {
          // Gemini doesn't provide token usage in the same way as OpenAI
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    } catch (apiError) {
      console.error("Error generating Gemini completion:", apiError);
      if (apiError.message?.includes("API key")) {
        return {
          success: false,
          error: "Invalid Gemini API key. Please check your API key and try again."
        };
      } else if (apiError.message?.includes("rate limit")) {
        return {
          success: false,
          error: "Gemini API rate limit exceeded. Please try again later."
        };
      }
      return {
        success: false,
        error: apiError.message || "Unknown error occurred with Gemini API"
      };
    }
  } catch (error) {
    console.error("Error generating Gemini completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with Gemini API"
    };
  }
}
async function verifyApiKey(provider, apiKey) {
  try {
    switch (provider) {
      case "openai": {
        const tempClient = new OpenAI({ apiKey });
        try {
          await tempClient.models.list({ limit: 1 });
          return { valid: true };
        } catch (error) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid OpenAI API key" };
          } else if (error.status === 429) {
            return { valid: false, message: "OpenAI API rate limit exceeded" };
          } else {
            return { valid: false, message: error.message || "Error verifying OpenAI API key" };
          }
        }
      }
      case "anthropic": {
        const tempClient = new Anthropic({ apiKey });
        try {
          await tempClient.models.list();
          return { valid: true };
        } catch (error) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid Anthropic API key" };
          } else if (error.status === 429) {
            return { valid: false, message: "Anthropic API rate limit exceeded" };
          } else {
            return { valid: false, message: error.message || "Error verifying Anthropic API key" };
          }
        }
      }
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
          return { valid: false, message: "Groq integration is currently unavailable. The @groq/groq package is not installed." };
        } catch (error) {
          return { valid: false, message: error.message || "Error verifying Groq API key" };
        }
      }
      case "together": {
        try {
          const tempTogether = new OpenAI({
            apiKey,
            baseURL: "https://api.together.xyz/v1"
          });
          await tempTogether.chat.completions.create({
            messages: [{ role: "user", content: "Test" }],
            model: "meta-llama/Llama-3-70b-chat-hf",
            max_tokens: 1
          });
          return { valid: true };
        } catch (error) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid Together.ai API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying Together.ai API key" };
          }
        }
      }
      case "aiml": {
        try {
          const tempClient = new OpenAI({
            apiKey,
            baseURL: "https://api.aimlapi.com/v1"
          });
          await tempClient.models.list({ limit: 1 });
          return { valid: true };
        } catch (error) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid AIML API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying AIML API key" };
          }
        }
      }
      case "openrouter": {
        try {
          const tempClient = new OpenAI({
            apiKey,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
              "HTTP-Referer": "https://glowctf.com",
              "X-Title": "GlowCTF Arena"
            }
          });
          await tempClient.models.list({ limit: 1 });
          return { valid: true };
        } catch (error) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid OpenRouter API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying OpenRouter API key" };
          }
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
async function generateAIMLCompletion(messages) {
  try {
    const aimlKey = await storage.getChatbotKeyByProvider("aiml");
    if (!aimlKey || !aimlKey.isActive) {
      return {
        success: false,
        error: "AIML API key is not configured or inactive. Please add your API key in the settings."
      };
    }
    try {
      const aimlClient = new OpenAI({
        apiKey: aimlKey.apiKey,
        baseURL: "https://api.aimlapi.com/v1"
      });
      let systemMessage = "You are a helpful assistant.";
      let userMessage = "";
      for (const message of messages) {
        if (message.role === "system") {
          systemMessage = message.content;
        } else if (message.role === "user") {
          userMessage = message.content;
        }
      }
      if (!userMessage && messages.length > 0) {
        userMessage = messages[messages.length - 1].content;
      }
      const completion = await aimlClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      return {
        success: true,
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content || ""
        },
        usage: completion.usage
      };
    } catch (apiError) {
      console.error("Error generating AIML completion:", apiError);
      if (apiError.status === 401 || apiError.status === 403) {
        return {
          success: false,
          error: "Invalid AIML API key. Please check your API key and try again."
        };
      } else if (apiError.status === 429) {
        return {
          success: false,
          error: "AIML API rate limit exceeded. Please try again later."
        };
      } else if (apiError.message) {
        return {
          success: false,
          error: `AIML API error: ${apiError.message}`
        };
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Error generating AIML completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with AIML API"
    };
  }
}
async function generateOpenRouterCompletion(messages) {
  try {
    const openRouterKey = await storage.getChatbotKeyByProvider("openrouter");
    if (!openRouterKey || !openRouterKey.isActive) {
      return {
        success: false,
        error: "OpenRouter API key is not configured or inactive. Please add your API key in the settings."
      };
    }
    try {
      const openRouterClient = new OpenAI({
        apiKey: openRouterKey.apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://glowctf.com",
          // Required by OpenRouter
          "X-Title": "GlowCTF Arena"
          // Required by OpenRouter
        }
      });
      const completion = await openRouterClient.chat.completions.create({
        model: "openai/gpt-4o",
        messages,
        max_tokens: 500
        // Important: Lower token request as mentioned in the example
      });
      return {
        success: true,
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content || ""
        },
        usage: completion.usage
      };
    } catch (apiError) {
      console.error("Error generating OpenRouter completion:", apiError);
      if (apiError.status === 401 || apiError.status === 403) {
        return {
          success: false,
          error: "Invalid OpenRouter API key. Please check your API key and try again."
        };
      } else if (apiError.status === 429) {
        return {
          success: false,
          error: "OpenRouter API rate limit exceeded. Please try again later."
        };
      } else if (apiError.message) {
        return {
          success: false,
          error: `OpenRouter API error: ${apiError.message}`
        };
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Error generating OpenRouter completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with OpenRouter API"
    };
  }
}
async function generateTogetherCompletion(messages) {
  try {
    if (!together) {
      const togetherKey = await storage.getChatbotKeyByProvider("together");
      if (!togetherKey || !togetherKey.isActive) {
        return {
          success: false,
          error: "Together.ai API key is not configured or inactive. Please add your API key in the settings."
        };
      }
      try {
        together = new OpenAI({
          apiKey: togetherKey.apiKey,
          baseURL: "https://api.together.xyz/v1"
        });
      } catch (initError) {
        console.error("Error initializing Together client:", initError);
        return {
          success: false,
          error: "Failed to initialize Together client. Please check your API key."
        };
      }
    }
    try {
      const response = await together.chat.completions.create({
        model: "meta-llama/Llama-3-70b-chat-hf",
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
    } catch (apiError) {
      console.error("Error generating Together.ai completion:", apiError);
      if (apiError.status === 401 || apiError.status === 403) {
        return {
          success: false,
          error: "Invalid Together.ai API key. Please check your API key and try again."
        };
      } else if (apiError.status === 429) {
        return {
          success: false,
          error: "Together.ai API rate limit exceeded. Please try again later."
        };
      } else if (apiError.message) {
        return {
          success: false,
          error: `Together.ai API error: ${apiError.message}`
        };
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Error generating Together.ai completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with Together.ai API"
    };
  }
}
async function generateGroqCompletion(messages) {
  try {
    return {
      success: false,
      error: "Groq integration is currently unavailable. The @groq/groq package is not installed."
    };
  } catch (error) {
    console.error("Error generating Groq completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with Groq API"
    };
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
var platformChallenges = [
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
    title: "Vigen\xE8re Cipher",
    description: "Decrypt this message encrypted with a Vigen\xE8re cipher. The key is 'CRYPTO': 'wlrt{mzxvoigl_gzxjigj_fvi_hkvqrxvk}'",
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
function setupChallengeRoutes(app2) {
  app2.get("/api/challenges", async (req, res, next) => {
    try {
      const challenges3 = await storage.getAllChallenges();
      res.json(challenges3);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/challenges/:id", async (req, res, next) => {
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
  app2.post("/api/challenges/:id/submit", async (req, res, next) => {
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
      const completedChallenges3 = await storage.getUserCompletedChallenges(userId);
      const alreadyCompleted = completedChallenges3.some((c) => c.id === challengeId);
      if (alreadyCompleted) {
        return res.status(400).json({ message: "You have already completed this challenge" });
      }
      if (flag !== challenge.flag) {
        return res.status(200).json({ success: false, message: "Incorrect flag. Try again!" });
      }
      let timeToSolve = null;
      if (startTime) {
        timeToSolve = Math.floor((Date.now() - startTime) / 1e3);
      }
      let bonusPoints = 0;
      if (timeToSolve) {
        if (timeToSolve < 300) {
          bonusPoints = Math.floor(challenge.points * 0.3);
        } else if (timeToSolve < 600) {
          bonusPoints = Math.floor(challenge.points * 0.2);
        } else if (timeToSolve < 1800) {
          bonusPoints = Math.floor(challenge.points * 0.1);
        }
      }
      const totalPoints = challenge.points + bonusPoints;
      await storage.completeChallenge({
        userId,
        challengeId,
        timeToSolve,
        pointsAwarded: totalPoints
      });
      await storage.updateUserScore(userId, totalPoints);
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
  app2.get("/api/challenges/:id/hints", async (req, res, next) => {
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
  app2.get("/api/challenges/:id/team-notes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view team notes" });
      }
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      const mockNotes = [
        {
          id: 1,
          userId,
          username: req.user.username,
          content: "I think we need to look at the HTTP headers for this challenge.",
          createdAt: new Date(Date.now() - 36e5).toISOString()
        },
        {
          id: 2,
          userId: userId + 1,
          username: "teammate1",
          content: "I found something interesting in the source code. There's a hidden comment with a base64 string.",
          createdAt: new Date(Date.now() - 18e5).toISOString()
        },
        {
          id: 3,
          userId,
          username: req.user.username,
          content: "Good catch! Let me try to decode it.",
          createdAt: new Date(Date.now() - 9e5).toISOString()
        }
      ];
      res.json(mockNotes);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/challenges/:id/team-notes", async (req, res, next) => {
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
      const newNote = {
        id: Math.floor(Math.random() * 1e3),
        userId,
        username: req.user.username,
        content,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.status(201).json(newNote);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/challenges/:id/team-members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view team members" });
      }
      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
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
  app2.post("/api/challenges/:id/invite", async (req, res, next) => {
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
      res.json({ success: true, message: `Invitation sent to ${username}` });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/admin/challenges/seed", isAdmin, async (req, res, next) => {
    try {
      const results = [];
      for (const challenge of platformChallenges) {
        try {
          const challenges3 = await storage.getAllChallenges();
          const exists = challenges3.some((c) => c.title === challenge.title);
          if (exists) {
            results.push({ title: challenge.title, status: "skipped", message: "Challenge already exists" });
            continue;
          }
          const newChallenge = await storage.createChallenge(challenge);
          results.push({ title: challenge.title, status: "created", id: newChallenge.id });
        } catch (error) {
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
  app2.post("/api/admin/challenges", isAdmin, async (req, res, next) => {
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

// server/routes/contest-routes.ts
import { sql as sql2, eq as eq2 } from "drizzle-orm";
function setupContestRoutes(app2) {
  app2.get("/api/contests", async (req, res, next) => {
    try {
      const db4 = await getDb();
      const allContests = await db4.select().from(contests);
      res.json(allContests);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/contests/:id", async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.id);
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      const db4 = await getDb();
      const [contest] = await db4.select().from(contests).where(eq2(contests.id, contestId));
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      const contestWithChallenges = await getContestWithChallenges(contestId);
      res.json(contestWithChallenges);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/admin/contests", isAdmin, async (req, res, next) => {
    try {
      const { title, description, startDate, endDate, externalUrl, isExternal } = req.body;
      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const db4 = await getDb();
      const [newContest] = await db4.insert(contests).values({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        externalUrl: externalUrl || null,
        isExternal: isExternal || false,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      res.status(201).json(newContest);
    } catch (error) {
      next(error);
    }
  });
  app2.put("/api/admin/contests/:id", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.id);
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      const { title, description, startDate, endDate, externalUrl, isExternal } = req.body;
      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const db4 = await getDb();
      const [updatedContest] = await db4.update(contests).set({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        externalUrl: externalUrl || null,
        isExternal: isExternal || false
      }).where(eq2(contests.id, contestId)).returning();
      if (!updatedContest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      res.json(updatedContest);
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/admin/contests/:id", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.id);
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      const db4 = await getDb();
      await db4.delete(contestChallenges).where(eq2(contestChallenges.contestId, contestId));
      await db4.delete(contests).where(eq2(contests.id, contestId));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/admin/contests/:contestId/challenges", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const { challengeId } = req.body;
      if (isNaN(contestId) || isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid contest or challenge ID" });
      }
      const db4 = await getDb();
      const [contest] = await db4.select().from(contests).where(eq2(contests.id, contestId));
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      const [existingEntry] = await db4.select().from(contestChallenges).where(sql2`${contestChallenges.contestId} = ${contestId} AND ${contestChallenges.challengeId} = ${challengeId}`);
      if (existingEntry) {
        return res.status(400).json({ message: "Challenge is already part of this contest" });
      }
      const [newContestChallenge] = await db4.insert(contestChallenges).values({
        contestId,
        challengeId
      }).returning();
      res.status(201).json(newContestChallenge);
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/admin/contests/:contestId/challenges/:challengeId", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const challengeId = parseInt(req.params.challengeId);
      if (isNaN(contestId) || isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid contest or challenge ID" });
      }
      await db.delete(contestChallenges).where(sql2`${contestChallenges.contestId} = ${contestId} AND ${contestChallenges.challengeId} = ${challengeId}`);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/contests/:contestId/submit", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to submit flags" });
      }
      const userId = req.user.id;
      const contestId = parseInt(req.params.contestId);
      const { flag, challengeName, description, points } = req.body;
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      if (!flag || !challengeName || !points) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const [contest] = await db.select().from(contests).where(eq2(contests.id, contestId));
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      if (!contest.isExternal) {
        return res.status(400).json({ message: "Flag submissions are only allowed for external contests" });
      }
      const submission = await storage.submitExternalFlag({
        userId,
        contestId,
        challengeName,
        description: description || "",
        points,
        flag
      });
      res.json({
        success: true,
        message: "Flag submitted for review. Points will be awarded after admin verification.",
        pendingPoints: points,
        submissionId: submission.id
      });
    } catch (error) {
      next(error);
    }
  });
}
async function getContestWithChallenges(contestId) {
  const [contest] = await db.select().from(contests).where(eq2(contests.id, contestId));
  if (!contest) {
    return null;
  }
  const contestChallengeEntries = await db.select().from(contestChallenges).where(eq2(contestChallenges.contestId, contestId));
  const challengeIds = contestChallengeEntries.map((c) => c.challengeId);
  const challenges3 = [];
  for (const challengeId of challengeIds) {
    const challenge = await storage.getChallengeById(challengeId);
    if (challenge) {
      challenges3.push(challenge);
    }
  }
  return {
    ...contest,
    challenges: challenges3
  };
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  setupAdminRoutes(app2);
  await initializeAIClients();
  setupChallengeRoutes(app2);
  setupContestRoutes(app2);
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
      const validProviders = ["openai", "anthropic", "gemini", "aiml", "openrouter", "together", "groq"];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: "Invalid provider" });
      }
      if (!key || typeof key !== "string" || key.trim().length < 10) {
        return res.status(400).json({ message: "Invalid API key format" });
      }
      if (provider === "openai" && !key.startsWith("sk-")) {
        return res.status(400).json({ message: "Invalid OpenAI API key format. Keys should start with 'sk-'" });
      }
      if (provider === "anthropic" && !key.startsWith("sk-ant-")) {
        return res.status(400).json({ message: "Invalid Anthropic API key format. Keys should start with 'sk-ant-'" });
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
        if (provider === "openai") {
          await generateOpenAICompletion(messages, res);
          return;
        } else {
          res.write(`data: ${JSON.stringify({ content: "Streaming is only supported for OpenAI. Using regular response instead." })}

`);
        }
      }
      let result;
      switch (provider) {
        case "openai":
          result = await generateOpenAICompletion(messages);
          break;
        case "anthropic":
          result = await generateAnthropicCompletion(messages);
          break;
        case "gemini":
          result = await generateGeminiCompletion(messages);
          break;
        case "aiml":
          result = await generateAIMLCompletion(messages);
          break;
        case "openrouter":
          result = await generateOpenRouterCompletion(messages);
          break;
        case "together":
          result = await generateTogetherCompletion(messages);
          break;
        case "groq":
          result = await generateGroqCompletion(messages);
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
  app2.get("/api/tryhackme/challenges", async (req, res) => {
    try {
      const tryHackMeChallenges = [
        // Easy Challenges
        {
          id: "thm1",
          title: "Basic Pentesting",
          category: "Penetration Testing",
          difficulty: "easy",
          description: "This room is aimed at complete beginners. Learn the basic workflow of pentesting.",
          points: 200,
          hints: ["Start with reconnaissance", "Look for open ports", "Check for weak credentials"],
          roomUrl: "https://tryhackme.com/room/basicpentestingjt"
        },
        {
          id: "thm2",
          title: "OWASP Top 10",
          category: "Web",
          difficulty: "easy",
          description: "Learn about the OWASP Top 10 vulnerabilities in web applications.",
          points: 250,
          hints: ["Focus on understanding each vulnerability type", "Try to exploit each vulnerability"],
          roomUrl: "https://tryhackme.com/room/owasptop10"
        },
        {
          id: "thm3",
          title: "Vulnversity",
          category: "Web",
          difficulty: "easy",
          description: "Learn about active recon, web app attacks and privilege escalation.",
          points: 200,
          hints: ["Use nmap for initial scanning", "Look for upload vulnerabilities"],
          roomUrl: "https://tryhackme.com/room/vulnversity"
        },
        {
          id: "thm4",
          title: "Blue",
          category: "Exploitation",
          difficulty: "easy",
          description: "Deploy & hack into a Windows machine, exploiting EternalBlue.",
          points: 250,
          hints: ["Research MS17-010", "Use Metasploit for exploitation"],
          roomUrl: "https://tryhackme.com/room/blue"
        },
        {
          id: "thm5",
          title: "Introductory Networking",
          category: "Networking",
          difficulty: "easy",
          description: "An introduction to networking theory and basic networking tools.",
          points: 150,
          hints: ["Learn the OSI model", "Understand basic networking commands"],
          roomUrl: "https://tryhackme.com/room/introtonetworking"
        },
        // Medium Challenges
        {
          id: "thm6",
          title: "Mr Robot CTF",
          category: "Web",
          difficulty: "medium",
          description: "Based on the Mr. Robot show, can you root this box?",
          points: 350,
          hints: ["Look for hidden directories", "Check for CMS vulnerabilities"],
          roomUrl: "https://tryhackme.com/room/mrrobot"
        },
        {
          id: "thm7",
          title: "Game Zone",
          category: "Web",
          difficulty: "medium",
          description: "Learn about SQL injection, directory traversal and privilege escalation.",
          points: 300,
          hints: ["Try SQL injection on the login form", "Look for ways to escalate privileges"],
          roomUrl: "https://tryhackme.com/room/gamezone"
        },
        {
          id: "thm8",
          title: "Pickle Rick",
          category: "Web",
          difficulty: "medium",
          description: "A Rick and Morty CTF. Help Rick find the ingredients he needs.",
          points: 300,
          hints: ["Check the page source", "Look for command execution vulnerabilities"],
          roomUrl: "https://tryhackme.com/room/picklerick"
        },
        {
          id: "thm9",
          title: "RootMe",
          category: "Web",
          difficulty: "medium",
          description: "A ctf for beginners, can you root me?",
          points: 350,
          hints: ["Look for file upload vulnerabilities", "Find SUID binaries for privilege escalation"],
          roomUrl: "https://tryhackme.com/room/rrootme"
        },
        {
          id: "thm10",
          title: "Metasploit",
          category: "Exploitation",
          difficulty: "medium",
          description: "Learn to use Metasploit, a powerful penetration testing framework.",
          points: 300,
          hints: ["Learn the basic Metasploit commands", "Understand how to use exploits and payloads"],
          roomUrl: "https://tryhackme.com/room/rpmetasploit"
        },
        // Hard Challenges
        {
          id: "thm11",
          title: "HackPark",
          category: "Windows",
          difficulty: "hard",
          description: "Bruteforce a website login, use Windows Privilege Escalation techniques.",
          points: 450,
          hints: ["Use Hydra for brute forcing", "Look for scheduled tasks for privilege escalation"],
          roomUrl: "https://tryhackme.com/room/hackpark"
        },
        {
          id: "thm12",
          title: "Steel Mountain",
          category: "Windows",
          difficulty: "hard",
          description: "Hack into a Mr. Robot themed Windows machine.",
          points: 450,
          hints: ["Enumerate running services", "Look for unquoted service paths"],
          roomUrl: "https://tryhackme.com/room/steelmountain"
        },
        {
          id: "thm13",
          title: "Alfred",
          category: "Windows",
          difficulty: "hard",
          description: "Exploit Jenkins to gain an initial shell, then escalate privileges.",
          points: 500,
          hints: ["Look for default credentials", "Use PowerShell for privilege escalation"],
          roomUrl: "https://tryhackme.com/room/alfred"
        },
        {
          id: "thm14",
          title: "Skynet",
          category: "Linux",
          difficulty: "hard",
          description: "A vulnerable Terminator themed Linux machine.",
          points: 500,
          hints: ["Enumerate SMB shares", "Look for vulnerable CMS installations"],
          roomUrl: "https://tryhackme.com/room/skynet"
        },
        {
          id: "thm15",
          title: "Daily Bugle",
          category: "Web",
          difficulty: "hard",
          description: "Compromise a Joomla CMS account, practice SQL injection, and gain root access.",
          points: 550,
          hints: ["Research Joomla vulnerabilities", "Look for database credentials"],
          roomUrl: "https://tryhackme.com/room/dailybugle"
        }
      ];
      res.status(200).json(tryHackMeChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch TryHackMe challenges" });
    }
  });
  app2.post("/api/tryhackme/import", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const { challenges: challenges3 } = req.body;
      if (!Array.isArray(challenges3) || challenges3.length === 0) {
        return res.status(400).json({ message: "Invalid challenges data" });
      }
      const importedChallenges = [];
      for (const thmChallenge of challenges3) {
        const challengeData = {
          title: thmChallenge.title,
          description: thmChallenge.description,
          difficulty: thmChallenge.difficulty,
          category: thmChallenge.category,
          points: thmChallenge.points,
          flag: thmChallenge.flag || `flag{${thmChallenge.id}_placeholder}`,
          // In real implementation, admin would add correct flags
          imageUrl: thmChallenge.imageUrl || "https://images.unsplash.com/photo-1563089145-599997674d42"
        };
        try {
          const parsedData = insertChallengeSchema.parse(challengeData);
          const importedChallenge = await storage.createChallenge(parsedData);
          importedChallenges.push(importedChallenge);
        } catch (parseError) {
          console.error(`Failed to import challenge ${thmChallenge.title}:`, parseError);
        }
      }
      res.status(200).json({
        success: true,
        count: importedChallenges.length,
        challenges: importedChallenges
      });
    } catch (error) {
      console.error("Failed to import TryHackMe challenges:", error);
      res.status(500).json({ message: "Failed to import TryHackMe challenges" });
    }
  });
  app2.post("/api/tryhackme/submit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { flag, startTime, solution } = req.body;
    const challengeId = req.params.id;
    try {
      const existingChallenges = await storage.getAllChallenges();
      const challenge = existingChallenges.find((c) => c.title.includes(challengeId) || c.description.includes(challengeId));
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
          challengeId: challenge.id,
          timeToSolve: timeToSolve || null,
          pointsAwarded: totalPoints
        });
        await storage.updateUserScore(req.user.id, totalPoints);
        const newBadges = await storage.checkAndAwardBadges(req.user.id, challenge.id);
        if (solution) {
          console.log(`User ${req.user.id} submitted solution for challenge ${challenge.id}:`, solution);
          const flagData = {
            userId: req.user.id,
            username: req.user.username,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            flag,
            solution,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          console.log("Flag data to be saved:", flagData);
        }
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
      console.error("Failed to process TryHackMe submission:", error);
      res.status(500).json({ message: "Failed to process submission" });
    }
  });
  app2.get("/api/platformctf/challenges", async (req, res) => {
    try {
      const platformCTFChallenges = [
        // Easy Challenges
        {
          id: "platformctf1",
          title: "Buffer Overflow Basics",
          category: "Binary Exploitation",
          difficulty: "easy",
          description: "This challenge introduces the concept of buffer overflows. Exploit the vulnerability to get the flag.",
          points: 150,
          hints: ["Look for unbounded input functions", "What happens when you write beyond the buffer's capacity?"],
          flag_format: "flag{buffer_overflow_101}"
        },
        {
          id: "platformctf2",
          title: "Format String Vulnerability",
          category: "Binary Exploitation",
          difficulty: "easy",
          description: "Learn about format string vulnerabilities and how they can be exploited to leak memory.",
          points: 200,
          hints: ["printf() without proper formatting can be dangerous", "Try using format specifiers like %x or %p"],
          flag_format: "flag{format_strings_are_dangerous}"
        },
        {
          id: "platformctf3",
          title: "Basic Reversing",
          category: "Reverse Engineering",
          difficulty: "easy",
          description: "Analyze the assembly code to find the correct input that will give you the flag.",
          points: 175,
          hints: ["Use a disassembler like Ghidra or IDA Pro", "Look for comparison operations"],
          files: [{ name: "challenge.bin", url: "https://example.com/files/challenge.bin" }],
          flag_format: "flag{reversing_is_fun}"
        },
        {
          id: "platformctf4",
          title: "Patching Binary",
          category: "Reverse Engineering",
          difficulty: "easy",
          description: "Modify the binary to bypass the authentication check and get the flag.",
          points: 225,
          hints: ["Look for conditional jumps that check authentication", "You can use a hex editor to modify the binary"],
          files: [{ name: "auth.bin", url: "https://example.com/files/auth.bin" }],
          flag_format: "flag{binary_patching_success}"
        },
        {
          id: "platformctf5",
          title: "Simple Shellcode",
          category: "Binary Exploitation",
          difficulty: "easy",
          description: "Write a simple shellcode to execute /bin/sh and get the flag.",
          points: 250,
          hints: ["Look up shellcode examples online", "Remember to handle null bytes"],
          files: [{ name: "shellcode.c", url: "https://example.com/files/shellcode.c" }],
          flag_format: "flag{shellcode_execution_success}"
        },
        // Medium Challenges
        {
          id: "platformctf6",
          title: "Return-Oriented Programming",
          category: "Binary Exploitation",
          difficulty: "medium",
          description: "Use ROP techniques to bypass non-executable stack protection and get the flag.",
          points: 350,
          hints: ["Identify useful gadgets in the binary", "Chain them together to execute your payload"],
          files: [{ name: "rop_challenge.bin", url: "https://example.com/files/rop_challenge.bin" }],
          flag_format: "flag{rop_chain_success}"
        },
        {
          id: "platformctf7",
          title: "Heap Exploitation",
          category: "Binary Exploitation",
          difficulty: "medium",
          description: "Exploit heap vulnerabilities like use-after-free or double-free to get the flag.",
          points: 400,
          hints: ["Look for memory management bugs", "Understand how the heap allocator works"],
          files: [{ name: "heap_challenge.c", url: "https://example.com/files/heap_challenge.c" }],
          flag_format: "flag{heap_exploitation_success}"
        },
        {
          id: "platformctf8",
          title: "Anti-Debugging Techniques",
          category: "Reverse Engineering",
          difficulty: "medium",
          description: "Bypass anti-debugging techniques to analyze the binary and find the flag.",
          points: 375,
          hints: ["Look for ptrace calls or timing checks", "You might need to patch the binary"],
          files: [{ name: "anti_debug.bin", url: "https://example.com/files/anti_debug.bin" }],
          flag_format: "flag{anti_debugging_bypassed}"
        },
        {
          id: "platformctf9",
          title: "Custom Encryption Algorithm",
          category: "Cryptography",
          difficulty: "medium",
          description: "Reverse engineer a custom encryption algorithm and decrypt the flag.",
          points: 325,
          hints: ["Break down the algorithm step by step", "Look for weaknesses in the implementation"],
          files: [{ name: "encrypt.py", url: "https://example.com/files/encrypt.py" }],
          flag_format: "flag{custom_crypto_broken}"
        },
        {
          id: "platformctf10",
          title: "Kernel Module Analysis",
          category: "Reverse Engineering",
          difficulty: "medium",
          description: "Analyze a Linux kernel module to find vulnerabilities and extract the flag.",
          points: 425,
          hints: ["Look for improper IOCTL handlers", "Check for missing input validation"],
          files: [{ name: "kernel_mod.ko", url: "https://example.com/files/kernel_mod.ko" }],
          flag_format: "flag{kernel_vulnerability_found}"
        },
        // Hard Challenges
        {
          id: "platformctf11",
          title: "Advanced Exploitation",
          category: "Binary Exploitation",
          difficulty: "hard",
          description: "Combine multiple exploitation techniques to bypass all protections and get the flag.",
          points: 500,
          hints: ["You'll need to bypass ASLR, NX, and stack canaries", "Look for information leaks"],
          files: [{ name: "advanced_exploit.bin", url: "https://example.com/files/advanced_exploit.bin" }],
          flag_format: "flag{advanced_exploitation_master}"
        },
        {
          id: "platformctf12",
          title: "VM Escape",
          category: "Binary Exploitation",
          difficulty: "hard",
          description: "Escape from a virtual machine to access the host system and find the flag.",
          points: 550,
          hints: ["Look for vulnerabilities in the VM's implementation", "Focus on the interface between guest and host"],
          files: [{ name: "vm.zip", url: "https://example.com/files/vm.zip" }],
          flag_format: "flag{vm_escape_success}"
        },
        {
          id: "platformctf13",
          title: "Obfuscated Code Analysis",
          category: "Reverse Engineering",
          difficulty: "hard",
          description: "Analyze heavily obfuscated code to understand its functionality and find the flag.",
          points: 475,
          hints: ["Look for patterns in the obfuscation", "Try to simplify the code step by step"],
          files: [{ name: "obfuscated.js", url: "https://example.com/files/obfuscated.js" }],
          flag_format: "flag{obfuscation_defeated}"
        },
        {
          id: "platformctf14",
          title: "Side-Channel Attack",
          category: "Cryptography",
          difficulty: "hard",
          description: "Exploit timing or power analysis side-channels to extract the encryption key and decrypt the flag.",
          points: 525,
          hints: ["Measure execution time for different inputs", "Look for patterns in the timing differences"],
          files: [{ name: "side_channel.py", url: "https://example.com/files/side_channel.py" }],
          flag_format: "flag{side_channel_attack_success}"
        },
        {
          id: "platformctf15",
          title: "Custom CPU Architecture",
          category: "Reverse Engineering",
          difficulty: "hard",
          description: "Reverse engineer a custom CPU architecture and emulator to understand the program and find the flag.",
          points: 600,
          hints: ["First understand the instruction set", "Then analyze the program logic"],
          files: [{ name: "custom_cpu.zip", url: "https://example.com/files/custom_cpu.zip" }],
          flag_format: "flag{custom_architecture_mastered}"
        }
      ];
      res.status(200).json(platformCTFChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Platform CTF challenges" });
    }
  });
  app2.post("/api/platformctf/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { challengeId, flag, startTime, solution } = req.body;
    try {
      const existingChallenges = await storage.getAllChallenges();
      const challenge = existingChallenges.find((c) => c.title.includes(challengeId) || c.description.includes(challengeId));
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
          challengeId: challenge.id,
          timeToSolve: timeToSolve || null,
          pointsAwarded: totalPoints
        });
        await storage.updateUserScore(req.user.id, totalPoints);
        const newBadges = await storage.checkAndAwardBadges(req.user.id, challenge.id);
        if (solution) {
          console.log(`User ${req.user.id} submitted solution for challenge ${challenge.id}:`, solution);
          const flagData = {
            userId: req.user.id,
            username: req.user.username,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            flag,
            solution,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          console.log("Flag data to be saved:", flagData);
        }
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
      console.error("Failed to process Platform CTF submission:", error);
      res.status(500).json({ message: "Failed to process submission" });
    }
  });
  app2.get("/api/picoctf/challenges", async (req, res) => {
    try {
      const picoCTFChallenges = [
        // Easy Challenges
        {
          id: "pico1",
          title: "Obedient Cat",
          category: "General Skills",
          difficulty: "easy",
          description: "This file has a flag in plain sight (aka 'in-the-clear'). Download flag.",
          points: 100,
          hints: ["Any hints about how to solve this challenge would be included here."],
          files: [{ name: "flag", url: "https://mercury.picoctf.net/static/0e428b2db9788d31189329bed089ce98/flag" }]
        },
        {
          id: "pico2",
          title: "Mod 26",
          category: "Cryptography",
          difficulty: "easy",
          description: "Cryptography can be easy, do you know what ROT13 is?",
          points: 150,
          hints: ["This can be solved online if you don't want to do it by hand!"],
          flag_format: "cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_MAZyqFQj}"
        },
        {
          id: "pico3",
          title: "Python Wrangling",
          category: "General Skills",
          difficulty: "easy",
          description: "Python scripts are invoked with `python3 script.py` and help can be output with `python3 script.py -h`.",
          points: 200,
          hints: ["Get the Python script access to read the password, then use the script to decode it."],
          files: [
            { name: "ende.py", url: "https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/ende.py" },
            { name: "flag.txt.en", url: "https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/flag.txt.en" },
            { name: "pw.txt", url: "https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/pw.txt" }
          ]
        },
        {
          id: "pico4",
          title: "Wave a flag",
          category: "General Skills",
          difficulty: "easy",
          description: "Can you invoke help flags for a command-line program?",
          points: 200,
          hints: ["This program will only work in the webshell or another Linux computer.", "To get the file accessible in your shell, enter the following in the Terminal prompt: `wget https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm`", "Run this program by entering the following in the Terminal prompt: `./warm`, but you'll first have to make it executable with `chmod +x warm`", "The chmod +x command allows the program to be executed."],
          files: [{ name: "warm", url: "https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm" }]
        },
        {
          id: "pico5",
          title: "Nice netcat...",
          category: "General Skills",
          difficulty: "easy",
          description: "There is a nice program that you can talk to by using this command in a shell: $ nc mercury.picoctf.net 43239, but it doesn't speak English...",
          points: 150,
          hints: ["You can practice using netcat with this picoGym problem: https://play.picoctf.org/practice/challenge/34", "You can practice reading and writing ASCII with this picoGym problem: https://play.picoctf.org/practice/challenge/22"]
        },
        {
          id: "pico6",
          title: "Static ain't always noise",
          category: "General Skills",
          difficulty: "easy",
          description: "Can you look at the data in this binary: static? This BASH script might help!",
          points: 150,
          hints: ["Any strings in the binary?"],
          files: [
            { name: "static", url: "https://mercury.picoctf.net/static/bc72945175d643626d6ea9a689672dbd/static" },
            { name: "ltdis.sh", url: "https://mercury.picoctf.net/static/bc72945175d643626d6ea9a689672dbd/ltdis.sh" }
          ]
        },
        // Medium Challenges
        {
          id: "pico7",
          title: "Information",
          category: "Forensics",
          difficulty: "medium",
          description: "Files can always be changed in a secret way. Can you find the flag?",
          points: 300,
          hints: ["Look at the details of the file", "Make sure to submit the flag as picoCTF{XXXXX}"],
          files: [{ name: "cat.jpg", url: "https://mercury.picoctf.net/static/a614a27d4cb251d04c7d2f3f3f76a965/cat.jpg" }]
        },
        {
          id: "pico8",
          title: "Transformation",
          category: "Reverse Engineering",
          difficulty: "medium",
          description: "I wonder what this really is... enc ''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])",
          points: 300,
          hints: ["You may find some decoders online"],
          files: [{ name: "enc", url: "https://mercury.picoctf.net/static/77a2b202236aa741e988581e78d277a6/enc" }]
        },
        {
          id: "pico9",
          title: "Stonks",
          category: "Binary Exploitation",
          difficulty: "medium",
          description: "I decided to try something noone else has before. I made a bot to automatically trade stonks for me using AI and machine learning. I wouldn't believe you if you told me it's unsecure!",
          points: 350,
          hints: ["Okay, maybe I'd believe you if you find my API key"],
          files: [
            { name: "vuln.c", url: "https://mercury.picoctf.net/static/e4d297ce964e4f54225786fe7b153b4b/vuln.c" },
            { name: "Makefile", url: "https://mercury.picoctf.net/static/e4d297ce964e4f54225786fe7b153b4b/Makefile" }
          ]
        },
        {
          id: "pico10",
          title: "Mind your Ps and Qs",
          category: "Cryptography",
          difficulty: "medium",
          description: "In RSA, a small e value can be problematic, but what about N? Can you decrypt this?",
          points: 400,
          hints: ["Bits are expensive, I used only a little bit over 100 to save money"],
          files: [{ name: "values", url: "https://mercury.picoctf.net/static/b9ddda080c56fb421bf30409bec3460c/values" }]
        },
        {
          id: "pico11",
          title: "Cookies",
          category: "Web Exploitation",
          difficulty: "medium",
          description: "Who doesn't love cookies? Try to figure out the best one.",
          points: 300,
          hints: ["Apply your browser developer tools"]
        },
        // Hard Challenges
        {
          id: "pico12",
          title: "Wireshark doo dooo do doo...",
          category: "Forensics",
          difficulty: "hard",
          description: "Can you find the flag? shark1.pcapng.",
          points: 450,
          hints: ["All these protocols, so little time"],
          files: [{ name: "shark1.pcapng", url: "https://mercury.picoctf.net/static/81c7862241faf4a48bd64a858392c92b/shark1.pcapng" }]
        },
        {
          id: "pico13",
          title: "Scrambled: RSA",
          category: "Cryptography",
          difficulty: "hard",
          description: "Hmmm I wonder if you have a big enough brain to decrypt this?",
          points: 500,
          hints: ["RSA encryption is based on the difficulty of factoring large numbers", "The decryption is based on Euler's Theorem"],
          files: [{ name: "scrambled.py", url: "https://mercury.picoctf.net/static/3cfdd6592d2b0cd30041f22b3d8c1d84/scrambled.py" }]
        },
        {
          id: "pico14",
          title: "Some Assembly Required 2",
          category: "Web Exploitation",
          difficulty: "hard",
          description: "There is some assembly required. Can you get the flag?",
          points: 550,
          hints: ["Analyze the WebAssembly code"]
        },
        {
          id: "pico15",
          title: "Reverse Engineering: ARMssembly 3",
          category: "Reverse Engineering",
          difficulty: "hard",
          description: "What integer does this program print with argument 4189673334? File: chall_3.S",
          points: 500,
          hints: ["Shifts are useful in ARM assembly"],
          files: [{ name: "chall_3.S", url: "https://mercury.picoctf.net/static/e7b2d6ff8e55b64ddd2c7c361709e2a9/chall_3.S" }]
        }
      ];
      res.status(200).json(picoCTFChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PicoCTF challenges" });
    }
  });
  app2.post("/api/picoctf/import", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const { challenges: challenges3 } = req.body;
      if (!Array.isArray(challenges3) || challenges3.length === 0) {
        return res.status(400).json({ message: "Invalid challenges data" });
      }
      const importedChallenges = [];
      for (const picoChallenge of challenges3) {
        const challengeData = {
          title: picoChallenge.title,
          description: picoChallenge.description,
          difficulty: picoChallenge.difficulty,
          category: picoChallenge.category,
          points: picoChallenge.points,
          flag: picoChallenge.flag || `flag{${picoChallenge.id}_placeholder}`,
          // In real implementation, admin would add correct flags
          imageUrl: picoChallenge.files && picoChallenge.files.length > 0 ? picoChallenge.files[0].url : "https://images.unsplash.com/photo-1557853197-aefb550b6fdc"
        };
        try {
          const parsedData = insertChallengeSchema.parse(challengeData);
          const importedChallenge = await storage.createChallenge(parsedData);
          importedChallenges.push(importedChallenge);
        } catch (parseError) {
          console.error(`Failed to import challenge ${picoChallenge.title}:`, parseError);
        }
      }
      res.status(200).json({
        success: true,
        count: importedChallenges.length,
        challenges: importedChallenges
      });
    } catch (error) {
      console.error("Failed to import PicoCTF challenges:", error);
      res.status(500).json({ message: "Failed to import PicoCTF challenges" });
    }
  });
  app2.post("/api/picoctf/submit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { flag, startTime } = req.body;
    const challengeId = req.params.id;
    try {
      const existingChallenges = await storage.getAllChallenges();
      const challenge = existingChallenges.find((c) => c.title.includes(challengeId) || c.description.includes(challengeId));
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
          challengeId: challenge.id,
          timeToSolve: timeToSolve || null,
          pointsAwarded: totalPoints
        });
        await storage.updateUserScore(req.user.id, totalPoints);
        const newBadges = await storage.checkAndAwardBadges(req.user.id, challenge.id);
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
      console.error("Failed to process PicoCTF submission:", error);
      res.status(500).json({ message: "Failed to process submission" });
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
var db3;
var connectedPool = false;
if (!useMySQL && hasPostgresUrl) {
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
  db3 = drizzlePg(pgPool, { schema: schema_exports });
}
if (useMySQL) {
  const dbConfig = hasMysqlUrl ? process.env.MYSQL_DATABASE_URL : {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "glowctf_user",
    password: process.env.DB_PASSWORD || "Maruf078692",
    database: process.env.DB_NAME || "glowctf",
    port: parseInt(process.env.DB_PORT || "3306")
  };
  console.log("Using MySQL database configuration");
}
var checkConnection = async () => {
  if (useMySQL) {
    try {
      const dbConfig = hasMysqlUrl ? process.env.MYSQL_DATABASE_URL : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "glowctf_user",
        password: process.env.DB_PASSWORD || "Maruf078692",
        database: process.env.DB_NAME || "glowctf",
        port: parseInt(process.env.DB_PORT || "3306")
      };
      mysqlConnection = await mysql2.createConnection(dbConfig);
      await mysqlConnection.execute("SELECT 1");
      if (!db3) {
        db3 = drizzleMysql(mysqlConnection, { schema: mysql_schema_exports, mode: "default" });
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
