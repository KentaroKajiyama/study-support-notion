import { 
  NotionDate,
  SubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum,
  Uint
} from "@domain/types/index.js";

export interface DomainStudentRemaining {
  subfieldName?: SubfieldsSubfieldNameEnum;
  subjectName?: SubjectsSubjectNameEnum;
  remainingDay?: Uint;
  targetDate?: NotionDate;
}

