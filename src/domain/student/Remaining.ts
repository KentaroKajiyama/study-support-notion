import { 
  NotionDate,
  SubjectsSubjectNameEnum,
  Uint
} from "@domain/types/index.js";

export interface DomainRemaining {
  subfieldName?: SubjectsSubjectNameEnum;
  subjectName?: SubjectsSubjectNameEnum;
  remainingDay?: Uint;
  targetDate?: NotionDate;
}

