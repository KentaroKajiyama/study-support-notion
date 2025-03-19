import { describe, it, expect, beforeAll, afterAll } from "vitest";
import NotionAPI from "@infrastructure/notionAPI.js";
import { NotionUUID, toNotionUUID } from "@domain/types/myNotionTypes.js";
import { copyPageCreate, copyPageUpdate, copyPagePropertiesUpdate, deleteAllBlockChildren } from "@infrastructure/notionCopyPage.js";
import dotenv from "dotenv";

dotenv.config();

// Load actual Notion API credentials from .env
const TEST_PAGE_ID = process.env.TEST_SOURCE_PAGE_ID || "";
const TEST_DATABASE_ID = process.env.TEST_DATABASE_ID || "";
let copiedPageId = "1bbb95a4c61980f89039c1c26ead3399";

describe("Notion Page Copy Integration Tests", () => {
  beforeAll(() => {
    if (!process.env.TEST_NOTION_TOKEN) {
      throw new Error("Missing NOTION_TOKEN in environment");
    }
    if (!TEST_PAGE_ID) {
      throw new Error("Missing TEST_PAGE_ID in environment");
    }
    if (!TEST_DATABASE_ID) {
      throw new Error("Missing TEST_DATABASE_ID in environment");
    }
  });

  it("should create a copy of the page", async () => {
    copiedPageId = await copyPageCreate(toNotionUUID(TEST_PAGE_ID), toNotionUUID(TEST_DATABASE_ID));
    expect(copiedPageId).toBeDefined();
    expect(copiedPageId).not.toBe("");
  });

  it("should update the copied page properties", async () => {
    await copyPageUpdate(toNotionUUID(TEST_PAGE_ID), toNotionUUID(copiedPageId));
    const copiedPage = await NotionAPI.retrieveAPage(copiedPageId);
    expect(copiedPage).toBeDefined();
    expect(copiedPage.id).toBe(copiedPageId);
  });

  it("should copy only page properties without modifying blocks", async () => {
    await copyPagePropertiesUpdate(toNotionUUID(TEST_PAGE_ID), toNotionUUID(copiedPageId));
    const copiedPage = await NotionAPI.retrieveAPage(copiedPageId);
    expect(copiedPage).toBeDefined();
  });

  it("should delete all block children of the copied page", async () => {
    await deleteAllBlockChildren(copiedPageId);
    const copiedPageBlocks = await NotionAPI.retrieveBlockChildren(copiedPageId);
    expect(copiedPageBlocks.results.length).toBe(0);
  });

  afterAll(async () => {
    if (copiedPageId) {
      await NotionAPI.deleteAPage(copiedPageId as NotionUUID);
    }
  });
});