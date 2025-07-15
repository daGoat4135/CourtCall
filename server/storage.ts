import { 
  users, 
  matches, 
  rsvps, 
  notifications,
  type User, 
  type InsertUser,
  type Match,
  type InsertMatch,
  type Rsvp,
  type InsertRsvp,
  type Notification,
  type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getOrCreateUserByName(name: string): Promise<User>;

  // Match operations
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: number): Promise<boolean>;

  // RSVP operations
  getRsvpsByMatch(matchId: number): Promise<Rsvp[]>;
  getRsvpsByUser(userId: number): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  deleteRsvp(matchId: number, userId: number): Promise<boolean>;
  getRsvpCount(matchId: number): Promise<number>;
  getConfirmedRsvpCount(matchId: number): Promise<number>;
  getWaitlistedRsvps(matchId: number): Promise<Rsvp[]>;
  promoteFromWaitlist(matchId: number): Promise<Rsvp | null>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationSent(id: number): Promise<void>;

  // Analytics
  getPlayerStats(startDate: Date, endDate: Date): Promise<Array<{
    userId: number;
    user: User;
    gameCount: number;
  }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private rsvps: Map<number, Rsvp>;
  private notifications: Map<number, Notification>;
  private currentUserId: number;
  private currentMatchId: number;
  private currentRsvpId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.rsvps = new Map();
    this.notifications = new Map();
    this.currentUserId = 1;
    this.currentMatchId = 1;
    this.currentRsvpId = 1;
    this.currentNotificationId = 1;

    // Create time slots without sample data
    this.createFixedTimeSlots();
  }

  

  private createFixedTimeSlots() {
    const today = new Date();
    const timeSlots = ["morning", "lunch", "afterwork"];
    
    // Create slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      timeSlots.forEach(slot => {
        this.createMatch({
          date: date,
          timeSlot: slot,
          maxPlayers: 4,
          status: "open"
        });
      });
    }
  }

  

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getOrCreateUserByName(name: string): Promise<User> {
    // Check if user already exists by name
    const existingUser = Array.from(this.users.values()).find(user => user.name === name);
    if (existingUser) {
      return existingUser;
    }
    
    // Create new user
    const initials = name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    const username = name.toLowerCase().replace(/\s+/g, '.');
    
    return this.createUser({
      username,
      password: 'temp', // Not used for our simple auth
      name,
      department: 'Team',
      avatar: initials
    });
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => {
      const matchDate = new Date(match.date);
      return matchDate >= startDate && matchDate <= endDate;
    });
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = { 
      ...insertMatch, 
      id, 
      createdAt: new Date() 
    };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteMatch(id: number): Promise<boolean> {
    return this.matches.delete(id);
  }

  // RSVP operations
  async getRsvpsByMatch(matchId: number): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.matchId === matchId);
  }

  async getRsvpsByUser(userId: number): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.userId === userId);
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const id = this.currentRsvpId++;
    const rsvp: Rsvp = { 
      ...insertRsvp, 
      id, 
      joinedAt: new Date() 
    };
    this.rsvps.set(id, rsvp);
    return rsvp;
  }

  async deleteRsvp(matchId: number, userId: number): Promise<boolean> {
    const rsvp = Array.from(this.rsvps.values()).find(r => r.matchId === matchId && r.userId === userId);
    if (!rsvp) return false;
    return this.rsvps.delete(rsvp.id);
  }

  async getRsvpCount(matchId: number): Promise<number> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.matchId === matchId && rsvp.status !== "cancelled").length;
  }

  async getConfirmedRsvpCount(matchId: number): Promise<number> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.matchId === matchId && rsvp.status === "confirmed").length;
  }

  async getWaitlistedRsvps(matchId: number): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.matchId === matchId && rsvp.status === "waitlisted");
  }

  async promoteFromWaitlist(matchId: number): Promise<Rsvp | null> {
    const waitlisted = await this.getWaitlistedRsvps(matchId);
    if (waitlisted.length === 0) return null;
    
    // Get the first waitlisted person (first come, first served)
    const toPromote = waitlisted.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())[0];
    toPromote.status = "confirmed";
    this.rsvps.set(toPromote.id, toPromote);
    
    return toPromote;
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => notification.userId === userId);
  }

  async markNotificationSent(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.sent = true;
      this.notifications.set(id, notification);
    }
  }

  // Analytics
  async getPlayerStats(startDate: Date, endDate: Date): Promise<Array<{
    userId: number;
    user: User;
    gameCount: number;
  }>> {
    const matchesInRange = await this.getMatchesByDateRange(startDate, endDate);
    const userStats = new Map<number, number>();

    for (const match of matchesInRange) {
      const rsvps = await this.getRsvpsByMatch(match.id);
      for (const rsvp of rsvps) {
        if (rsvp.status === "confirmed") {
          userStats.set(rsvp.userId, (userStats.get(rsvp.userId) || 0) + 1);
        }
      }
    }

    const result = [];
    for (const [userId, gameCount] of userStats) {
      const user = await this.getUser(userId);
      if (user) {
        result.push({ userId, user, gameCount });
      }
    }

    return result.sort((a, b) => b.gameCount - a.gameCount);
  }
}

import { ReplitStorage } from "./replit-storage";
import { DatabaseStorage } from "./db-storage";

// Use database storage if DATABASE_URL is available, otherwise fallback to in-memory
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage()
  : new ReplitStorage();
