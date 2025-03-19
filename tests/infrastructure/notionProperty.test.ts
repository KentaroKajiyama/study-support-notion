import { describe, it, expect } from "vitest";
import {
  propertyResponseToDomain,
  propertyDomainToRequest,
} from "@infrastructure/notionProperty.js"; // Adjust path

import {
  TitlePropertyResponse,
  NumberPropertyResponse,
  SelectPropertyResponse,
  MultiSelectPropertyResponse,
  StatusPropertyResponse,
  CheckboxPropertyResponse,
  DatePropertyResponse,
  RelationPropertyResponse,
  PeoplePropertyResponse,
  EmailPropertyResponse,
  PhoneNumberPropertyResponse,
  PagePropertyResponse,
  NotionPagePropertyType,
  NotionPropertyRequest,
  NotionDate,
} from "@domain/types/index.js";

describe("propertyResponseToDomain", () => {
  it("should correctly handle title properties", () => {
    const mockResponse: PagePropertyResponse = {
      id: "mock",
      type: "title",
      title: [{ type: "text", text: { content: "Test Title", link: null } , annotations: {bold: false, italic: false, strikethrough: false, underline: false, code: false, color: "default"}, plain_text: "Text Title", href: null}],
    };

    const result = propertyResponseToDomain(mockResponse, "string");

    expect(result).toBe("Test Title");
  });

  it("should correctly handle number properties", () => {
    const mockResponse: PagePropertyResponse = {
      id: "mock",
      type: "number",
      number: 42,
    };

    const result = propertyResponseToDomain(mockResponse, "any");

    expect(result).toBe(42);
  });

  it("should correctly handle select properties", () => {
    const mockResponse: PagePropertyResponse = {
      id: "mock",
      type: "select",
      select: { name: "Option A", id: "mock", color: "default"},
    };

    const result = propertyResponseToDomain(mockResponse, "string");

    expect(result).toBe("Option A");
  });

  it("should correctly handle checkbox properties", () => {
    const mockResponse: PagePropertyResponse = {
      id: "mock",
      type: "checkbox",
      checkbox: true,
    };

    const result = propertyResponseToDomain(mockResponse, "");

    expect(result).toBe(true);
  });

  it("should correctly handle date properties", () => {
    const mockResponse: PagePropertyResponse = {
      id: "mock",
      type: "date",
      date: { start: "2025-03-20", end: null, time_zone: "Asia/Tokyo" },
    };

    const result = propertyResponseToDomain(mockResponse, "start date");

    expect(result).toBe("2025-03-20");
  });

  it("should correctly handle email properties", () => {
    const mockResponse: PagePropertyResponse = {
      id: "mock",
      type: "email",
      email: "test@example.com",
    };

    const result = propertyResponseToDomain(mockResponse, "email");

    expect(result).toBe("test@example.com");
  });

  it("should throw an error for unsupported property types", () => {
    const mockResponse: PagePropertyResponse = {
      type: "unsupported_type",
    } as any;

    expect(() => propertyResponseToDomain(mockResponse, ""))
      .toThrowError("Unsupported property type: unsupported_type");
  });
});

describe("propertyDomainToRequest", () => {
  it("should correctly handle title properties", () => {
    const input = "Test Title";

    const result = propertyDomainToRequest(input, "title", "string");

    expect(result).toEqual({
      type: "title",
      title: [{ type: "text", text: { content: "Test Title", link: null }, annotations :{bold: false, italic: false, underline: false, strikethrough: false, code: false}}],
    });
  });

  it("should correctly handle number properties", () => {
    const input = 42;

    const result = propertyDomainToRequest(input, "number", "any");

    expect(result).toEqual({
      type: "number",
      number: 42,
    });
  });

  it("should correctly handle select properties", () => {
    const input = "国語";

    const result = propertyDomainToRequest(input, "select", "a subject name");

    expect(result).toEqual({
      type: "select",
      select: { name: "国語" },
    });
  });

  it("should correctly handle checkbox properties", () => {
    const input = true;

    const result = propertyDomainToRequest(input, "checkbox", "");

    expect(result).toEqual({
      checkbox: true,
    });
  });

  it("should correctly handle date properties", () => {
    const input = { start: "2025-03-20" as NotionDate, end: null };

    const result = propertyDomainToRequest(input, "date", "date");

    expect(result).toEqual({
      type: "date",
      date: { start: "2025-03-20", end: null },
    });
  });

  it("should correctly handle email properties", () => {
    const input = "test@example.com";

    const result = propertyDomainToRequest(input, "email", "email");

    expect(result).toEqual({
      type: "email",
      email: "test@example.com",
    });
  });

  it("should return undefined for unsupported property types", () => {
    const input = "some value";
    expect(() => propertyDomainToRequest(input, "unsupported_type" as NotionPagePropertyType, ""))
    .toThrowError("Error converting property domain to request: Error: Unsupported property type: unsupported_type");
  });

  it("should return undefined if domainProperty is undefined", () => {
    const result = propertyDomainToRequest(undefined, "title", "");

    expect(result).toBeUndefined();
  });
});
