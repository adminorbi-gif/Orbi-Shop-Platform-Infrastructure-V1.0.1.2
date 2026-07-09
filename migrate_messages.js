import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.log("No DATABASE_URL found in environment.");
  process.exit(0);
}

const client = new pg.Client({ connectionString });
async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL.");
    await client.query(`
      ALTER TABLE public.messages 
      ADD COLUMN IF NOT EXISTS seller_id TEXT;
    `);
    console.log("Successfully added seller_id column to messages table.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}
run();
