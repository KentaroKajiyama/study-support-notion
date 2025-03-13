import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config(); 

export function getNotionClient(): Client {
  const notionApiKey: string | undefined = process.env.NOTION_API_KEY;

  if (!notionApiKey) {
    throw new Error("NOTION_API_KEY is not set in the environment variables.");
  }

  return new Client({
    auth: notionApiKey,
  });
}


