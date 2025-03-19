// File: tests/integration/notionAPI.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import NotionAPI from "@infrastructure/notionAPI.js"; // Adjust path as needed
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import dotenv from 'dotenv';
import { NotionUUID } from "@domain/types/myNotionTypes.js";

// Load environment variables (e.g., from .env)
const TEST_PAGE_ID = process.env.TEST_PAGE_ID || "";
const TEST_DATABASE_ID = process.env.TEST_DATABASE_ID || "";

describe("NotionAPI Integration Tests", () => {
  // Optional: validate environment variables
  beforeAll(() => {
    dotenv.config();
    if (!process.env.TEST_NOTION_TOKEN) {
      throw new Error("Missing TEST_NOTION_TOKEN in environment");
    }
    if (!TEST_PAGE_ID) {
      throw new Error("Missing TEST_PAGE_ID in environment");
    }
    if (!TEST_DATABASE_ID) {
      throw new Error("Missing TEST_DATABASE_ID in environment");
    }
  });

  it("should retrieve an existing page", async () => {
    // Attempt to fetch an existing page with the given PAGE_ID
    const page = await NotionAPI.retrieveAPage(TEST_PAGE_ID);
    expect(page).toBeDefined();
    // Optionally check some known property, e.g. archived flag or something
    expect((page as PageObjectResponse).archived).toBe(false);
  });

  it("should update page properties", async () => {
    // Attempt to set some minimal property
    const response = await NotionAPI.updatePageProperties(TEST_PAGE_ID, {
      // Example property: Title (change to an actual existing property)
      チェック項目: {
        title: [
          {
            text: { content: "Vitest Integration Check" },
          },
        ],
      },
    });
    expect(response).toBeDefined();
    // If your page has a 'title' property, verify the updated text
    // This depends on how your database is structured
    // For a "title" property, the Notion API might store it under a different key
    // so adapt accordingly.
  });

  it("should query an existing database", async () => {
    // Attempt to query a known existing database
    const results = await NotionAPI.queryADatabase(TEST_DATABASE_ID);
    expect(Array.isArray(results)).toBe(true);
    // You can further check that results has length or some known data
  });

  it("should create and delete a page under the test database", async () => {
    // Create a new page in the database
    const newPage = await NotionAPI.createAPage(
      {
        database_id: TEST_DATABASE_ID,
      },
      {
        // Minimal properties for the database
        チェック項目: { title: [{ text: { content: "Integration Test Page" } }] },
      }
    );
    expect(newPage).toBeDefined();
    expect(newPage.id).toBeTruthy();


    // Now delete (archive) the page
    const deletedPage = await NotionAPI.deleteAPage("1bbb95a4c61981b29e6de6c89a8bd977" as NotionUUID);
    expect((deletedPage as PageObjectResponse).archived).toBe(true);

    const restorePage = await NotionAPI.restoreAPage("1bbb95a4c61981b29e6de6c89a8bd977" as NotionUUID);
    expect((restorePage as PageObjectResponse).archived).toBe(false);
  });
});
