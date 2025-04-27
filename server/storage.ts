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
  sessionStore: session.SessionStore;
  
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
  saveChatHistory(data: InsertChatHistory): Promise<ChatHistory>;
  getUserChatHistory(userId: number): Promise<ChatHistory[]>;
  
  // Leaderboard methods
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private challengesMap: Map<number, Challenge>;
  private completedChallengesMap: Map<number, CompletedChallenge>;
  private badgesMap: Map<number, Badge>;
  private userBadgesMap: Map<number, UserBadge>;
  private chatbotKeysMap: Map<number, ChatbotKey>;
  private chatHistoryMap: Map<number, ChatHistory>;
  
  sessionStore: session.SessionStore;
  
  currentIdUsers: number;
  currentIdChallenges: number;
  currentIdCompletedChallenges: number;
  currentIdBadges: number;
  currentIdUserBadges: number;
  currentIdChatbotKeys: number;
  currentIdChatHistory: number;

  constructor() {
    this.usersMap = new Map();
    this.challengesMap = new Map();
    this.completedChallengesMap = new Map();
    this.badgesMap = new Map();
    this.userBadgesMap = new Map();
    this.chatbotKeysMap = new Map();
    this.chatHistoryMap = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.currentIdUsers = 1;
    this.currentIdChallenges = 1;
    this.currentIdCompletedChallenges = 1;
    this.currentIdBadges = 1;
    this.currentIdUserBadges = 1;
    this.currentIdChatbotKeys = 1;
    this.currentIdChatHistory = 1;
    
    // Initialize with some default badges
    this.initDefaultBadges();
    // Initialize with some default challenges
    this.initDefaultChallenges();
  }
  
  private initDefaultBadges() {
    const defaultBadges: InsertBadge[] = [
      {
        name: "First Blood",
        description: "Solved your first challenge",
        imageUrl: "firstblood",
        requirement: "firstChallenge"
      },
      {
        name: "Speedrunner",
        description: "Solved a challenge in under 5 minutes",
        imageUrl: "speedrunner",
        requirement: "speedrun"
      },
      {
        name: "Brainiac",
        description: "Solved a hard difficulty challenge",
        imageUrl: "brainiac",
        requirement: "hardChallenge"
      },
      {
        name: "Streak Master",
        description: "Solved 5 challenges in a row",
        imageUrl: "streakmaster",
        requirement: "streak"
      },
      {
        name: "Top 3",
        description: "Reached top 3 on the leaderboard",
        imageUrl: "top3",
        requirement: "leaderboard"
      }
    ];
    
    defaultBadges.forEach(badge => {
      this.createBadge(badge);
    });
  }
  
  private initDefaultChallenges() {
    const defaultChallenges: InsertChallenge[] = [
      {
        title: "Hidden in Plain Sight",
        description: "Find the hidden flag in the webpage source code.",
        difficulty: "easy",
        category: "web",
        points: 250,
        flag: "flag{source_code_secrets}",
        imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd"
      },
      {
        title: "Cookie Monster",
        description: "Investigate and manipulate browser cookies to gain unauthorized access.",
        difficulty: "easy",
        category: "web",
        points: 250,
        flag: "flag{cookie_manipulation_101}",
        imageUrl: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87"
      },
      {
        title: "SQL Injection Basics",
        description: "Exploit a vulnerable login form to bypass authentication.",
        difficulty: "medium",
        category: "web",
        points: 500,
        flag: "flag{bobby_tables_sends_regards}",
        imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7"
      },
      {
        title: "Script Kiddie",
        description: "Exploit cross-site scripting vulnerabilities to steal user cookies.",
        difficulty: "medium",
        category: "web",
        points: 500,
        flag: "flag{xss_alert_1337}",
        imageUrl: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87"
      },
      {
        title: "Decoder Ring",
        description: "Decrypt a series of encoded messages using various cipher techniques.",
        difficulty: "easy",
        category: "crypto",
        points: 250,
        flag: "flag{cipher_cracked_successfully}",
        imageUrl: "https://images.unsplash.com/photo-1623282033815-40b05d96c903"
      },
      {
        title: "Reverse Engineering Challenge",
        description: "Analyze and crack the provided binary to find the flag.",
        difficulty: "hard",
        category: "binary",
        points: 1000,
        flag: "flag{binary_reversal_master}",
        imageUrl: "https://images.unsplash.com/photo-1607798748738-b15c40d33d57"
      },
      {
        title: "Buffer Overflow",
        description: "Exploit a buffer overflow vulnerability to gain shell access.",
        difficulty: "hard",
        category: "binary",
        points: 1000,
        flag: "flag{stack_smashed_successfully}",
        imageUrl: "https://images.unsplash.com/photo-1607798748738-b15c40d33d57"
      },
      {
        title: "Digital Autopsy",
        description: "Perform digital forensics on a memory dump to find evidence of intrusion.",
        difficulty: "hard",
        category: "forensics",
        points: 1000,
        flag: "flag{memory_artifacts_analyzed}",
        imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de"
      }
    ];
    
    defaultChallenges.forEach(challenge => {
      this.createChallenge(challenge);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIdUsers++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      score: 0, 
      createdAt: timestamp
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUserScore(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.score += points;
    this.usersMap.set(userId, user);
    return user;
  }
  
  async getUserStats(userId: number): Promise<UserStats> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get all users ordered by score to determine rank
    const allUsers = Array.from(this.usersMap.values())
      .sort((a, b) => b.score - a.score);
    
    const rank = allUsers.findIndex(u => u.id === userId) + 1;
    
    // Count completed challenges
    const completedChallenges = Array.from(this.completedChallengesMap.values())
      .filter(cc => cc.userId === userId);
    
    // Count badges
    const badges = Array.from(this.userBadgesMap.values())
      .filter(ub => ub.userId === userId);
    
    // Calculate streak (simplified - just return a random number for now)
    const streak = Math.floor(Math.random() * 5) + 1; // Random number between 1-5
    
    return {
      rank,
      totalPoints: user.score,
      challengesSolved: completedChallenges.length,
      badgesEarned: badges.length,
      streak
    };
  }
  
  // Challenge methods
  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challengesMap.values());
  }
  
  async getChallengeById(id: number): Promise<Challenge | undefined> {
    return this.challengesMap.get(id);
  }
  
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentIdChallenges++;
    const timestamp = new Date();
    const challenge: Challenge = {
      ...insertChallenge,
      id,
      solveCount: 0,
      createdAt: timestamp
    };
    this.challengesMap.set(id, challenge);
    return challenge;
  }
  
  // Completed challenges methods
  async completeChallenge(data: InsertCompletedChallenge): Promise<CompletedChallenge> {
    // Check if user has already completed this challenge
    const alreadyCompleted = Array.from(this.completedChallengesMap.values())
      .find(cc => cc.userId === data.userId && cc.challengeId === data.challengeId);
    
    if (alreadyCompleted) {
      return alreadyCompleted;
    }
    
    const id = this.currentIdCompletedChallenges++;
    const timestamp = new Date();
    const completedChallenge: CompletedChallenge = {
      ...data,
      id,
      completedAt: timestamp
    };
    this.completedChallengesMap.set(id, completedChallenge);
    
    // Update solve count for the challenge
    const challenge = await this.getChallengeById(data.challengeId);
    if (challenge) {
      challenge.solveCount += 1;
      this.challengesMap.set(data.challengeId, challenge);
    }
    
    return completedChallenge;
  }
  
  async getUserCompletedChallenges(userId: number): Promise<Challenge[]> {
    const completedIds = Array.from(this.completedChallengesMap.values())
      .filter(cc => cc.userId === userId)
      .map(cc => cc.challengeId);
    
    return Array.from(this.challengesMap.values())
      .filter(challenge => completedIds.includes(challenge.id));
  }
  
  // Badge methods
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.currentIdBadges++;
    const badge: Badge = {
      ...insertBadge,
      id
    };
    this.badgesMap.set(id, badge);
    return badge;
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badgesMap.values());
  }
  
  async getUserBadges(userId: number): Promise<Badge[]> {
    const badgeIds = Array.from(this.userBadgesMap.values())
      .filter(ub => ub.userId === userId)
      .map(ub => ub.badgeId);
    
    return Array.from(this.badgesMap.values())
      .filter(badge => badgeIds.includes(badge.id));
  }
  
  async awardBadge(data: InsertUserBadge): Promise<UserBadge> {
    // Check if user already has this badge
    const existingBadge = Array.from(this.userBadgesMap.values())
      .find(ub => ub.userId === data.userId && ub.badgeId === data.badgeId);
    
    if (existingBadge) {
      return existingBadge;
    }
    
    const id = this.currentIdUserBadges++;
    const timestamp = new Date();
    const userBadge: UserBadge = {
      ...data,
      id,
      awardedAt: timestamp
    };
    this.userBadgesMap.set(id, userBadge);
    return userBadge;
  }
  
  async checkAndAwardBadges(userId: number, challengeId: number): Promise<Badge[]> {
    const newBadges: Badge[] = [];
    const user = await this.getUser(userId);
    if (!user) return newBadges;
    
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) return newBadges;
    
    const userCompletedChallenges = Array.from(this.completedChallengesMap.values())
      .filter(cc => cc.userId === userId);
    
    const userBadges = await this.getUserBadges(userId);
    const userBadgeNames = userBadges.map(b => b.name);
    
    // Check for "First Blood" badge
    if (!userBadgeNames.includes("First Blood") && userCompletedChallenges.length === 1) {
      const firstBloodBadge = Array.from(this.badgesMap.values())
        .find(b => b.name === "First Blood");
      
      if (firstBloodBadge) {
        await this.awardBadge({ userId, badgeId: firstBloodBadge.id });
        newBadges.push(firstBloodBadge);
      }
    }
    
    // Check for "Speedrunner" badge
    const thisChallenge = userCompletedChallenges.find(cc => cc.challengeId === challengeId);
    if (!userBadgeNames.includes("Speedrunner") && thisChallenge && thisChallenge.timeToSolve && thisChallenge.timeToSolve < 300) {
      const speedrunnerBadge = Array.from(this.badgesMap.values())
        .find(b => b.name === "Speedrunner");
      
      if (speedrunnerBadge) {
        await this.awardBadge({ userId, badgeId: speedrunnerBadge.id });
        newBadges.push(speedrunnerBadge);
      }
    }
    
    // Check for "Brainiac" badge
    if (!userBadgeNames.includes("Brainiac") && challenge.difficulty === "hard") {
      const brainiacBadge = Array.from(this.badgesMap.values())
        .find(b => b.name === "Brainiac");
      
      if (brainiacBadge) {
        await this.awardBadge({ userId, badgeId: brainiacBadge.id });
        newBadges.push(brainiacBadge);
      }
    }
    
    // Check for "Top 3" badge (simplified)
    const leaderboard = await this.getLeaderboard();
    const userRank = leaderboard.findIndex(entry => entry.id === userId) + 1;
    
    if (!userBadgeNames.includes("Top 3") && userRank <= 3) {
      const top3Badge = Array.from(this.badgesMap.values())
        .find(b => b.name === "Top 3");
      
      if (top3Badge) {
        await this.awardBadge({ userId, badgeId: top3Badge.id });
        newBadges.push(top3Badge);
      }
    }
    
    return newBadges;
  }
  
  // Chatbot methods
  async saveChatbotKey(data: InsertChatbotKey): Promise<ChatbotKey> {
    // Check if this provider already has a key for this user
    const existingKey = Array.from(this.chatbotKeysMap.values())
      .find(key => key.userId === data.userId && key.provider === data.provider);
    
    // If exists, update it
    if (existingKey) {
      existingKey.apiKey = data.apiKey;
      this.chatbotKeysMap.set(existingKey.id, existingKey);
      return existingKey;
    }
    
    // Otherwise, create new
    const id = this.currentIdChatbotKeys++;
    const timestamp = new Date();
    const chatbotKey: ChatbotKey = {
      ...data,
      id,
      createdAt: timestamp
    };
    this.chatbotKeysMap.set(id, chatbotKey);
    return chatbotKey;
  }
  
  async getUserChatbotKeys(userId: number): Promise<ChatbotKey[]> {
    return Array.from(this.chatbotKeysMap.values())
      .filter(key => key.userId === userId);
  }
  
  async saveChatHistory(data: InsertChatHistory): Promise<ChatHistory> {
    const id = this.currentIdChatHistory++;
    const timestamp = new Date();
    const chatHistoryEntry: ChatHistory = {
      ...data,
      id,
      createdAt: timestamp
    };
    this.chatHistoryMap.set(id, chatHistoryEntry);
    return chatHistoryEntry;
  }
  
  async getUserChatHistory(userId: number): Promise<ChatHistory[]> {
    return Array.from(this.chatHistoryMap.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => {
        // Sort by creation date (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
  
  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = Array.from(this.usersMap.values())
      .sort((a, b) => b.score - a.score);
    
    const leaderboard: LeaderboardEntry[] = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const badges = await this.getUserBadges(user.id);
      const completedChallenges = await this.getUserCompletedChallenges(user.id);
      
      leaderboard.push({
        id: user.id,
        username: user.username,
        score: user.score,
        badges,
        solvedChallenges: completedChallenges.length,
        rank: i + 1,
        avatarUrl: user.avatarUrl
      });
    }
    
    return leaderboard;
  }
}

export const storage = new MemStorage();
