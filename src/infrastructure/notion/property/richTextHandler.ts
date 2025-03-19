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
} from "@utils/index.js"

export type RichTextResponseOption = 'a mention string' | 'string' ;
export type RichTextResponseReturnType = NotionMentionString | string;

export function richTextResponseHandler(richTextProp: RichTextPropertyResponse, option: RichTextResponseOption): RichTextResponseReturnType {
  switch(option) {
    case 'a mention string':
      return richTextPropertyResponseToOneMentionString(richTextProp);
    case 'string':
      return richTextToInlineText(richTextProp.rich_text);
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
    throw new Error('Error converting RichTextPropertyItemObjectResponse to NotionMentionString, '+ error);
  }
}

export type RichTextRequestOption = 'a mention string' | 'string';
export type RichTextRequestInputType = NotionMentionString | string;

export function richTextRequestHandler(inlineText: RichTextRequestInputType, option : RichTextRequestOption): RichTextPropertyRequest{
  switch(option) {
    case 'a mention string':
      if(!isNotionMentionString(inlineText)) throw new Error(`You must provide a mention string: ${inlineText}`);
      return {
        rich_text: inlineTextToRichText(inlineText),
        type: 'rich_text'
      };
    case 'string':
      return {
        rich_text: inlineTextToRichText(inlineText),
        type: 'rich_text'
      };
    default:
      throw new Error("Invalid RichText option");
  }
}