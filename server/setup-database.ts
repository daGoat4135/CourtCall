
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, matches, rsvps } from '@shared/schema';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Run migration
    const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running database migration...');
    await client.unsafe(migrationSQL);
    console.log('Migration completed successfully!');

    // Check if we need to seed sample data
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Seeding sample data...');
      await seedSampleData(db);
      console.log('Sample data seeded successfully!');
    }

    await client.end();
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Database setup failed:', error);
    await client.end();
    throw error;
  }
}

async function seedSampleData(db: any) {
  // Create sample users
  const sampleUsers = [
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

  const createdUsers = await db.insert(users).values(sampleUsers).returning();

  // Create sample matches
  const today = new Date();
  const timeSlots = ["morning", "lunch", "afterwork"];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const slot of timeSlots) {
      await db.insert(matches).values({
        date: date,
        timeSlot: slot,
        maxPlayers: 4,
        status: "open"
      });
    }
  }

  // Add some sample RSVPs
  const allMatches = await db.select().from(matches);
  
  if (allMatches.length > 0) {
    // Join first lunch match with 2 players
    const lunchMatch = allMatches.find(m => m.timeSlot === "lunch");
    if (lunchMatch) {
      await db.insert(rsvps).values([
        { matchId: lunchMatch.id, userId: createdUsers[0].id, status: "confirmed" },
        { matchId: lunchMatch.id, userId: createdUsers[1].id, status: "confirmed" }
      ]);
    }
    
    // Join first morning match with 3 players (almost full)
    const morningMatch = allMatches.find(m => m.timeSlot === "morning");
    if (morningMatch) {
      await db.insert(rsvps).values([
        { matchId: morningMatch.id, userId: createdUsers[2].id, status: "confirmed" },
        { matchId: morningMatch.id, userId: createdUsers[3].id, status: "confirmed" },
        { matchId: morningMatch.id, userId: createdUsers[4].id, status: "confirmed" }
      ]);
    }
    
    // Fill one afterwork match completely
    const afterworkMatch = allMatches.find(m => m.timeSlot === "afterwork");
    if (afterworkMatch) {
      await db.insert(rsvps).values([
        { matchId: afterworkMatch.id, userId: createdUsers[5].id, status: "confirmed" },
        { matchId: afterworkMatch.id, userId: createdUsers[6].id, status: "confirmed" },
        { matchId: afterworkMatch.id, userId: createdUsers[7].id, status: "confirmed" },
        { matchId: afterworkMatch.id, userId: createdUsers[8].id, status: "confirmed" }
      ]);
      
      // Update match status to full
      await db.update(matches).set({ status: "full" }).where({ id: afterworkMatch.id });
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };
