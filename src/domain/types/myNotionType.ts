import { 
  IdRequest,
  EmptyObject,
  DateRequest,
  PartialUserObjectResponse,
  TemplateMentionRequest,
  TextRequest,
  EmojiRequest,
  RichTextItemRequest,
  StringRequest,
  SelectColor,
  DateResponse,
  CustomEmojiResponse,
  RollupFunction,
  PartialSelectResponse,
  UserObjectResponse, 
  RichTextItemResponse
} from "@notionhq/client/build/src/api-endpoints.js";
import MarkdownIt from "markdown-it";
import dollarmathPlugin from "markdown-it-dollarmath";
import { mentionPlugin, MentionTokenMeta, logger } from "@utils/index.js";
import { URLString } from "./myTypes.js";


/** ------------------------------------------------------------------
 *  Placeholder definitions for types referenced in the snippet.
 *  Replace these with your actual definitions as needed.
 *  ----------------------------------------------------------------- */

export type VerificationPropertyResponse = any;        // one variant of "verification"
export type VerificationPropertyUnverifiedResponse = any; // another variant

export type NotionUUID = string & { __notion_uuid__: void };

export function isNotionUUID(value: string): value is NotionUUID {
  const notionUuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  return notionUuidRegex.test(value);
}

export function toNotionUUID(value: string): NotionUUID {
  if (!isNotionUUID(value)) {
    throw new Error(`Invalid Notion UUID: ${value}`);
  }
  return value as NotionUUID;
}

export type NotionDateString = `${number}-${number}-${number}`;
export type NotionDateTimeString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}+09:00`; 
export type NotionDate = NotionDateString | NotionDateTimeString;
export function isNotionDate(value: string): boolean {
  const dateRegex = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
  return dateRegex.test(value);
}

export type NotionMentionType = 'user' | 'page' | 'database' | 'date' | 'custom_emoji'
export type NotionMentionString = `@[${string}(${"user" | "page" | "database" | "date" | 'custom_emoji'}:${string})]`;
export function isNotionMentionString(value: string): boolean {
  const mentionRegex = /^@\[([^\]]+)\((user|page|database|date|person|workspace|bot):([^\]]+)\)\]$/;
  return mentionRegex.test(value);
}
export function toNotionMentionString(mentionDetail: MentionDetail): NotionMentionString {
  switch (mentionDetail.type) {
    case 'user':
    case 'page':
    case 'database':
    case 'custom_emoji':
      return `@[${mentionDetail.displayText} (${mentionDetail.type}:${ (mentionDetail as MentionDetailId).id })]`;
    case 'date':
      return `@[${mentionDetail.displayText} (${mentionDetail.type}: start:${(mentionDetail as MentionDetailDate).start} end:${(mentionDetail as MentionDetailDate).end})]`;
    default:
      throw new Error(`Invalid mention type: ${mentionDetail.type}`);
  }
}
export function extractMentionDetails(
  mentionText: string
): MentionDetail | null 
{
  const mentionRegex = /@\[(.*?) \((\w+):\s?(.*?)\)\]/;
  const match = mentionText.match(mentionRegex);

  if (!match) return null;

  const [, displayText, type, details] = match;

  if (type === "user" || type === "page" || type === "database" || type === "custom_emoji") {
    return { displayText: displayText, type: type, id: details.trim() as NotionUUID };
  }

  if (type === "date") {
    const dateRegex = /start:\s?([\d-:T]+)(?:\s?end:\s?([\d-:T]+))?/;
    const dateMatch = details.match(dateRegex);

    if (dateMatch) {
      if (dateMatch.length == 2 && isNotionDate(dateMatch[1]) && isNotionDate(dateMatch[2])) {
        return { displayText: displayText, type: type, start: dateMatch[1] as NotionDate, end: dateMatch[2] as NotionDate };
      } else if (dateMatch.length == 1 && isNotionDate(dateMatch[1])) {
        return { displayText: displayText, type: type, start: dateMatch[1] as NotionDate, end: null };
      } else {
        throw new Error(`Invalid date format in mention: ${details}`);
      }
    }
  }

  return null;
}

export function inlineTextToMentionStringArray(
  inlineText: string,
): NotionMentionString[] {
  if (!inlineText) return [];

  const md = new MarkdownIt("commonmark")
    .use(dollarmathPlugin, { allow_space: true, double_inline: true })
    .use(mentionPlugin);

  const tokens = md.parse(inlineText, {});

  if (!tokens[1] || !tokens[1].children) return [];

  const resultArray: NotionMentionString[] = [];

  for (const token of tokens[1].children) {
    switch (token.type) {
      case "mention_token": { // ✅ Handle mention tokens
        const mentionMeta = token.meta as MentionTokenMeta;
        const mentionDisplay = token.content
        resultArray.push(`@[${mentionDisplay}(${mentionMeta.mentionType}:${mentionMeta.mentionValue})]`)
        break;
      }
      default: 
        break;
    }
  }

  return resultArray;
}

export function fromStringToANotionMentionString(normalString: string): NotionMentionString {
  const mentionStringArray: NotionMentionString[] = inlineTextToMentionStringArray(normalString);
  if (mentionStringArray.length === 0) {
    throw new Error('You must provide a mention string')
  } else if (mentionStringArray.length >= 2) {
    logger.warn('You provide more than one mention. Everything is ignored other than the first one.')
  };
  return mentionStringArray[0];
};

export type MentionDetailId =
{
  displayText: string;
  type: NotionMentionType;
  id: NotionUUID;
};
export type MentionDetailDate =
{
  displayText: string;
  type: NotionMentionType;
  start: NotionDate;
  end: NotionDate | null;
};
export type MentionDetail = MentionDetailId | MentionDetailDate;

export function getMentionDetailsArrayFromInlineText(inlineText: string): MentionDetail[] {
  try {
    const mentionStringArray = inlineTextToMentionStringArray(inlineText);
    return mentionStringArray
      .map(mentionString => extractMentionDetails(mentionString))
      .filter((e): e is NonNullable<typeof e> => e !== null);
  } catch (error) {
    logger.error(`Error extracting mention details from inline text in myNotionType.ts: ${error}`);
    throw error;
  }
}

export type NotionFilterPropertyType = 
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "formula"
  | "relation"
  | "rollup"
  | "people"
  | "files"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by"
  | "status"
  | "unique_id"

export type NotionPagePropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "formula"
  | "relation"
  | "rollup"
  | "people"
  | "files"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by"
  | "status"
  | "unique_id"
  | "verification"
  | "button"

  export const NotionPagePropertiesTypeArray = [
    "title",
    "rich_text",
    "people",
    "unique_id",
    "number",
    "url",
    "select",
    "multi_select",
    "status",
    "date",
    "email",
    "phone_number",
    "checkbox",
    "files",
    "created_by",
    "created_time",
    "last_edited_by",
    "last_edited_time",
    "formula",
    "relation",
    "rollup",
    "button",
    "verification",

  ] as const;

export type NotionBlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "to_do"
  | "image"
  | "numbered_list_item"
  | "bulleted_list_item"
  | "quote"
  | "code"
  | "callout"
  | "toggle"
  | "divider"
  | "table"
  | "table_row"
  | "embed"
  | "video"
  | "audio"
  | "file"
  | "bookmark"
  | "equation"
  | "column_list"
  | "column"
  | "link_preview"
  | "link_to_page"
  | "synced_block"
  | "breadcrumb"
  | "table_of_contents"
  | "template"
  | "unsupported";

// For Request

export type RichTextMentionItemRequest = {
  mention:
    | {
        user:
          | { id: IdRequest }
          | {
              person: { email?: string }
              id: IdRequest
              type?: "person"
              name?: string | null
              avatar_url?: string | null
              object?: "user"
            }
          | {
              bot:
                | EmptyObject
                | {
                    owner:
                      | {
                          type: "user"
                          user:
                            | {
                                type: "person"
                                person: { email: string }
                                name: string | null
                                avatar_url: string | null
                                id: IdRequest
                                object: "user"
                              }
                            | PartialUserObjectResponse
                        }
                      | { type: "workspace"; workspace: true }
                    workspace_name: string | null
                  }
              id: IdRequest
              type?: "bot"
              name?: string | null
              avatar_url?: string | null
              object?: "user"
            }
      }
    | { date: DateRequest }
    | { page: { id: IdRequest } }
    | { database: { id: IdRequest } }
    | { template_mention: TemplateMentionRequest }
    | { custom_emoji: { id: IdRequest; name?: string; url?: string } }
  type?: "mention"
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?:
      | "default"
      | "gray"
      | "brown"
      | "orange"
      | "yellow"
      | "green"
      | "blue"
      | "purple"
      | "pink"
      | "red"
      | "default_background"
      | "gray_background"
      | "brown_background"
      | "orange_background"
      | "yellow_background"
      | "green_background"
      | "blue_background"
      | "purple_background"
      | "pink_background"
      | "red_background"
  }
}

// 1. Title
export type TitlePropertyRequest = {
  title: RichTextItemRequest[];
  type?: 'title';
};

// 2. RichText
export type RichTextPropertyRequest = {
  rich_text: RichTextItemRequest[];
  type?: 'rich_text';
};

// 3. Number
export type NumberPropertyRequest = {
  number: number | null;
  type?: 'number';
};

// 4. URL
export type UrlPropertyRequest = {
  url: TextRequest | null;
  type?: 'url';
};

// 5. Select
export type SelectPropertyRequest = {
  select:
    | {
        id: StringRequest;
        name?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
    | {
        name: StringRequest;
        id?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
    | null;
  type?: 'select';
};

// 6. MultiSelect
export type MultiSelectPropertyRequest = {
  multi_select: Array<
    | {
        id: StringRequest;
        name?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
    | {
        name: StringRequest;
        id?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
  >;
  type?: 'multi_select';
};

// 7. People
export type PeoplePropertyRequest = {
  people: Array<
    | { id: IdRequest }
    | {
        person: { email?: string };
        id: IdRequest;
        type?: 'person';
        name?: string | null;
        avatar_url?: string | null;
        object?: 'user';
      }
    | {
        bot:
          | EmptyObject
          | {
              owner:
                | {
                    type: 'user';
                    user:
                      | {
                          type: 'person';
                          person: { email: string };
                          name: string | null;
                          avatar_url: string | null;
                          id: IdRequest;
                          object: 'user';
                        }
                      | PartialUserObjectResponse; // define as needed
                  }
                | { type: 'workspace'; workspace: true };
              workspace_name: string | null;
            };
        id: IdRequest;
        type?: 'bot';
        name?: string | null;
        avatar_url?: string | null;
        object?: 'user';
      }
  >;
  type?: 'people';
};

// 8. Email
export type EmailPropertyRequest = {
  email: StringRequest | null;
  type?: 'email';
};

// 9. PhoneNumber
export type PhoneNumberPropertyRequest = {
  phone_number: StringRequest | null;
  type?: 'phone_number';
};

// 10. Date
export type DatePropertyRequest = {
  date: DateRequest | null;
  type?: 'date';
};

// 11. Checkbox
export type CheckboxPropertyRequest = {
  checkbox: boolean;
  type?: 'checkbox';
};

// 12. Relation
export type RelationPropertyRequest = {
  relation: Array<{ id: IdRequest }>;
  type?: 'relation';
};

// 13. Files
export type FilesPropertyRequest = {
  files: Array<
    | {
        file: { url: string; expiry_time?: string };
        name: StringRequest;
        type?: 'file';
      }
    | {
        external: { url: TextRequest };
        name: StringRequest;
        type?: 'external';
      }
  >;
  type?: 'files';
};

// 14. Status
export type StatusPropertyRequest = {
  status:
    | {
        id: StringRequest;
        name?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
    | {
        name: StringRequest;
        id?: StringRequest;
        color?: SelectColor;
        description?: StringRequest | null;
      }
    | null;
  type?: 'status';
};

/** --------------------------------------------------
 *  PropertyRequest Union: if you want a combined type
 *  -------------------------------------------------- */
export type NotionPropertyRequest =
  | TitlePropertyRequest
  | RichTextPropertyRequest
  | NumberPropertyRequest
  | UrlPropertyRequest
  | SelectPropertyRequest
  | MultiSelectPropertyRequest
  | PeoplePropertyRequest
  | EmailPropertyRequest
  | PhoneNumberPropertyRequest
  | DatePropertyRequest
  | CheckboxPropertyRequest
  | RelationPropertyRequest
  | FilesPropertyRequest
  | StatusPropertyRequest;

/** --------------------------------------------------
 *  Icon types
 *  -------------------------------------------------- */
export type IconEmoji = {
  emoji: EmojiRequest;
  type?: 'emoji';
};

export type IconExternal = {
  external: {
    url: URLString;
  };
  type?: 'external';
};

export type IconCustomEmoji = {
  custom_emoji: {
    id: NotionUUID;
    name?: string;
    url?: string;
  };
  type?: 'custom_emoji';
};

export type IconUnion = IconEmoji | IconExternal | IconCustomEmoji;

/** --------------------------------------------------
 *  Cover type
 *  -------------------------------------------------- */
export type CoverExternal = {
  external: { url: TextRequest };
  type?: 'external';
};

/** --------------------------------------------------
 *  Final parameter type
 *  -------------------------------------------------- */
export type UpdatePageBodyParameters = {
  properties?: Record<string, NotionPropertyRequest>;
  icon?: IconEmoji | IconExternal | IconCustomEmoji | null;
  cover?: CoverExternal | null;
  archived?: boolean;
  in_trash?: boolean;
};

export type ParentRequest = 
  | { page_id: NotionUUID, type?: "page_id" }
  | { database_id: NotionUUID, type?: "database_id" }
// For Response



/** ------------------------------------------------------------------
 *  Individual page property types (response side)
 *  ----------------------------------------------------------------- */

// 1) Number
export interface NumberPropertyResponse {
  type: "number";
  number: number | null;
  id: string;
}

// 2) URL
export interface UrlPropertyResponse {
  type: "url";
  url: string | null;
  id: string;
}

// 3) Select
export interface SelectPropertyResponse {
  type: "select";
  select: PartialSelectResponse | null;
  id: string;
}

// 4) Multi-select
export interface MultiSelectPropertyResponse {
  type: "multi_select";
  multi_select: PartialSelectResponse[];
  id: string;
}

// 5) Status
export interface StatusPropertyResponse {
  type: "status";
  status: PartialSelectResponse | null;
  id: string;
}

// 6) Date
export interface DatePropertyResponse {
  type: "date";
  date: DateResponse | null;
  id: string;
}

// 7) Email
export interface EmailPropertyResponse {
  type: "email";
  email: string | null;
  id: string;
}

// 8) PhoneNumber
export interface PhoneNumberPropertyResponse {
  type: "phone_number";
  phone_number: string | null;
  id: string;
}

// 9) Checkbox
export interface CheckboxPropertyResponse {
  type: "checkbox";
  checkbox: boolean;
  id: string;
}

// 10) Files
export interface FilesPropertyResponse {
  type: "files";
  files: Array<
    | {
        file: { url: string; expiry_time: string };
        name: StringRequest;
        type?: "file";
      }
    | {
        external: { url: TextRequest };
        name: StringRequest;
        type?: "external";
      }
  >;
  id: string;
}

// 11) CreatedBy
export interface CreatedByPropertyResponse {
  type: "created_by";
  created_by: PartialUserObjectResponse | UserObjectResponse;
  id: string;
}

// 12) CreatedTime
export interface CreatedTimePropertyResponse {
  type: "created_time";
  created_time: string;
  id: string;
}

// 13) LastEditedBy
export interface LastEditedByPropertyResponse {
  type: "last_edited_by";
  last_edited_by: PartialUserObjectResponse | UserObjectResponse;
  id: string;
}

// 14) LastEditedTime
export interface LastEditedTimePropertyResponse {
  type: "last_edited_time";
  last_edited_time: string;
  id: string;
}

// 15) Formula
type FormulaValueProperty = 
  | { type: "number"; number: number | null }
  | { type: "string"; string: string | null }
  | { type: "date"; date: DateResponse | null }
  | { type: "boolean"; boolean: boolean | null}

export interface FormulaPropertyResponse {
  type: "formula";
  formula: FormulaValueProperty; // Some union or shape for the formula's actual value
  id: string;
}

// 16) Button
export interface ButtonPropertyResponse {
  type: "button";
  button: Record<string, never>;
  id: string;
}

// 17) UniqueId
export interface UniqueIdPropertyResponse {
  type: "unique_id";
  unique_id: {
    prefix: string | null;
    number: number | null;
  };
  id: string;
}

/**
 * 18) Verification
 *     The snippet shows "verification" might be one of several sub-types:
 *     e.g. VerificationPropertyUnverifiedResponse | VerificationPropertyResponse
 */
export interface VerificationPropResponse {
  type: "verification";
  verification:
    | VerificationPropertyUnverifiedResponse
    | VerificationPropertyResponse
    | null;
  id: string;
}

// 19) Title
export interface TitlePropertyResponse {
  type: "title";
  title: RichTextItemResponse[];
  id: string;
}

// 20) RichText
export interface RichTextPropertyResponse {
  type: "rich_text";
  rich_text: RichTextItemResponse[];
  id: string;
}

// 21) People
export interface PeoplePropertyResponse {
  type: "people";
  people: Array<PartialUserObjectResponse | UserObjectResponse>;
  id: string;
}

// 22) Relation
export interface RelationPropertyResponse {
  type: "relation";
  relation: Array<{ id: string }>;
  id: string;
}

/** ------------------------------------------------------------------
 *  Rollup property (includes sub-cases and the "array" variant)
 *  ----------------------------------------------------------------- */

// Possible items that appear inside a rollup's "array" field:
export type RollupArrayItemResponse =
  | { type: "number"; number: number | null }
  | { type: "url"; url: string | null }
  | { type: "select"; select: PartialSelectResponse | null }
  | {
      type: "multi_select";
      multi_select: PartialSelectResponse[];
    }
  | { type: "status"; status: PartialSelectResponse | null }
  | { type: "date"; date: DateResponse | null }
  | { type: "email"; email: string | null }
  | { type: "phone_number"; phone_number: string | null }
  | { type: "checkbox"; checkbox: boolean }
  | {
      type: "files";
      files: Array<
        | {
            file: { url: string; expiry_time: string };
            name: StringRequest;
            type?: "file";
          }
        | {
            external: { url: TextRequest };
            name: StringRequest;
            type?: "external";
          }
      >;
    }
  | {
      type: "created_by";
      created_by: PartialUserObjectResponse | UserObjectResponse;
    }
  | { type: "created_time"; created_time: string }
  | {
      type: "last_edited_by";
      last_edited_by: PartialUserObjectResponse | UserObjectResponse;
    }
  | { type: "last_edited_time"; last_edited_time: string }
  | { type: "formula"; formula: FormulaPropertyResponse }
  | { type: "button"; button: Record<string, never> }
  | {
      type: "unique_id";
      unique_id: {
        prefix: string | null;
        number: number | null;
      };
    }
  | {
      type: "verification";
      verification:
        | VerificationPropertyUnverifiedResponse
        | VerificationPropertyResponse
        | null;
    }
  | { type: "title"; title: RichTextItemResponse[] }
  | { type: "rich_text"; rich_text: RichTextItemResponse[] }
  | {
      type: "people";
      people: Array<PartialUserObjectResponse | UserObjectResponse>;
    }
  | { type: "relation"; relation: Array<{ id: string }> };

/** Rollup main property */
export interface RollupPropertyResponse {
  type: "rollup";
  rollup:
    | {
        type: "number";
        number: number | null;
        function: RollupFunction;
      }
    | {
        type: "date";
        date: DateResponse | null;
        function: RollupFunction;
      }
    | {
        type: "array";
        array: RollupArrayItemResponse[];
        function: RollupFunction;
      };
  id: string;
}

/** ------------------------------------------------------------------
 *  Union of property response types
 *  ----------------------------------------------------------------- */
export type PagePropertyResponse =
  | NumberPropertyResponse
  | UrlPropertyResponse
  | SelectPropertyResponse
  | MultiSelectPropertyResponse
  | StatusPropertyResponse
  | DatePropertyResponse
  | EmailPropertyResponse
  | PhoneNumberPropertyResponse
  | CheckboxPropertyResponse
  | FilesPropertyResponse
  | CreatedByPropertyResponse
  | CreatedTimePropertyResponse
  | LastEditedByPropertyResponse
  | LastEditedTimePropertyResponse
  | FormulaPropertyResponse
  | ButtonPropertyResponse
  | UniqueIdPropertyResponse
  | VerificationPropResponse
  | TitlePropertyResponse
  | RichTextPropertyResponse
  | PeoplePropertyResponse
  | RelationPropertyResponse
  | RollupPropertyResponse;

/** ------------------------------------------------------------------
 *  Parent object
 *  ----------------------------------------------------------------- */
export type ParentResponse =
  | { type: "database_id"; database_id: string }
  | { type: "page_id"; page_id: string }
  | { type: "block_id"; block_id: string }
  | { type: "workspace"; workspace: true };

/** ------------------------------------------------------------------
 *  Icon / Cover
 *  ----------------------------------------------------------------- */
export interface IconEmojiResponse {
  type: "emoji";
  emoji: EmojiRequest;
}
export interface IconExternalResponse {
  type: "external";
  external: {
    url: TextRequest;
  };
}
export interface IconFileResponse {
  type: "file";
  file: {
    url: string;
    expiry_time: string;
  };
}
export interface IconCustomEmojiResponse {
  type: "custom_emoji";
  custom_emoji: CustomEmojiResponse;
}

export type IconResponse =
  | IconEmojiResponse
  | IconExternalResponse
  | IconFileResponse
  | IconCustomEmojiResponse
  | null;

export interface CoverExternalResponse {
  type: "external";
  external: { url: TextRequest };
}
export interface CoverFileResponse {
  type: "file";
  file: { url: string; expiry_time: string };
}
export type CoverResponse = CoverExternalResponse | CoverFileResponse | null;

/** ------------------------------------------------------------------
 *  Final: Page Object Response
 *  ----------------------------------------------------------------- */
export interface PageObjectResponse {
  object: "page";
  id: string;
  parent: ParentResponse;
  properties: Record<string, PagePropertyResponse>;
  icon: IconResponse;
  cover: CoverResponse;
  created_by: PartialUserObjectResponse;
  last_edited_by: PartialUserObjectResponse;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  in_trash: boolean;
  url: string;
  public_url: string | null;
}
