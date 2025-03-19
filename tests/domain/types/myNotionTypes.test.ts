import { describe, it, expect, vi } from "vitest";
import {
  isNotionUUID,
  toNotionUUID,
  isNotionDate,
  isNotionMentionString,
  toNotionMentionString,
  extractMentionDetails,
  inlineTextToMentionStringArray,
  fromStringToANotionMentionString,
  getMentionDetailsArrayFromInlineText,
  NotionMentionString,
  NotionUUID,
  NotionMentionType
} from "@domain/types/myNotionTypes.js";
import { logger } from "@utils/logger.js";

describe("UUID Functions", () => {
  it("should validate Notion UUID correctly", () => {
    expect(isNotionUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isNotionUUID("550e8400-e29b-41d4-a716")).toBe(false);
    expect(isNotionUUID("invalid-uuid")).toBe(false);
  });

  it("should convert a valid string to NotionUUID", () => {
    expect(toNotionUUID("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should throw an error for an invalid UUID", () => {
    expect(() => toNotionUUID("invalid-uuid")).toThrowError();
  });
});

describe("Date Functions", () => {
  it("should validate NotionDate format", () => {
    expect(isNotionDate("2024-03-19")).toBe(true);
    expect(isNotionDate("2024-13-01")).toBe(false);
    expect(isNotionDate("19-03-2024")).toBe(false);
  });
});

describe("Mention Functions", () => {
  it("should validate Notion Mention Strings", () => {
    expect(isNotionMentionString("@[John Doe (user:550e8400-e29b-41d4-a716-446655440000)]")).toBe(true);
    expect(isNotionMentionString("@[Database (database:12345678)]")).toBe(true);
    expect(isNotionMentionString("@[Today (date: start: '2025-03-19')]")).toBe(true);
    expect(isNotionMentionString("@[Invalid Mention]")).toBe(false);
  });

  it("should convert mention details to NotionMentionString", () => {
    const mentionDetail = { displayText: "John Doe", type: "user" as NotionMentionType, id: "550e8400-e29b-41d4-a716-446655440000" as NotionUUID };
    expect(toNotionMentionString(mentionDetail)).toBe("@[John Doe (user:550e8400-e29b-41d4-a716-446655440000)]");
  });

  it("should extract mention details correctly", () => {
    const mentionText = "@[John Doe (user:550e8400-e29b-41d4-a716-446655440000)]";
    const expectedDetail = { displayText: "John Doe", type: "user", id: "550e8400-e29b-41d4-a716-446655440000" };
    expect(extractMentionDetails(mentionText)).toEqual(expectedDetail);
  });

  it("should return null for invalid mentions", () => {
    expect(extractMentionDetails("Invalid Mention")).toBeNull();
  });

  it("should extract multiple mentions from inline text", () => {
    const inlineText = "Hello @[John Doe (user:550e8400-e29b-41d4-a716-446655440000)] @[Alice (page:12345678)]! You should do this by @[Today (date: start: '2025-03-19')]";
    const expectedMentions: NotionMentionString[] = [
      "@[John Doe (user:550e8400-e29b-41d4-a716-446655440000)]",
      "@[Alice (page:12345678)]",
      "@[Today (date: start: '2025-03-19')]"
    ];
    expect(inlineTextToMentionStringArray(inlineText)).toEqual(expectedMentions);
  });

  it("should extract mention details from inline text", () => {
    const inlineText = "Check @[John Doe (user:550e8400-e29b-41d4-a716-446655440000)] for details.";
    const expectedDetails = [
      { displayText: "John Doe", type: "user", id: "550e8400-e29b-41d4-a716-446655440000" }
    ];
    expect(getMentionDetailsArrayFromInlineText(inlineText)).toEqual(expectedDetails);
  });

  it("should extract the first mention from a normal string", () => {
    const input = "Message @[John Doe (user:550e8400-e29b-41d4-a716-446655440000)] in chat.";
    expect(fromStringToANotionMentionString(input)).toBe("@[John Doe (user:550e8400-e29b-41d4-a716-446655440000)]");
  });

  it("should throw an error if no mention is found", () => {
    expect(() => fromStringToANotionMentionString("No mention here.")).toThrowError();
  });

  it("should warn if multiple mentions are found", () => {
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});
    fromStringToANotionMentionString("Text @[John Doe (user:123)] @[Alice (page:456)]!");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("You provide more than one mention."));
    warnSpy.mockRestore();
  });
});
