import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import PrismaClient using dynamic import
const { PrismaClient } = await import('@prisma/client');

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/.env` });

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Successfully connected to the database!');
    console.log('Test query result:', result);
    
    // List existing tables (if any)
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('\nExisting tables:', tables);
    
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
