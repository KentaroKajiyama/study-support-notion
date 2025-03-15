import { 
  Uint, 
  NotionDate, 
  NotionUUID
} from '@domain/types/index.js'

export interface DomainActualBlock {
  blockName?: string;
  startDate?: NotionDate;
  endDate?: NotionDate;
  studentProblemRelations: NotionUUID[];
  speed?: Uint;
  space?: Uint;
  lap?: Uint;
  blockOrder?: Uint;
  blockPageId?: NotionUUID;
}