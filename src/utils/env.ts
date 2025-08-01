import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export the DATABASE_URL and SECRET constant
export const DATABASE_URL:string = process.env.DATABASE_URL || '';
export const SECRET:string = process.env.SECRET || ''; // Ensure a default value for SECRET