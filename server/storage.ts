import { 
  users, type User, type InsertUser,
  challenges, type Challenge, type InsertChallenge,
  completedChallenges, type CompletedChallenge, type InsertCompletedChallenge,
  badges, type Badge, type InsertBadge,
  userBadges, type UserBadge, type InsertUserBadge,
  chatbotKeys, type ChatbotKey, type InsertChatbotKey,
  chatHistory, type ChatHistory, type InsertChatHistory
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
  getUserStats(userId: number): Promise<UserStats>;
  
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
  updateChatbotKey(id: number, data: { key?: string; isActive?: boolean }): Promise<ChatbotKey>;
  deleteChatbotKey(id: number): Promise<void>;
  saveChatHistory(data: InsertChatHistory): Promise<ChatHistory>;
  getUserChatHistory(userId: number): Promise<ChatHistory[]>;
  
  // Leaderboard methods
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
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
  
  async getUserStats(userId: number): Promise<UserStats> {
    // Get user rank based on score
    const userRanksResult = await db.execute(sql`
      SELECT id, RANK() OVER (ORDER BY score DESC) as rank FROM ${users}
    `);
    const userRanks = userRanksResult.rows as { id: number, rank: number }[];
    const userRank = userRanks.find(r => r.id === userId)?.rank || 0;
    
    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    
    // Count completed challenges
    const completedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(completedChallenges)
      .where(eq(completedChallenges.userId, userId));
    
    // Count badges
    const badgesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    
    return {
      rank: userRank,
      totalPoints: user.score,
      challengesSolved: completedCount[0]?.count || 0,
      badgesEarned: badgesCount[0]?.count || 0,
      streak: 1 // Default for now, will implement proper streak tracking later
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
    const userCompletedChallenges = await db
      .select({
        challengeId: completedChallenges.challengeId
      })
      .from(completedChallenges)
      .where(eq(completedChallenges.userId, userId));
    
    if (userCompletedChallenges.length === 0) return [];
    
    const challengeIds = userCompletedChallenges.map(c => c.challengeId);
    
    return await db
      .select()
      .from(challenges)
      .where(sql`${challenges.id} IN (${challengeIds.join(',')})`);
  }
  
  // Badge methods
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }
  
  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadgesResult = await db
      .select({
        badgeId: userBadges.badgeId
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    
    if (userBadgesResult.length === 0) return [];
    
    const badgeIds = userBadgesResult.map(b => b.badgeId);
    
    return await db
      .select()
      .from(badges)
      .where(sql`${badges.id} IN (${badgeIds.join(',')})`);
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
    // This is a complex function that will need a proper implementation
    // For now, return empty array
    return [];
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
  
  async updateChatbotKey(id: number, data: { key?: string; isActive?: boolean }): Promise<ChatbotKey> {
    const updateData: any = {};
    
    if (data.key !== undefined) {
      updateData.key = data.key;
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
    const userRanks = await db.execute(sql`
      SELECT id, username, score, RANK() OVER (ORDER BY score DESC) as rank FROM ${users}
      ORDER BY rank ASC
      LIMIT 100
    `);
    
    const leaderboard = [];
    
    for (const userRank of userRanks.rows as any[]) {
      const badges = await this.getUserBadges(userRank.id);
      
      // Count solved challenges
      const solvedChallenges = await db
        .select({ count: sql<number>`count(*)` })
        .from(completedChallenges)
        .where(eq(completedChallenges.userId, userRank.id));
      
      leaderboard.push({
        id: userRank.id,
        username: userRank.username,
        score: userRank.score,
        badges,
        solvedChallenges: solvedChallenges[0]?.count || 0,
        rank: Number(userRank.rank),
        avatarUrl: undefined
      });
    }
    
    return leaderboard;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();