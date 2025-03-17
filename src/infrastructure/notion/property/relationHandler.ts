import { 
  NotionUUID, 
  toNotionUUID, 
  RelationPropertyResponse,
  RelationPropertyRequest
} from '@domain/types/index.js';
import { 
  logger
} from '@utils/index.js';


export type RelationResponseOption =
  | 'a page id'

export type RelationResponseReturnType = 
  | NotionUUID
  | null;

export function relationResponseHandler(
  relationProp: RelationPropertyResponse, 
  option: RelationResponseOption
): RelationResponseReturnType {
  switch (option) {
    case 'a page id':
      if (relationProp.relation.length === 0) {
        logger.warn('Relation has no relation');
      } else if (relationProp.relation.length >= 2) {
        logger.error('Relation has more than one relation');
      };
      return toNotionUUID(relationProp.relation[0].id);
    default:
      throw new Error('Invalid relation option');
  }
};

export type RelationRequestOption = 
  | 'a page id'

export type RelationRequestInputType =
  | NotionUUID
  | null;

export function relationRequestHandler(
  input: RelationRequestInputType, 
  option: RelationRequestOption
): RelationPropertyRequest {
  switch (option) {
    case 'a page id':
      if (Array.isArray(input)) {
        logger.error('Input for relation property option:' + option +'must be a single page id');
        throw new Error('Input for relation property option:' + option +'must be a single page id');
      } else if (input === null) {
        logger.warn('No page id provided for relation property option:' + option);
        return { relation: [] };
      }
      return { relation: [{ id: toNotionUUID(input) }] };
    default:
      throw new Error('Invalid relation option');
  }
};