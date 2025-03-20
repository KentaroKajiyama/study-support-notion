import _ from "lodash";

export function convertToSnakeCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase) as T; // Convert each array item
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
      const newKey = _.snakeCase(key); // Convert key to snake_case
      acc[newKey] = convertToSnakeCase(obj[key as keyof typeof obj]); // Recursively convert values
      return acc;
    }, {}) as T;
  }
  return obj;
}

export function convertToCamelCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase) as T; // Convert each array item
  } else if (obj !== null && typeof obj === "object") {
    if (obj instanceof Date) {
      return obj.toISOString() as T; 
    }
    return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
      const newKey = _.camelCase(key); // Convert key to camelCase
      acc[newKey] = convertToCamelCase(obj[key as keyof typeof obj]); // Recursively convert values
      return acc;
    }, {}) as T;
  }
  return obj;
}
