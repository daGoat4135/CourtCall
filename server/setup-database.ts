
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

    console.log('Database migration completed - ready for use!');

    await client.end();
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Database setup failed:', error);
    await client.end();
    throw error;
  }
}



// Run setup if this file is executed directly
if (import.meta.main) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };
