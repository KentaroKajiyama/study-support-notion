import _ from "lodash";

export function convertToSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = _.snakeCase(key); // Convert key to snake_case
      acc[newKey] = convertToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// Example Usage:
const camelCaseData1 = {
    firstName: "John",
    lastName: "Doe",
    emailAddress: "john.doe@example.com"
};

const snakeCaseData1 = convertToSnakeCase(camelCaseData1);
console.log(snakeCaseData1);
// Output: { first_name: 'John', last_name: 'Doe', email_address: 'john.doe@example.com' }

export function convertToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase); // Convert each array item
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = _.camelCase(key); // Convert key to camelCase
      acc[newKey] = convertToCamelCase(obj[key]); // Recursively convert values
      return acc;
    }, {});
  }
  return obj; 
}

// Example Usage:
const snakeCaseData2 = {
    first_name: "John",
    last_name: "Doe",
    email_address: "john.doe@example.com"
};

const camelCaseData2 = convertToCamelCase(snakeCaseData);
console.log(camelCaseData);
// Output: { firstName: 'John', lastName: 'Doe', emailAddress: 'john.doe@example.com' }
