import MarkdownIt from "markdown-it";
import { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import { Token } from "markdown-it/index.js";

// Define MentionPlugin options (extendable in the future)
interface MentionPluginOptions {}

// Define custom token type
interface MentionTokenMeta {
  mentionType: "user" | "page" | "database" | "date";
  mentionValue: string;
}

/**
 * A Markdown-It plugin to process mentions in the format:
 *   @[Username (user:1234)]
 *   @[Project (page:abcd-efgh)]
 *   @[Database (database:xyz)]
 *   @[Event (date:2025-02-28)]
 *
 * @param {MarkdownIt} md - The Markdown-It instance.
 * @param {MentionPluginOptions} [options={}] - Plugin options.
 */
export function mentionPlugin(md: MarkdownIt, options: MentionPluginOptions = {}): void {
  const MENTION_RE = /^@\[([^()]+)\((user|page|database|date):([^)]+)\)\]/;

  const mentionInline: RuleInline = (state, silent): boolean => {
    // If the current position doesn't start with '@[', bail early
    if (state.src[state.pos] !== "@" || state.src[state.pos + 1] !== "[") {
      return false;
    }

    // Match the mention syntax
    const match = MENTION_RE.exec(state.src.slice(state.pos));
    if (!match) return false;

    if (!silent) {
      // Create a new token for the mention
      const token = state.push("mention_token", "", 0);
      token.content = match[1].trim(); // Extract the display text
      token.meta = {
        mentionType: match[2].trim(), // "user" | "page" | "database" | "date"
        mentionValue: match[3].trim(), // Extracted ID or date
      } as MentionTokenMeta;
    }

    // Move the parser position forward by the match length
    state.pos += match[0].length;
    return true;
  };

  // Register the inline rule before emphasis (or wherever appropriate)
  md.inline.ruler.before("emphasis", "mention_inline", mentionInline);

  // Define a renderer for HTML output (optional)
  md.renderer.rules.mention_token = (tokens: Token[], idx: number): string => {
    const content = tokens[idx].content;
    const { mentionType, mentionValue } = tokens[idx].meta as MentionTokenMeta;
    return `<span class="mention mention-${mentionType}" data-id="${mentionValue}">@${content}</span>`;
  };
}
