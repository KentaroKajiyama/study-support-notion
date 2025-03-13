import db from '../awsDB.js';
import logger from '../../utils/logger.js';
import { convertToCamelCase, convertToSnakeCase } from '../../utils/convertCase.js';
import { MySQLTimestamp, MySQLUintID } from '../../const/mysqlType.js';
import { SubjectsSubjectNameEnum, isValidSubjectsSubjectNameEnum } from '../../const/enumTypes.js';

export interface MySQLSubject {
  subjectId?: MySQLUintID;
  subjectName?: SubjectsSubjectNameEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface Subject {
  subjectId?: MySQLUintID;
  subjectName?: SubjectsSubjectNameEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

function toSubject(row: MySQLSubject): Subject {
  try {
    const transformed: Subject = {
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as Subject;
  } catch (error) {
    logger.error(`Error converting MySQLSubject to Subject: ${error}`);
    throw error;
  }
}

function toMySQLSubject(data: Subject): MySQLSubject {
  try {
    if (data.subjectName && !isValidSubjectsSubjectNameEnum(data.subjectName)) {
      logger.error("Invalid subjectName provided.");
      throw new Error("Invalid subjectName provided.");
    }
    const transformed: MySQLSubject = {
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as MySQLSubject;
  } catch (error) {
    logger.error(`Error converting Subject to MySQLSubject: ${error}`);
    throw error;
  }
}

export class Subjects {
  static async create(data: Subject): Promise<boolean> {
    try {
      if (!data || !data.subjectName) {
        logger.error("Invalid data for creating subject: missing `subjectName`.");
        throw new Error("Invalid input for creating subject.");
      }

      const payload = toMySQLSubject(data);

      const sql = `
        INSERT INTO subjects (subject_id, subject_name)
        VALUES (?, ?)
      `;

      const [result] = await db.query(sql, [
        payload.subjectId ?? null,
        payload.subjectName
      ]);

      const affectedRows = (result as { affectedRows: number }).affectedRows;
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error creating subject:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Subject[]> {
    try {
      const [rows] = await db.query(`SELECT * FROM subjects`);
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findAll' query was not an array.");
        throw new Error("Result of 'findAll' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subject was found in findAll Subjects.ts')
        return [];
      }
      return rows.map((row) => toSubject(convertToCamelCase(row) as MySQLSubject));
    } catch (error) {
      logger.error("Error finding all subjects:", error);
      throw error;
    }
  }

  static async findAllSubjectNames(): Promise<SubjectsSubjectNameEnum[]> {
    try {
      const [rows] = await db.query(`SELECT subject_name FROM subjects`);
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findAllSubjectNames' query was not an array.");
        throw new Error("Result of 'findAllSubjectNames' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subject was found in findAllSubjectNames.ts')
        return [];
      }

      return rows.map((r: MySQLSubject) => toSubject(convertToCamelCase(r)).subjectName).filter(e => e !== undefined);
    } catch (error) {
      logger.error("Error finding all subject names:", error);
      throw error;
    }
  }

  static async findBySubjectId(subjectId: MySQLUintID): Promise<Subject | null> {
    try {
      if (!subjectId) {
        logger.error("No subjectId provided to findBySubjectId.");
        throw new Error("Invalid subjectId.");
      }

      const [rows] = await db.query(
        `SELECT * FROM subjects WHERE subject_id = ?`,
        [subjectId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findBySubjectId' query was not an array.");
        throw new Error("Result of 'findBySubjectId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subject was found in findBySubjectId Subjects.ts')
        return null;
      }

      const rowCamel = convertToCamelCase(rows[0]) as MySQLSubject;
      return toSubject(rowCamel);
    } catch (error) {
      logger.error(`Error finding subject by subjectId: ${subjectId}`, error);
      throw error;
    }
  }

  static async findBySubjectName(subjectName: string): Promise<Subject[]> {
    try {
      if (!subjectName) {
        logger.error("No subjectName provided to findBySubjectName.");
        throw new Error("Invalid subjectName.");
      }

      const [rows] = await db.query(
        `SELECT * FROM subjects WHERE subject_name = ?`,
        [subjectName]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findBySubjectName' query was not an array.");
        throw new Error("Result of 'findBySubjectName' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subject was found in findBySubjectName Subjects.ts')
        return [];
      }

      return rows.map((row) => toSubject(convertToCamelCase(row) as MySQLSubject));
    } catch (error) {
      logger.error(`Error finding subjects by name: ${subjectName}`, error);
      throw error;
    }
  }

  static async findSubfieldAndSubjectBySubjectName(
    subjectName: SubjectsSubjectNameEnum
  ): Promise<
    {
      subjectId: MySQLUintID;
      subjectName: string;
      subfieldId: MySQLUintID;
      subfieldName: string;
    }[]
  > {
    try {
      if (!subjectName) {
        logger.error("No subjectName provided to findSubfieldAndSubjectBySubjectName.");
        throw new Error("Invalid subjectName.");
      }

      const [rows] = await db.query(
        `
          SELECT
            subjects.subject_id,
            subjects.subject_name,
            subfields.subfield_id,
            subfields.subfield_name
          FROM subjects
          INNER JOIN subfields
            ON subjects.subject_id = subfields.subject_id
          WHERE subjects.subject_name = ?
        `,
        [subjectName]
      );
      if (!Array.isArray(rows)) {
        logger.error(
          "Result of 'findSubfieldAndSubjectBySubjectName' query was not an array."
        );
        throw new Error(
          "Result of 'findSubfieldAndSubjectBySubjectName' query was not an array."
        );
      } else if (rows.length === 0) {
        logger.warn('No subject was found in findSubfieldAndSubjectBySubjectName Subjects.ts')
        return [];
      }

      // Convert to camelCase or you can do partial if you want
      return rows.map((r: any) => {
        const cr = convertToCamelCase(r);
        return {
          subjectId: cr.subjectId,
          subjectName: cr.subjectName,
          subfieldId: cr.subfieldId,
          subfieldName: cr.subfieldName
        };
      });
    } catch (error) {
      logger.error(
        `Error finding subfield and subject by subjectName: ${subjectName}`,
        error
      );
      throw error;
    }
  }

  static async update(
    subjectId: MySQLUintID,
    updates: Partial<Subject>
  ): Promise<boolean> {
    try {
      if (!subjectId || !updates || Object.keys(updates).length === 0) {
        logger.error("Invalid input for updating a subject: missing ID or updates.");
        throw new Error("Invalid input for subject update.");
      }

      const payload = convertToSnakeCase(toMySQLSubject(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);

      if (columns.length === 0) {
        // Nothing to update
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const sql = `
        UPDATE subjects
        SET ${setClause}, updated_at = NOW()
        WHERE subject_id = ?
      `;

      const [result] = await db.query(sql, [...values, subjectId]);
      const { affectedRows } = result as { affectedRows: number };
      return affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating subject with ID: ${subjectId}`, error);
      throw error;
    }
  }

  static async delete(subjectId: MySQLUintID): Promise<boolean> {
    try {
      if (!subjectId) {
        logger.error("No subjectId provided to delete subject.");
        throw new Error("Invalid subjectId for deletion.");
      }

      const sql = `DELETE FROM subjects WHERE subject_id = ?`;
      const [result] = await db.query(sql, [subjectId]);

      const { affectedRows } = result as { affectedRows: number };
      if(affectedRows > 0) {return true;}
      else {
        logger.warn(`No subject found for ID: ${subjectId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error deleting subject with ID: ${subjectId}`, error);
      throw error;
    }
  }
}
