// This file implements the storage interface using MySQL
// By default, the application uses PostgreSQL (see storage.ts)
// This MySQL implementation is provided as an alternative option

import { getDb } from "./mysql-db";
import connectMySQL from "mysql2/promise";
import session from "express-session";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users, badges, challenges, completedChallenges, userBadges,
  chatbotKeys, chatHistory, contests, contestChallenges, externalFlagSubmissions,
  InsertUser, User, InsertChallenge, Challenge, InsertCompletedChallenge, CompletedChallenge,
  InsertBadge, Badge, InsertUserBadge, UserBadge, InsertChatbotKey, ChatbotKey,
  InsertChatHistory, ChatHistory, InsertContest, Contest, InsertContestChallenge,
  ContestChallenge, InsertExternalFlagSubmission, ExternalFlagSubmission
} from "@shared/mysql-schema";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MySQLStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const db = await getDb();
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await getDb();
    const results = await db.insert(users).values(insertUser);
    const userId = results[0].insertId;
    return this.getUser(userId);
  }

  async updateUserScore(userId: number, points: number): Promise<User> {
    const db = await getDb();
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const newScore = user.score + points;
    await db.update(users).set({ score: newScore }).where(eq(users.id, userId));
    
    return this.getUser(userId);
  }

  async getAllUsers(): Promise<User[]> {
    const db = await getDb();
    return db.select().from(users);
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const db = await getDb();
    
    // Count solved challenges
    const solvedChallenges = await db.select({
      count: sql<number>`count(*)`
    }).from(completedChallenges)
      .where(eq(completedChallenges.userId, userId));
    
    // Count badges
    const badges = await db.select({
      count: sql<number>`count(*)`
    }).from(userBadges)
      .where(eq(userBadges.userId, userId));
    
    // Get user score and rank
    const user = await this.getUser(userId);
    const allUsers = await db.select({
      id: users.id,
      score: users.score
    }).from(users)
      .orderBy(desc(users.score));
    
    // Find user rank
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
      badgesEarned: badges[0]?.count || 0,
      streak: 0 // TODO: Implement streak tracking
    };
  }

  async getAllChallenges(): Promise<Challenge[]> {
    const db = await getDb();
    return db.select().from(challenges);
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const db = await getDb();
    const results = await db.select().from(challenges).where(eq(challenges.id, id));
    return results[0];
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const db = await getDb();
    const results = await db.insert(challenges).values(insertChallenge);
    const challengeId = results[0].insertId;
    return this.getChallengeById(challengeId);
  }

  async completeChallenge(data: InsertCompletedChallenge): Promise<CompletedChallenge> {
    const db = await getDb();
    const results = await db.insert(completedChallenges).values(data);
    const id = results[0].insertId;
    const completedChallengeResults = await db.select().from(completedChallenges).where(eq(completedChallenges.id, id));
    
    // Update challenge solve count
    const challenge = await this.getChallengeById(data.challengeId);
    if (challenge) {
      await db.update(challenges)
        .set({ solveCount: challenge.solveCount + 1 })
        .where(eq(challenges.id, data.challengeId));
    }
    
    // Award badges
    await this.checkAndAwardBadges(data.userId, data.challengeId);
    
    return completedChallengeResults[0];
  }

  async getUserCompletedChallenges(userId: number): Promise<Challenge[]> {
    const db = await getDb();
    const completedResults = await db.select()
      .from(completedChallenges)
      .where(eq(completedChallenges.userId, userId));
    
    const challengeIds = completedResults.map(c => c.challengeId);
    
    if (challengeIds.length === 0) {
      return [];
    }
    
    const challengeResults = await Promise.all(
      challengeIds.map(id => this.getChallengeById(id))
    );
    
    return challengeResults.filter(Boolean) as Challenge[];
  }

  async getAllBadges(): Promise<Badge[]> {
    const db = await getDb();
    return db.select().from(badges);
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const db = await getDb();
    const userBadgesResults = await db.select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    
    const badgeIds = userBadgesResults.map(ub => ub.badgeId);
    
    if (badgeIds.length === 0) {
      return [];
    }
    
    const results = await Promise.all(
      badgeIds.map(async (id) => {
        const badgeResults = await db.select().from(badges).where(eq(badges.id, id));
        return badgeResults[0];
      })
    );
    
    return results.filter(Boolean) as Badge[];
  }

  async awardBadge(data: InsertUserBadge): Promise<UserBadge> {
    const db = await getDb();
    
    // Check if user already has this badge
    const existingResults = await db.select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, data.userId),
          eq(userBadges.badgeId, data.badgeId)
        )
      );
    
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    
    const results = await db.insert(userBadges).values(data);
    const id = results[0].insertId;
    const userBadgeResults = await db.select().from(userBadges).where(eq(userBadges.id, id));
    return userBadgeResults[0];
  }

  async checkAndAwardBadges(userId: number, challengeId: number): Promise<Badge[]> {
    const db = await getDb();
    
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
    
    // Get all badges
    const allBadges = await this.getAllBadges();
    
    // Check which badges should be awarded
    const badgesToAward = allBadges.filter(badge => {
      if (badge.requirement === 'first-blood' && challenge.solveCount === 0) {
        return true;
      }
      
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
      
      if (badge.requirement === `category-${challenge.category}-3` && categoryCount >= 3) {
        return true;
      }
      
      if (badge.requirement === `category-${challenge.category}-5` && categoryCount >= 5) {
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

  async saveChatbotKey(data: InsertChatbotKey): Promise<ChatbotKey> {
    const db = await getDb();
    
    // Check if a key for this provider already exists for this user
    const existingResults = await db.select()
      .from(chatbotKeys)
      .where(
        and(
          eq(chatbotKeys.userId, data.userId),
          eq(chatbotKeys.provider, data.provider)
        )
      );
    
    if (existingResults.length > 0) {
      // Update existing key
      await db.update(chatbotKeys)
        .set({
          apiKey: data.apiKey,
          isActive: data.isActive
        })
        .where(eq(chatbotKeys.id, existingResults[0].id));
      
      return this.getChatbotKeyById(existingResults[0].id);
    }
    
    // Create new key
    const results = await db.insert(chatbotKeys).values(data);
    const id = results[0].insertId;
    return this.getChatbotKeyById(id);
  }

  async getChatbotKeyById(id: number): Promise<ChatbotKey> {
    const db = await getDb();
    const results = await db.select().from(chatbotKeys).where(eq(chatbotKeys.id, id));
    return results[0];
  }

  async getUserChatbotKeys(userId: number): Promise<ChatbotKey[]> {
    const db = await getDb();
    return db.select().from(chatbotKeys).where(eq(chatbotKeys.userId, userId));
  }

  async getAllChatbotKeys(): Promise<ChatbotKey[]> {
    const db = await getDb();
    return db.select().from(chatbotKeys);
  }

  async getChatbotKeyByProvider(provider: string): Promise<ChatbotKey | undefined> {
    const db = await getDb();
    const results = await db.select()
      .from(chatbotKeys)
      .where(
        and(
          eq(chatbotKeys.provider, provider),
          eq(chatbotKeys.isActive, true)
        )
      );
    
    return results[0];
  }

  async updateChatbotKey(id: number, data: { apiKey?: string; isActive?: boolean }): Promise<ChatbotKey> {
    const db = await getDb();
    await db.update(chatbotKeys)
      .set(data)
      .where(eq(chatbotKeys.id, id));
    
    return this.getChatbotKeyById(id);
  }

  async deleteChatbotKey(id: number): Promise<void> {
    const db = await getDb();
    await db.delete(chatbotKeys).where(eq(chatbotKeys.id, id));
  }

  async saveChatHistory(data: InsertChatHistory): Promise<ChatHistory> {
    const db = await getDb();
    const results = await db.insert(chatHistory).values(data);
    const id = results[0].insertId;
    const chatHistoryResults = await db.select().from(chatHistory).where(eq(chatHistory.id, id));
    return chatHistoryResults[0];
  }

  async getUserChatHistory(userId: number): Promise<ChatHistory[]> {
    const db = await getDb();
    return db.select().from(chatHistory).where(eq(chatHistory.userId, userId));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const db = await getDb();
    const userResults = await db.select().from(users).orderBy(desc(users.score));
    
    const leaderboard = await Promise.all(
      userResults.map(async (user, index) => {
        const userBadgesResults = await this.getUserBadges(user.id);
        
        const completedChallengesCount = await db.select({
          count: sql<number>`count(*)`
        }).from(completedChallenges)
          .where(eq(completedChallenges.userId, user.id));
        
        return {
          id: user.id,
          username: user.username,
          score: user.score,
          badges: userBadgesResults,
          solvedChallenges: completedChallengesCount[0]?.count || 0,
          rank: index + 1,
          avatarUrl: user.avatarUrl
        };
      })
    );
    
    return leaderboard;
  }

  async getAllContests(): Promise<Contest[]> {
    const db = await getDb();
    return db.select().from(contests);
  }

  async getContestById(id: number): Promise<Contest | undefined> {
    const db = await getDb();
    const results = await db.select().from(contests).where(eq(contests.id, id));
    return results[0];
  }

  async createContest(insertContest: InsertContest): Promise<Contest> {
    const db = await getDb();
    const results = await db.insert(contests).values(insertContest);
    const contestId = results[0].insertId;
    return this.getContestById(contestId);
  }

  async updateContest(id: number, data: Partial<InsertContest>): Promise<Contest> {
    const db = await getDb();
    await db.update(contests).set(data).where(eq(contests.id, id));
    return this.getContestById(id);
  }

  async deleteContest(id: number): Promise<void> {
    const db = await getDb();
    await db.delete(contests).where(eq(contests.id, id));
  }

  async addChallengeToContest(data: InsertContestChallenge): Promise<ContestChallenge> {
    const db = await getDb();
    
    // Check if the challenge is already in the contest
    const existingResults = await db.select()
      .from(contestChallenges)
      .where(
        and(
          eq(contestChallenges.contestId, data.contestId),
          eq(contestChallenges.challengeId, data.challengeId)
        )
      );
    
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    
    const results = await db.insert(contestChallenges).values(data);
    const id = results[0].insertId;
    const contestChallengeResults = await db.select().from(contestChallenges).where(eq(contestChallenges.id, id));
    return contestChallengeResults[0];
  }

  async removeChallengeFromContest(contestId: number, challengeId: number): Promise<void> {
    const db = await getDb();
    await db.delete(contestChallenges)
      .where(
        and(
          eq(contestChallenges.contestId, contestId),
          eq(contestChallenges.challengeId, challengeId)
        )
      );
  }

  async getContestChallenges(contestId: number): Promise<Challenge[]> {
    const db = await getDb();
    const contestChallengesResults = await db.select()
      .from(contestChallenges)
      .where(eq(contestChallenges.contestId, contestId));
    
    const challengeIds = contestChallengesResults.map(cc => cc.challengeId);
    
    if (challengeIds.length === 0) {
      return [];
    }
    
    const challengeResults = await Promise.all(
      challengeIds.map(id => this.getChallengeById(id))
    );
    
    return challengeResults.filter(Boolean) as Challenge[];
  }

  async submitExternalFlag(data: InsertExternalFlagSubmission): Promise<ExternalFlagSubmission> {
    const db = await getDb();
    const results = await db.insert(externalFlagSubmissions).values(data);
    const id = results[0].insertId;
    const submissionResults = await db.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.id, id));
    return submissionResults[0];
  }

  async getExternalFlagSubmissions(contestId: number): Promise<ExternalFlagSubmission[]> {
    const db = await getDb();
    return db.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.contestId, contestId));
  }

  async getUserExternalFlagSubmissions(userId: number): Promise<ExternalFlagSubmission[]> {
    const db = await getDb();
    return db.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.userId, userId));
  }

  async reviewExternalFlagSubmission(id: number, reviewerId: number, status: string): Promise<ExternalFlagSubmission> {
    const db = await getDb();
    
    const now = new Date();
    
    await db.update(externalFlagSubmissions)
      .set({
        status,
        reviewedBy: reviewerId,
        reviewedAt: now
      })
      .where(eq(externalFlagSubmissions.id, id));
    
    const submissionResults = await db.select().from(externalFlagSubmissions).where(eq(externalFlagSubmissions.id, id));
    
    // If approved, award points to the user
    if (status === "approved") {
      const submission = submissionResults[0];
      await this.updateUserScore(submission.userId, submission.points);
    }
    
    return submissionResults[0];
  }
}

export const storage = new MySQLStorage();