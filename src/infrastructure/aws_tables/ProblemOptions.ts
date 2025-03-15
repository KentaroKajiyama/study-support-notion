import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
} from "@utils/index.js";
import {
  MySQLUintID,
  MySQLTimestamp,
} from '@domain/types/index.js';
import { RowDataPacket, ResultSetHeader } from "mysql2";


export interface MySQLProblemOption {
  problemOptionId?: MySQLUintID;
  problemId?: MySQLUintID;
  notionDbPropertyId?: MySQLUintID;
  optionValue?: string;
  createAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface ProblemOption {
  problemOptionId?: MySQLUintID;
  problemId?: MySQLUintID;
  notionDbPropertyId?: MySQLUintID;
  optionValue?: string;
  createAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

function toProblemOption(row: MySQLProblemOption): ProblemOption {
  try {
    const transformed = {
      problemOptionId: row.problemOptionId,
      problemId: row.problemId,
      notionDbPropertyId: row.notionDbPropertyId,
      optionValue: row.optionValue,
      createAt: row.createAt,
      updatedAt: row.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error transforming MySQLProblemOption to ProblemOption:', error);
    throw error;
  }
}

function toMySQLProblemOption(data: ProblemOption): MySQLProblemOption {
  try {
    const transformed = {
      problemOptionId: data.problemOptionId,
      problemId: data.problemId,
      notionDbPropertyId: data.notionDbPropertyId,
      optionValue: data.optionValue,
      createAt: data.createAt,
      updatedAt: data.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    ) as MySQLProblemOption;
  } catch (error) {
    logger.error('Error transforming ProblemOption to MySQLProblemOption:', error);
    throw error;
  }
}

export class ProblemOptions {
  static async create(data: ProblemOption): Promise<boolean> {
    try {
      const payload = toMySQLProblemOption(data);
      const sql = `
        INSERT INTO problem_options (problem_id, notion_db_property_id, option_value)
        VALUES (?,?,?)
      `;
      const [result] = await db.query<ResultSetHeader>(sql, [
        payload.problemId,
        payload.notionDbPropertyId,
        payload.optionValue,
      ]);
      if(result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during creation of ProblemOption');
        return false;
      }
    } catch (error) {
      logger.error('Error creating ProblemOption:', error);
      throw error;
    }
  };

  static async findAll(): Promise<ProblemOption[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(`
        SELECT * FROM problem_options
      `);
      if (!Array.isArray(rows)){
        logger.error('Result of "findAll" query was not an array.');
        throw new Error('Result of "findAll" query was not an array.');
      } else if (rows.length === 0) {
        logger.warn('No problem option found in ProblemOptions.ts')
        return [];
      }
      return rows.map(row => toProblemOption(convertToCamelCase(row) as MySQLProblemOption)) as ProblemOption[];
    } catch (error) {
      logger.error('Error finding all problem options:', error);
      throw error;
    }
  };

  static async findByProblemOptionId(problemOptionId: MySQLUintID): Promise<ProblemOption | null> {
    try {
      if (!problemOptionId) {
        throw new Error('Invalid problemOptionId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM problem_options WHERE problem_option_id =?`,
        [problemOptionId]
      );
      if (!Array.isArray(rows)) {
        logger.error('Result of "findByProblemOptionId" query was not an array.');
        throw new Error('Result of "findByProblemOptionId" query was not an array.');
      } else if (rows.length === 0) {
        logger.warn('No problem option found for given problemOptionId in ProblemOptions.ts');
        return null;
      }
      return toProblemOption(convertToCamelCase(rows[0]) as MySQLProblemOption);
    } catch (error) {
      logger.error(`Error finding problem option by ID: ${problemOptionId}`, error);
      throw error;
    }
  };

  static async findByProblemId(problemId: MySQLUintID): Promise<ProblemOption[]> {
    try {
      if (!problemId) {
        throw new Error('Invalid problemId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM problem_options WHERE problem_id =?`,
        [problemId]
      );
      if (!Array.isArray(rows)) {
        logger.error('Result of "findByProblemId" query was not an array.');
        throw new Error('Result of "findByProblemId" query was not an array.');
      } else if (rows.length === 0) {
        logger.warn('No problem options found for given problemId in ProblemOptions.ts');
        return [];
      }
      return rows.map(row => toProblemOption(convertToCamelCase(row) as MySQLProblemOption)) as ProblemOption[];
    } catch (error) {
      logger.error(`Error finding problem options by problemId: ${problemId}`, error);
      throw error;
    }
  };

  static async findByNotionDbPropertyId(notionDbPropertyId: MySQLUintID): Promise<ProblemOption[]> {
    try {
      if (!notionDbPropertyId) {
        throw new Error('Invalid notionDbPropertyId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM problem_options WHERE notion_db_property_id =?`,
        [notionDbPropertyId]
      );
      if (!Array.isArray(rows)) {
        logger.error('Result of "findByNotionDbPropertyId" query was not an array.');
        throw new Error('Result of "findByNotionDbPropertyId" query was not an array.');
      } else if (rows.length === 0) {
        logger.warn('No problem options found for given notionDbPropertyId in ProblemOptions.ts');
        return [];
      }
      return rows.map(row => toProblemOption(convertToCamelCase(row) as MySQLProblemOption)) as ProblemOption[];
    } catch (error) {
      logger.error(`Error finding problem options by notionDbPropertyId: ${notionDbPropertyId}`, error);
      throw error;
    }
  };

  static async findByCompositeKey(problemId: MySQLUintID, notionDbPropertyId: MySQLUintID): Promise<ProblemOption | null> {
    try {
      if (!problemId ||!notionDbPropertyId) {
        throw new Error('Invalid problemId or notionDbPropertyId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM problem_options WHERE problem_id =? AND notion_db_property_id =?`,
        [problemId, notionDbPropertyId]
      );
      if (!Array.isArray(rows)) {
        logger.error('Result of "findByCompositeKey" query was not an array.');
        throw new Error('Result of "findByCompositeKey" query was not an array.');
      } else if (rows.length === 0) {
        logger.warn('No problem options found for given composite key in ProblemOptions.ts');
        return null;
      }
      return toProblemOption(convertToCamelCase(rows[0]) as MySQLProblemOption);
    } catch (error) {
      logger.error(`Error finding problem options by composite key: ${problemId}-${notionDbPropertyId}`, error);
      throw error;
    }
  };

  static async update(problemOptionId: MySQLUintID, updates: ProblemOption): Promise<boolean> {
    try {
      if (!problemOptionId ||!updates) {
        throw new Error('Invalid problemOptionId or updates');
      }
      const payload = convertToSnakeCase(toMySQLProblemOption(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);

      if (columns.length === 0) {
        // nothing to update
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const sql = `
        UPDATE problem_options
        SET ${setClause}
        WHERE problem_option_id =?
      `;
      const [result] = await db.query<ResultSetHeader>(sql, values);
      if(result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during update of ProblemOption');
        return false;
      }
    } catch (error) {
      logger.error(`Error updating problem option by ID: ${problemOptionId}`, error);
      throw error;
    }
  };

  static async updateByCompositeKey(problemId: MySQLUintID, notionDbPropertyId: MySQLUintID, optionValue: string) {
    try {
      if (!problemId ||!notionDbPropertyId ||!optionValue) {
        throw new Error('Invalid problemId, notionDbPropertyId, or optionValue');
      }
      const sql = `
        UPDATE problem_options
        SET option_value =?
        WHERE problem_id =? AND notion_db_property_id =?
      `;
      const [result] = await db.query<ResultSetHeader>(sql, [optionValue, problemId, notionDbPropertyId]);
      if(result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during update of ProblemOption by composite key');
        return false;
      }
    } catch (error) {
      logger.error(`Error updating problem option by composite key: ${problemId}-${notionDbPropertyId}`, error);
      throw error;
    }
  };

  static async delete(problemOptionId: MySQLUintID): Promise<boolean> {
    try {
      if (!problemOptionId) {
        throw new Error('Invalid problemOptionId');
      }
      const sql = `
        DELETE FROM problem_options
        WHERE problem_option_id =?
      `;
      const [result] = await db.query<ResultSetHeader>(sql, [problemOptionId]);
      if(result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during deletion of ProblemOption');
        return false;
      }
    } catch (error) {
      logger.error(`Error deleting problem option by ID: ${problemOptionId}`, error);
      throw error;
    }
  };
}