import {
  inlineTextToMentionStringArray,
  NotionMentionString,
  RichTextPropertyResponse
} from "@domain/types/index.js";
import {
  richTextToInlineText,
} from "@utils/index.js"

export type RichTextResponseOption = 'a mention string';
export type RichTextResponseReturnType = NotionMentionString;

export function richTextResponseHandler(richTextProp: RichTextPropertyResponse, option: RichTextResponseOption): RichTextResponseReturnType {
  switch(option) {
    case 'a mention string':
      return richTextPropertyResponseToOneMentionString(richTextProp);
    default:
      throw new Error("Invalid richText option");
  }
}
function richTextPropertyResponseToOneMentionString(richTextProp: RichTextPropertyResponse): NotionMentionString {
  try {
    const inlineText = richTextToInlineText(richTextProp.rich_text);
    const mentionStringArray = inlineTextToMentionStringArray(inlineText);
    if (mentionStringArray.length === 0) {
      throw new Error("No mention information available");
    } else if (mentionStringArray.length >= 2) {
      throw new Error("Too many mention information available");
    }
    return mentionStringArray[0];
  } catch (error) {
    throw new Error('Error converting RichTextPropertyItemObjectResponse to NotionMentionString');
  }
}