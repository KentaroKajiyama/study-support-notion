import { NotionUUID } from "@domain/types/index.js";
import { DomainStudentProblem } from "@domain/student/index.js";

export interface DomainTopProblem extends DomainStudentProblem {
  topProblemPageId?: NotionUUID;
}