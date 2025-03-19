import { describe, it, expect } from "vitest";
import { convertToSnakeCase, convertToCamelCase } from "@utils/index.js"; 

describe("Case Conversion Functions", () => {
  describe("convertToSnakeCase", () => {
    it("should convert keys of a simple object to snake_case", () => {
      const input = {
        firstName: "John",
        lastName: "Doe",
      };
      const expected = {
        first_name: "John",
        last_name: "Doe",
      };
      expect(convertToSnakeCase(input)).toEqual(expected);
    });

    it("should convert keys of nested objects to snake_case", () => {
      const input = {
        userName: "johndoe",
        address: {
          streetName: "Main Street",
          postalCode: "12345",
        },
      };
      const expected = {
        user_name: "johndoe",
        address: {
          street_name: "Main Street",
          postal_code: "12345",
        },
      };
      expect(convertToSnakeCase(input)).toEqual(expected);
    });

    it("should handle arrays of objects", () => {
      const input = [
        { firstName: "John", lastName: "Doe" },
        { firstName: "Alice", lastName: "Smith" }
      ];
      const expected = [
        { first_name: "John", last_name: "Doe" },
        { first_name: "Alice", last_name: "Smith" }
      ];
      expect(convertToSnakeCase(input)).toEqual(expected);
    });

    it("should return non-object values unchanged", () => {
      expect(convertToSnakeCase("hello")).toBe("hello");
      expect(convertToSnakeCase(123)).toBe(123);
      expect(convertToSnakeCase(null)).toBe(null);
    });
  });

  describe("convertToCamelCase", () => {
    it("should convert keys of a simple object to camelCase", () => {
      const input = {
        first_name: "John",
        last_name: "Doe",
      };
      const expected = {
        firstName: "John",
        lastName: "Doe",
      };
      expect(convertToCamelCase(input)).toEqual(expected);
    });

    it("should convert keys of nested objects to camelCase", () => {
      const input = {
        user_name: "johndoe",
        address: {
          street_name: "Main Street",
          postal_code: "12345",
        },
      };
      const expected = {
        userName: "johndoe",
        address: {
          streetName: "Main Street",
          postalCode: "12345",
        },
      };
      expect(convertToCamelCase(input)).toEqual(expected);
    });

    it("should handle arrays of objects", () => {
      const input = [
        { first_name: "John", last_name: "Doe" },
        { first_name: "Alice", last_name: "Smith" }
      ];
      const expected = [
        { firstName: "John", lastName: "Doe" },
        { firstName: "Alice", lastName: "Smith" }
      ];
      expect(convertToCamelCase(input)).toEqual(expected);
    });

    it("should return non-object values unchanged", () => {
      expect(convertToCamelCase("hello")).toBe("hello");
      expect(convertToCamelCase(123)).toBe(123);
      expect(convertToCamelCase(null)).toBe(null);
    });
  });

  // Optionally, test a round-trip conversion
  describe("Round Trip Conversion", () => {
    it("should convert an object to snake_case then back to camelCase and preserve the data", () => {
      const original = {
        firstName: "John",
        lastName: "Doe",
        address: {
          streetName: "Main Street",
          postalCode: "12345",
        },
        hobbies: ["Reading", "Coding"],
      };
      const snakeCase = convertToSnakeCase(original);
      const camelCase = convertToCamelCase(snakeCase);
      expect(camelCase).toEqual(original);
    });
  });
});
