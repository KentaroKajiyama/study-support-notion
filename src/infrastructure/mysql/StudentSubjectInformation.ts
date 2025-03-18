import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
} from "@utils/index.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  StudentSubjectInformationSubjectLevelEnum,
  StudentSubjectInformationSubjectGoalLevelEnum
} from '@domain/types/index.js';
import { RowDataPacket } from "mysql2";


export interface MySQLStudentSubjectInformation {
  studentSubjectInformationId?: MySQLUintID;
  studentId?: MySQLUintID;
  subjectId?: MySQLUintID;
  subjectLevel?: StudentSubjectInformationSubjectLevelEnum;
  goalDescription?: string;
  subjectGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface StudentSubjectInformation {
  studentSubjectInformationId?: MySQLUintID;
  studentId?: MySQLUintID;
  subjectId?: MySQLUintID;
  subjectLevel?: StudentSubjectInformationSubjectLevelEnum;
  goalDescription?: string;
  subjectGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

interface SubjectName {
  subjectName?: string;
}

export interface MySQLStudentSubjectInformationWithSubjectName
  extends MySQLStudentSubjectInformation, SubjectName {}


export interface StudentSubjectInformationWithSubjectName
  extends StudentSubjectInformation, SubjectName {}

function toStudentSubjectInformation(
  row: MySQLStudentSubjectInformation
): StudentSubjectInformation {
  try {
    const transformed: StudentSubjectInformation = {
      studentSubjectInformationId: row.studentSubjectInformationId,
      studentId: row.studentId,
      subjectId: row.subjectId,
      subjectLevel: row.subjectLevel,
      goalDescription: row.goalDescription,
      subjectGoalLevel: row.subjectGoalLevel,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    // Remove undefined fields for cleanliness
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as StudentSubjectInformation;
  } catch (error) {
    logger.error(
      `Error converting MySQLStudentSubjectInformation to StudentSubjectInformation: ${error}`
    );
    throw error;
  }
}

function toMySQLStudentSubjectInformation(
  data: StudentSubjectInformation
): MySQLStudentSubjectInformation {
  try {
    const transformed: MySQLStudentSubjectInformation = {
      studentSubjectInformationId: data.studentSubjectInformationId,
      studentId: data.studentId,
      subjectId: data.subjectId,
      subjectLevel: data.subjectLevel,
      goalDescription: data.goalDescription,
      subjectGoalLevel: data.subjectGoalLevel,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    // Remove undefined fields
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as MySQLStudentSubjectInformation;
  } catch (error) {
    logger.error(
      `Error converting StudentSubjectInformation to MySQLStudentSubjectInformation: ${error}`
    );
    throw error;
  }
}

export class StudentSubjectInformationData {
  static async create(data: StudentSubjectInformation): Promise<boolean> {
    try {
      if (!data || !data.studentId || !data.subjectId) {
        logger.error("Missing required fields for creating StudentSubjectInformation.");
        throw new Error("Invalid data for creating StudentSubjectInformation.");
      }

      // Convert domain object -> DB fields
      const payload = toMySQLStudentSubjectInformation(data);

      const sql = `
        INSERT INTO student_subject_information
          (
            student_id,
            subject_id,
            subject_level,
            goal_description,
            goal_level,
          )
        VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        payload.studentId,
        payload.subjectId,
        payload.subjectLevel ?? null,
        payload.goalDescription ?? null,
        payload.subjectGoalLevel ?? null,
      ]);

      // If no rows were inserted, return false; otherwise true.
      const affectedRows = (result as { affectedRows: number }).affectedRows;
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error creating StudentSubjectInformation:", error);
      throw error;
    }
  }

  static async findAll(): Promise<StudentSubjectInformation[]> {
    try {
      const [rows] = await db.query('SELECT * FROM student_subject_information');
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findAll' query was not an array.");
        throw new Error("Result of 'findAll' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No student subject information was found in findAll StudentSubjectInformation.ts')
        return [];
      }

      // Convert each DB row to the domain object
      return rows.map((row) =>
        toStudentSubjectInformation(convertToCamelCase(row) as MySQLStudentSubjectInformation)
      ) as StudentSubjectInformation[];
    } catch (error) {
      logger.error("Error finding all StudentSubjectInformation:", error);
      throw error;
    }
  }

  static async findByStudentId(studentId: MySQLUintID): Promise<StudentSubjectInformation[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findByStudentId.");
        throw new Error("Invalid studentId in findByStudentId.");
      }

      const [rows] = await db.query(
        'SELECT * FROM student_subject_information WHERE student_id = ?',
        [studentId]
      );

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByStudentId' query was not an array.");
        throw new Error("Result of 'findByStudentId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No student subject information was found in findByStudentId StudentSubjectInformation.ts')
        return [];
      }

      return rows.map((row) =>
        toStudentSubjectInformation(convertToCamelCase(row) as MySQLStudentSubjectInformation)
      ) as StudentSubjectInformation[];
    } catch (error) {
      logger.error(`Error finding StudentSubjectInformation by studentId: ${studentId}`, error);
      throw error;
    }
  }

  static async findIdAndSubjectNameByStudentId(
    studentId: MySQLUintID
  ): Promise<{ studentSubjectInformationId: MySQLUintID; subjectName: string }[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findIdAndSubjectNameByStudentId.");
        throw new Error("Invalid studentId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT 
          student_subject_information.student_subject_information_id,
          subjects.subject_name
        FROM student_subject_information
        INNER JOIN subjects
          ON student_subject_information.subject_id = subjects.subject_id
        WHERE student_subject_information.student_id = ?
        `,
        [studentId]
      );

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findIdAndSubjectNameByStudentId' query was not an array.");
        throw new Error("Result of 'findIdAndSubjectNameByStudentId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No student subject information was found in findIdAndSubjectNameByStudentId StudentSubjectInformation.ts')
        return [];
      }

      const result = rows.map((row: RowDataPacket) => toStudentSubjectInformation(convertToCamelCase(row) as MySQLStudentSubjectInformation)) as StudentSubjectInformation[];
      return result.map((r: any) => ({
        studentSubjectInformationId: r.studentSubjectInformationId,
        subjectName: r.subjectName
      }));
    } catch (error) {
      logger.error(
        `Error finding ID and subject name by studentId: ${studentId}`,
        error
      );
      throw error;
    }
  }

  static async findByCompositeKey(
    studentId: MySQLUintID,
    subjectId: MySQLUintID
  ): Promise<StudentSubjectInformation|null> {
    try {
      if (!studentId || !subjectId) {
        logger.error("Invalid input to findByCompositeKey: missing IDs.");
        throw new Error("Both studentId and subjectId are required.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM student_subject_information WHERE student_id = ? AND subject_id = ?',
        [studentId, subjectId]
      );

      if (!Array.isArray(rows)) {
        logger.error(
          "Result of 'findByCompositeKey' query was not an array."
        );
        throw new Error("Result of 'findByCompositeKey' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No student subject information was found in findByCompositeKey StudentSubjectInformation.ts')
        return null;
      }

      return toStudentSubjectInformation(convertToCamelCase(rows[0]) as MySQLStudentSubjectInformation);
    } catch (error) {
      logger.error(
        `Error finding StudentSubjectInformation by compositeKey (studentId=${studentId}, subjectId=${subjectId}):`,
        error
      );
      throw error;
    }
  }

  static async update(
    studentSubjectInformationId: MySQLUintID,
    updates: Partial<StudentSubjectInformation>
  ): Promise<boolean> {
    try {
      if (
        !studentSubjectInformationId ||
        !updates ||
        Object.keys(updates).length === 0
      ) {
        logger.error(
          "Invalid input: studentSubjectInformationId and updates are required."
        );
        throw new Error(
          "Invalid input: studentSubjectInformationId and updates are required."
        );
      }

      const payload = convertToSnakeCase(toMySQLStudentSubjectInformation(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);

      if (columns.length === 0) {
        // Nothing to update
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const sql = `
        UPDATE student_subject_information
        SET ${setClause}, updated_at = NOW()
        WHERE student_subject_information_id = ?
      `;

      const [result] = await db.query(sql, [...values, studentSubjectInformationId]);
      const affectedRows = (result as { affectedRows: number }).affectedRows;
      return affectedRows > 0;
    } catch (error) {
      logger.error(
        `Error updating StudentSubjectInformation with ID: ${studentSubjectInformationId}`,
        error
      );
      throw error;
    }
  }

  static async delete(studentSubjectInformationId: MySQLUintID): Promise<boolean> {
    try {
      if (!studentSubjectInformationId) {
        logger.error("No ID provided to delete StudentSubjectInformation.");
        throw new Error("Invalid studentSubjectInformationId for delete.");
      }

      const sql = `
        DELETE FROM student_subject_information
        WHERE student_subject_information_id = ?
      `;
      const [result] = await db.query(sql, [studentSubjectInformationId]);

      const affectedRows = (result as { affectedRows: number }).affectedRows;
      return affectedRows > 0;
    } catch (error) {
      logger.error(
        `Error deleting StudentSubjectInformation with ID: ${studentSubjectInformationId}`,
        error
      );
      throw error;
    }
  }
}
