import MarkdownIt from "markdown-it";
import dollarmathPlugin from "markdown-it-dollarmath";
import { mentionPlugin, MentionTokenMeta } from "@utils/index.js";
import { MentionRichTextItemResponse, RichTextItemRequest, RichTextItemResponse, TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { RichTextMentionItemRequest } from "@domain/types/index.js";

// Define the RichText structure based on Notion API documentation
interface Annotations {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export function richTextToInlineText(richTextArray: RichTextItemResponse[]): string {
  if (!Array.isArray(richTextArray) || richTextArray.length === 0) {
    return "";
  }

  return richTextArray.map((rtItem) => convertRichTextItem(rtItem)).join("");
}

function convertRichTextItem(rtItem: RichTextItemResponse): string {
  let segment = "";

  switch (rtItem.type) {
    case "text": {
      const { content, link } = extractTextAndLink(rtItem);
      segment = applyAnnotations(content, rtItem.annotations, link);
      break;
    }
    case "mention": {
      segment = formatMention(rtItem);
      break;
    }
    case "equation": {
      const expression = rtItem.equation?.expression || "";
      segment = applyAnnotations(`$${expression}$`, rtItem.annotations);
      break;
    }
    default:
      segment = "";
  }

  return segment;
}

/**
 * Extracts text content and link from a rich_text item.
 */
function extractTextAndLink(rtItem: TextRichTextItemResponse): { content: string; link: string | null } {
  const content = rtItem.text?.content ?? "";
  const link = rtItem.text?.link?.url ?? null;
  return { content, link };
}

/**
 * Applies formatting annotations to text.
 */
function applyAnnotations(text: string, annotations: Annotations = {}, link: string | null = null): string {
  if (!text) return "";

  let transformed = text;
  if (annotations.code) return `\`${transformed}\``;
  if (link) transformed = `[${transformed}](${link})`;
  if (annotations.strikethrough) transformed = `~~${transformed}~~`;
  if (annotations.bold) transformed = `**${transformed}**`;
  if (annotations.italic) transformed = `*${transformed}*`;
  if (annotations.underline) transformed = `<u>${transformed}</u>`;

  return transformed;
}

/**
 * Formats Notion mention objects into markdown-style syntax.
 */
function formatMention(rtItem: MentionRichTextItemResponse): string {
  const mentionBlock = rtItem.mention ;
  const plainText = rtItem.plain_text || "";
  if (!mentionBlock) return applyAnnotations(plainText, rtItem.annotations);

  let mentionSyntax = `@[${plainText} (${mentionBlock.type}:`;
  switch (mentionBlock.type) {
    case "user":
      mentionSyntax += ` ${mentionBlock.user?.id}`;
      break;
    case "page":
      mentionSyntax += ` ${mentionBlock.page?.id}`;
      break;
    case "database":
      mentionSyntax += ` ${mentionBlock.database?.id}`;
      break;
    case "date":
      mentionSyntax += ` start: ${mentionBlock.date?.start}`;
      if (mentionBlock.date?.end) mentionSyntax += ` end: ${mentionBlock.date.end}`;
      break;
    default:
      return applyAnnotations(plainText, rtItem.annotations);
  }

  mentionSyntax += `)]`;
  return applyAnnotations(mentionSyntax, rtItem.annotations);
}

/**
 * Converts inline text to Notion-style rich text.
 */
export function inlineTextToRichText(
  inlineText: string,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  isStrikethrough = false
): RichTextItemRequest[] {
  if (!inlineText) return [];

  const md = new MarkdownIt("commonmark")
    .use(dollarmathPlugin, { allow_space: true, double_inline: true })
    .use(mentionPlugin);

  const tokens = md.parse(inlineText, {});

  if (!tokens[1] || !tokens[1].children) return [];

  const richTextArray: RichTextItemRequest[] = [];
  let bold = isBold,
    italic = isItalic,
    underline = isUnderline,
    strikethrough = isStrikethrough,
    linkUrl: string | null = null;

  for (const token of tokens[1].children) {
    switch (token.type) {
      case "s_open":
        strikethrough = true;
        break;
      case "s_close":
        strikethrough = false;
        break;
      case "strong_open":
        bold = true;
        break;
      case "strong_close":
        bold = false;
        break;
      case "em_open":
        italic = true;
        break;
      case "em_close":
        italic = false;
        break;
      case "link_open":
        if (token.attrs) {
          const hrefAttr = token.attrs.find((attr) => attr[0] === "href");
          if (hrefAttr) linkUrl = hrefAttr[1];
        }
        break;
      case "link_close":
        linkUrl = null;
        break;
      case "code_inline": {
        richTextArray.push({
          type: "text",
          text: { content: token.content, link: undefined },
          annotations: { bold: false, italic: false, underline: false, strikethrough: false, code: true },
        });
        break;
      }
      case "math_inline":
      case "math_inline_double": {
        richTextArray.push({
          type: "equation",
          equation: { expression: token.content },
          annotations: { bold: bold, italic: italic, underline: underline, strikethrough: strikethrough, code: false },
        });
        break;
      }
      case "mention_token": { // ✅ Handle mention tokens
        const mentionMeta = token.meta as MentionTokenMeta;
        if (['user', 'person', 'bot', 'workspace', 'page', 'database'].includes(mentionMeta.mentionType)) {
          richTextArray.push({
            type: "mention",
            mention: {
              [mentionMeta.mentionType]: { id: mentionMeta.mentionValue },
            },
            annotations: { bold: bold, italic: italic, underline: underline, strikethrough: strikethrough, code: false },
          } as RichTextMentionItemRequest);
        } else if (mentionMeta.mentionType === 'date') {
          const dateRegex = /start:\s?([\d-:T]+)(?:\s?end:\s?([\d-:T]+|null))?/;
          const match = mentionMeta.mentionValue.match(dateRegex);

          if (!match) throw new Error(`Invalid date value "${mentionMeta.mentionValue}".`);
          if (match[1] === null) throw new Error(`Invalid date value "${mentionMeta.mentionValue}".`);

          richTextArray.push({
            type: "mention",
            mention: {
              date: { start: match[1], end: match[2] !== "null" ? match[2] : null },
            },
            annotations: { bold, italic, underline, strikethrough, code: false },
          } as RichTextMentionItemRequest);
        } else {
          throw new Error(`Invalid mention type "${mentionMeta.mentionType}". Supported types: user, page, database, date.`);
        }
        break;
      }
      case "text": {
        richTextArray.push({
          type: "text",
          text: { content: token.content, link: linkUrl ? { url: linkUrl } : null },
          annotations: { bold, italic, underline, strikethrough, code: false },
        });
        break;
      }
    }
  }

  return richTextArray;
}
