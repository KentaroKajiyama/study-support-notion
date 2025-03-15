import {
  inlineTextToMentionStringArray,
  isNotionMentionString,
  NotionMentionString,
  TitlePropertyRequest,
  TitlePropertyResponse
} from "@domain/types/index.js";
import {
  inlineTextToRichText,
  richTextToInlineText,
} from "@utils/index.js"

export type TitleResponseOption = 'a mention string';
export type TitleResponseReturnType = NotionMentionString;

export function titleResponseHandler(titleProp: TitlePropertyResponse, option: TitleResponseOption): TitleResponseReturnType {
  switch(option) {
    case 'a mention string':
      return titlePropertyResponseToOneMentionString(titleProp);
    default:
      throw new Error("Invalid title option");
  }
}
function titlePropertyResponseToOneMentionString(titleProp: TitlePropertyResponse): NotionMentionString {
  try {
    const inlineText = richTextToInlineText(titleProp.title);
    const mentionStringArray = inlineTextToMentionStringArray(inlineText);
    if (mentionStringArray.length === 0) {
      throw new Error("No mention information available");
    } else if (mentionStringArray.length >= 2) {
      throw new Error("Too many mention information available");
    }
    return mentionStringArray[0];
  } catch (error) {
    throw new Error('Error converting TitlePropertyItemObjectResponse to NotionMentionString');
  }
}

export type TitleRequestOption = 'a mention string';
export type TitleRequestInputType = NotionMentionString;

export function titleRequestHandler(inlineText: TitleRequestInputType, option : TitleRequestOption): TitlePropertyRequest{
  switch(option) {
    case 'a mention string':
      if(!isNotionMentionString(inlineText)) throw new Error(`You must provide a mention string: ${inlineText}`);
      return {
        title: inlineTextToRichText(inlineText),
        type: 'title'
      };
    default:
      throw new Error("Invalid title option");
  }
}