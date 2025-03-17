import { 
  Uint, 
  NotionDate, 
  NotionUUID,
  ActualBlocksProblemLevelEnum
} from '@domain/types/index.js'

export interface DomainStudentActualBlock {
  blockName?: string;
  startDate?: NotionDate;
  endDate?: NotionDate;
  studentProblemRelations?: NotionUUID[];
  speed?: Uint;
  space?: Uint;
  lap?: Uint;
  problemLevel?: ActualBlocksProblemLevelEnum;
  blockOrder?: Uint;
  blockPageId?: NotionUUID;
}