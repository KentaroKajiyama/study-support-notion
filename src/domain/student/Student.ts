import { 
  MySQLUintID,
  PhoneNumber,
  Email,
  NotionDate,
  NotionUUID,
  MySQLTimestamp
} from '@domain/types/index.js';

export interface Student {
  studentId?: MySQLUintID;
  studentName?: string;
  parentName?: string;
  parentPhoneNumber?: PhoneNumber;
  parentEmail?: Email;
  examDate?: NotionDate;
  studentPageId?: NotionUUID;
  todoDbId?: NotionUUID;
  remainingDbId?: NotionUUID;
  wrongDbId?: NotionUUID;
  isDifficultDbId?: NotionUUID;
  todoCounterDbId?: NotionUUID;
  studentScheduleDbId?: NotionUUID;
  studentOverviewPageId?: NotionUUID;
  studentInfoDetailDbId?: NotionUUID;
  coachRestDbId?: NotionUUID;
  coachPlanDbId?: NotionUUID;
  coachIrregularDbId?: NotionUUID;
  necessaryStudyTimeDbId?: NotionUUID;
  goalDescription?: string;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}