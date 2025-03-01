import { validator } from "../utils/errorHandler";
import { getNotionClient } from "../infrastructure/notionClient";
import { inlineTextToRichText } from "../utils/convertRichText";

const notionClient = getNotionClient();

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Icon
 */
export class Icon {
  /**
   * Returns the JSON representation for an icon.
   * @param {string} type - The type of the icon ("emoji" or "external").
   * @param {string} content - The icon content (emoji character or external Url).
   * @returns {string} JSON string.
   */
  static getJSON(type, content) {
    if (type === 'emoji') {
      const data = { type: 'emoji', emoij: content };
      return JSON.stringify(data);
    } else if (type === 'external') {
      const data = { type: 'external', external: { url: content } };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid icon type');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Cover
 */
export class Cover {
  /**
   * Returns the JSON representation for a cover.
   * @param {string} type - The type of the cover ("external").
   * @param {string} content - The cover content (Url).
   * @returns {string} JSON string.
   */
  static getJSON(type, content) {
    if (type === 'external') {
      const data = { type: 'external', external: { url: content } };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid cover type');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Parent
 * @param {string} type 'database_id' or 'page_id' or 'workspace' or 'block_id'
 * @param {string} id identifier of database or page or block.
 */
export class Parent {
  /**
   * Returns the JSON representation for a parent.
   * @param {string} type - The parent type ("database_id", "page_id", "workspace", or "block_id").
   * @param {string} id - The identifier for the parent.
   * @returns {string} JSON string.
   */
  static getJSON(type, id) {
    if (type === 'database_id') {
      const data = { type: 'database_id', database_id: id };
      return JSON.stringify(data);
    } else if (type === 'page_id') {
      const data = { type: 'page_id', page_id: id};
      return JSON.stringify(data);
    } else if (type === 'workspace') {
      const data = { type: 'workspace', workspace: true };
      return JSON.stringify(data);
    } else if (type === 'block_id') {
      const data = { type: 'block_id', block_id: id };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid parent type');
    }
  }
}
/**
 * @description A utility class for building the "properties" object.
 * @date 18/02/2025
 * @export
 * @class Properties
 */
export class Properties {
  /**
   * Builds the combined Notion properties JSON string from multiple property JSON strings.
   * @param {...string} propertyJSONs - The JSON strings for individual properties.
   * @returns {string} - The JSON string of the combined properties.
   */
  static getJSON(...propertyJSONs) {
    const result = { properties: {} };

    for (const propJson of propertyJSONs) {
      const parsed = JSON.parse(propJson);
      const key = Object.keys(parsed)[0];
      result.properties[key] = parsed[key];
    }

    return JSON.stringify(result);
  }
}

/**
 * @description A utility class for building the "children" array.
 * @date 18/02/2025
 * @export
 * @class Children
 */
export class Children {
  /**
   * Builds the Notion children JSON from an array of children objects.
   * @param {Array<Object>} childrenArray - The array of children objects.
   * @returns {string} JSON string.
   */
  static getJSON(childrenArray) {
    return JSON.stringify(childrenArray);
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Checkbox
 */
export class Checkbox {
  /**
   * Returns the JSON representation for a checkbox property.
   * @param {string} name - The property name.
   * @param {boolean} content - The boolean value.
   * @returns {string} JSON string.
   */
  static getJSON(name, content) {
    if (typeof content === 'boolean') {
      const data = { [name]: { checkbox: content } };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid check_box content type');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Date
 * @param {string} name
 * @param {string} start which should be formatted as "yyyy-MM-dd"
 * @param {string} end which should be formatted as "yyyy-MM-dd"
 */
export class Date {
  /**
   * Returns the JSON representation for a date property.
   * @param {string} name - The property name.
   * @typedef {Object} DateProperty
   * @property {string} start - The start date (yyyy-MM-dd).
   * @property {string} end - The end date (yyyy-MM-dd).
   * @returns {string} JSON string.
   */
  static getJSON(name, { start, end }) {
    if (validator.validateDate(start) && validator.validateDate(end)) {
      const data = {
        [name]: {
          date: {
            start: start,
            end: start,
            time_zone: 'Asia/Tokyo'
          }
        }
      };
      return JSON.stringify(data);
    } else if (validator.validateDate(start) && end) {
      throw new Error('Invalid date format of end');
    } else if (validator.validateDate(start)) {
      const data = {
        [name]: {
          date: {
            start: start,
            time_zone: 'Asia/Tokyo'
          }
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid date format of start');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Email
 */
export class Email {
  /**
   * Returns the JSON representation for an email property.
   * @param {string} name - The property name.
   * @param {string} email - The email address.
   * @returns {string} JSON string.
   */
  static getJSON(name, emailVal) {
    if (validator.validateEmail(emailVal)) {
      const data = { [name]: { email: emailVal } };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid email format');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Files
 */
export class Files {
  /**
   * Returns the JSON representation for a files property.
   * @param {string} name - The property name.
   * @param {Array} files - The array of file names, each mapped to a Url.
   * @typedef {Object} FileProperty
   * @property {string} fname - The filename
   * @property {string} url - The URL
   * @returns {string} JSON string.
   */
  static getJSON(name, files) {
    if (files) {
      const data = {
        [name]: {
          files: files.map(({fname, url}) => {
            return {
              name: fname,
              type: 'external',
              external: {
                url: url
              }
            };
          })
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('No files provided');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class MultiSelect
 */
export class MultiSelect {
  /**
   * Returns the JSON representation for a multiSelect property.
   * @param {string} name - The property name.
   * @param {string[]} options - The multi-select options.
   * @returns {string} JSON string.
   */
  static getJSON(name, options) {
    if (Array.isArray(options)) {
      const data = {
        [name]: {
          multiSelect: options.map(item => {
            return { name: item };
          })
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid options type');
    }
  }

  /**
   * Check if all options exist in a multiSelect property on a Notion page.
   * @param {string} page_id - The Notion page ID.
   * @param {string} property_name - The property name.
   * @param {string[]} options - The array of options to check.
   * @throws {Error} If the property isn't found, isn't multiSelect, or any option doesn't exist.
   * @returns {Promise<boolean>}
   */
  static async checkOptions(page_id, property_name, options) {
    const response = await notionClient.pages.retrieve({ page_id });
    const { properties } = response;

    if (!properties.some(property => property.hasOwnProperty(property_name))) {
      throw new Error(`Property ${property_name} not found`);
    }
    const property = properties.find(property => property.hasOwnProperty(property_name));

    if (!property.multiSelect) {
      throw new Error(`Property ${property_name} is not a multiSelect property`);
    }
    const multiSelect = property.multiSelect;
    options.forEach(option => {
      if (!multiSelect.some(select => Object.values(select).includes(option))) {
        throw new Error(`Option ${option} not found in property ${property_name}`);
      }
    });
    return true;
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Number
 * @param {string} name
 * @param {number} number
 */
export class Number {
  /**
   * Returns the JSON representation for a number property.
   * @param {string} name - The property name.
   * @param {number} numberVal - The numeric value.
   * @returns {string} JSON string.
   */
  static getJSON(name, numberVal) {
    if (typeof numberVal === 'number') {
      const data = { [name]: { number: numberVal } };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid number type');
    }
  }
}

/**
 * @description TODO: Change here based on the type of people
 * @date 18/02/2025
 * @export
 * @class People
 */
export class People {
  /**
   * Returns the JSON representation for a people property.
   * @param {Array} people - The array of people objects.
   * @returns {string} JSON string.
   */
  static getJSON(people) {
    if (Array.isArray(people)) {
      const data = {
        people: people.map(person => {
          return {
            object: 'user',
            id: person.id,
            name: person.name,
            email: person.email
          };
        })
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid people type');
    }
  }
}

/**
 * @description TODO: Check the case that your phone number var type is not string but number.
 * @date 18/02/2025
 * @export
 * @class PhoneNumber
 */
export class PhoneNumber {
  /**
   * Returns the JSON representation for a phone number property.
   * @param {string|number} phone - The phone number.
   * @returns {string} JSON string.
   */
  static getJSON(phone) {
    if (validator.validatePhoneNumber(phone)) {
      const data = { phoneNumber: phone };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid phone number format');
    }
  }
}

export class Relation {
  /**
   * Returns the JSON representation for a relation property.
   * @param {string} name - The property name.
   * @param {Array<string>} ids - The related IDs.
   * @returns {string} JSON string.
   */
  static getJSON(name, ids) {
    if (Array.isArray(ids)) {
      const data = {
        [name]: {
          relation: ids.map(id => id)
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid relation type');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class RichText
 * @param {string} name
 * @param {string[]} inlineText
 */
export class RichText {
  /**
   * Returns the JSON representation for a rich text property.
   * @param {string} name - The property name.
   * @param {string[]} inlineText - The inline text array.
   * @returns {string} JSON string.
   */
  static getJSON(name, inlineText) {
    if (Array.isArray(inlineText)) {
      const data = {
        [name]: {
          rich_text: inlineTextToRichText(inlineText)
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid rich_text type');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Select
 */
export class Select {
  /**
   * Returns the JSON representation for a select property.
   * @param {string} name - The property name.
   * @param {string} option - The select option.
   * @returns {string} JSON string.
   */
  static getJSON(name, option) {
    if (typeof option === 'string') {
      const data = {
        [name]: {
          select: { name: option }
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid option type');
    }
  }

  /**
   * Checks if the current option matches the page property's select option.
   * @param {string} page_id - The Notion page ID.
   * @param {string} property_name - The property name.
   * @param {string} expectedOption - The expected option name.
   * @throws {Error} If the page retrieval fails, property not found, or mismatch occurs.
   * @returns {Promise<boolean>}
   */
  static async checkOption(page_id, property_name, expectedOption) {
    const response = notionClient.pages.retrieve({ page_id });
    if (response.status !== 200) {
      throw new Error(`Error retrieving page: ${page_id}`);
    }
    const { properties } = response;
    if (!properties.some(property => property.hasOwnProperty(property_name))) {
      throw new Error(`Property ${property_name} not found in page ${page_id}`);
    }
    const property = properties.find(property => property.hasOwnProperty(property_name));
    const currentOption = property.select.name;
    if (expectedOption !== currentOption) {
      throw new Error(`Expected ${currentOption} but got ${expectedOption}`);
    }
    return true;
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Status
 */
export class Status {
  /**
   * Returns the JSON representation for a status property.
   * @param {string} name - The property name.
   * @param {string} statusVal - The status value.
   * @returns {string} JSON string.
   */
  static getJSON(name, statusVal) {
    if (typeof statusVal === 'string') {
      const data = {
        [name]: {
          status: {
            name: statusVal
          }
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid status type');
    }
  }

  /**
   * Checks if the current status matches the page property's status.
   * @param {string} page_id - The Notion page ID.
   * @param {string} property_name - The property name.
   * @param {string} expectedStatus - The expected status name.
   * @throws {Error} If the page retrieval fails, property not found, or mismatch occurs.
   * @returns {Promise<boolean>}
   */
  static async checkStatus(page_id, property_name, expectedStatus) {
    const response = notionClient.pages.retrieve({ page_id });
    if (response.status !== 200) {
      throw new Error(`Error retrieving page: ${page_id}`);
    }
    const { properties } = response;
    if (!properties.some(property => property.hasOwnProperty(property_name))) {
      throw new Error(`Property ${property_name} not found in page ${page_id}`);
    }
    const property = properties.find(property => property.hasOwnProperty(property_name));
    const currentStatus = property.status.name;
    if (expectedStatus !== currentStatus) {
      throw new Error(`Expected ${currentStatus} but got ${expectedStatus}`);
    }
    return true;
  }
}

/**
 * @description
 * @date 21/02/2025
 * @export
 * @class Title
 * @param {string} name
 * @param {string} title this should be an inline text.
 */
export class Title {
  /**
   * Returns the JSON representation for a title property.
   * @param {string} name - The property name.
   * @param {string} titleVal - The inline text.
   * @returns {string} JSON string.
   */
  static getJSON(name, titleVal) {
    if (typeof titleVal === 'string') {
      const data = {
        [name]: {
          type: 'title',
          title: inlineTextToRichText(titleVal)
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid title type');
    }
  }
}

/**
 * @description
 * @date 18/02/2025
 * @export
 * @class Url
 */
export class Url {
  /**
   * Returns the JSON representation for a Url property.
   * @param {string} name - The property name.
   * @param {string} urlVal - The Url.
   * @returns {string} JSON string.
   */
  static getJSON(name, urlVal) {
    if (validator.isUrl(urlVal)) {
      const data = {
        [name]: {
          type: 'url',
          url: urlVal
        }
      };
      return JSON.stringify(data);
    } else {
      throw new Error('Invalid Url format');
    }
  }
}


