import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

export function getNotionClient() {
  // Expecting a NOTION_API_KEY environment variable
  dotenv.config({ path: './config/.env'})
  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
}
