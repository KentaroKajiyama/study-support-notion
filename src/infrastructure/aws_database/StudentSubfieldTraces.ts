import db from '../awsDB.js';
import logger from '../../utils/logger.js';
import { convertToCamelCase, convertToSnakeCase } from '../../utils/convertCase.js';
import {
  MySQLDate,
  MySQLTimestamp,
  MySQLUintID,
} from '../../const/mysqlType.js';
import {
  Uint,
  isUint,
  Int,
  isInt
} from '../../const/myTypes.js';
import {
  NotionUUID,
  toNotionUUID
} from '../../const/myNotionType.js';
import {
  NotionDate,
  convertTimeMySQLToNotion,
  convertTimeNotionToMySQL
} from '../../utils/dateHandler.js';

export interface MySQLStudentSubfieldTrace {
  traceId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  todoRemainingCounter?: Uint;
  todoRemainingCounterNotionPageId?: string;
  remainingDay?: Uint;
  remainingDayNotionPageId?: string;
  actualEndDate?: MySQLDate | null;
  targetDate?: MySQLDate | null;
  examDate?: MySQLDate | null;
  delay?: Int;
  notionProblemsDbId?: string;
  reviewSpeed?: Uint;
  reviewSpace?: Uint;
  reviewRemainingSpace?: Uint;
  reviewAlert?: Uint; 
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface StudentSubfieldTrace {
  traceId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  todoRemainingCounter?: Uint;
  todoRemainingCounterNotionPageId?: NotionUUID;
  remainingDay?: Uint;
  remainingDayNotionPageId?: NotionUUID;
  actualEndDate?: NotionDate | null;
  targetDate?: NotionDate | null;
  examDate?: NotionDate | null;
  delay?: Int;
  notionProblemsDbId?: NotionUUID;
  reviewSpeed?: Uint;
  reviewSpace?: Uint;
  reviewRemainingSpace?: Uint;
  reviewAlert?: Uint;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

interface SubfieldName {
  subfieldName?: string;
}

export interface MySQLStudentSubfieldTraceWithSubfieldName extends MySQLStudentSubfieldTrace, SubfieldName {};
export interface StudentSubfieldTraceWithSubfieldName extends StudentSubfieldTrace, SubfieldName {};

export function toStudentSubfieldTrace(
  row: MySQLStudentSubfieldTrace
): StudentSubfieldTrace {
  try {
    const transformed: StudentSubfieldTrace = {
      traceId: row.traceId,
      studentId: row.studentId,
      subfieldId: row.subfieldId,
      todoRemainingCounter: row.todoRemainingCounter,
      todoRemainingCounterNotionPageId:
        row.todoRemainingCounterNotionPageId !== undefined
          ? toNotionUUID(row.todoRemainingCounterNotionPageId)
          : undefined,
      remainingDay: row.remainingDay,
      remainingDayNotionPageId:
        row.remainingDayNotionPageId !== undefined
          ? toNotionUUID(row.remainingDayNotionPageId)
          : undefined,
      actualEndDate:
        row.actualEndDate !== undefined
          ? (convertTimeMySQLToNotion(row.actualEndDate) as NotionDate)
          : undefined,
      targetDate:
        row.targetDate !== undefined
          ? (convertTimeMySQLToNotion(row.targetDate) as NotionDate)
          : undefined,
      examDate:
        row.examDate !== undefined
          ? (convertTimeMySQLToNotion(row.examDate) as NotionDate)
          : undefined,
      delay: row.delay,
      notionProblemsDbId:
        row.notionProblemsDbId !== undefined
          ? toNotionUUID(row.notionProblemsDbId)
          : undefined,
      reviewSpeed: row.reviewSpeed,
      reviewSpace: row.reviewSpace,
      reviewRemainingSpace: row.reviewRemainingSpace,
      reviewAlert: row.reviewAlert,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    // Remove undefined fields
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as StudentSubfieldTrace;
  } catch (error) {
    logger.error('Error transforming MySQLStudentSubfieldTrace -> StudentSubfieldTrace:', error);
    throw error;
  }
}

export function toStudentSubfieldTraceWithSubfieldName(
  row: MySQLStudentSubfieldTraceWithSubfieldName
): StudentSubfieldTraceWithSubfieldName {
  try {
    const transformed: StudentSubfieldTraceWithSubfieldName = {
      traceId: row.traceId,
      studentId: row.studentId,
      subfieldId: row.subfieldId,
      subfieldName: row.subfieldName,
      todoRemainingCounter: row.todoRemainingCounter,
      todoRemainingCounterNotionPageId:
        row.todoRemainingCounterNotionPageId !== undefined
          ? toNotionUUID(row.todoRemainingCounterNotionPageId)
          : undefined,
      remainingDay: row.remainingDay,
      remainingDayNotionPageId:
        row.remainingDayNotionPageId !== undefined
          ? toNotionUUID(row.remainingDayNotionPageId)
          : undefined,
      actualEndDate:
        row.actualEndDate !== undefined
          ? (convertTimeMySQLToNotion(row.actualEndDate) as NotionDate)
          : undefined,
      targetDate:
        row.targetDate !== undefined
          ? (convertTimeMySQLToNotion(row.targetDate) as NotionDate)
          : undefined,
      examDate:
        row.examDate !== undefined
          ? (convertTimeMySQLToNotion(row.examDate) as NotionDate)
          : undefined,
      delay: row.delay,
      notionProblemsDbId:
        row.notionProblemsDbId !== undefined
          ? toNotionUUID(row.notionProblemsDbId)
          : undefined,
      reviewSpeed: row.reviewSpeed,
      reviewSpace: row.reviewSpace,
      reviewRemainingSpace: row.reviewRemainingSpace,
      reviewAlert: row.reviewAlert,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    // Remove undefined fields
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as StudentSubfieldTraceWithSubfieldName;
  } catch (error) {
    logger.error('Error transforming MySQLStudentSubfieldTrace -> StudentSubfieldTrace:', error);
    throw error;
  }
}

export function toMySQLStudentSubfieldTrace(
  data: StudentSubfieldTrace
): MySQLStudentSubfieldTrace {
  try {
    if (data.todoRemainingCounter && !isUint(data.todoRemainingCounter)) {
      throw new Error('Invalid todoRemainingCounter');
    }
    if (data.remainingDay && !isUint(data.remainingDay)) {
      throw new Error('Invalid remainingDay');
    }
    if (data.delay && !isInt(data.delay)) {
      throw new Error('Invalid delay');
    }

    const transformed: MySQLStudentSubfieldTrace = {
      traceId: data.traceId,
      studentId: data.studentId,
      subfieldId: data.subfieldId,
      todoRemainingCounter: data.todoRemainingCounter,
      todoRemainingCounterNotionPageId: data.todoRemainingCounterNotionPageId,
      remainingDay: data.remainingDay,
      remainingDayNotionPageId: data.remainingDayNotionPageId,
      actualEndDate:
        data.actualEndDate !== undefined
          ? (convertTimeNotionToMySQL(data.actualEndDate, true) as MySQLDate)
          : undefined,
      targetDate:
        data.targetDate !== undefined
          ? (convertTimeNotionToMySQL(data.targetDate, true) as MySQLDate)
          : undefined,
      examDate:
        data.examDate !== undefined
          ? (convertTimeNotionToMySQL(data.examDate, true) as MySQLDate)
          : undefined,
      delay: data.delay,
      notionProblemsDbId: data.notionProblemsDbId,
      reviewSpeed: data.reviewSpeed,
      reviewSpace: data.reviewSpace,
      reviewRemainingSpace: data.reviewRemainingSpace,
      reviewAlert: data.reviewAlert,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    // Remove undefined fields
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as MySQLStudentSubfieldTrace;
  } catch (error) {
    logger.error('Error transforming StudentSubfieldTrace -> MySQLStudentSubfieldTrace:', error);
    throw error;
  }
}


export class StudentSubfieldTraces {
  static async create({
    studentId,
    subfieldId
  }: {
    studentId: MySQLUintID;
    subfieldId: MySQLUintID;
  }): Promise<boolean> {
    try {
      if (!studentId || !subfieldId) {
        logger.error("Invalid input for creating StudentSubfieldTrace: missing IDs.");
        throw new Error("studentId and subfieldId are required.");
      }

      const sql = `
        INSERT INTO student_subfield_traces
        (
          student_id,
          subfield_id,
        )
        VALUES (?, ?)
      `;
      await db.query(sql, [
        studentId,
        subfieldId,      
      ]);

      // Return how many rows were affected or the insertId
      return true;
    } catch (error) {
      logger.error("Error creating StudentSubfieldTrace:", error);
      throw error;
    }
  }

  static async findAll(): Promise<StudentSubfieldTrace[]> {
    try {
      const [rows] = await db.query('SELECT * FROM student_subfield_traces');
      if (!Array.isArray(rows)) {
        throw new Error("rows must be an array in findAll StudentSubfieldTraces.ts");
      } else if (rows.length === 0){
        logger.warn('No trace is found in findAll StudentSubfieldTrace.ts')
        return [];
      }
      return rows.map(row => toStudentSubfieldTrace(convertToCamelCase(row) as MySQLStudentSubfieldTrace)) as StudentSubfieldTrace[]
    } catch (error) {
      logger.error("Error finding all StudentSubfieldTraces:", error);
      throw error;
    }
  }

  static async findByStudentId(studentId: MySQLUintID): Promise<StudentSubfieldTrace[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findByStudentId.");
        throw new Error("studentId is required.");
      }

      const [rows] = await db.query(
        'SELECT * FROM student_subfield_traces WHERE student_id = ?',
        [studentId]
      );
      if (!Array.isArray(rows)) {
        throw new Error("rows must be an array in findByStudentId StudentSubfieldTraces.ts");
      } else if (rows.length === 0) {
        logger.warn('No trace is found in findByStudentId StudentSubfieldTrace.ts')
        return [];
      }

      return rows.map(row => toStudentSubfieldTrace(convertToCamelCase(row) as MySQLStudentSubfieldTrace)) as StudentSubfieldTrace[]
    } catch (error) {
      logger.error(`Error finding StudentSubfieldTrace by studentId: ${studentId}`, error);
      throw error;
    }
  }

  static async findOnlySubfieldInfoByStudentId(studentId: MySQLUintID): Promise<{
    subfieldId: MySQLUintID;
    subfieldName: string;
  }[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findOnlySubfieldInfoByStudentId.");
        throw new Error("studentId is required.");
      }

      const [rows] = await db.query(
        `
          SELECT student_subfield_traces.subfield_id, subfields.subfield_name
          FROM student_subfield_traces
          INNER JOIN subfields
            ON student_subfield_traces.subfield_id = subfields.subfield_id
          WHERE student_subfield_traces.student_id = ?
        `,
        [studentId]
      );

      if (!Array.isArray(rows)) {
        throw new Error("rows must be an array in findOnlySubfieldInfoByStudentId StudentSubfieldTraces.ts");
      } else if (rows.length === 0) {
        logger.warn('No trace is found in findOnlySubfieldInfoByStudentId StudentSubfieldTrace.ts')
        return [];
      }
      const camelRows = convertToCamelCase(rows);
      return camelRows.map((camelRow: StudentSubfieldTraceWithSubfieldName) => {
        if(camelRow.subfieldId === undefined || camelRow.subfieldName === undefined) {
          throw new Error("Invalid camelRow in findOnlySubfieldInfoByStudentId StudentSubfieldTrace.ts");
        }
        return {
          subfieldId: camelRow.subfieldId,
          subfieldName: camelRow.subfieldName,
        }
      });
    } catch (error) {
      logger.error(
        `Error finding only subfield info by studentId: ${studentId}`,
        error
      );
      throw error;
    }
  }
  static async findOnlyReviewAlertByStudentId(studentId: MySQLUintID): Promise<{
    studentId: MySQLUintID;
    subfieldId: MySQLUintID;
    reviewAlert: Uint;
    subfieldName: string;
  }[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findOnlyReviewAlertByStudentId.");
        throw new Error("studentId is required.");
      }

      const [rows] = await db.query(
        `
          SELECT
            student_subfield_traces.student_id,
            student_subfield_traces.subfield_id,
            student_subfield_traces.review_alert,
            subfields.subfield_name
          FROM student_subfield_traces
          INNER JOIN subfields
            ON student_subfield_traces.subfield_id = subfields.subfield_id
          WHERE student_subfield_traces.student_id = ?
        `,
        [studentId]
      );
      if (!Array.isArray(rows)) {
        throw new Error("rows must be an array in findOnlyReviewAlertByStudentId StudentSubfieldTraces.ts");
      } else if (rows.length === 0) {
        logger.warn('No trace is found in findOnlyReviewAlertByStudentId StudentSubfieldTrace.ts')
        return [];
      }
      return rows.map((r: StudentSubfieldTraceWithSubfieldName) => {
        if(r.studentId === undefined || r.subfieldId === undefined || r.reviewAlert === undefined || r.subfieldName === undefined) {
          throw new Error("Invalid row in findOnlyReviewAlertByStudentId StudentSubfieldTrace.ts");
        }
        return {
          studentId: r.studentId,
          subfieldId: r.subfieldId,
          reviewAlert: r.reviewAlert,
          subfieldName: r.subfieldName,
        }
      });
    } catch (error) {
      logger.error(
        `Error finding reviewAlert by studentId: ${studentId}`,
        error
      );
      throw error;
    }
  }
  static async findByCompositeKey(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID
  ): Promise<StudentSubfieldTrace | null> {
    try {
      if (!studentId || !subfieldId) {
        logger.error("Invalid input to findByCompositeKey: missing IDs.");
        throw new Error("studentId and subfieldId are required.");
      }

      const [rows] = await db.query(
        `
          SELECT *
          FROM student_subfield_traces
          WHERE student_id = ? AND subfield_id = ?
        `,
        [studentId, subfieldId]
      );

      if (!Array.isArray(rows)) {
        throw new Error("rows must be an array in findByCompositeKey StudentSubfieldTrace.ts");
      } else if (rows.length === 0) {
        logger.warn('No trace is found in findByCompositeKey StudentSubfieldTrace.ts')
        return null;
      }

      const rowCamel = convertToCamelCase(rows[0]) as MySQLStudentSubfieldTraceWithSubfieldName;
      return toStudentSubfieldTraceWithSubfieldName(rowCamel);
    } catch (error) {
      logger.error(
        `Error finding StudentSubfieldTrace by compositeKey (studentId=${studentId}, subfieldId=${subfieldId}):`,
        error
      );
      throw error;
    }
  }

  static async findOnlyTodoRemainingCounterByCompositeKey(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID
  ): Promise<number | null> {
    try {
      if (!studentId || !subfieldId) {
        logger.error("Invalid input to findOnlyTodoRemainingCounterByCompositeKey: missing IDs.");
        throw new Error("studentId and subfieldId are required.");
      }

      const [rows] = await db.query(
        `
          SELECT todo_remaining_counter
          FROM student_subfield_traces
          WHERE student_id = ? AND subfield_id = ?
        `,
        [studentId, subfieldId]
      );
      if (!Array.isArray(rows)) {
        throw new Error("rows must be an array in findOnlyTodoRemainingCounterByCompositeKey StudentSubfieldTrace.ts");
      } else if (rows.length === 0) {
        logger.warn('No trace is found in findOnlyTodoRemainingCounterByCompositeKey StudentSubfieldTrace.ts')
        return null;
      }

      const rowCamel = convertToCamelCase(rows[0]) as StudentSubfieldTrace;
      return rowCamel.todoRemainingCounter ?? null;
    } catch (error) {
      logger.error(
        `Error finding todoRemainingCounter by compositeKey (studentId=${studentId}, subfieldId=${subfieldId}):`,
        error
      );
      throw error;
    }
  }

  static async update(
    traceId: MySQLUintID,
    updates: Partial<StudentSubfieldTrace>
  ): Promise<boolean> {
    try {
      if (!traceId || !updates || Object.keys(updates).length === 0) {
        logger.error("Invalid input to update: traceId and updates are required.");
        throw new Error("traceId and updates are required.");
      }

      // Convert domain-level updates to DB fields
      const payload = convertToSnakeCase(toMySQLStudentSubfieldTrace(updates));
      const columns = Object.keys(payload);
      if (columns.length === 0) {
        logger.warn("No updates are provided")
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const values = Object.values(payload);

      const sql = `
        UPDATE student_subfield_traces
        SET ${setClause}
        WHERE trace_id = ?
      `;

      await db.query(sql, [...values, traceId]);
      return true;
    } catch (error) {
      logger.error(`Error updating StudentSubfieldTrace with traceId: ${traceId}`, error);
      throw error;
    }
  }

  static async updateByCompositeKey(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID,
    updates: Partial<StudentSubfieldTrace>
  ): Promise<boolean> {
    try {
      if (!studentId || !subfieldId) {
        logger.error(
          "Invalid input: studentId and subfieldId are required for updateByCompositeKey."
        );
        throw new Error("studentId and subfieldId are required for updateByCompositeKey.");
      }
      if (!updates || Object.keys(updates).length === 0) {
        logger.error("No updates provided to updateByCompositeKey.");
        throw new Error("No updates provided for updateByCompositeKey.");
      }

      // Convert domain-level updates to DB columns
      const payload = convertToSnakeCase(toMySQLStudentSubfieldTrace(updates));
      const columns = Object.keys(payload);
      if (columns.length === 0) {
        // nothing to update
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const values = Object.values(payload);

      const sql = `
        UPDATE student_subfield_traces
        SET ${setClause}
        WHERE student_id = ? AND subfield_id = ?
      `;
      await db.query(sql, [...values, studentId, subfieldId]);
      return true;
    } catch (error) {
      logger.error("Error updating StudentSubfieldTrace by composite key:", error);
      throw error;
    }
  }

  static async delete(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID
  ): Promise<boolean> {
    try {
      if (!studentId || !subfieldId) {
        logger.error("Invalid input to delete: missing studentId or subfieldId.");
        throw new Error("studentId and subfieldId are required.");
      }

      await db.query(
        `
        DELETE FROM student_subfield_traces
        WHERE student_id = ? AND subfield_id = ?
      `,
        [studentId, subfieldId]
      );
      // Return the count of rows deleted
      return true;
    } catch (error) {
      logger.error(
        `Error deleting StudentSubfieldTrace with studentId=${studentId}, subfieldId=${subfieldId}`,
        error
      );
      throw error;
    }
  }
}
