import {
  inlineTextToMentionStringArray,
  isNotionMentionString,
  isValidSubfieldsSubfieldNameEnum,
  NotionMentionString,
  SubfieldsSubfieldNameEnum,
  TitlePropertyRequest,
  TitlePropertyResponse
} from "@domain/types/index.js";
import {
  inlineTextToRichText,
  richTextToInlineText,
} from "@utils/index.js"

export type TitleResponseOption = 'a mention string' | 'a subfield name' | 'string';
export type TitleResponseReturnType = NotionMentionString | SubfieldsSubfieldNameEnum | string;

export function titleResponseHandler(titleProp: TitlePropertyResponse, option: TitleResponseOption): TitleResponseReturnType {
  switch(option) {
    case 'a mention string':
      return titlePropertyResponseToOneMentionString(titleProp);
    case 'a subfield name':
      const inlineText = richTextToInlineText(titleProp.title);
      if (!isValidSubfieldsSubfieldNameEnum(inlineText)) throw new Error ("title must be a subfield name");
      return inlineText;
    case 'string':
      return richTextToInlineText(titleProp.title);
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

export type TitleRequestOption = 'a mention string' | 'a subfield name' | 'string';
export type TitleRequestInputType = NotionMentionString | SubfieldsSubfieldNameEnum | string;

export function titleRequestHandler(inlineText: TitleRequestInputType, option : TitleRequestOption): TitlePropertyRequest{
  switch(option) {
    case 'a mention string':
      if(!isNotionMentionString(inlineText)) throw new Error(`You must provide a mention string: ${inlineText}`);
      return {
        title: inlineTextToRichText(inlineText),
        type: 'title'
      };
    case 'a subfield name':
      if (!isValidSubfieldsSubfieldNameEnum(inlineText)) throw new Error ("Invalid input for title property option:" + option + ". input : " + inlineText);
      return {
        title: inlineTextToRichText(inlineText),
        type: 'title'
      };
    case 'string':
      return {
        title: inlineTextToRichText(inlineText),
        type: 'title'
      };
    default:
      throw new Error("Invalid title option");
  }
}