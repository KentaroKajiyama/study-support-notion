import db from '../awsDB.js';
import logger from '../../utils/logger.js';
import {
  MySQLUintID,
  isMySQLUintID,
  MySQLBoolean,
  toMySQLBoolean,
  toBoolean,
  MySQLDate,
  MySQLTimestamp,
  toMySQLUintID,
} from '../../const/mysqlType.js';

import {
  StudentProblemsAnswerStatusEnum,
  isValidStudentProblemsAnswerStatusEnum,
  StudentProblemsReviewLevelEnum,
  isValidStudentProblemsReviewLevelEnum,
} from '../../const/enumTypes.js';

import { toUint, Uint } from '../../const/myTypes.js';
import { NotionUUID, toNotionUUID, isNotionUUID } from '../../const/myNotionType.js';
import {
  NotionDate,
  convertTimeMySQLToNotion,
  convertTimeNotionToMySQL
} from '../../utils/dateHandler.js';

import { convertToCamelCase, convertToSnakeCase } from '../../utils/convertCase.js';  
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface MySQLStudentProblem {
  studentProblemId?: MySQLUintID;
  studentId?: MySQLUintID;
  problemId?: MySQLUintID;
  actualBlockId?: MySQLUintID;
  notionPageId?: string | null;
  answerStatus?: StudentProblemsAnswerStatusEnum;
  isDifficult?: MySQLBoolean;
  tryCount?: Uint;
  difficultCount?: Uint;
  wrongCount?: Uint;
  reviewLevel?: StudentProblemsReviewLevelEnum;
  reviewCountDown?: Uint | null;
  reviewAvailableDate?: MySQLDate | null;
  problemInBlockOrder?: Uint;
  problemOverallOrder?: Uint;
  lastAnsweredDate?: MySQLDate | null;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface StudentProblem {
  studentProblemId?: MySQLUintID;
  studentId?: MySQLUintID;
  problemId?: MySQLUintID;
  actualBlockId?: MySQLUintID;
  notionPageId?: NotionUUID | null;
  answerStatus?: StudentProblemsAnswerStatusEnum;
  isDifficult?: boolean;
  tryCount?: Uint;
  difficultCount?: Uint;
  wrongCount?: Uint;
  reviewLevel?: StudentProblemsReviewLevelEnum;
  reviewCountDown?: Uint | null;
  reviewAvailableDate?: NotionDate | null;
  problemInBlockOrder?: Uint;
  problemOverallOrder?: Uint;      
  lastAnsweredDate?: NotionDate | null;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
};

export interface Subfield {
  subfieldId?: MySQLUintID
  subfieldName?: string
};

export interface MySQLStudentProblemWithSubfield extends MySQLStudentProblem, Subfield {};

export interface StudentProblemWithSubfield extends StudentProblem, Subfield {};

export function toStudentProblem(row: Partial<MySQLStudentProblem>): StudentProblem {
  try {
    const transformed: StudentProblem = {
      studentProblemId: isMySQLUintID(row.studentProblemId ?? 0)
        ? row.studentProblemId
        : undefined,
      studentId: isMySQLUintID(row.studentId ?? 0)
        ? row.studentId
        : undefined,
      problemId: isMySQLUintID(row.problemId ?? 0)
        ? row.problemId
        : undefined,
      actualBlockId: isMySQLUintID(row.actualBlockId ?? 0)
        ? row.actualBlockId
        : undefined,
      notionPageId: row.notionPageId ? toNotionUUID(row.notionPageId) : undefined,
      answerStatus: row.answerStatus,
      isDifficult: row.isDifficult !== undefined ? toBoolean(row.isDifficult) : undefined,
      tryCount: row.tryCount,
      difficultCount: row.difficultCount,
      wrongCount: row.wrongCount,
      reviewLevel: row.reviewLevel,
      reviewCountDown: row.reviewCountDown,
      reviewAvailableDate: row.reviewAvailableDate && convertTimeMySQLToNotion(row.reviewAvailableDate),
      problemInBlockOrder: row.problemInBlockOrder,
      problemOverallOrder: row.problemOverallOrder,
      lastAnsweredDate: row.lastAnsweredDate
        ? convertTimeMySQLToNotion(row.lastAnsweredDate)
        : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    // Remove undefined fields for cleanliness
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as StudentProblem;
  } catch (error) {
    logger.error(`Error converting MySQLStudentProblem to StudentProblem: ${error}`);
    throw error;
  }
}

export function toStudentProblemWithSubfield(row: MySQLStudentProblemWithSubfield): StudentProblemWithSubfield {
  try {
    const transformed: StudentProblemWithSubfield = {
      studentProblemId: isMySQLUintID(row.studentProblemId ?? 0)
        ? row.studentProblemId
        : undefined,
      studentId: isMySQLUintID(row.studentId ?? 0)
        ? row.studentId
        : undefined,
      problemId: isMySQLUintID(row.problemId ?? 0)
        ? row.problemId
        : undefined,
      actualBlockId: isMySQLUintID(row.actualBlockId ?? 0)
        ? row.actualBlockId
        : undefined,
      subfieldId: isMySQLUintID(row.subfieldId ?? 0)
        ? row.subfieldId
        : undefined,
      subfieldName:row.subfieldName,
      notionPageId: row.notionPageId ? toNotionUUID(row.notionPageId) : undefined,
      answerStatus: row.answerStatus,
      isDifficult: row.isDifficult !== undefined ? toBoolean(row.isDifficult) : undefined,
      tryCount: row.tryCount,
      difficultCount: row.difficultCount,
      wrongCount: row.wrongCount,
      reviewLevel: row.reviewLevel,
      reviewCountDown: row.reviewCountDown,
      reviewAvailableDate: row.reviewAvailableDate && convertTimeMySQLToNotion(row.reviewAvailableDate),
      problemInBlockOrder: row.problemInBlockOrder,
      problemOverallOrder: row.problemOverallOrder,
      lastAnsweredDate: row.lastAnsweredDate
        ? convertTimeMySQLToNotion(row.lastAnsweredDate)
        : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    // Remove undefined fields for cleanliness
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as StudentProblem;
  } catch (error) {
    logger.error(`Error converting MySQLStudentProblem to StudentProblem: ${error}`);
    throw error;
  }
}

export function toMySQLStudentProblem(data: StudentProblem): MySQLStudentProblem {
  try {
    if (data.answerStatus && !isValidStudentProblemsAnswerStatusEnum(data.answerStatus)) {
      throw new Error('Invalid Answer Status in StudentProblem');
    }
    if (data.reviewLevel && !isValidStudentProblemsReviewLevelEnum(data.reviewLevel)) {
      throw new Error('Invalid Review Level in StudentProblem');
    }

    const transformed: Partial<MySQLStudentProblem> = {
      studentProblemId: data.studentProblemId
        ? toMySQLUintID(data.studentProblemId)
        : undefined,
      studentId: data.studentId ? toMySQLUintID(data.studentId) : undefined,
      problemId: data.problemId ? toMySQLUintID(data.problemId) : undefined,
      actualBlockId: data.actualBlockId ? toMySQLUintID(data.actualBlockId) : undefined,
      notionPageId: data.notionPageId ? toNotionUUID(data.notionPageId) : undefined,
      answerStatus: data.answerStatus,
      isDifficult: data.isDifficult !== undefined
        ? toMySQLBoolean(data.isDifficult)
        : undefined,
      tryCount: data.tryCount !== undefined ? toUint(data.tryCount) : undefined,
      difficultCount: data.difficultCount !== undefined ? toUint(data.difficultCount) : undefined,
      wrongCount: data.wrongCount !== undefined ? toUint(data.wrongCount) : undefined,
      reviewLevel: data.reviewLevel,
      reviewCountDown: data.reviewCountDown !== undefined
        ? toUint(data.reviewCountDown as number)
        : undefined,
      reviewAvailableDate: data.reviewAvailableDate
        ? convertTimeNotionToMySQL(data.reviewAvailableDate) as MySQLDate
        : undefined,
      problemInBlockOrder: data.problemInBlockOrder,
      problemOverallOrder: data.problemOverallOrder,
      lastAnsweredDate: data.lastAnsweredDate
        ? convertTimeNotionToMySQL(data.lastAnsweredDate) as MySQLDate
        : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as MySQLStudentProblem;
  } catch (error) {
    logger.error(`Error converting StudentProblem to MySQLStudentProblem: ${error}`);
    throw error;
  }
}

export class StudentProblemsAWS {

  static async create(data: StudentProblem): Promise<number> {
    try {
      if (!data) {
        logger.error("Invalid data provided to create a StudentProblem.");
        throw new Error("Invalid data provided to create a StudentProblem.");
      }

      const payload = toMySQLStudentProblem(data);

      const sql = `
        INSERT INTO student_problems
        (
          student_problem_id,
          student_id,
          problem_id,
          actual_block_id,
          notion_page_id,
          answer_status,
          is_difficult,
          try_count,
          difficult_count,
          wrong_count,
          review_level,
          review_count_down,
          problem_in_block_order,
          problem_order_overall,
          last_answered_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        payload.studentProblemId ?? null,
        payload.studentId ?? null,
        payload.problemId ?? null,
        payload.actualBlockId ?? null,
        payload.notionPageId ?? null,
        payload.answerStatus ?? null,
        payload.isDifficult ?? null,
        payload.tryCount ?? null,
        payload.difficultCount ?? null,
        payload.wrongCount ?? null,
        payload.reviewLevel ?? null,
        payload.reviewCountDown ?? null,
        payload.problemInBlockOrder ?? null,
        payload.problemOverallOrder ?? null,
        payload.lastAnsweredDate ?? null
      ]);

      return (result as { insertId: number }).insertId;
    } catch (error) {
      logger.error("Error creating a student problem:", error);
      throw error;
    }
  }
  static async findAll(): Promise<StudentProblem[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM student_problems');
      if (rows.length === 0) {
        logger.warn('No student problem found in StudentProblem.ts')
        return [];
      }
      return rows.map(row => toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem)) as StudentProblem[];
    } catch (error) {
      logger.error("Error finding all student problems:", error);
      throw error;
    }
  }

  static async findByStudentProblemId(studentProblemId: MySQLUintID): Promise<StudentProblem> {
    try {
      if (!studentProblemId) {
        logger.error("No studentProblemId provided to findById.");
        throw new Error("No studentProblemId provided to findById.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM student_problems WHERE student_problem_id = ?',
        [studentProblemId]
      );
      if (rows.length === 0) {
        logger.warn('No student problem found with studentProblemId in StudentProblem.ts')
        return {};
      }

      const row = convertToCamelCase(rows[0]) as MySQLStudentProblem;
      return toStudentProblem(row) as StudentProblem;
    } catch (error) {
      logger.error(`Error finding student problem by ID: ${studentProblemId}`, error);
      throw error;
    }
  }

  static async findByStudentId(studentId: MySQLUintID): Promise<StudentProblem[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findByStudentId.");
        throw new Error("No studentId provided to findByStudentId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM student_problems WHERE student_id = ?',
        [studentId]
      );
      if (rows.length === 0) {
        logger.warn('No student problem found with studentId in StudentProblem.ts')
        return [];
      }

      return rows.map(row => toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem)) as StudentProblem[];
    } catch (error) {
      logger.error(`Error finding student problems by studentId: ${studentId}`, error);
      throw error;
    }
  }

  static async findByStudentIdAndSubfieldId(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID
  ): Promise<StudentProblem[]> {
    try {
      if (!studentId || !subfieldId) {
        logger.error("Invalid studentId or subfieldId in findByStudentIdAndSubfieldId.");
        throw new Error("Invalid studentId or subfieldId in findByStudentIdAndSubfieldId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM student_problems WHERE student_id = ? AND subfield_id = ?',
        [studentId, subfieldId]
      );
      if (rows.length === 0) {
        return [];
      }

      return rows.map(row => toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem)) as StudentProblem[];
    } catch (error) {
      logger.error(
        `Error finding student problems by studentId: ${studentId} and subfieldId: ${subfieldId}`,
        error
      );
      throw error;
    }
  }

  static async findByCompositeKeyProblemOrder(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID,
    problemOverallOrder: Uint
  ): Promise<StudentProblem[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT * FROM student_problems
        WHERE student_id = ? AND subfield_id = ? AND problem_order_overall = ?
      `,
        [studentId, subfieldId, problemOverallOrder]
      );
      if (rows.length === 0) {
        logger.warn("No student problems found for student id: " + studentId + ", subfield id: " + subfieldId + "problem" + " in StudentProblems.ts")
        return [];
      }

      return rows.map(row => toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem)) as StudentProblem[];
    } catch (error) {
      logger.error(
        `Error finding student problems by composite key (problem_order_overall).`,
        error
      );
      throw error;
    }
  }

  static async findByCompositeKeyInBlockOrder(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID,
    problemInBlockOrder: Uint
  ): Promise<StudentProblem[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT * FROM student_problems
        WHERE student_id = ? AND subfield_id = ? AND problem_in_block_order = ?
      `,
        [studentId, subfieldId, problemInBlockOrder]
      );
      if (rows.length === 0) {
        logger.warn("No student problems found for student id: " + studentId + ", subfield id: " + subfieldId + " prolem in block order:"+ problemInBlockOrder + " in StudentProblems.ts")
        return [];
      }

      return rows.map(row => toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem)) as StudentProblem[];
    } catch (error) {
      logger.error(
        `Error finding student problems by composite key (problem_in_block_order).`,
        error
      );
      throw error;
    }
  }

  static async findWithSubfieldIdByNotionPageId(
    notionPageId: NotionUUID
  ): Promise<StudentProblemWithSubfield[]> {
    try {
      if (!notionPageId) {
        logger.error("No notionPageId provided to findWithSubfieldIdByNotionPageId.");
        throw new Error("No notionPageId provided to findWithSubfieldIdByNotionPageId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT student_problems.*, problems.subfield_id
        FROM student_problems
        INNER JOIN problems
          ON problems.problem_id = student_problems.problem_id
        WHERE student_problems.notion_page_id = ?
        `,
        [notionPageId]
      );
      if (rows.length === 0) {
        logger.warn("No student problems found with notion page id in StudentProblems.ts")
        return [];
      }

      return rows.map(row => toStudentProblemWithSubfield(convertToCamelCase(row) as MySQLStudentProblemWithSubfield)) as StudentProblemWithSubfield[];
    } catch (error) {
      logger.error(`Error finding problem with subfieldId by notionPageId: ${notionPageId}`, error);
      throw error;
    }
  }

  static async findByBlockInfoAndStudentInfo(
    studentId: MySQLUintID,
    actualBlockId: MySQLUintID,
    problemInBlockOrder: Uint
  ): Promise<StudentProblem[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT * FROM student_problems
        WHERE student_id = ? AND actual_block_id = ? AND problem_in_block_order = ?
        `,
        [studentId, actualBlockId, problemInBlockOrder]
      );
      if (rows.length === 0) {
        logger.warn("No student problems found by block info and student info in StudentProblems.ts")
        return [];
      }

      return rows.map(row => toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem)) as StudentProblem[];
    } catch (error) {
      logger.error(
        `Error finding student problem by block/student info: ${studentId}, ${actualBlockId}`,
        error
      );
      throw error;
    }
  }

  static async findNotionPageIdsByCompositeKey(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID,
    actualBlockId: MySQLUintID
  ): Promise<NotionUUID[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT notion_page_id
        FROM student_problems
        WHERE student_id = ? AND subfield_id = ? AND actual_block_id = ?
        `,
        [studentId, subfieldId, actualBlockId]
      );
      if (rows.length === 0) {
        logger.warn("No student problems found by composite key in StudentProblems.ts")
        return [];
      }

      return rows.map(row => {
        const notionPageId = toStudentProblem(convertToCamelCase(row) as MySQLStudentProblem).notionPageId
        if (!notionPageId || !isNotionUUID(notionPageId)) {
          logger.warn(`Invalid Notion UUID: ${notionPageId} for ${row.problemId} and StudentId: ${row.studentId} in StudentProblems.ts`);
          return null
        }
        return notionPageId;
      }).filter(id => id !== null && id !== undefined) as NotionUUID[];
    } catch (error) {
      logger.error(
        `Error finding notionPageIds by composite key: sId=${studentId}, sfId=${subfieldId}, abId=${actualBlockId}`,
        error
      );
      throw error;
    }
  }

  static async findNotionPageIdByStudentProblemId(
    studentProblemId: MySQLUintID
  ): Promise<NotionUUID | null> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT notion_page_id
        FROM student_problems
        WHERE student_problem_id = ?
        `,
        [studentProblemId]
      );
      if (rows.length === 0) {
        logger.warn('There is no notion page id for student problem id: ' + studentProblemId + ' was not found in StudentProblems.ts\n');
        return null;
      }

      const row = convertToCamelCase(rows[0]);
      if (!isNotionUUID(row as unknown as string)) throw new Error('Invalid NotionUUID in StudentProblem.ts');
      return row.notionPageId;
    } catch (error) {
      logger.error(
        `Error finding notionPageId by studentProblemId: ${studentProblemId}`,
        error
      );
      throw error;
    }
  }

  static async findWithSubfieldIdByStudentProblemId(
    studentProblemId: MySQLUintID
  ): Promise<StudentProblemWithSubfield[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT student_problems.*, problems.subfield_id
        FROM student_problems
        INNER JOIN problems ON problems.problem_id = student_problems.problem_id
        WHERE student_problems.student_problem_id = ?
        `,
        [studentProblemId]
      );
      if (rows.length === 0) {
        return [];
      }

      return rows.map(row => toStudentProblemWithSubfield(convertToCamelCase(row) as MySQLStudentProblemWithSubfield)) as StudentProblemWithSubfield[];
    } catch (error) {
      logger.error(`Error finding problem for review by studentProblemId: ${studentProblemId}`, error);
      throw error;
    }
  }

  static async findAllProblemsForReview(
    subfieldId: MySQLUintID,
    reviewSpeed: number
  ): Promise<StudentProblem[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT student_problems.*, problems.subfield_id, subfields.subfield_name
        FROM student_problems
        INNER JOIN problems
          ON problems.problem_id = student_problems.problem_id
        INNER JOIN subfields
          ON subfields.subfield_id = problems.subfield_id
        WHERE student_problems.review_count_down = 0
          AND problems.subfield_id = ?
        ORDER BY student_problems.review_available_date ASC
        LIMIT ?
        `,
        [subfieldId, reviewSpeed]
      );
      if (rows.length === 0) {
        return [];
      }

      return rows.map(row => toStudentProblemWithSubfield(convertToCamelCase(row) as MySQLStudentProblemWithSubfield)) as StudentProblemWithSubfield[];
    } catch (error) {
      logger.error(`Error finding all problems for review by subfieldId: ${subfieldId}`, error);
      throw error;
    }
  }

  static async updateReviewCountDown(): Promise<boolean> {
    try {
      await db.query(
        `
        UPDATE student_problems
        SET review_count_down = GREATEST(review_count_down - 1, 0)
        WHERE review_count_down > 0
        `
      );
      return true;
    } catch (error) {
      logger.error("Error updating review_count_down", error);
      throw error;
    }
  }

  static async update(
    studentProblemId: MySQLUintID,
    updates: Partial<StudentProblem>
  ): Promise<boolean> {
    try {
      if (!studentProblemId || !updates || Object.keys(updates).length === 0) {
        logger.error("Invalid input: studentProblemId and updates are required for update.");
        throw new Error("Invalid input: studentProblemId and updates are required for update.");
      }

      // Convert domain-level updates into DB column updates
      const payload = convertToSnakeCase(toMySQLStudentProblem(updates));

      const columns = Object.keys(payload);
      if (columns.length === 0) {
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const values = Object.values(payload);

      const sql = `
        UPDATE student_problems
        SET ${setClause},
        WHERE student_problem_id = ?
      `;

      await db.query(sql, [...values, studentProblemId]);
      return true;
    } catch (error) {
      logger.error(`Error updating student problem with ID: ${studentProblemId}`, error);
      throw error;
    }
  }

  static async updateForCoachPlan(updates: {
    studentProblemId: MySQLUintID;
    actualBlockId?: MySQLUintID;
    probOverallOrder?: Uint;
    probInBlockOrder?: Uint;
  }[]): Promise<boolean> {
    try {
      if (!updates) {
        logger.error("No updates provided to updateForCoachPlan.");
        throw new Error("No updates provided to updateForCoachPlan.");
      } else if (updates.length === 0) {
        logger.warn("No updates provided to updateForCoachPlan.");
        return false;
      }

      // Build CASE statements dynamically
      const studentProblemIds = updates.map((u) => u.studentProblemId).join(", ");

      const buildCase = (fieldInDB: string, arrayKey: keyof typeof updates[number]) => {
        let caseSql = `${fieldInDB} = CASE`;
        let hasAny = false;
        for (const u of updates) {
          const val = u[arrayKey];
          if (val !== undefined) {
            hasAny = true;
            caseSql += ` WHEN student_problem_id = ${u.studentProblemId} THEN ${val}`;
          }
        }
        caseSql += ` ELSE ${fieldInDB} END`;
        return hasAny ? caseSql : null;
      };

      const actualBlockIdCase = buildCase("actual_block_id", "actualBlockId");
      const overallOrderCase = buildCase("problem_order_overall", "probOverallOrder");
      const inBlockOrderCase = buildCase("problem_in_block_order", "probInBlockOrder");

      // Collect only those CASE statements that actually had updates
      const caseStatements = [actualBlockIdCase, overallOrderCase, inBlockOrderCase].filter(
        (stmt) => stmt !== null
      );

      // If there's nothing to update, just return
      if (caseStatements.length === 0) {
        logger.warn("updateForCoachPlan was called but no valid fields to update.");
        return false;
      }

      const sql = `
        UPDATE student_problems
        SET
          ${caseStatements.join(", ")}
        WHERE student_problem_id IN (${studentProblemIds})
      `;

      await db.query(sql);
      return true;
    } catch (error: any) {
      logger.error("Error updating student problems for coach plan:", error);
      await db.rollback();
      throw new Error("Error updating student problems for coach plan.");
    }
  }

  static async delete(studentProblemId: MySQLUintID): Promise<boolean> {
    try {
      if (!studentProblemId) {
        logger.error("No studentProblemId provided to delete a student problem.");
        throw new Error("No studentProblemId provided to delete a student problem.");
      }

      const [result] = await db.query<ResultSetHeader>(
        'DELETE FROM student_problems WHERE student_problem_id = ?',
        [studentProblemId]
      );
      if (result.affectedRows === 0) {
        logger.warn(`No student problem found with ID: ${studentProblemId}`);
        return false;
      }
      return true
    } catch (error) {
      logger.error(`Error deleting student problem with ID: ${studentProblemId}`, error);
      throw error;
    }
  }
}
