import _ from "lodash";

export default function convertToSnakeCase(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[_.snakeCase(key)] = obj[key];  // Convert camelCase -> snake_case
    return acc;
  }, {});
}

// Example Usage:
const camelCaseData = {
    firstName: "John",
    lastName: "Doe",
    emailAddress: "john.doe@example.com"
};

const snakeCaseData = convertToSnakeCase(camelCaseData);
console.log(snakeCaseData);
// Output: { first_name: 'John', last_name: 'Doe', email_address: 'john.doe@example.com' }
