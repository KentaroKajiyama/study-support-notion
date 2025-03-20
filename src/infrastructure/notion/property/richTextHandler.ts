import {
  inlineTextToMentionStringArray,
  NotionMentionString,
  RichTextPropertyRequest,
  RichTextPropertyResponse,
  isNotionMentionString,
  extractMentionDetails,
  MentionDetailId,
  RichTextMentionItemRequest
} from "@domain/types/index.js";
import {
  richTextToInlineText,
  inlineTextToRichText,
  ensureValue,
  logger
} from "@utils/index.js"

export type RichTextResponseOption = 'a mention string' | 'string' ;
export type RichTextResponseReturnType = NotionMentionString | string | null;

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
function richTextPropertyResponseToOneMentionString(richTextProp: RichTextPropertyResponse): NotionMentionString | null {
  try {
    const inlineText = richTextToInlineText(richTextProp.rich_text);
    const mentionStringArray = inlineTextToMentionStringArray(inlineText);
    if (mentionStringArray.length === 0) {
      logger.warn("No mention information available");
      return null;
    } else if (mentionStringArray.length >= 2) {
      throw new Error("Too many mention information available");
    }
    return mentionStringArray[0];
  } catch (error) {
    throw new Error('Error converting RichTextPropertyItemObjectResponse to NotionMentionString, '+ error);
  }
}

export type RichTextRequestOption = 'a mention string' | 'an extracted id from a mention string' | 'string';
export type RichTextRequestInputType = NotionMentionString | string;

export function richTextRequestHandler(inlineText: RichTextRequestInputType, option : RichTextRequestOption): RichTextPropertyRequest{
  switch(option) {
    case 'a mention string':
      if(!isNotionMentionString(inlineText)) throw new Error(`You must provide a mention string: ${inlineText}`);
      return {
        rich_text: inlineTextToRichText(inlineText),
        type: 'rich_text'
      };
    case 'an extracted id from a mention string':
      if(!isNotionMentionString(inlineText)) throw new Error(`You must provide a mention string: ${inlineText}`);
      const MentionDetail = ensureValue(extractMentionDetails(inlineText));
      if(MentionDetail.type === 'date') throw new Error(`You must provide a id type mention`);
      return {
        rich_text: [
          {
            type: 'text',
            text: {
              content: (MentionDetail as MentionDetailId).id
            }
          } 
        ],
        type: 'rich_text'
      }
    case 'string':
      return {
        rich_text: inlineTextToRichText(inlineText),
        type: 'rich_text'
      };
    default:
      throw new Error("Invalid RichText option");
  }
}