import { Client } from '@notionhq/client';

export function getNotionClient() {
  // Expecting a NOTION_API_KEY environment variable
  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
}
