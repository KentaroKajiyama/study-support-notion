import { richTextToInlineText } from "./convertRichText.js";
import * as conv from "../const/notionTemplate.js";
import logger from "./logger.js";
// TODO: Implement rollup.
// TODO: Think other methods for icon and cover.
/**
 * Handles various property types from a Notion-like property object.
 *
 * @param {Object} propertiesArray - The array of properties.
 * @param {string} propertyName - The name of the property to retrieve.
 * @param {string} propertyType - The type of the property.
 * @returns {boolean | string | number | Object | Object[]} - The extracted property value.
 *
 * @throws {Error} If the file type is invalid or the property type is unknown.
 *
 * @typedef {Object} DateProperty
 * @property {string} start - The start date.
 * @property {string|null} end - The end date (nullable).
 *
 * @typedef {Object} FileProperty
 * @property {string} name - The name of the file.
 * @property {string} url - The external URL of the file.
 * 
 * @typedef {string[]} MultiSelectProperty - Array of selected option names.
 *
 * @typedef {Object} PeopleProperty
 * @property {string} id - The unique identifier of the person.
 * @property {string} name - The person's name.
 * @property {string} email - The person's email.
 *
 * @typedef {string[]} RelationProperty
 * @property {string} id - The ID of the related item.
 *
 * @typedef {Object} UniqueIdProperty
 * @property {string} number - The unique identifier value.
 * @property {string} prefix - The prefix of the unique ID.
 *
 *
 * @returns {DateProperty|FileProperty[]|PeopleProperty[]|RelationProperty[]|MultiSelectProperty|UniqueIdProperty} - The processed property value.
 */
export const propertyFromNotion = ({ propertiesObj, propertyName, propertyType }) => {
  if(!propertiesObj ||!propertiesObj[propertyName]){
    throw new Error(`Property ${propertyName} not found in ${JSON.stringify(propertiesObj)}`);
  }
  const property = propertiesObj[propertyName];
  if(propertyType === 'checkbox') {
    return property.checkbox;
  } else if(propertyType === 'date') {
    return { start: property.date.start, end: property.date.end || null };
  } else if(propertyType === 'email') {
    return property.email;
  } else if(propertyType === 'files') {
    return property.files.map(file => {
      if(!file.external){
        throw new Error(`Invalid file type: ${file.type}, file name: ${file.name} in ${propertyName}`);
      }
      return { name: file.name, url: file.external.url };
    });
  } else if(propertyType === 'formula') {
    return property.formula.number;
  } else if(propertyType === 'multi_select') {
    return property.multi_select.map(item => item.name);
  } else if(propertyType === 'number') {
    return property.number;
  } else if(propertyType === 'people') {
    return property.people.map(person => {
      return { id: person.id, name: person.name, email: person.person.email };
    });
  } else if(propertyType === 'phone_number') {
    return property.phone_number;
  } else if(propertyType === 'relation') {
    return property.relation.map(relation => relation.id); 
  } else if(propertyType === 'rich_text') {
    return richTextToInlineText(property.rich_text);
  } else if(propertyType === 'select') {
    return property.select.name;
  } else if(propertyType === 'status') {
    return property.status.name;
  } else if(propertyType === 'title') {
    return richTextToInlineText(property.title);
  } else if(propertyType === 'url') {
    return property.url;
  } else if(propertyType === 'unique_id'){
    return { 'number': property.unique_id.name, 'prefix': property.unique_id.prefix };
  } else {
    throw new Error(`Invalid property type: ${propertyType} in ${propertyName}`);
  }
}

/**
 * Handles various property types from a Notion-like property object.
 *
 * @param {string} propertyName - The name of the property to retrieve.
 * @param {string | Array | Object} propertiesContent - The array of properties.
 * @param {string} propertyType - The type of the property.
 * @returns {Object | Object[]} - The extracted property value.
 *
 * @throws {Error} If the property type is invalid or unknown.
 *
 * @typedef {Object} DatePropertyContent
 * @property {string} start - The start date.
 * @property {string|null} end - The end date (nullable).
 *
 * @typedef {Object} FileProperty
 * @property {string} name - The name of the file.
 * @property {string} url - The external URL of the file.
 * 
 * @typedef {string[]} MultiSelectProperty - Array of selected option names.
 *
 * @typedef {Object} PeopleProperty
 * @property {string} id - The unique identifier of the person.
 * @property {string} name - The person's name.
 * @property {string} email - The person's email.
 *
 * @typedef {string[]} RelationProperty
 * @property {string} id - The ID of the related item.
 *
 * @typedef {Object} UniqueIdProperty
 * @property {string} number - The unique identifier value.
 * @property {string} prefix - The prefix of the unique ID.
 *
 *
 *
 * @returns {DateProperty|FileProperty[]|PeopleProperty[]|RelationProperty[]|MultiSelectProperty|UniqueIdProperty} - The processed property value.
 */
export const propertyToNotion = ({ propertyName, propertyContent, propertyType }) => {
  if (propertyType === 'checkbox') {
    return conv.Checkbox.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'date') {
    return conv.Date.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'email') {
    return conv.Email.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'files') {
    return conv.Files.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'formula') {
    return conv.Formula.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'multi_select') {
    return conv.MultiSelect.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'number') {
    return conv.Number.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'people') {
    return conv.People.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'phone_number') {
    return conv.PhoneNumber.getJSON(propertyName, propertyContent);
  } else if (propertyType ==='relation') {
    return conv.Relation.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'rich_text') {
    return conv.RichText.getJSON(propertyName, propertyContent);
  } else if (propertyType ==='select') {
    return conv.Select.getJSON(propertyName, propertyContent);
  } else if (propertyType ==='status') {
    return conv.Status.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'title') {
    return conv.Title.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'url') {
    return conv.Url.getJSON(propertyName, propertyContent);
  } else if (propertyType === 'unique_id') {
    return conv.UniqueId.getJSON(propertyName, propertyContent);
  } else {
    throw new Error(`Invalid property type: ${propertyType}`);
  };
}
