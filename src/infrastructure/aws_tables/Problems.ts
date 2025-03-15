import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
} from "@utils/index.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  toNotionUUID,
  NotionUUID,
  ProblemsProblemLevelEnum
} from '@domain/types/index.js';
import { RowDataPacket, ResultSetHeader } from "mysql2";



interface MySQLProblem {
  problemId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  defaultBlockId?: MySQLUintID;
  notionPageId?: string;
  problemName?: string;
  answer?: string;
  problemLevel?: ProblemsProblemLevelEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

interface Problem {
  problemId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  defaultBlockId?: MySQLUintID;
  notionPageId?: NotionUUID;
  problemName?: string;
  answer?: string;
  problemLevel?: ProblemsProblemLevelEnum;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

function toProblem(row: MySQLProblem): Problem {
  const transformed = {
    problemId: row.problemId,
    subfieldId: row.subfieldId,
    defaultBlockId: row.defaultBlockId,
    notionPageId: row.notionPageId !== undefined ? toNotionUUID(row.notionPageId) : undefined,
    problemName: row.problemName,
    answer: row.answer,
    problemLevel: row.problemLevel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return Object.fromEntries(
    Object.entries(transformed).filter(row => row !== undefined)
  ) as Problem
}

function toMySQLProblem(data: Problem): MySQLProblem {
  const transformed = {
    problemId: data.problemId,
    subfieldId: data.subfieldId,
    defaultBlockId: data.defaultBlockId,
    notionPageId: data.notionPageId,
    problemName: data.problemName,
    answer: data.answer,
    problemLevel: data.problemLevel,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }
  return Object.fromEntries(
    Object.entries(transformed).filter(row => row!== undefined)
  ) as MySQLProblem;
}

export class Problems {
  static async create(data: Problem): Promise<boolean> {
    try {
      if (!data) {
        throw new Error("Problem is not available in cretaion  Problem.ts\n"); 
      }
      const payload = toMySQLProblem(data);
      const sql = `
        INSERT INTO problems
        (problem_id, subfield_id, default_block_id, notion_page_id, problem_name, answer, problem_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query<ResultSetHeader>(sql, [
        payload.problemId,
        payload.subfieldId,
        payload.defaultBlockId,
        payload.notionPageId,
        payload.problemName,
        payload.answer,
        payload.problemLevel,
      ]);
      return true;
    } catch (error) {
      logger.error('Failed to create problem in create Problems.ts,', error);
      throw error
    }
  }

  static async findAll(): Promise<Problem[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM problems');
      if (rows.length === 0) {
        logger.warn('No problem found in Problems.ts')
        return [];
      }
      return rows.map(row => toProblem(convertToCamelCase(row) as MySQLProblem)) as Problem[];
    } catch (error) {
      logger.error('Failed to find all problems in Problems.ts,', error);
      throw error;
    }
  }

  static async findById(problemId: MySQLUintID): Promise<Problem[]> {
    try {
      if (!problemId) {
        throw new Error("Invalid input: problemId is required.");
      }
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM problems WHERE problem_id =?',
        [problemId]
      );
      if (rows.length === 0) {
        logger.warn('No problem found in Problems.ts')
        return [];
      }
      return rows.map(row => toProblem(convertToCamelCase(row) as MySQLProblem)) as Problem[];
    } catch (error) {
      logger.error('Failed to find problem by id in Problems.ts,', error);
      throw error;
    }
  }

  static async findBySubfieldId(subfieldId: MySQLUintID): Promise<Problem[]> {
    try {
      if (!subfieldId) {
        throw new Error("Invalid input: subfieldId is required.");
      }
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM problems WHERE subfield_id =?',
        [subfieldId]
      );
      if (rows.length === 0) {
        logger.warn('No problem found in Problems.ts')
        return [];
      }
      return rows.map(row => toProblem(convertToCamelCase(row) as MySQLProblem)) as Problem[];
    } catch (error) {
      logger.error('Failed to find problems by subfieldId in Problems.ts,', error);
      throw error;
    }
  }

  static async update(problemId: MySQLUintID, updates: Problem[]): Promise<boolean> {
    try {
      if (!problemId) {
        throw new Error("Invalid input: problemId is required.");
      }
      if (!updates) {
        throw new Error("Invalid input: updates are required.");
      }
      if (updates.length === 0){
        logger.warn('No updates in Problem.ts!')
        return false;
      }
      const parsedUpdates = convertToSnakeCase(updates.map(data => toMySQLProblem(data)));
      const columns = Object.keys(parsedUpdates);
      const values = Object.values(updates);
      const setClause = columns.map(col => `${col} = ?`).join(", ");
      
      const sql = `
        UPDATE problems
        SET ${setClause}, updated_at = NOW()
        WHERE problem_id = ?
      `;
      
      await db.query(sql, [...values, problemId]);
      return true;
    } catch (error) {
      logger.error('Failed to update problem in Problems.ts,', error);
      throw error;
    }
  }

  static async delete(problemId: MySQLUintID): Promise<boolean> {
    try {
      if (!problemId) {
        throw new Error("Invalid input: problemId is required.");
      }
      if (!Number.isInteger(problemId)) {
        throw new Error("Invalid input: problemId must be an integer.");
      }
      
      const sql = 'DELETE FROM problems WHERE problem_id =?';
      await db.query(sql, [problemId]);
      return true;
    } catch (error) {
      logger.error('Failed to delete problem in Problems.ts,', error);
      throw error;
    }
  }
}