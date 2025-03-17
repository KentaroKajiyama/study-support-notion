import { 
  NotionUUID, 
  PeoplePropertyResponse, 
  toNotionUUID,
  PeoplePropertyRequest,
} from "@domain/types/index.js";
import {
  logger
} from "@utils/index.js";

export type PeopleResponseOption = 
  | 'a person'

export type PeopleResponseReturnType =
  | NotionUUID

export function peopleResponseHandler(peopleProp: PeoplePropertyResponse, option: PeopleResponseOption): PeopleResponseReturnType {
  switch (option) {
    case 'a person':
      if (peopleProp.people.length === 0) {
        throw new Error('People property is empty');
      } else if (peopleProp.people.length >= 2) {
        logger.warn("More than 2 people were found in the response")
      };
      return toNotionUUID(peopleProp.people[0].id);
    default:
      throw new Error('Invalid people response option');
  }
}

export type PeopleRequestOption = 
  | 'a person'

export type PeopleRequestInputType = 
  | NotionUUID

export function peopleRequestHandler(input: PeopleRequestInputType, option: PeopleRequestOption): PeoplePropertyRequest {
  switch (option) {
    case 'a person':
      return {
        type: "people",
        people: [{ id: input }],
      };
    default:
      throw new Error('Invalid people request option');
  }
}