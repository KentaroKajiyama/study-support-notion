import {
  logger
} from '@utils/index.js'
import { 
  NotionUUID,
  PeoplePropertyResponse,
  URLString
} from '@domain/types/index.js';
import {
  propertyResponseToDomain
} from '@infrastructure/notionProperty.js';

export const extractIdFromUrl = (url: URLString) => {
  try {
    if (typeof url !== 'string'){
      throw new Error('Invalid input: URL must be a string.');
    }
    const regex = /([a-f0-9]{32})/
    const match = url.match(regex)
    if (!match){
      throw new Error('Invalid URL: No ID found.');
    }
    return match[1];
  } catch(error) {
    logger.error(error);
    return null;
  }
}

// TODO: Modification
export const extractIdFromMention = (richText: string) => {
  try {
    if (!Array.isArray(richText)){
      throw new Error('Invalid input: Rich text must be an array.');
    }
    const mentionRegex = /<@([a-f0-9]{32})>/
    const match = richText.find((text) => text.type === 'mention' && mentionRegex.test(text.text))
    if (!match){
      throw new Error('Invalid rich text: No mention found.');
    }
    return match[1];
  } catch(error) {
    logger.error(error);
    return null;
  }
}

export const extractStudentUserIdFromPeople = (peopleProperty: PeoplePropertyResponse): NotionUUID => {
  try {
    return propertyResponseToDomain(peopleProperty, 'a person') as NotionUUID;
  } catch (error) {
    logger.error('Something went wrong in extractIdFromPeople', error);
    throw error;
  }
}