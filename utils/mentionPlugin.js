export function mentionPlugin(md, options = {}) {
  const MENTION_RE = /^@\[([^()]+)\((user|page|database|date):([^)]+)\)\]/;

  function mentionInline(state, silent) {
    // If we don't see '@[' at current position, bail early
    if (state.src[state.pos] !== '@' || state.src[state.pos + 1] !== '[') {
      return false;
    }

    // Try matching
    const match = MENTION_RE.exec(state.src.slice(state.pos));
    if (!match) {
      return false;
    }

    if (!silent) {
      // Build a custom token
      const token = state.push('mention_token', '', 0);
      token.content = match[1].trim(); // the display text
      token.meta = {
        mentionType: match[2].trim(), // "user" | "page" | "database" | "date"
        mentionValue: match[3].trim() // the ID or date
      };
    }

    // Move the parser position forward
    state.pos += match[0].length;

    return true; // we parsed something
  }

  // Insert this rule before emphasis (or wherever you like)
  md.inline.ruler.before('emphasis', 'mention_inline', mentionInline);

  // (Optional) If you use md.render to HTML, you can define a renderer:
  md.renderer.rules.mention_token = (tokens, idx) => {
    const content = tokens[idx].content;
    const { mentionType, mentionValue } = tokens[idx].meta;
    // Example HTML, adjust as you wish
    return `<span class="mention mention-${mentionType}" data-id="${mentionValue}">@${content}</span>`;
  };
};
