import { Express, Request, Response, NextFunction } from "express";
import { storage } from "../mysql-storage";
import { isAdmin } from "../admin";
import { sql, eq } from "drizzle-orm";
import { getDb } from "../mysql-db";
import { contests, contestChallenges, type Contest, type InsertContest, type ContestChallenge, type InsertContestChallenge } from "@shared/mysql-schema";

export function setupContestRoutes(app: Express) {
  // Get all contests
  app.get("/api/contests", async (req, res, next) => {
    try {
      const db = await getDb();
      const allContests = await db.select().from(contests);
      res.json(allContests);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific contest
  app.get("/api/contests/:id", async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.id);
      
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      
      const db = await getDb();
      const [contest] = await db
        .select()
        .from(contests)
        .where(eq(contests.id, contestId));
      
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      
      // Get challenges for this contest
      const contestWithChallenges = await getContestWithChallenges(contestId);
      
      res.json(contestWithChallenges);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new contest (admin only)
  app.post("/api/admin/contests", isAdmin, async (req, res, next) => {
    try {
      const { title, description, startDate, endDate, externalUrl, isExternal } = req.body;
      
      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create the contest
      const db = await getDb();
      const [newContest] = await db.insert(contests).values({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        externalUrl: externalUrl || null,
        isExternal: isExternal || false,
        createdAt: new Date()
      }).returning();
      
      res.status(201).json(newContest);
    } catch (error) {
      next(error);
    }
  });
  
  // Update a contest (admin only)
  app.put("/api/admin/contests/:id", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.id);
      
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      
      const { title, description, startDate, endDate, externalUrl, isExternal } = req.body;
      
      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Update the contest
      const db = await getDb();
      const [updatedContest] = await db
        .update(contests)
        .set({
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          externalUrl: externalUrl || null,
          isExternal: isExternal || false
        })
        .where(eq(contests.id, contestId))
        .returning();
      
      if (!updatedContest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      
      res.json(updatedContest);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a contest (admin only)
  app.delete("/api/admin/contests/:id", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.id);
      
      if (isNaN(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      
      const db = await getDb();
      // First delete all contest-challenge associations
      await db
        .delete(contestChallenges)
        .where(eq(contestChallenges.contestId, contestId));
      
      // Then delete the contest
      await db
        .delete(contests)
        .where(eq(contests.id, contestId));
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Add a challenge to a contest (admin only)
  app.post("/api/admin/contests/:contestId/challenges", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const { challengeId } = req.body;
      
      if (isNaN(contestId) || isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid contest or challenge ID" });
      }
      
      const db = await getDb();
      // Check if the contest exists
      const [contest] = await db
        .select()
        .from(contests)
        .where(eq(contests.id, contestId));
      
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      
      // Check if the challenge exists
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if the challenge is already in the contest
      const [existingEntry] = await db
        .select()
        .from(contestChallenges)
        .where(sql`${contestChallenges.contestId} = ${contestId} AND ${contestChallenges.challengeId} = ${challengeId}`);
      
      if (existingEntry) {
        return res.status(400).json({ message: "Challenge is already part of this contest" });
      }
      
      // Add the challenge to the contest
      const [newContestChallenge] = await db
        .insert(contestChallenges)
        .values({
          contestId,
          challengeId
        })
        .returning();
      
      res.status(201).json(newContestChallenge);
    } catch (error) {
      next(error);
    }
  });
  
  // Remove a challenge from a contest (admin only)
  app.delete("/api/admin/contests/:contestId/challenges/:challengeId", isAdmin, async (req, res, next) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const challengeId = parseInt(req.params.challengeId);
      
      if (isNaN(contestId) || isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid contest or challenge ID" });
      }
      
      // Delete the contest-challenge association
      await db
        .delete(contestChallenges)
        .where(sql`${contestChallenges.contestId} = ${contestId} AND ${contestChallenges.challengeId} = ${challengeId}`);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Submit a flag for an external CTF contest
  app.post("/api/contests/:contestId/submit", async (req, res, next) => {
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
      
      // Check if the contest exists and is external
      const [contest] = await db
        .select()
        .from(contests)
        .where(eq(contests.id, contestId));
      
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      
      if (!contest.isExternal) {
        return res.status(400).json({ message: "Flag submissions are only allowed for external contests" });
      }
      
      // Save the flag submission to the database
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

// Helper function to get a contest with all its challenges
async function getContestWithChallenges(contestId: number) {
  // Get the contest
  const [contest] = await db
    .select()
    .from(contests)
    .where(eq(contests.id, contestId));
  
  if (!contest) {
    return null;
  }
  
  // Get all challenge IDs for this contest
  const contestChallengeEntries = await db
    .select()
    .from(contestChallenges)
    .where(eq(contestChallenges.contestId, contestId));
  
  const challengeIds = contestChallengeEntries.map(c => c.challengeId);
  
  // Get the challenge details
  const challenges = [];
  for (const challengeId of challengeIds) {
    const challenge = await storage.getChallengeById(challengeId);
    if (challenge) {
      challenges.push(challenge);
    }
  }
  
  return {
    ...contest,
    challenges
  };
}