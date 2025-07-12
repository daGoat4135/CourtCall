
import Database from "@replit/database";
import { 
  type User, 
  type InsertUser,
  type Match,
  type InsertMatch,
  type Rsvp,
  type InsertRsvp,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { IStorage } from "./storage";

export class ReplitStorage implements IStorage {
  private db: Database;
  private currentUserId: number = 1;
  private currentMatchId: number = 1;
  private currentRsvpId: number = 1;
  private currentNotificationId: number = 1;
  private initialized: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    this.db = new Database();
    this.initPromise = this.initialize();
  }

  private async initialize() {
    await this.initializeCounters();
    await this.initializeSampleData();
    this.initialized = true;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  private async initializeCounters() {
    // Initialize ID counters if they don't exist
    const userCount = await this.db.get("userIdCounter");
    if (userCount === null || userCount === undefined) {
      this.currentUserId = 1;
      await this.db.set("userIdCounter", 1);
    } else {
      this.currentUserId = userCount;
    }

    const matchCount = await this.db.get("matchIdCounter");
    if (matchCount === null || matchCount === undefined) {
      this.currentMatchId = 1;
      await this.db.set("matchIdCounter", 1);
    } else {
      this.currentMatchId = matchCount;
    }

    const rsvpCount = await this.db.get("rsvpIdCounter");
    if (rsvpCount === null || rsvpCount === undefined) {
      this.currentRsvpId = 1;
      await this.db.set("rsvpIdCounter", 1);
    } else {
      this.currentRsvpId = rsvpCount;
    }

    const notificationCount = await this.db.get("notificationIdCounter");
    if (notificationCount === null || notificationCount === undefined) {
      this.currentNotificationId = 1;
      await this.db.set("notificationIdCounter", 1);
    } else {
      this.currentNotificationId = notificationCount;
    }
  }

  private async initializeSampleData() {
    // Check if sample data already exists
    const existingUsers = await this.db.get("users");
    if (existingUsers && Object.keys(existingUsers).length > 0) {
      return; // Sample data already exists
    }

    const sampleUsers: InsertUser[] = [
      { username: "john.doe", password: "password", name: "John Doe", department: "Engineering", avatar: "JD" },
      { username: "alex.martinez", password: "password", name: "Alex Martinez", department: "Engineering", avatar: "AM" },
      { username: "sarah.kim", password: "password", name: "Sarah Kim", department: "Design", avatar: "SK" },
      { username: "jordan.lee", password: "password", name: "Jordan Lee", department: "Marketing", avatar: "JL" },
      { username: "mike.rodriguez", password: "password", name: "Mike Rodriguez", department: "Sales", avatar: "MR" },
      { username: "diana.kim", password: "password", name: "Diana Kim", department: "Product", avatar: "DK" },
      { username: "lisa.martinez", password: "password", name: "Lisa Martinez", department: "HR", avatar: "LM" },
      { username: "tom.riley", password: "password", name: "Tom Riley", department: "Engineering", avatar: "TR" },
      { username: "rachel.wong", password: "password", name: "Rachel Wong", department: "Design", avatar: "RW" },
      { username: "james.smith", password: "password", name: "James Smith", department: "Engineering", avatar: "JS" },
      { username: "kate.parker", password: "password", name: "Kate Parker", department: "Marketing", avatar: "KP" },
    ];

    for (const user of sampleUsers) {
      await this.createUser(user);
    }

    await this.createFixedTimeSlots();
  }

  private async createFixedTimeSlots() {
    const today = new Date();
    const timeSlots = ["morning", "lunch", "afterwork"];
    
    // Create slots for the next 5 weekdays
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const slot of timeSlots) {
        await this.createMatch({
          date: date,
          timeSlot: slot,
          maxPlayers: 4,
          status: "open"
        });
      }
    }
    
    await this.addSampleRSVPs();
  }

  private async addSampleRSVPs() {
    const matches = await this.getAllMatches();
    
    if (matches.length > 0) {
      // Join first lunch match with 2 players
      const lunchMatch = matches.find(m => m.timeSlot === "lunch");
      if (lunchMatch) {
        await this.createRsvp({ matchId: lunchMatch.id, userId: 1, status: "confirmed" });
        await this.createRsvp({ matchId: lunchMatch.id, userId: 2, status: "confirmed" });
      }
      
      // Join first morning match with 3 players (almost full)
      const morningMatch = matches.find(m => m.timeSlot === "morning");
      if (morningMatch) {
        await this.createRsvp({ matchId: morningMatch.id, userId: 3, status: "confirmed" });
        await this.createRsvp({ matchId: morningMatch.id, userId: 4, status: "confirmed" });
        await this.createRsvp({ matchId: morningMatch.id, userId: 5, status: "confirmed" });
      }
      
      // Fill one afterwork match completely
      const afterworkMatch = matches.find(m => m.timeSlot === "afterwork");
      if (afterworkMatch) {
        await this.createRsvp({ matchId: afterworkMatch.id, userId: 6, status: "confirmed" });
        await this.createRsvp({ matchId: afterworkMatch.id, userId: 7, status: "confirmed" });
        await this.createRsvp({ matchId: afterworkMatch.id, userId: 8, status: "confirmed" });
        await this.createRsvp({ matchId: afterworkMatch.id, userId: 9, status: "confirmed" });
        await this.updateMatch(afterworkMatch.id, { status: "full" });
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = await this.db.get("users") || {};
    return users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.db.get("users") || {};
    return Object.values(users).find((user: any) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureInitialized();
    
    const id = this.currentUserId++;
    await this.db.set("userIdCounter", this.currentUserId);
    
    const user: User = { ...insertUser, id };
    
    const users = await this.db.get("users") || {};
    users[id] = user;
    await this.db.set("users", users);
    
    return user;
  }

  async getOrCreateUserByName(name: string): Promise<User> {
    const users = await this.db.get("users") || {};
    const existingUser = Object.values(users).find((user: any) => user.name === name);
    if (existingUser) {
      return existingUser as User;
    }
    
    const initials = name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    const username = name.toLowerCase().replace(/\s+/g, '.');
    
    return this.createUser({
      username,
      password: 'temp',
      name,
      department: 'Team',
      avatar: initials
    });
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.db.get("users") || {};
    return Object.values(users);
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    const matches = await this.db.get("matches") || {};
    return matches[id];
  }

  async getAllMatches(): Promise<Match[]> {
    const matches = await this.db.get("matches") || {};
    return Object.values(matches);
  }

  async getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    const matches = await this.getAllMatches();
    return matches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate >= startDate && matchDate <= endDate;
    });
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    await this.ensureInitialized();
    
    const id = this.currentMatchId++;
    await this.db.set("matchIdCounter", this.currentMatchId);
    
    const match: Match = { 
      ...insertMatch, 
      id, 
      createdAt: new Date() 
    };
    
    const matches = await this.db.get("matches") || {};
    matches[id] = match;
    await this.db.set("matches", matches);
    
    return match;
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const matches = await this.db.get("matches") || {};
    const match = matches[id];
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    matches[id] = updatedMatch;
    await this.db.set("matches", matches);
    
    return updatedMatch;
  }

  async deleteMatch(id: number): Promise<boolean> {
    const matches = await this.db.get("matches") || {};
    if (!matches[id]) return false;
    
    delete matches[id];
    await this.db.set("matches", matches);
    return true;
  }

  // RSVP operations
  async getRsvpsByMatch(matchId: number): Promise<Rsvp[]> {
    const rsvps = await this.db.get("rsvps") || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.matchId === matchId);
  }

  async getRsvpsByUser(userId: number): Promise<Rsvp[]> {
    const rsvps = await this.db.get("rsvps") || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.userId === userId);
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    await this.ensureInitialized();
    
    const id = this.currentRsvpId++;
    await this.db.set("rsvpIdCounter", this.currentRsvpId);
    
    const rsvp: Rsvp = { 
      ...insertRsvp, 
      id, 
      joinedAt: new Date() 
    };
    
    const rsvps = await this.db.get("rsvps") || {};
    rsvps[id] = rsvp;
    await this.db.set("rsvps", rsvps);
    
    return rsvp;
  }

  async deleteRsvp(matchId: number, userId: number): Promise<boolean> {
    const rsvps = await this.db.get("rsvps") || {};
    const rsvpToDelete = Object.values(rsvps).find((r: any) => r.matchId === matchId && r.userId === userId);
    if (!rsvpToDelete) return false;
    
    delete rsvps[(rsvpToDelete as any).id];
    await this.db.set("rsvps", rsvps);
    return true;
  }

  async getRsvpCount(matchId: number): Promise<number> {
    const rsvps = await this.getRsvpsByMatch(matchId);
    return rsvps.filter(rsvp => rsvp.status !== "cancelled").length;
  }

  async getConfirmedRsvpCount(matchId: number): Promise<number> {
    const rsvps = await this.getRsvpsByMatch(matchId);
    return rsvps.filter(rsvp => rsvp.status === "confirmed").length;
  }

  async getWaitlistedRsvps(matchId: number): Promise<Rsvp[]> {
    const rsvps = await this.getRsvpsByMatch(matchId);
    return rsvps.filter(rsvp => rsvp.status === "waitlisted");
  }

  async promoteFromWaitlist(matchId: number): Promise<Rsvp | null> {
    const waitlisted = await this.getWaitlistedRsvps(matchId);
    if (waitlisted.length === 0) return null;
    
    const toPromote = waitlisted.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())[0];
    toPromote.status = "confirmed";
    
    const rsvps = await this.db.get("rsvps") || {};
    rsvps[toPromote.id] = toPromote;
    await this.db.set("rsvps", rsvps);
    
    return toPromote;
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    await this.ensureInitialized();
    
    const id = this.currentNotificationId++;
    await this.db.set("notificationIdCounter", this.currentNotificationId);
    
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date() 
    };
    
    const notifications = await this.db.get("notifications") || {};
    notifications[id] = notification;
    await this.db.set("notifications", notifications);
    
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const notifications = await this.db.get("notifications") || {};
    return Object.values(notifications).filter((notification: any) => notification.userId === userId);
  }

  async markNotificationSent(id: number): Promise<void> {
    const notifications = await this.db.get("notifications") || {};
    const notification = notifications[id];
    if (notification) {
      notification.sent = true;
      await this.db.set("notifications", notifications);
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
