import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMatchSchema, insertRsvpSchema } from "@shared/schema";
import { z } from "zod";
import { startOfWeek, endOfWeek, addDays, format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get current week matches
  app.get("/api/matches/week", async (req, res) => {
    try {
      const dateParam = req.query.date as string;
      const baseDate = dateParam ? new Date(dateParam) : new Date();
      const startDate = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
      const endDate = endOfWeek(baseDate, { weekStartsOn: 1 }); // Sunday
      
      const matches = await storage.getMatchesByDateRange(startDate, endDate);
      
      // Get RSVPs for each match
      const matchesWithRsvps = await Promise.all(
        matches.map(async (match) => {
          const rsvps = await storage.getRsvpsByMatch(match.id);
          const rsvpUsers = await Promise.all(
            rsvps.map(async (rsvp) => {
              const user = await storage.getUser(rsvp.userId);
              return { ...rsvp, user };
            })
          );
          return { ...match, rsvps: rsvpUsers };
        })
      );
      
      res.json(matchesWithRsvps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Create new match (simplified for fixed time slots)
  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid match data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create match" });
      }
    }
  });

  // Join match (create RSVP) - supports both existing users and new users by name
  app.post("/api/matches/:matchId/join", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const { userId, userName } = req.body;
      
      // Check if match exists
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      let actualUserId = userId;
      
      // If userName is provided instead of userId, create or find the user
      if (userName && !userId) {
        const user = await storage.getOrCreateUserByName(userName);
        actualUserId = user.id;
      } else if (userId) {
        // Check if user exists in backend, if not this is a frontend-only user
        const existingUser = await storage.getUser(userId);
        if (!existingUser) {
          // This is a frontend-only user (with timestamp ID), we need userName to create them
          if (!userName) {
            return res.status(400).json({ error: "User not found in database. Please provide userName." });
          }
          const user = await storage.getOrCreateUserByName(userName);
          actualUserId = user.id;
        }
      }
      
      // Check if user is already in the match
      const existingRsvps = await storage.getRsvpsByMatch(matchId);
      if (existingRsvps.some(rsvp => rsvp.userId === actualUserId)) {
        return res.status(400).json({ error: "User already joined this match" });
      }
      
      // Check if match has spots available
      const confirmedCount = await storage.getConfirmedRsvpCount(matchId);
      const status = confirmedCount >= match.maxPlayers ? "waitlisted" : "confirmed";
      
      const rsvp = await storage.createRsvp({
        matchId,
        userId: actualUserId,
        status
      });
      
      // Update match status if full
      if (status === "confirmed") {
        const newConfirmedCount = await storage.getConfirmedRsvpCount(matchId);
        if (newConfirmedCount >= match.maxPlayers) {
          await storage.updateMatch(matchId, { status: "full" });
        }
      }
      
      res.json(rsvp);
    } catch (error) {
      res.status(500).json({ error: "Failed to join match" });
    }
  });

  // Leave match (delete RSVP) - supports both userId and userName
  app.delete("/api/matches/:matchId/leave", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const { userId, userName } = req.body;
      
      let actualUserId = userId;
      
      // If userName is provided, find the user
      if (userName && !userId) {
        const user = await storage.getOrCreateUserByName(userName);
        actualUserId = user.id;
      } else if (userId) {
        // Check if user exists in backend, if not find by name
        const existingUser = await storage.getUser(userId);
        if (!existingUser && userName) {
          const user = await storage.getOrCreateUserByName(userName);
          actualUserId = user.id;
        }
      }
      
      // Check if the leaving user was confirmed before deleting
      const existingRsvps = await storage.getRsvpsByMatch(matchId);
      const leavingRsvp = existingRsvps.find(rsvp => rsvp.userId === actualUserId);
      const wasConfirmed = leavingRsvp?.status === "confirmed";
      
      const success = await storage.deleteRsvp(matchId, actualUserId);
      if (!success) {
        return res.status(404).json({ error: "RSVP not found" });
      }
      
      // If a confirmed player left, promote someone from waitlist
      if (wasConfirmed) {
        await storage.promoteFromWaitlist(matchId);
      }
      
      // Update match status back to open if no longer full
      const match = await storage.getMatch(matchId);
      if (match && match.status === "full") {
        const confirmedCount = await storage.getConfirmedRsvpCount(matchId);
        if (confirmedCount < match.maxPlayers) {
          await storage.updateMatch(matchId, { status: "open" });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave match" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { period = "month" } = req.query;
      
      let startDate: Date;
      const endDate = new Date();
      
      if (period === "week") {
        startDate = startOfWeek(endDate, { weekStartsOn: 1 });
      } else {
        // Default to last 30 days to capture more activity
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 30);
      }
      
      console.log("Leaderboard query:", { startDate, endDate, period });
      const stats = await storage.getPlayerStats(startDate, endDate);
      console.log("Leaderboard stats:", stats);
      res.json(stats);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get user stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const rsvps = await storage.getRsvpsByUser(userId);
      const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const thisWeekMatches = await storage.getMatchesByDateRange(thisWeekStart, thisWeekEnd);
      const thisWeekGames = rsvps.filter(rsvp => 
        thisWeekMatches.some(match => match.id === rsvp.matchId)
      ).length;
      
      const totalGames = rsvps.length;
      
      res.json({
        user,
        thisWeekGames,
        totalGames
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get upcoming notifications for user
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUser(userId);
      
      // Filter for upcoming notifications
      const upcomingNotifications = notifications.filter(notification => {
        const scheduledTime = new Date(notification.scheduledFor);
        return scheduledTime > new Date() && !notification.sent;
      });
      
      res.json(upcomingNotifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
