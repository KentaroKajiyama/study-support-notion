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
    const regex = /([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})/i;
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

export const extractStudentUserIdFromPeople = (peopleProperty: PeoplePropertyResponse): NotionUUID => {
  try {
    return propertyResponseToDomain(peopleProperty, 'a person') as NotionUUID;
  } catch (error) {
    logger.error('Something went wrong in extractIdFromPeople', error);
    throw error;
  }
}