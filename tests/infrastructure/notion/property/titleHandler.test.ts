import { describe, it, expect } from "vitest";
import { 
  titleResponseHandler, 
  titleRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import {
  TitlePropertyResponse,
  TitlePropertyRequest,
  NotionMentionString,
  SubfieldsSubfieldNameEnum,
  isNotionMentionString,
  isValidSubfieldsSubfieldNameEnum,
} from "@domain/types/index.js";

import {
  inlineTextToRichText,
  richTextToInlineText,
} from "@utils/index.js";
import { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints.js";

describe("titleResponseHandler", () => {
  it("should return a valid mention string when option is 'a mention string'", () => {
    const mockResponse: TitlePropertyResponse = {
      id: "mock",
      type: "title",
      title: inlineTextToRichText("@mention") as RichTextItemResponse[],
    };

    const result = titleResponseHandler(mockResponse, "a mention string");

    expect(result).toBe("@mention");
  });

  it("should throw an error when mention information is missing", () => {
    const mockResponse: TitlePropertyResponse = {
      id: "mock",
      type: "title",
      title: inlineTextToRichText("No mention here") as RichTextItemResponse[],
    };

    expect(() => titleResponseHandler(mockResponse, "a mention string"))
      .toThrowError("No mention information available");
  });

  it("should return a valid subfield name when option is 'a subfield name'", () => {
    const mockResponse: TitlePropertyResponse = {
      id: "mock",
      type: "title",
      title: inlineTextToRichText("数学") as RichTextItemResponse[],
    };

    expect(isValidSubfieldsSubfieldNameEnum(richTextToInlineText(mockResponse.title))).toBeTruthy();

    const result = titleResponseHandler(mockResponse, "a subfield name");

    expect(result).toBe("数学");
  });

  it("should throw an error when title is not a valid subfield name", () => {
    const mockResponse: TitlePropertyResponse = {
      id: "mock",
      type: "title",
      title: inlineTextToRichText("InvalidSubfield") as RichTextItemResponse[],
    };

    expect(() => titleResponseHandler(mockResponse, "a subfield name"))
      .toThrowError("title must be a subfield name");
  });

  it("should return a valid string when option is 'string'", () => {
    const mockResponse: TitlePropertyResponse = {
      id: "mock",
      type: "title",
      title: inlineTextToRichText("Hello World") as RichTextItemResponse[],
    };

    const result = titleResponseHandler(mockResponse, "string");

    expect(result).toBe("Hello World");
  });

  it("should throw an error for an invalid option", () => {
    const mockResponse: TitlePropertyResponse = {
      id: "mock",
      type: "title",
      title: inlineTextToRichText("Hello") as RichTextItemResponse[],
    };

    expect(() => titleResponseHandler(mockResponse, "invalid-option" as any))
      .toThrowError("Invalid title option");
  });
});

describe("titleRequestHandler", () => {
  it("should return a valid TitlePropertyRequest for 'a mention string'", () => {
    const input: NotionMentionString = "@[Kentaro Kajiyama (user: 1bbb95a4c61980a58909fe83ab1815cd)]";
    
    expect(isNotionMentionString(input)).toBeTruthy();

    const expected: TitlePropertyRequest = {
      type: "title",
      title: inlineTextToRichText(input),
    };

    const result = titleRequestHandler(input, "a mention string");

    expect(result).toEqual(expected);
  });

  it("should throw an error when input is not a mention string", () => {
    expect(() => titleRequestHandler("InvalidMention" as any, "a mention string"))
      .toThrowError("You must provide a mention string: InvalidMention");
  });

  it("should return a valid TitlePropertyRequest for 'a subfield name'", () => {
    const input: SubfieldsSubfieldNameEnum = "数学";

    expect(isValidSubfieldsSubfieldNameEnum(input)).toBeTruthy();

    const expected: TitlePropertyRequest = {
      type: "title",
      title: inlineTextToRichText(input),
    };

    const result = titleRequestHandler(input, "a subfield name");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid subfield name", () => {
    expect(() => titleRequestHandler("InvalidSubfield" as any, "a subfield name"))
      .toThrowError("Invalid input for title property option:a subfield name. input : InvalidSubfield");
  });

  it("should return a valid TitlePropertyRequest for 'string'", () => {
    const input = "Hello World";

    const expected: TitlePropertyRequest = {
      type: "title",
      title: inlineTextToRichText(input),
    };

    const result = titleRequestHandler(input, "string");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid option", () => {
    expect(() => titleRequestHandler("ValidName" as any, "invalid-option" as any))
      .toThrowError("Invalid title option");
  });
});
