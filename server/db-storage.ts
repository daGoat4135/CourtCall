
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
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

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getOrCreateUserByName(name: string): Promise<User> {
    // Check if user already exists by name
    const existingUser = await this.db.select().from(users).where(eq(users.name, name));
    if (existingUser.length > 0) {
      return existingUser[0];
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
    return await this.db.select().from(users);
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    const result = await this.db.select().from(matches).where(eq(matches.id, id));
    return result[0];
  }

  async getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    return await this.db
      .select()
      .from(matches)
      .where(
        and(
          gte(matches.date, startDate),
          lte(matches.date, endDate)
        )
      )
      .orderBy(asc(matches.date));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const result = await this.db.insert(matches).values(insertMatch).returning();
    return result[0];
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const result = await this.db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return result[0];
  }

  async deleteMatch(id: number): Promise<boolean> {
    const result = await this.db.delete(matches).where(eq(matches.id, id));
    return result.count > 0;
  }

  // RSVP operations
  async getRsvpsByMatch(matchId: number): Promise<Rsvp[]> {
    return await this.db
      .select()
      .from(rsvps)
      .where(eq(rsvps.matchId, matchId))
      .orderBy(asc(rsvps.joinedAt));
  }

  async getRsvpsByUser(userId: number): Promise<Rsvp[]> {
    return await this.db
      .select()
      .from(rsvps)
      .where(eq(rsvps.userId, userId))
      .orderBy(desc(rsvps.joinedAt));
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const result = await this.db.insert(rsvps).values(insertRsvp).returning();
    return result[0];
  }

  async deleteRsvp(matchId: number, userId: number): Promise<boolean> {
    const result = await this.db
      .delete(rsvps)
      .where(
        and(
          eq(rsvps.matchId, matchId),
          eq(rsvps.userId, userId)
        )
      );
    return result.count > 0;
  }

  async getRsvpCount(matchId: number): Promise<number> {
    const result = await this.db
      .select()
      .from(rsvps)
      .where(
        and(
          eq(rsvps.matchId, matchId),
          eq(rsvps.status, 'confirmed')
        )
      );
    return result.length;
  }

  async getConfirmedRsvpCount(matchId: number): Promise<number> {
    const result = await this.db
      .select()
      .from(rsvps)
      .where(
        and(
          eq(rsvps.matchId, matchId),
          eq(rsvps.status, 'confirmed')
        )
      );
    return result.length;
  }

  async getWaitlistedRsvps(matchId: number): Promise<Rsvp[]> {
    return await this.db
      .select()
      .from(rsvps)
      .where(
        and(
          eq(rsvps.matchId, matchId),
          eq(rsvps.status, 'waitlisted')
        )
      )
      .orderBy(asc(rsvps.joinedAt));
  }

  async promoteFromWaitlist(matchId: number): Promise<Rsvp | null> {
    const waitlisted = await this.getWaitlistedRsvps(matchId);
    if (waitlisted.length === 0) return null;
    
    // Get the first waitlisted person (first come, first served)
    const toPromote = waitlisted[0];
    const result = await this.db
      .update(rsvps)
      .set({ status: 'confirmed' })
      .where(eq(rsvps.id, toPromote.id))
      .returning();
    
    return result[0];
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await this.db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationSent(id: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ sent: true })
      .where(eq(notifications.id, id));
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
      const matchRsvps = await this.getRsvpsByMatch(match.id);
      for (const rsvp of matchRsvps) {
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
