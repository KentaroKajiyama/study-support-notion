import db from "../awsDB.js";
import logger from "../../utils/logger.js";
import { convertToCamelCase } from "../../utils/convertCase.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  MySQLBoolean,
  toBoolean,
  toMySQLBoolean,
} from '../../const/mysqlType.js';
import {
  Uint,
  toUint,
  Int,
  toInt,
} from '../../const/myTypes.js';
import {
  NotionUUID,
  toNotionUUID
} from "../../const/myNotionType.js";
import {
  ActualBlocksProblemLevelEnum,
} from "../../const/enumTypes.js";
import { RowDataPacket } from "mysql2";

export interface MySQLDefaultBlock {
  defaultBlockId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  notionPageId?: string;          
  blockName?: string;
  space?: Int;
  speed?: Int;
  lap?: Int;
  blockOrder?: Uint;
  isTail?: MySQLBoolean | null;
  blockSize?: Int;
  problemLevel?: ActualBlocksProblemLevelEnum;
  averageExpectedTime?: Uint;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface DefaultBlock {
  defaultBlockId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  notionPageId?: NotionUUID;
  blockName?: string;
  space?: Int;
  speed?: Int;
  lap?: Int;
  blockOrder?: Uint;
  isTail?: boolean | null;              
  blockSize?: Int;
  problemLevel?: ActualBlocksProblemLevelEnum;
  averageExpectedTime?: Uint;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

function toDefaultBlock(row: Partial<MySQLDefaultBlock>): DefaultBlock {
  if (row.space === undefined) throw new Error('space must not be empty in toDefaultBlock in DefaultBlocks.ts\n');
  if (row.speed === undefined) throw new Error('speed must not be empty in toDefaultBlock in DefaultBlocks.ts\n');
  if (row.lap === undefined) throw new Error('lap must not be empty in toDefaultBlock in DefaultBlocks.ts\n');
  const transformed: Partial<DefaultBlock> = {
    defaultBlockId: row.defaultBlockId,
    subfieldId: row.subfieldId,
    notionPageId: row.notionPageId ? toNotionUUID(row.notionPageId) : undefined,
    blockName: row.blockName || "",
    space: row.space,
    speed: row.speed,
    lap: row.lap,
    blockOrder: row.blockOrder !== undefined ? toUint(row.blockOrder) : undefined,
    isTail: row.isTail !== undefined ?( row.isTail !== null ? toBoolean(row.isTail) : null) : null,
    blockSize: row.blockSize !== undefined ? toInt(row.blockSize) : undefined,
    problemLevel: row.problemLevel,
    averageExpectedTime: row.averageExpectedTime !== undefined ? toUint(row.averageExpectedTime) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  return Object.fromEntries(
    Object.entries(transformed).filter(([_, value]) => value !== undefined)
  ) as DefaultBlock
}

function toMySQLDefaultBlock(data: Partial<DefaultBlock>): MySQLDefaultBlock {
  
  const transformed: Partial<MySQLDefaultBlock> = {
    defaultBlockId: data.defaultBlockId,
    subfieldId: data.subfieldId,
    notionPageId: data.notionPageId,
    blockName: data.blockName,
    space: data.space,
    speed: data.speed,
    lap: data.lap,
    blockOrder: data.blockOrder,
    isTail: data.isTail !== null ? (data.isTail !== undefined ? toMySQLBoolean(data.isTail) : undefined) : null,
    blockSize: data.blockSize,
    problemLevel: data.problemLevel,
    averageExpectedTime: data.averageExpectedTime,
  };

  return Object.fromEntries(
    Object.entries(transformed).filter(([_, value]) => value!== undefined) 
  ) as MySQLDefaultBlock
}

export class DefaultBlocks {

  static async create(data: DefaultBlock): Promise<boolean> {
    try {
      if (!data) {
        logger.error("Invalid data provided for creating a default block.");
        throw new Error("Invalid data provided for creating a default block.");
      }

      const payload = toMySQLDefaultBlock(data);

      const sql = `
        INSERT INTO default_blocks
        (
          subfield_id,
          notion_page_id,
          block_name,
          space,
          speed,
          lap,
          block_order,
          is_tail,
          block_size,
          problem_level,
          average_expected_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(sql, [
        payload.subfieldId,
        payload.notionPageId ?? null,
        payload.blockName ?? null,
        payload.space,
        payload.speed,
        payload.lap,
        payload.blockOrder ?? null,
        payload.isTail ?? null,
        payload.blockSize ?? null,
        payload.problemLevel ?? null,
        payload.averageExpectedTime ?? null,
      ]);

      return true;
    } catch (error) {
      logger.error("Error creating a default block", error);
      throw error;
    }
  }

  static async findAll(): Promise<DefaultBlock[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM default_blocks");

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findAll' query was not an array.");
        throw new Error("Result of 'findAll' query was not an array.");
      }
      if (rows.length === 0) {
        logger.warn("No blocks were found in DefaultBlock.ts")
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLDefaultBlock[];
      return camelRows.map((row) => toDefaultBlock(row));
    } catch (error) {
      logger.error("Error finding all default blocks", error);
      throw error;
    }
  }

  static async findByDefaultBlockId(defaultBlockId: MySQLUintID): Promise<DefaultBlock[]> {
    try {
      if (!defaultBlockId) {
        logger.error("No defaultBlockId provided to findByDefaultBlockId.");
        throw new Error("No defaultBlockId provided to findByDefaultBlockId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM default_blocks WHERE default_block_id = ?",
        [defaultBlockId]
      );

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByDefaultBlockId' query was not an array.");
        throw new Error("Result of 'findByDefaultBlockId' query was not an array.");
      }
      if (rows.length === 0) {
        logger.warn("No blocks were found in DefaultBlock.ts")
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLDefaultBlock[];
      return camelRows.map((row) => toDefaultBlock(row));
    } catch (error) {
      logger.error(`Error finding default block by ID: ${defaultBlockId}`, error);
      throw error;
    }
  }

  // -----------------------------------------------------------
  // FIND by SubfieldId
  // -----------------------------------------------------------
  static async findBySubfieldId(subfieldId: MySQLUintID): Promise<DefaultBlock[]> {
    try {
      if (!subfieldId) {
        logger.error("No subfieldId provided to findBySubfieldId.");
        throw new Error("No subfieldId provided to findBySubfieldId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM default_blocks WHERE subfield_id = ?",
        [subfieldId]
      );

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findBySubfieldId' query was not an array.");
        throw new Error("Result of 'findBySubfieldId' query was not an array.");
      }
      if (rows.length === 0) {
        logger.warn("No blocks were found in DefaultBlock.ts")
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLDefaultBlock[];
      return camelRows.map((row) => toDefaultBlock(row));
    } catch (error) {
      logger.error(`Error finding default blocks by subfieldId: ${subfieldId}`, error);
      throw error;
    }
  }

  static async findByCompositeKey(
    subfieldId: MySQLUintID,
    blockName: string
  ): Promise<DefaultBlock[]> {
    try {
      if (!subfieldId || !blockName) {
        logger.error("Invalid subfieldId or blockName provided to findByCompositeKey.");
        throw new Error("Invalid subfieldId or blockName provided to findByCompositeKey.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM default_blocks WHERE subfield_id = ? AND block_name = ?",
        [subfieldId, blockName]
      );

      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByCompositeKey' query was not an array.");
        throw new Error("Result of 'findByCompositeKey' query was not an array.");
      }
      if (rows.length === 0) {
        logger.warn("No blocks were found in DefaultBlock.ts")
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLDefaultBlock[];
      return camelRows.map((row) => toDefaultBlock(row));
    } catch (error) {
      logger.error(
        `Error finding default blocks by subfieldId: ${subfieldId} and blockName: ${blockName}`,
        error
      );
      throw error;
    }
  }

  static async findBySubfieldIdUnderSpecificLevel(
    subfieldId: MySQLUintID,
    problemLevel: ActualBlocksProblemLevelEnum
  ): Promise<DefaultBlock[]> {
    try {
      if (!subfieldId || problemLevel == null) {
        logger.error(
          "Invalid subfieldId or problemLevel provided to findBySubfieldIdUnderSpecificLevel."
        );
        throw new Error(
          "Invalid subfieldId or problemLevel provided to findBySubfieldIdUnderSpecificLevel."
        );
      }

      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM default_blocks WHERE subfield_id = ? AND problem_level <= ?",
        [subfieldId, problemLevel]
      );

      if (!Array.isArray(rows)) {
        logger.error(
          "Result of 'findBySubfieldIdUnderSpecificLevel' query was not an array."
        );
        throw new Error("Result of 'findBySubfieldIdUnderSpecificLevel' query was not an array.");
      }
      if (rows.length === 0) {
        logger.warn("No blocks were found in DefaultBlock.ts")
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLDefaultBlock[];
      return camelRows.map((row) => toDefaultBlock(row));
    } catch (error) {
      logger.error(
        `Error finding default blocks by subfieldId: ${subfieldId} under level: ${problemLevel}`,
        error
      );
      throw error;
    }
  }

  static async updateByDefaultBlockId(
    defaultBlockId: MySQLUintID,
    updates: Partial<DefaultBlock>
  ): Promise<boolean> {
    try {
      if (!defaultBlockId || !updates || Object.keys(updates).length === 0) {
        logger.error(
          "Invalid input: defaultBlockId and updates are required for updateByDefaultBlockId."
        );
        throw new Error(
          "Invalid input: defaultBlockId and updates are required for updateByDefaultBlockId."
        );
      }

      // Convert incoming updates to DB form
      const dbPayload = convertToCamelCase(toMySQLDefaultBlock(updates));

      // Build SET clause
      const columns: string[] = [];
      const values: any[] = [];

      for (const [key, val] of Object.entries(dbPayload)) {
        if (val === undefined) continue;
        columns.push(`${key} = ?`);
        values.push(val);
      }

      if (columns.length === 0) {
        // Nothing to update
        return false;
      }

      const sql = `
        UPDATE default_blocks
        SET ${columns.join(", ")},
            updated_at = NOW()
        WHERE default_block_id = ?
      `;

      await db.query(sql, [...values, defaultBlockId]);
      return true;
    } catch (error) {
      logger.error(`Error updating default block with ID: ${defaultBlockId}`, error);
      throw error;
    }
  }

  static async delete(defaultBlockId: MySQLUintID): Promise<number> {
    try {
      if (!defaultBlockId) {
        logger.error("No defaultBlockId provided to delete a default block.");
        throw new Error("No defaultBlockId provided to delete a default block.");
      }

      const [result] = await db.query(
        "DELETE FROM default_blocks WHERE default_block_id = ?",
        [defaultBlockId]
      );
      return (result as { affectedRows: number }).affectedRows;
    } catch (error) {
      logger.error(`Error deleting default block with ID: ${defaultBlockId}`, error);
      throw error;
    }
  }
}
