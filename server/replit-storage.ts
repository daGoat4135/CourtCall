
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
import { IStorage } from "./storage";

export class ReplitStorage implements IStorage {
  private db: any;
  private currentUserId: number = 1;
  private currentMatchId: number = 1;
  private currentRsvpId: number = 1;
  private currentNotificationId: number = 1;

  constructor() {
    this.db = (global as any).db || {};
    (global as any).db = this.db;
    // Initialize counters and sample data if needed
    this.initializeIfNeeded();
  }

  private initializeIfNeeded() {
    // Initialize counters if they don't exist
    if (!this.db.userIdCounter) {
      this.db.userIdCounter = 1;
      this.currentUserId = 1;
    } else {
      this.currentUserId = this.db.userIdCounter;
    }
    
    if (!this.db.matchIdCounter) {
      this.db.matchIdCounter = 1;
      this.currentMatchId = 1;
    } else {
      this.currentMatchId = this.db.matchIdCounter;
    }
    
    if (!this.db.rsvpIdCounter) {
      this.db.rsvpIdCounter = 1;
      this.currentRsvpId = 1;
    } else {
      this.currentRsvpId = this.db.rsvpIdCounter;
    }
    
    if (!this.db.notificationIdCounter) {
      this.db.notificationIdCounter = 1;
      this.currentNotificationId = 1;
    } else {
      this.currentNotificationId = this.db.notificationIdCounter;
    }

    // Initialize with time slots only (no sample data)
    const matches = this.db.matches || {};
    if (Object.keys(matches).length === 0) {
      this.createFixedTimeSlotsAsync();
    }
  }

  private async createFixedTimeSlotsAsync() {
    // Run initialization in background
    setTimeout(async () => {
      await this.createFixedTimeSlots();
    }, 0);
  }

  private async initializeSampleData() {
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
    
    // Add some sample RSVPs to show the interface in action
    await this.addSampleRSVPs();
  }

  private async addSampleRSVPs() {
    // Get some matches to add RSVPs to
    const matches = this.db.matches || {};
    const matchList = Object.values(matches) as Match[];
    
    // Add RSVPs to a few matches to show different states
    if (matchList.length > 0) {
      // Join first lunch match with 2 players
      const lunchMatch = matchList.find(m => m.timeSlot === "lunch");
      if (lunchMatch) {
        await this.createRsvp({ matchId: lunchMatch.id, userId: 1, status: "confirmed" });
        await this.createRsvp({ matchId: lunchMatch.id, userId: 2, status: "confirmed" });
      }
      
      // Join first morning match with 3 players (almost full)
      const morningMatch = matchList.find(m => m.timeSlot === "morning");
      if (morningMatch) {
        await this.createRsvp({ matchId: morningMatch.id, userId: 3, status: "confirmed" });
        await this.createRsvp({ matchId: morningMatch.id, userId: 4, status: "confirmed" });
        await this.createRsvp({ matchId: morningMatch.id, userId: 5, status: "confirmed" });
      }
      
      // Fill one afterwork match completely
      const afterworkMatch = matchList.find(m => m.timeSlot === "afterwork");
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
    const users = this.db.users || {};
    return users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.db.users || {};
    return Object.values(users).find((user: any) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Initialize counters if they don't exist
    if (!this.db.userIdCounter) {
      this.db.userIdCounter = 1;
      this.currentUserId = 1;
    }
    
    const id = this.currentUserId++;
    this.db.userIdCounter = this.currentUserId;
    
    const user: User = { ...insertUser, id };
    
    const users = this.db.users || {};
    users[id] = user;
    this.db.users = users;
    
    return user;
  }

  async getOrCreateUserByName(name: string): Promise<User> {
    // Check if user already exists by name
    const users = this.db.users || {};
    const existingUser = Object.values(users).find((user: any) => user.name === name);
    if (existingUser) {
      return existingUser as User;
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
    const users = this.db.users || {};
    return Object.values(users);
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    const matches = this.db.matches || {};
    return matches[id];
  }

  async getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    const matches = this.db.matches || {};
    return Object.values(matches).filter((match: any) => {
      const matchDate = new Date(match.date);
      return matchDate >= startDate && matchDate <= endDate;
    });
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    // Initialize counters if they don't exist
    if (!this.db.matchIdCounter) {
      this.db.matchIdCounter = 1;
      this.currentMatchId = 1;
    }
    
    const id = this.currentMatchId++;
    this.db.matchIdCounter = this.currentMatchId;
    
    const match: Match = { 
      ...insertMatch, 
      id, 
      createdAt: new Date() 
    };
    
    const matches = this.db.matches || {};
    matches[id] = match;
    this.db.matches = matches;
    
    return match;
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const matches = this.db.matches || {};
    const match = matches[id];
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    matches[id] = updatedMatch;
    this.db.matches = matches;
    
    return updatedMatch;
  }

  async deleteMatch(id: number): Promise<boolean> {
    const matches = this.db.matches || {};
    if (!matches[id]) return false;
    
    delete matches[id];
    this.db.matches = matches;
    return true;
  }

  // RSVP operations
  async getRsvpsByMatch(matchId: number): Promise<Rsvp[]> {
    const rsvps = this.db.rsvps || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.matchId === matchId);
  }

  async getRsvpsByUser(userId: number): Promise<Rsvp[]> {
    const rsvps = this.db.rsvps || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.userId === userId);
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    // Initialize counters if they don't exist
    if (!this.db.rsvpIdCounter) {
      this.db.rsvpIdCounter = 1;
      this.currentRsvpId = 1;
    }
    
    const id = this.currentRsvpId++;
    this.db.rsvpIdCounter = this.currentRsvpId;
    
    const rsvp: Rsvp = { 
      ...insertRsvp, 
      id, 
      joinedAt: new Date() 
    };
    
    const rsvps = this.db.rsvps || {};
    rsvps[id] = rsvp;
    this.db.rsvps = rsvps;
    
    return rsvp;
  }

  async deleteRsvp(matchId: number, userId: number): Promise<boolean> {
    const rsvps = this.db.rsvps || {};
    const rsvp = Object.values(rsvps).find((r: any) => r.matchId === matchId && r.userId === userId);
    if (!rsvp) return false;
    
    delete rsvps[(rsvp as any).id];
    this.db.rsvps = rsvps;
    return true;
  }

  async getRsvpCount(matchId: number): Promise<number> {
    const rsvps = this.db.rsvps || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.matchId === matchId && rsvp.status !== "cancelled").length;
  }

  async getConfirmedRsvpCount(matchId: number): Promise<number> {
    const rsvps = this.db.rsvps || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.matchId === matchId && rsvp.status === "confirmed").length;
  }

  async getWaitlistedRsvps(matchId: number): Promise<Rsvp[]> {
    const rsvps = this.db.rsvps || {};
    return Object.values(rsvps).filter((rsvp: any) => rsvp.matchId === matchId && rsvp.status === "waitlisted");
  }

  async promoteFromWaitlist(matchId: number): Promise<Rsvp | null> {
    const waitlisted = await this.getWaitlistedRsvps(matchId);
    if (waitlisted.length === 0) return null;
    
    // Get the first waitlisted person (first come, first served)
    const toPromote = waitlisted.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())[0];
    toPromote.status = "confirmed";
    
    const rsvps = this.db.rsvps || {};
    rsvps[toPromote.id] = toPromote;
    this.db.rsvps = rsvps;
    
    return toPromote;
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    // Initialize counters if they don't exist
    if (!this.db.notificationIdCounter) {
      this.db.notificationIdCounter = 1;
      this.currentNotificationId = 1;
    }
    
    const id = this.currentNotificationId++;
    this.db.notificationIdCounter = this.currentNotificationId;
    
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date() 
    };
    
    const notifications = this.db.notifications || {};
    notifications[id] = notification;
    this.db.notifications = notifications;
    
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const notifications = this.db.notifications || {};
    return Object.values(notifications).filter((notification: any) => notification.userId === userId);
  }

  async markNotificationSent(id: number): Promise<void> {
    const notifications = this.db.notifications || {};
    const notification = notifications[id];
    if (notification) {
      notification.sent = true;
      notifications[id] = notification;
      this.db.notifications = notifications;
    }
  }

  // Analytics
  async getPlayerStats(startDate: Date, endDate: Date): Promise<Array<{
    userId: number;
    user: User;
    gameCount: number;
  }>> {
    console.log("getPlayerStats called with:", { startDate, endDate });
    
    const matchesInRange = await this.getMatchesByDateRange(startDate, endDate);
    console.log("Matches in range:", matchesInRange.length);
    
    const userStats = new Map<number, number>();

    // Get all RSVPs for matches in range
    const rsvps = this.db.rsvps || {};
    const allRsvps = Object.values(rsvps) as Rsvp[];
    console.log("Total RSVPs in database:", allRsvps.length);
    
    for (const match of matchesInRange) {
      const matchRsvps = allRsvps.filter(rsvp => rsvp.matchId === match.id);
      console.log(`Match ${match.id} has ${matchRsvps.length} RSVPs`);
      for (const rsvp of matchRsvps) {
        if (rsvp.status === "confirmed") {
          userStats.set(rsvp.userId, (userStats.get(rsvp.userId) || 0) + 1);
          console.log(`User ${rsvp.userId} now has ${userStats.get(rsvp.userId)} games`);
        }
      }
    }

    console.log("User stats map:", Array.from(userStats.entries()));

    // Build result array with user data
    const result = [];
    for (const [userId, gameCount] of userStats) {
      const user = await this.getUser(userId);
      if (user) {
        result.push({ userId, user, gameCount });
        console.log(`Added user ${user.name} with ${gameCount} games`);
      } else {
        console.log(`User ${userId} not found`);
      }
    }

    console.log("Final leaderboard result:", result);
    return result.sort((a, b) => b.gameCount - a.gameCount);
  }
}
