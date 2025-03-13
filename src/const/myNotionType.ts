import { Validator } from "../utils/validation.js";
import { inlineTextToRichText } from "../utils/convertRichText.js";
import { IdRequest } from "@notionhq/client/build/src/api-endpoints.js";

export class Icon {
  static getJSON(type: "emoji" | "external", content: string): string {
    if (type === "emoji") {
      const data: IconData = { type: "emoji", emoji: content };
      return JSON.stringify(data);
    } else if (type === "external") {
      const data: IconData = { type: "external", external: { url: content } };
      return JSON.stringify(data);
    }
    throw new Error("Invalid icon type");
  }
}

interface CoverData {
  type: "external";
  external: { url: string };
}

export class Cover {
  static getJSON(type: "external", content: string): string {
    if (type === "external") {
      const data: CoverData = { type: "external", external: { url: content } };
      return JSON.stringify(data);
    }
    throw new Error("Invalid cover type");
  }
}

interface ParentData {
  type: "database_id" | "page_id" | "workspace" | "block_id";
  database_id?: string;
  page_id?: string;
  block_id?: string;
  workspace?: boolean;
}

export class Parent {
  static getJSON(type: ParentData["type"], id?: string): string {
    if (type === "database_id") return JSON.stringify({ type, database_id: id });
    if (type === "page_id") return JSON.stringify({ type, page_id: id });
    if (type === "block_id") return JSON.stringify({ type, block_id: id });
    if (type === "workspace") return JSON.stringify({ type, workspace: true });
    throw new Error("Invalid parent type");
  }
}

export class Properties {
  static getJSON(...propertyJSONs: string[]): string {
    const result: { properties: Record<string, any> } = { properties: {} };
    for (const propJson of propertyJSONs) {
      const parsed = JSON.parse(propJson);
      const key = Object.keys(parsed)[0];
      result.properties[key] = parsed[key];
    }
    return JSON.stringify(result);
  }
}

export class Children {
  static getJSON(childrenArray: any[]): string {
    return JSON.stringify(childrenArray);
  }
}

export class Checkbox {
  static getJSON(name: string, content: boolean): string {
    if (typeof content === "boolean") {
      return JSON.stringify({ [name]: { checkbox: content } });
    }
    throw new Error("Invalid checkbox content type");
  }
}

export class DateProperty {
  static getJSON(name: string, { start, end }: { start: string; end?: string }): string {
    if (!Validator.validateDate(start)) throw new Error("Invalid start date format");
    if (end && !Validator.validateDate(end)) throw new Error("Invalid end date format");

    const data = {
      [name]: { date: { start, ...(end && { end }), time_zone: "Asia/Tokyo" } }
    };
    return JSON.stringify(data);
  }
}

export class Email {
  static getJSON(name: string, emailVal: string): string {
    if (!Validator.validateEmail(emailVal)) throw new Error("Invalid email format");
    return JSON.stringify({ [name]: { email: emailVal } });
  }
}

interface FileItem {
  fname: string;
  url: string;
}

export class Files {
  static getJSON(name: string, files: FileItem[]): string {
    if (!Array.isArray(files)) throw new Error("No files provided");
    return JSON.stringify({
      [name]: { files: files.map(({ fname, url }) => ({ name: fname, type: "external", external: { url } })) }
    });
  }
}

export class MultiSelect {
  static getJSON(name: string, options: string[]): string {
    if (!Array.isArray(options)) throw new Error("Invalid options type");
    return JSON.stringify({ [name]: { multi_select: options.map((item) => ({ name: item })) } });
  }
}

export class NumberProperty {
  static getJSON(name: string, numberVal: number): string {
    if (typeof numberVal !== "number") throw new Error("Invalid number type");
    return JSON.stringify({ [name]: { number: numberVal } });
  }
}

interface Person {
  id: string;
  name?: string;
  email?: string;
}

export class People {
  static getJSON(people: Person[]): string {
    if (!Array.isArray(people)) throw new Error("Invalid people type");
    return JSON.stringify({ people: people.map(({ id, name, email }) => ({ object: "user", id, name, email })) });
  }
}

export class PhoneNumber {
  static getJSON(phone: string): string {
    if (!Validator.validatePhoneNumber(phone)) throw new Error("Invalid phone number format");
    return JSON.stringify({ phone_number: phone });
  }
}

export class Relation {
  static getJSON(name: string, ids: string[]): string {
    if (!Array.isArray(ids)) throw new Error("Invalid relation type");
    return JSON.stringify({ [name]: { relation: ids.map((id) => ({ id })) } });
  }
}

export class RichText {
  static getJSON(name: string, inlineText: string[]): string {
    if (!Array.isArray(inlineText)) throw new Error("Invalid rich text type");
    return JSON.stringify({ [name]: { rich_text: inlineTextToRichText(inlineText) } });
  }
}

export class Select {
  static getJSON(name: string, option: string): string {
    if (typeof option !== "string") throw new Error("Invalid option type");
    return JSON.stringify({ [name]: { select: { name: option } } });
  }
}

export class Status {
  static getJSON(name: string, statusVal: string): string {
    if (typeof statusVal !== "string") throw new Error("Invalid status type");
    return JSON.stringify({ [name]: { status: { name: statusVal } } });
  }
}

export class Title {
  static getJSON(name: string, titleVal: string): string {
    if (typeof titleVal !== "string") throw new Error("Invalid title type");
    return JSON.stringify({ [name]: { type: "title", title: inlineTextToRichText(titleVal) } });
  }
}

export class Url {
  static getJSON(name: string, urlVal: string): string {
    if (!Validator.validateURL(urlVal)) throw new Error("Invalid URL format");
    return JSON.stringify({ [name]: { type: "url", url: urlVal } });
  }
}

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
  | "verification";

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
