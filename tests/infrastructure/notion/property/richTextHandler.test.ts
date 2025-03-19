import { describe, it, expect, vi } from "vitest";
import { 
  richTextResponseHandler, 
  richTextRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import {
  inlineTextToMentionStringArray,
  NotionMentionString,
  RichTextPropertyRequest,
  RichTextPropertyResponse,
  isNotionMentionString
} from "@domain/types/index.js";

import {
  richTextToInlineText,
  inlineTextToRichText
} from "@utils/index.js";
import { TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints.js";

// // Mock necessary dependencies
// vi.mock("@utils/index.js", () => ({
//   richTextToInlineText: vi.fn((richText) => richText.map(item => item.plain_text).join(" ")),
//   inlineTextToRichText: vi.fn((text) => [{ type: "text", text: { content: text }, plain_text: text }])
// }));

// vi.mock("@domain/types/index.js", () => ({
//   inlineTextToMentionStringArray: vi.fn((text) => text.includes("@") ? [text] : []),
//   isNotionMentionString: vi.fn((text) => text.startsWith("@"))
// }));

describe("richTextResponseHandler", () => {
  it("should return a mention string when option is 'a mention string'", () => {
    const mockResponse = {
        "id": "HbZT",
        "type": "rich_text",
        "rich_text": [
          {
            "type": "mention",
            "mention": {
              "type": "database",
              "database": {
                "id": "a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b"
              }
            },
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            },
            "plain_text": "Database with test things",
            "href": "https://www.notion.so/a1d8501e1ac143e9a6bdea9fe6c8822b"
          }
        ]
      } as RichTextPropertyResponse;

    const result = richTextResponseHandler(mockResponse, "a mention string");

    expect(result).toBe("@[Database with test things (database: a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b)]");
  });

  it("should throw an error when there are no mentions", () => {
    const mockResponse = {
      "id": "HbZT",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Some words ",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Some words ",
          "href": null
        }
      ]
    } as RichTextPropertyResponse;

    expect(() => richTextResponseHandler(mockResponse, "a mention string")).toThrowError("No mention information available");
  });

  it("should throw an error when there are multiple mentions", () => {

    const mockResponse: RichTextPropertyResponse = {
      id: "mock",
      type: "rich_text",
      rich_text: [{
        "type": "mention",
        "mention": {
          "type": "database",
          "database": {
            "id": "a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b"
          }
        },
        "annotations": {
          "bold": false,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        },
        "plain_text": "Database with test things",
        "href": "https://www.notion.so/a1d8501e1ac143e9a6bdea9fe6c8822b"
      },
      {
        "type": "mention",
        "mention": {
          "type": "database",
          "database": {
            "id": "a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b"
          }
        },
        "annotations": {
          "bold": false,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        },
        "plain_text": "Database with test things",
        "href": "https://www.notion.so/a1d8501e1ac143e9a6bdea9fe6c8822b"
      }]
    };

    expect(() => richTextResponseHandler(mockResponse, "a mention string")).toThrowError("Too many mention information available");
  });

  it("should return a string when option is 'string'", () => {
    const mockResponse: RichTextPropertyResponse = {
      "id": "HbZT",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Hello World",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Hello World",
          "href": null
        },
      ]
    } as RichTextPropertyResponse;

    const result = richTextResponseHandler(mockResponse, "string");

    expect(result).toBe("Hello World");
  });

  it("should throw an error for an invalid option", () => {
    const mockResponse: RichTextPropertyResponse = {
      "id": "HbZT",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "There is some ",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "There is some ",
          "href": null
        },
        {
          "type": "text",
          "text": {
            "content": "text",
            "link": null
          },
          "annotations": {
            "bold": true,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "text",
          "href": null
        },
        {
          "type": "text",
          "text": {
            "content": " in this property!",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": " in this property!",
          "href": null
        }
      ]
    } as RichTextPropertyResponse;

    expect(() => richTextResponseHandler(mockResponse, "invalid-option" as any)).toThrowError("Invalid richText option");
  });
});

describe("richTextRequestHandler", () => {
  it("should return a valid RichTextPropertyRequest for 'a mention string'", () => {
    const input: NotionMentionString = "@[notionUser (user:mockid)]";
    const expected: RichTextPropertyRequest = {
      rich_text: [{ type: "mention", mention: { user: {id: "mockid"} }, 
        "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
          } }],
      type: "rich_text"
    };

    const result = richTextRequestHandler(input, "a mention string");

    expect(result).toEqual(expected);
  });

  it("should throw an error if mention string is invalid", () => {

    expect(() => richTextRequestHandler("Hello", "a mention string")).toThrowError("You must provide a mention string: Hello");
  });

  it("should return a valid RichTextPropertyRequest for 'string'", () => {
    const input = "Hello World";
    const expected: RichTextPropertyRequest = {
      rich_text: [{ 
        type: "text", 
        text: { content: "Hello World", link: null }, 
        "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
          }
        }],
      type: "rich_text"
    };

    const result = richTextRequestHandler(input, "string");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid option", () => {
    expect(() => richTextRequestHandler("Hello", "invalid-option" as any)).toThrowError("Invalid RichText option");
  });
});
