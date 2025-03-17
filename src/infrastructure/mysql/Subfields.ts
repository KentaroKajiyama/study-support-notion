import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
} from "@utils/index.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  SubfieldsSubfieldNameEnum,
  isValidSubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum
} from '@domain/types/index.js';


export interface MySQLSubfield {
  subfieldId?: MySQLUintID;
  subjectId?: MySQLUintID;
  subfieldName?: SubfieldsSubfieldNameEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface Subfield {
  subfieldId?: MySQLUintID;
  subjectId?: MySQLUintID;
  subfieldName?: SubfieldsSubfieldNameEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

interface SubjectName {
  subjectName?: SubjectsSubjectNameEnum;
}

export interface MySQLSubfieldWithSubjectName extends MySQLSubfield, SubjectName {};
export interface SubfieldWithSubjectName extends MySQLSubfield, SubjectName {};

function toSubfield(row: MySQLSubfield): Subfield {
  try {
    const transformed: Subfield = {
      subfieldId: row.subfieldId,
      subjectId: row.subjectId,
      subfieldName: row.subfieldName,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as Subfield;
  } catch (error) {
    logger.error(`Error converting MySQLSubfield to Subfield: ${error}`);
    throw error;
  }
}

function toSubfieldWithSubjectName(row: MySQLSubfieldWithSubjectName): SubfieldWithSubjectName {
  try {
    const transformed: SubfieldWithSubjectName = {
      subfieldId: row.subfieldId,
      subjectId: row.subjectId,
      subfieldName: row.subfieldName,
      subjectName: row.subjectName,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as Subfield;
  } catch (error) {
    logger.error(`Error converting MySQLSubfield to Subfield: ${error}`);
    throw error;
  }
}
function toMySQLSubfield(data: Subfield): MySQLSubfield {
  try {
    if (data.subfieldName && !isValidSubfieldsSubfieldNameEnum(data.subfieldName)){
      logger.error(`Invalid subfieldName: ${data.subfieldName}`);
      throw new Error("Invalid subfieldName provided.");
    }
    const transformed: MySQLSubfield = {
      subfieldId: data.subfieldId,
      subjectId: data.subjectId,
      subfieldName: data.subfieldName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as MySQLSubfield;
  } catch (error) {
    logger.error(`Error converting Subfield to MySQLSubfield: ${error}`);
    throw error;
  }
}

export class Subfields {
  static async create(data: Subfield): Promise<boolean> {
    try {
      if (!data || !data.subjectId || !data.subfieldName) {
        logger.error("Invalid data for creating subfield: missing subjectId or subfieldName.");
        throw new Error("Invalid input for creating subfield.");
      }

      const payload = toMySQLSubfield(data);

      const sql = `
        INSERT INTO subfields
          (subfield_id, subject_id, subfield_name)
        VALUES
          (?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        payload.subfieldId ?? null,
        payload.subjectId,
        payload.subfieldName
      ]);

      const affectedRows = (result as { affectedRows: number }).affectedRows;
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error creating subfield:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Subfield[]> {
    try {
      const [rows] = await db.query(`SELECT * FROM subfields`);
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findAll' query was not an array.");
        throw new Error("Result of 'findAll' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No result was found in findAll Subfields.ts')
        return [];
      }
      
      return rows.map((r) => toSubfield(convertToCamelCase(r) as MySQLSubfield) );
    } catch (error) {
      logger.error("Error finding all subfields:", error);
      throw error;
    }
  }

  static async findBySubfieldId(subfieldId: MySQLUintID): Promise<Subfield | null> {
    try {
      if (!subfieldId) {
        logger.error("No subfieldId provided to findBySubfieldId.");
        throw new Error("Invalid subfieldId.");
      }

      const [rows] = await db.query(
        `SELECT * FROM subfields WHERE subfield_id = ?`,
        [subfieldId]
      );

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findBySubfieldId' query was not an array.");
        throw new Error("Result of 'findBySubfieldId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subfields are found in findBySubfieldId Subfields.ts');
        return null;
      }

      const row = convertToCamelCase(rows[0]) as MySQLSubfield;
      return toSubfield(row);
    } catch (error) {
      logger.error(`Error finding subfield by subfieldId: ${subfieldId}`, error);
      throw error;
    }
  }

  // subfield name column is given the unique key constraint, thus this function returns one value, not one array.
  static async findBySubfieldName(subfieldName: string): Promise<Subfield | null> {
    try {
      if (!subfieldName) {
        logger.error("No subfieldName provided to findBySubfieldName.");
        throw new Error("Invalid subfieldName.");
      }

      const [rows] = await db.query(
        `SELECT * FROM subfields WHERE subfield_name = ?`,
        [subfieldName]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findBySubfieldName' query was not an array.");
        throw new Error("Result of 'findBySubfieldName' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subfields are found in findBySubfieldName Subfields.ts');
        return null;
      }

      return toSubfield(convertToCamelCase(rows[0]) as MySQLSubfield) as Subfield;
    } catch (error) {
      logger.error(`Error finding subfields by name: ${subfieldName}`, error);
      throw error;
    }
  }

  static async findBySubjectId(subjectId: MySQLUintID): Promise<Subfield[]> {
    try {
      if (!subjectId) {
        logger.error("No subjectId provided to findBySubjectId.");
        throw new Error("Invalid subjectId.");
      }

      const [rows] = await db.query(
        `SELECT * FROM subfields WHERE subject_id = ?`,
        [subjectId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findBySubjectId' query was not an array.");
        throw new Error("Result of 'findBySubjectId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subfields are found in findBySubjectId Subfields.ts');
        return [];
      }

      return rows.map((r) => toSubfield(convertToCamelCase(r) as MySQLSubfield) );
    } catch (error) {
      logger.error(`Error finding subfields by subjectId: ${subjectId}`, error);
      throw error;
    }
  }

  static async findWithSubjectNameBySubfieldId(subjectId: MySQLUintID): Promise<SubfieldWithSubjectName | null> {
    try {
      if (!subjectId) {
        logger.error("No subjectId provided to findWithSubjectNameBySubfieldId.");
        throw new Error("Invalid subjectId.");
      }
      const [rows] = await db.query(
        `
        SELECT s.*, su.subject_name
        FROM subfields s
        INNER JOIN subjects su ON s.subject_id = su.subject_id
        WHERE s.subfield_id =?
        `,
        [subjectId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findWithSubjectNameBySubfieldId' query was not an array.");
        throw new Error("Result of 'findWithSubjectNameBySubfieldId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No subfields are found in findWithSubjectNameBySubfieldId Subfields.ts');
        return null;
      } else if (rows.length >= 2) {
        logger.warn('Multiple subfields found in findWithSubjectNameBySubfieldId Subfields.ts');
      };
      return toSubfieldWithSubjectName(convertToCamelCase(rows[0]) as MySQLSubfieldWithSubjectName);
    } catch (error) {
      logger.error(`Error finding subfields with subject name by subfieldId: ${subjectId}`, error);
      throw error;
    }
  }

  static async update(
    subfieldId: MySQLUintID,
    updates: Partial<Subfield>
  ): Promise<boolean> {
    try {
      if (!subfieldId || !updates || Object.keys(updates).length === 0) {
        logger.error("Invalid input for updating a subfield: missing id or updates.");
        throw new Error("Invalid input for subfield update.");
      }

      // Convert domain updates -> DB row
      const payload = convertToSnakeCase(toMySQLSubfield(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);

      if (columns.length === 0) {
        // No actual updates
        return false;
      }

      // Build `SET col1 = ?, col2 = ?`
      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const sql = `
        UPDATE subfields
        SET ${setClause}, updated_at = NOW()
        WHERE subfield_id = ?
      `;

      const [result] = await db.query(sql, [...values, subfieldId]);
      const { affectedRows } = result as { affectedRows: number };
      return affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating subfield with ID: ${subfieldId}`, error);
      throw error;
    }
  }

  static async delete(subfieldId: MySQLUintID): Promise<boolean> {
    try {
      if (!subfieldId) {
        logger.error("No subfieldId provided to delete a subfield.");
        throw new Error("Invalid subfieldId for deletion.");
      }

      const sql = `DELETE FROM subfields WHERE subfield_id = ?`;
      const [result] = await db.query(sql, [subfieldId]);

      const { affectedRows } = result as { affectedRows: number };
      return affectedRows > 0;
    } catch (error) {
      logger.error(`Error deleting subfield with ID: ${subfieldId}`, error);
      throw error;
    }
  }
}
