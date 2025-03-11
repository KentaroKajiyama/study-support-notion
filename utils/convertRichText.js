import MarkdownIt from "markdown-it";
import dollarmathPlugin from "markdown-it-dollarmath";
import { mentionPlugin } from "./mentionPlugin.js";

/**
 * Convert an array of rich_text objects from the Notion API
 * into a single plain-text string. Mentions are included
 * by examining their underlying properties.
 *
 * @param {Array} richTextArray - The array of rich_text objects.
 * @returns {String} - A concatenated plain-text version.
 */
/**
 * Convert a Notion-style rich text array back into a Markdown-like string
 * that matches the custom rules from inlineTextToRichText.
 * 
 * @param {Array} richTextArray - Array of Notion rich_text objects
 * @returns {string} - A Markdown-like inline string
 */
export function richTextToInlineText(richTextArray) {
  if (!Array.isArray(richTextArray) || richTextArray.length === 0) {
    return "";
  }

  let result = "";

  for (const rtItem of richTextArray) {
    let segment = "";

    // 1) Distinguish item.type (text, mention, equation, etc.)
    switch (rtItem.type) {
      case "text": {
        const { content, link } = extractTextAndLink(rtItem);
        // Apply annotations (bold/italic/strikethrough/underline/code)
        segment = applyAnnotations(content, rtItem.annotations, link);
        break;
      }

      case "mention": {
        // The structure: mention => { type: "user" | "page" | "database" | "date", ... }
        const mentionBlock = rtItem.mention;
        const plainText = rtItem.plain_text || ""; // fallback
        const { bold, italic, underline, strikethrough, code } = rtItem.annotations || {};

        if (!mentionBlock || !mentionBlock.type) {
          // Fallback to plain text
          segment = applyAnnotations(plainText, rtItem.annotations);
          break;
        }

        switch (mentionBlock.type) {
          case "user": {
            // For user mention:  @[Alice (user:abc123)]
            const userId = mentionBlock.user?.id || "";
            // Build custom syntax
            const mentionSyntax = `@[${plainText} (user:${userId})]`;
            segment = applyAnnotations(mentionSyntax, { bold, italic, underline, strikethrough, code });
            break;
          }
          case "page": {
            const pageId = mentionBlock.page?.id || "";
            const mentionSyntax = `@[${plainText} (page:${pageId})]`;
            segment = applyAnnotations(mentionSyntax, { bold, italic, underline, strikethrough, code });
            break;
          }
          case "database": {
            const dbId = mentionBlock.database?.id || "";
            const mentionSyntax = `@[${plainText} (database:${dbId})]`;
            segment = applyAnnotations(mentionSyntax, { bold, italic, underline, strikethrough, code });
            break;
          }
          case "date": {
            // date => { start: <date>, end: <date> }
            const start = mentionBlock.date?.start;
            const end = mentionBlock.date?.end;
            // Build: @[Event (date: start: 2025-02-28 end: 2025-03-30)]
            let dateSyntax = `@[${plainText} (date: start: ${start}`;
            if (end) {
              dateSyntax += ` end: ${end}`;
            }
            dateSyntax += `)]`;

            segment = applyAnnotations(dateSyntax, { bold, italic, underline, strikethrough, code });
            break;
          }
          default: {
            // If mentionBlock.type is unknown, fallback to plain text
            segment = applyAnnotations(plainText, { bold, italic, underline, strikethrough, code });
            break;
          }
        }
        break;
      }

      case "equation": {
        // e.g. { type: "equation", equation: { expression: "x^2 + y^2 = z^2" }, annotations: {...} }
        const expression = rtItem.equation?.expression || "";
        // We'll represent all equations as $expression$
        // (You could conditionally do $$ if you wanted multi-line)
        // Also apply bold/italic/etc. if you want (rare with math)
        // Typically, code for math in plain Markdown is just `$ ... $`.
        const { bold, italic, underline, strikethrough, code } = rtItem.annotations || {};
        const mathSyntax = `$${expression}$`;
        segment = applyAnnotations(mathSyntax, { bold, italic, underline, strikethrough, code });
        break;
      }

      default: {
        // Fallback: if we don't recognize the type, just convert it to an empty string or plain text
        segment = "";
        break;
      }
    }

    result += segment;
  }

  return result;
}

function extractTextAndLink(rtItem) {
  const content = rtItem.text?.content ?? "";
  const linkObj = rtItem.text?.link; // { url: "https://..." } or null
  const link = linkObj ? linkObj.url : null;
  return { content, link };
}

function applyAnnotations(text, annotations = {}, link = null) {
  if (!text) return "";
  const {
    bold = false,
    italic = false,
    underline = false,
    strikethrough = false,
    code = false,
  } = annotations;
  let transformed = text;
  // If code is true, we'll just wrap in backticks and ignore other formatting
  if (code) {
    // Markdown code: `text`
    return `\`${transformed}\``;
  }
  // If there's a link, wrap in [text](url)
  // (Do this before bold/italic/strikethrough, so we nest the markers *inside* the link label.)
  if (link) {
    transformed = `[${transformed}](${link})`;
  }
  // strikethrough => ~~text~~
  if (strikethrough) {
    transformed = `~~${transformed}~~`;
  }
  // bold => **text**
  if (bold) {
    transformed = `**${transformed}**`;
  }
  // italic => *text*
  if (italic) {
    transformed = `*${transformed}*`;
  }
  // underline => <u>text</u> (non-standard in markdown)
  if (underline) {
    transformed = `<u>${transformed}</u>`;
  }
  return transformed;
}


/**
 * @description
 * @date 21/02/2025
 * @export
 * @param {*} inlineText
 * @param {boolean} [isBold=false]
 * @param {boolean} [isItalic=false]
 * @param {boolean} [isUnderline=false]
 * @param {boolean} [isStrikethrough=false]
 * @returns {*} 
 */
export function inlineTextToRichText(
  inlineText,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  isStrikethrough = false
) {
  // Return an empty array if there's no text
  if (!inlineText) {
    return [];
  }

  // Initialize markdown-it with the desired configuration and plugin
  const md = new MarkdownIt("gfm-like")
                  .use(dollarmathPlugin, {
                    allow_space: true,
                    double_inline: true,
                  })
                  .use(mentionPlugin);

  // Parse the inline text
  const tokens = md.parse(inlineText, {});

  // According to the parser, tokens[1] holds the inline tokens.
  if (!tokens[1] || !tokens[1].children) {
    return [];
  }

  // Filter out any tokens with an empty text content.
  const tokenChildren = tokens[1].children.filter(
    (token) => !(token.type === "text" && token.content === "")
  );

  const richTextArray = [];
  let bold = isBold;
  let italic = isItalic;
  let underline = isUnderline;
  let strikethrough = isStrikethrough;
  let linkUrl = null;

  // Process each token to generate the corresponding rich text object.
  for (const token of tokenChildren) {
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
        // In markdown-it, token.attrs is an array like: [ [ "href", "https://example.com" ], ... ]
        if (token.attrs) {
          const hrefAttr = token.attrs.find((attr) => attr[0] === "href");
          if (hrefAttr) {
            linkUrl = hrefAttr[1];
          }
        }
        break;
      case "link_close":
        linkUrl = null;
        break;
      case "code_inline": {
        const content = token.content;
        richTextArray.push({
          type: "text",
          text: { content: content, link: null },
          annotations: {
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            code: true,
            color: "default",
          },
        });
        break;
      }
      case "math_inline":
      case "math_inline_double": {
        const content = token.content;
        richTextArray.push({
          type: "equation",
          equation: { expression: content },
          annotations: {
            bold: bold,
            italic: italic,
            underline: underline,
            strikethrough: strikethrough,
            code: false,
            color: "default",
          },
        });
        break;
      }
      case "text": {
        const content = token.content;
        const link = linkUrl ? { url: linkUrl } : null;
        richTextArray.push({
          type: "text",
          text: { content: content, link: link },
          annotations: {
            bold: bold,
            italic: italic,
            underline: underline,
            strikethrough: strikethrough,
            code: false,
            color: "default",
          },
        });
        break;
      }
      case "mention": {
        const content = token.content;
        const mentionType = token.meta.mentionType;
        const mentionValue = token.meta.mentionValue;
        let mentionObject;
        switch (mentionType) {
          case "user":
            mentionObject = {
              type: "mention",
              mention: {
                type: "user",
                user: { id: mentionValue },
              },
              annotations: {
                bold,
                italic,
                underline,
                strikethrough,
                code: false,
                color: "default",
              },
              plain_text: content,
            };
            break;

          case "page":
            mentionObject = {
              type: "mention",
              mention: {
                type: "page",
                page: { id: mentionValue },
              },
              annotations: {
                bold,
                italic,
                underline,
                strikethrough,
                code: false,
                color: "default",
              },
              plain_text: content,
            };
            break;

          case "database":
            mentionObject = {
              type: "mention",
              mention: {
                type: "database",
                database: { id: mentionValue },
              },
              annotations: {
                bold,
                italic,
                underline,
                strikethrough,
                code: false,
                color: "default",
              },
              plain_text: content,
            };
            break;

          case "date":
            const startMatch = /start:\s*([^\s]+)/.exec(mentionValue);
            const endMatch = /end:\s*([^\s]+)/.exec(mentionValue);

            const startDate = startMatch ? startMatch[1] : null;
            const endDate = endMatch ? endMatch[1] : null;
            mentionObject = {
              type: "mention",
              mention: {
                type: "date",
                date: { start: startDate, end: endDate }, 
              },
              annotations: {
                bold,
                italic,
                underline,
                strikethrough,
                code: false,
                color: "default",
              },
              plain_text: content,
            };
            break;

          default:
            // If you ever get an unknown mentionType, fallback to text or throw an error
            mentionObject = {
              type: "text",
              text: { content },
              annotations: {
                bold,
                italic,
                underline,
                strikethrough,
                code: false,
                color: "default",
              },
            };
            break;
        }

        richTextArray.push(mentionObject);
        break;
      }
      default:
        break;
    }
  }

  return richTextArray;
}
