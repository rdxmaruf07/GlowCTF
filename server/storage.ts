// This file implements the storage interface using PostgreSQL (Neon Serverless)
// This is the primary storage implementation used by the application
// For MySQL implementation, see mysql-storage.ts

import { 
  users, type User, type InsertUser,
  challenges, type Challenge, type InsertChallenge,
  completedChallenges, type CompletedChallenge, type InsertCompletedChallenge,
  badges, type Badge, type InsertBadge,
  userBadges, type UserBadge, type InsertUserBadge,
  chatbotKeys, type ChatbotKey, type InsertChatbotKey,
  chatHistory, type ChatHistory, type InsertChatHistory,
  contests, type Contest, type InsertContest,
  contestChallenges, type ContestChallenge, type InsertContestChallenge,
  externalFlagSubmissions, type ExternalFlagSubmission, type InsertExternalFlagSubmission
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, asc, desc, sql, and, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from './db';

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

interface UserStats {
  rank: number;
  totalPoints: number;
  challengesSolved: number;
  badgesEarned: number;
  streak: number;
}

interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  badges: Badge[];
  solvedChallenges: number;
  rank: number;
  avatarUrl?: string;
}

export interface IStorage {
  // Session store
  sessionStore: any;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, points: number): Promise<User>;
  updateUserBanStatus(userId: number, isBanned: boolean): Promise<User>;
  updateUserAvatar(userId: number, avatarUrl: string): Promise<User>;
  updateUserLastActive(userId: number): Promise<void>;
  getUserStats(userId: number): Promise<UserStats>;
  getAllUsers(): Promise<User[]>;
  
  // Challenge methods
  getAllChallenges(): Promise<Challenge[]>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Completed challenges methods
  completeChallenge(data: InsertCompletedChallenge): Promise<CompletedChallenge>;
  getUserCompletedChallenges(userId: number): Promise<Challenge[]>;
  
  // Badge methods
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<Badge[]>;
  awardBadge(data: InsertUserBadge): Promise<UserBadge>;
  checkAndAwardBadges(userId: number, challengeId: number): Promise<Badge[]>;
  
  // Chatbot methods
  saveChatbotKey(data: InsertChatbotKey): Promise<ChatbotKey>;
  getUserChatbotKeys(userId: number): Promise<ChatbotKey[]>;
  getAllChatbotKeys(): Promise<ChatbotKey[]>;
  getChatbotKeyByProvider(provider: string): Promise<ChatbotKey | undefined>;
  updateChatbotKey(id: number, data: { apiKey?: string; isActive?: boolean }): Promise<ChatbotKey>;
  deleteChatbotKey(id: number): Promise<void>;
  saveChatHistory(data: InsertChatHistory): Promise<ChatHistory>;
  getUserChatHistory(userId: number): Promise<ChatHistory[]>;
  
  // Leaderboard methods
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  
  // Contest methods
  getAllContests(): Promise<Contest[]>;
  getContestById(id: number): Promise<Contest | undefined>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, data: Partial<InsertContest>): Promise<Contest>;
  deleteContest(id: number): Promise<void>;
  
  // Contest challenges methods
  addChallengeToContest(data: InsertContestChallenge): Promise<ContestChallenge>;
  removeChallengeFromContest(contestId: number, challengeId: number): Promise<void>;
  getContestChallenges(contestId: number): Promise<Challenge[]>;
  
  // External flag submission methods
  submitExternalFlag(data: InsertExternalFlagSubmission): Promise<ExternalFlagSubmission>;
  getExternalFlagSubmissions(contestId: number): Promise<ExternalFlagSubmission[]>;
  getUserExternalFlagSubmissions(userId: number): Promise<ExternalFlagSubmission[]>;
  reviewExternalFlagSubmission(id: number, reviewerId: number, status: string): Promise<ExternalFlagSubmission>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    // Optimize session store for Neon serverless PostgreSQL
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      // Optimize session table configuration for Neon serverless
      tableName: 'session', // Default table name
      schemaName: 'public', // Default schema
      // Optimize session cleanup
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes (in seconds)
      // Optimize session data handling
      errorLog: (err) => console.error('Session store error:', err),
      // Optimize session table columns
      columnNames: {
        session_id: 'sid',
        session_data: 'sess',
        expire: 'expire'
      }
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserScore(userId: number, points: number): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    
    const [updatedUser] = await db
      .update(users)
      .set({ score: user.score + points })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async updateUserBanStatus(userId: number, isBanned: boolean): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ isBanned })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }
  
  async updateUserAvatar(userId: number, avatarUrl: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }
  
  async updateUserLastActive(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, userId));
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUserStats(userId: number): Promise<UserStats> {
    // Optimize user stats query for Neon serverless PostgreSQL
    // Use a single query to get user rank, completed challenges count, and badges count
    const statsQuery = await db.execute(sql`
      WITH user_ranks AS (
        SELECT id, score, RANK() OVER (ORDER BY score DESC) as rank 
        FROM ${users}
      ),
      user_completed_challenges AS (
        SELECT COUNT(*) as challenges_solved
        FROM ${completedChallenges}
        WHERE user_id = ${userId}
      ),
      user_badges AS (
        SELECT COUNT(*) as badges_earned
        FROM ${userBadges}
        WHERE user_id = ${userId}
      )
      SELECT 
        ur.rank,
        u.score as total_points,
        COALESCE(ucc.challenges_solved, 0) as challenges_solved,
        COALESCE(ub.badges_earned, 0) as badges_earned
      FROM ${users} u
      JOIN user_ranks ur ON u.id = ur.id
      LEFT JOIN user_completed_challenges ucc ON 1=1
      LEFT JOIN user_badges ub ON 1=1
      WHERE u.id = ${userId}
    `);
    
    if (statsQuery.rows.length === 0) {
      throw new Error("User not found");
    }
    
    const stats = statsQuery.rows[0] as any;
    
    // Calculate streak based on user activity
    let streak = 0;
    
    // Get the most recent completed challenges for streak calculation
    // This is kept as a separate query as it's more complex
    const recentChallenges = await db
      .select()
      .from(completedChallenges)
      .where(eq(completedChallenges.userId, userId))
      .orderBy(desc(completedChallenges.completedAt))
      .limit(30); // Get last 30 days of activity
    
    if (recentChallenges.length > 0) {
      // Check if user has activity today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const hasActivityToday = recentChallenges.some(challenge => {
        const challengeDate = new Date(challenge.completedAt);
        challengeDate.setHours(0, 0, 0, 0);
        return challengeDate.getTime() === today.getTime();
      });
      
      // Start with 1 for today if there's activity
      streak = hasActivityToday ? 1 : 0;
      
      // Check previous days
      let currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday
      
      while (true) {
        const currentDateStart = new Date(currentDate);
        currentDateStart.setHours(0, 0, 0, 0);
        
        const hasActivity = recentChallenges.some(challenge => {
          const challengeDate = new Date(challenge.completedAt);
          challengeDate.setHours(0, 0, 0, 0);
          return challengeDate.getTime() === currentDateStart.getTime();
        });
        
        if (hasActivity) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      // If no activity today but had activity yesterday, still count the streak
      if (streak === 0) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const hasActivityYesterday = recentChallenges.some(challenge => {
          const challengeDate = new Date(challenge.completedAt);
          challengeDate.setHours(0, 0, 0, 0);
          return challengeDate.getTime() === yesterday.getTime();
        });
        
        if (hasActivityYesterday) {
          streak = 1;
        }
      }
    }
    
    // Ensure streak is at least 1 if user has any completed challenges
    streak = Math.max(streak, stats.challenges_solved > 0 ? 1 : 0);
    
    // Update user's last active timestamp if needed
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user && user.lastActive === null) {
      await this.updateUserLastActive(userId);
    }
    
    return {
      rank: Number(stats.rank),
      totalPoints: Number(stats.total_points),
      challengesSolved: Number(stats.challenges_solved),
      badgesEarned: Number(stats.badges_earned),
      streak: streak
    };
  }
  
  // Challenge methods
  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }
  
  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge || undefined;
  }
  
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges).values(insertChallenge).returning();
    return challenge;
  }
  
  // Completed challenges methods
  async completeChallenge(data: InsertCompletedChallenge): Promise<CompletedChallenge> {
    const [completed] = await db.insert(completedChallenges).values(data).returning();
    
    // Update challenge solve count
    await db
      .update(challenges)
      .set({ solveCount: sql`${challenges.solveCount} + 1` })
      .where(eq(challenges.id, data.challengeId));
    
    return completed;
  }
  
  async getUserCompletedChallenges(userId: number): Promise<Challenge[]> {
    // Optimize query for Neon serverless PostgreSQL using a JOIN instead of multiple queries
    return await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        category: challenges.category,
        points: challenges.points,
        flag: challenges.flag,
        solveCount: challenges.solveCount,
        createdAt: challenges.createdAt,
        imageUrl: challenges.imageUrl
      })
      .from(completedChallenges)
      .innerJoin(challenges, eq(completedChallenges.challengeId, challenges.id))
      .where(eq(completedChallenges.userId, userId));
  }
  
  // Badge methods
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }
  
  async getUserBadges(userId: number): Promise<Badge[]> {
    // Optimize query for Neon serverless PostgreSQL using a JOIN instead of multiple queries
    return await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        imageUrl: badges.imageUrl,
        requirement: badges.requirement
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }
  
  async awardBadge(data: InsertUserBadge): Promise<UserBadge> {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, data.userId),
          eq(userBadges.badgeId, data.badgeId)
        )
      );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const [userBadge] = await db.insert(userBadges).values(data).returning();
    return userBadge;
  }
  
  async checkAndAwardBadges(userId: number, challengeId: number): Promise<Badge[]> {
    // Get the user's completed challenges
    const completedChallengesCount = await db.select({
      count: sql<number>`count(*)`
    }).from(completedChallenges)
      .where(eq(completedChallenges.userId, userId));
    
    const count = completedChallengesCount[0]?.count || 0;
    
    // Get the challenge category
    const challenge = await this.getChallengeById(challengeId);
    
    if (!challenge) {
      return [];
    }
    
    // Get category-specific challenges completed
    const categoryChallengesCount = await db.select({
      count: sql<number>`count(*)`
    }).from(completedChallenges)
      .innerJoin(challenges, eq(completedChallenges.challengeId, challenges.id))
      .where(
        and(
          eq(completedChallenges.userId, userId),
          eq(challenges.category, challenge.category)
        )
      );
    
    const categoryCount = categoryChallengesCount[0]?.count || 0;
    
    // Get difficulty-specific challenges completed
    const difficultyChallengesCount = await db.select({
      count: sql<number>`count(*)`
    }).from(completedChallenges)
      .innerJoin(challenges, eq(completedChallenges.challengeId, challenges.id))
      .where(
        and(
          eq(completedChallenges.userId, userId),
          eq(challenges.difficulty, challenge.difficulty)
        )
      );
    
    const difficultyCount = difficultyChallengesCount[0]?.count || 0;
    
    // Get user's total score
    const user = await this.getUser(userId);
    const userScore = user?.score || 0;
    
    // Get all badges
    const allBadges = await this.getAllBadges();
    
    // Get user's existing badges
    const userBadges = await this.getUserBadges(userId);
    const userBadgeIds = userBadges.map(badge => badge.id);
    
    // Check which badges should be awarded
    const badgesToAward = allBadges.filter(badge => {
      // Skip if user already has this badge
      if (userBadgeIds.includes(badge.id)) {
        return false;
      }
      
      // First blood (first to solve a challenge)
      if (badge.requirement === 'first-blood' && challenge.solveCount === 0) {
        return true;
      }
      
      // Milestone badges - challenges solved
      if (badge.requirement === 'solve-1' && count >= 1) {
        return true;
      }
      
      if (badge.requirement === 'solve-5' && count >= 5) {
        return true;
      }
      
      if (badge.requirement === 'solve-10' && count >= 10) {
        return true;
      }
      
      if (badge.requirement === 'solve-25' && count >= 25) {
        return true;
      }
      
      if (badge.requirement === 'solve-50' && count >= 50) {
        return true;
      }
      
      if (badge.requirement === 'solve-100' && count >= 100) {
        return true;
      }
      
      // Category specialist badges
      if (badge.requirement === `category-${challenge.category}-3` && categoryCount >= 3) {
        return true;
      }
      
      if (badge.requirement === `category-${challenge.category}-5` && categoryCount >= 5) {
        return true;
      }
      
      if (badge.requirement === `category-${challenge.category}-10` && categoryCount >= 10) {
        return true;
      }
      
      // Difficulty milestone badges
      if (badge.requirement === `difficulty-${challenge.difficulty}-3` && difficultyCount >= 3) {
        return true;
      }
      
      if (badge.requirement === `difficulty-${challenge.difficulty}-5` && difficultyCount >= 5) {
        return true;
      }
      
      if (badge.requirement === `difficulty-${challenge.difficulty}-10` && difficultyCount >= 10) {
        return true;
      }
      
      // Score milestone badges
      if (badge.requirement === 'score-1000' && userScore >= 1000) {
        return true;
      }
      
      if (badge.requirement === 'score-5000' && userScore >= 5000) {
        return true;
      }
      
      if (badge.requirement === 'score-10000' && userScore >= 10000) {
        return true;
      }
      
      if (badge.requirement === 'score-25000' && userScore >= 25000) {
        return true;
      }
      
      if (badge.requirement === 'score-50000' && userScore >= 50000) {
        return true;
      }
      
      return false;
    });
    
    // Award badges
    const awardedBadges = await Promise.all(
      badgesToAward.map(async badge => {
        await this.awardBadge({
          userId,
          badgeId: badge.id
        });
        return badge;
      })
    );
    
    return awardedBadges;
  }
  
  // Chatbot methods
  async saveChatbotKey(data: InsertChatbotKey): Promise<ChatbotKey> {
    const [key] = await db.insert(chatbotKeys).values(data).returning();
    return key;
  }
  
  async getUserChatbotKeys(userId: number): Promise<ChatbotKey[]> {
    return await db
      .select()
      .from(chatbotKeys)
      .where(eq(chatbotKeys.userId, userId));
  }
  
  async getAllChatbotKeys(): Promise<ChatbotKey[]> {
    return await db.select().from(chatbotKeys);
  }
  
  async getChatbotKeyByProvider(provider: string): Promise<ChatbotKey | undefined> {
    const [key] = await db.select().from(chatbotKeys).where(eq(chatbotKeys.provider, provider));
    return key;
  }
  
  async updateChatbotKey(id: number, data: { apiKey?: string; isActive?: boolean }): Promise<ChatbotKey> {
    const updateData: any = {};
    
    if (data.apiKey !== undefined) {
      updateData.apiKey = data.apiKey;
    }
    
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    
    const [updated] = await db
      .update(chatbotKeys)
      .set(updateData)
      .where(eq(chatbotKeys.id, id))
      .returning();
      
    return updated;
  }
  
  async deleteChatbotKey(id: number): Promise<void> {
    await db.delete(chatbotKeys).where(eq(chatbotKeys.id, id));
  }
  
  async saveChatHistory(data: InsertChatHistory): Promise<ChatHistory> {
    const [history] = await db.insert(chatHistory).values(data).returning();
    return history;
  }
  
  async getUserChatHistory(userId: number): Promise<ChatHistory[]> {
    return await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(desc(chatHistory.createdAt));
  }
  
  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Optimize leaderboard query for Neon serverless PostgreSQL
    // Use a single query with joins to reduce round trips to the database
    const leaderboardQuery = await db.execute(sql`
      WITH ranked_users AS (
        SELECT 
          u.id, 
          u.username, 
          u.score, 
          u.avatar_url,
          RANK() OVER (ORDER BY u.score DESC) as rank,
          COUNT(DISTINCT cc.id) as solved_challenges_count
        FROM ${users} u
        LEFT JOIN ${completedChallenges} cc ON u.id = cc.user_id
        WHERE u.is_banned = false
        GROUP BY u.id, u.username, u.score, u.avatar_url
        ORDER BY rank ASC
        LIMIT 100
      )
      SELECT * FROM ranked_users
    `);
    
    const leaderboard = [];
    
    for (const userRank of leaderboardQuery.rows as any[]) {
      // Get badges in a separate query since they can't be easily joined
      const badges = await this.getUserBadges(userRank.id);
      
      leaderboard.push({
        id: userRank.id,
        username: userRank.username,
        score: userRank.score,
        badges,
        solvedChallenges: Number(userRank.solved_challenges_count),
        rank: Number(userRank.rank),
        avatarUrl: userRank.avatar_url
      });
    }
    
    return leaderboard;
  }
  
  // Contest methods
  async getAllContests(): Promise<Contest[]> {
    return await db.select().from(contests);
  }
  
  async getContestById(id: number): Promise<Contest | undefined> {
    const [contest] = await db.select().from(contests).where(eq(contests.id, id));
    return contest || undefined;
  }
  
  async createContest(insertContest: InsertContest): Promise<Contest> {
    const [contest] = await db.insert(contests).values(insertContest).returning();
    return contest;
  }
  
  async updateContest(id: number, data: Partial<InsertContest>): Promise<Contest> {
    const [contest] = await db
      .update(contests)
      .set(data)
      .where(eq(contests.id, id))
      .returning();
      
    if (!contest) throw new Error("Contest not found");
    return contest;
  }
  
  async deleteContest(id: number): Promise<void> {
    // First delete all contest-challenge associations
    await db
      .delete(contestChallenges)
      .where(eq(contestChallenges.contestId, id));
    
    // Then delete the contest
    await db
      .delete(contests)
      .where(eq(contests.id, id));
  }
  
  // Contest challenges methods
  async addChallengeToContest(data: InsertContestChallenge): Promise<ContestChallenge> {
    // Check if already exists
    const [existing] = await db
      .select()
      .from(contestChallenges)
      .where(
        and(
          eq(contestChallenges.contestId, data.contestId),
          eq(contestChallenges.challengeId, data.challengeId)
        )
      );
    
    if (existing) {
      return existing;
    }
    
    const [contestChallenge] = await db
      .insert(contestChallenges)
      .values(data)
      .returning();
      
    return contestChallenge;
  }
  
  async removeChallengeFromContest(contestId: number, challengeId: number): Promise<void> {
    await db
      .delete(contestChallenges)
      .where(
        and(
          eq(contestChallenges.contestId, contestId),
          eq(contestChallenges.challengeId, challengeId)
        )
      );
  }
  
  async getContestChallenges(contestId: number): Promise<Challenge[]> {
    // Optimize query for Neon serverless PostgreSQL using a JOIN instead of multiple queries
    return await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        category: challenges.category,
        points: challenges.points,
        flag: challenges.flag,
        solveCount: challenges.solveCount,
        createdAt: challenges.createdAt,
        imageUrl: challenges.imageUrl
      })
      .from(contestChallenges)
      .innerJoin(challenges, eq(contestChallenges.challengeId, challenges.id))
      .where(eq(contestChallenges.contestId, contestId));
  }
  
  // External flag submission methods
  async submitExternalFlag(data: InsertExternalFlagSubmission): Promise<ExternalFlagSubmission> {
    const [submission] = await db
      .insert(externalFlagSubmissions)
      .values(data)
      .returning();
      
    return submission;
  }
  
  async getExternalFlagSubmissions(contestId: number): Promise<ExternalFlagSubmission[]> {
    return await db
      .select()
      .from(externalFlagSubmissions)
      .where(eq(externalFlagSubmissions.contestId, contestId))
      .orderBy(desc(externalFlagSubmissions.createdAt));
  }
  
  async getUserExternalFlagSubmissions(userId: number): Promise<ExternalFlagSubmission[]> {
    return await db
      .select()
      .from(externalFlagSubmissions)
      .where(eq(externalFlagSubmissions.userId, userId))
      .orderBy(desc(externalFlagSubmissions.createdAt));
  }
  
  async reviewExternalFlagSubmission(id: number, reviewerId: number, status: string): Promise<ExternalFlagSubmission> {
    const [submission] = await db
      .update(externalFlagSubmissions)
      .set({
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date()
      })
      .where(eq(externalFlagSubmissions.id, id))
      .returning();
      
    if (!submission) {
      throw new Error("Flag submission not found");
    }
    
    // If approved, award points to the user
    if (status === "approved") {
      await this.updateUserScore(submission.userId, submission.points);
    }
    
    return submission;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();