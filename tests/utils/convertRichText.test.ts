// File: tests/utils/richTextConversion.test.ts
import { describe, it, expect } from "vitest";
import {
  richTextToInlineText,
  inlineTextToRichText,
  logger
} from "@utils/index.js"; // Adjust the path to your module
import { PartialUserObjectResponse, RichTextItemResponse, RichTextItemRequest } from "@notionhq/client/build/src/api-endpoints.js";


// Dummy rich text item response for testing richTextToInlineText
// (Simulates a Notion TextRichTextItemResponse)
const dummyTextRichItem: RichTextItemResponse = {
  type: "text",
  plain_text: "Hello",
  href: null,
  text: { content: "Hello", link: null },
  annotations: { bold: true, italic: false, underline: false, strikethrough: false, code: false, color: 'default' },
} as const;

const dummyMentionRichItem: RichTextItemResponse = {
  type: "mention",
  plain_text: "John",
  href: null,
  mention: {
    type: 'user', user: { id: "1234", object: 'user' } as PartialUserObjectResponse,
  },
  annotations: { bold: false, italic: false, underline: false, strikethrough: false, code: false, color: 'default' },
} as const;

const dummyEquationRichItem: RichTextItemResponse = {
  type: "equation",
  plain_text: "$x+1$",
  href: null,
  equation: { expression: "x+1" },
  annotations: { bold: false, italic: false, underline: false, strikethrough: false, code: false, color: 'default'},
} as const;

describe("richTextToInlineText", () => {
  it("should return an empty string for an empty array", () => {
    expect(richTextToInlineText([])).toBe("");
  });

  it("should convert a simple text item with bold annotation", () => {
    // Expect the applyAnnotations function to wrap bold text with "**"
    // Given our applyAnnotations: if bold is true, it wraps with **.
    const result = richTextToInlineText([dummyTextRichItem]);
    expect(result).toBe("**Hello**");
  });

  it("should convert a mention rich text item correctly", () => {
    // formatMention will output a string like: "@[John (user: 1234)]"
    const result = richTextToInlineText([dummyMentionRichItem]);
    // Expect output to include "John" and the mention syntax with "user" and "1234"
    expect(result).toContain("John");
    expect(result).toContain("(user: 1234)");
  });

  it("should convert an equation rich text item correctly", () => {
    // For an equation, the conversion wraps the expression with '$' signs.
    const result = richTextToInlineText([dummyEquationRichItem]);
    expect(result).toContain("$x+1$");
  });
});

describe("inlineTextToRichText", () => {
  it("should convert plain inline text into a rich text array", () => {
    const input = "Hello world";
    const result = inlineTextToRichText(input);
    // Expect at least one rich text item with type "text" and the given content.
    expect(Array.isArray(result)).toBe(true);
    const textItem = result.find(item => item.type === "text");
    expect(textItem).toBeDefined();
    if (textItem && textItem.type === "text") {
      expect(textItem.text.content).toBe("Hello world");
      // Without explicit markdown formatting, annotations should be false.
      expect(textItem.annotations?.bold).toBeFalsy();
      expect(textItem.annotations?.italic).toBeFalsy();
    }
  });

  it("should convert inline text with emphasis into a rich text with italic annotation", () => {
    // Markdown commonmark converts *Hello* to emphasis tokens.
    const input = "This is *italic* text.";
    const result = inlineTextToRichText(input);
    // Find the rich text item for "italic"
    const italicItem = result.find(item => item.type === "text" && item.text.content === "italic");
    expect(italicItem).toBeDefined();
    if (italicItem) {
      expect(italicItem.annotations?.italic).toBe(true);
    }
  });

  it("should convert inline code segments into rich text items with code annotation", () => {
    const input = "Here is `code` snippet.";
    const result = inlineTextToRichText(input);
    const codeItem = result.find(item => item.annotations?.code === true);
    expect(codeItem).toBeDefined();
    if (codeItem && codeItem.type === 'text') {
      // The content of the code inline should be "code"
      expect(codeItem.text.content).toBe('code');
    }
  });

  it("should convert inline text with mention into a rich text mention item", () => {
    // Given the mentionPlugin, a mention should be parsed.
    const input = "Hi @[John (user:1234)]!";
    const result = inlineTextToRichText(input);
    const mentionItem = result.find(item => item.type === "mention");
    expect(mentionItem).toBeDefined();
    if (mentionItem && mentionItem.type === "mention") {
      // Expect that the mention object has a "user" property with id "1234"
      expect(mentionItem.mention).toHaveProperty("user");
      // if(mentionItem.mention.hasOwnProperty('user')){
      //   logger.debug(`${JSON.stringify(mentionItem.mention.user)} has a user property`);
      //   expect(mentionItem.mention.user).toHaveProperty("id");
      // }
    }
  });
});
