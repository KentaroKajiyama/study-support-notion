import db from "../awsDB.js";
import logger from "../../utils/logger.js";
import { convertToCamelCase, convertToSnakeCase } from "../../utils/convertCase.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  MySQLDate,
  MySQLBoolean,
  toBoolean,
  toMySQLBoolean
} from '../../const/mysqlType.js';
import {
  Uint,
  toUint,
  Int,
  toInt,
} from '../../const/myTypes.js';
import {
  NotionDate,
  convertTimeMySQLToNotion,
  convertTimeNotionToMySQL
} from '../../utils/dateHandler.js';
import {
  toNotionUUID,
  NotionUUID
} from '../../const/myNotionType.js';
import {
  ActualBlocksProblemLevelEnum,
  isValidActualBlocksProblemLevelEnum
} from '../../const/enumTypes.js'
import { RowDataPacket } from "mysql2";
import { dbEscape } from "../../const/mysqlType.js";


interface MySQLActualBlock {
  actualBlockId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  defaultBlockId?: MySQLUintID;
  actualBlockName?: string;
  space?: Int;
  speed?: Int;
  lap?: Int;
  startDate?: MySQLDate | null | undefined;
  endDate?: MySQLDate | null | undefined;
  blockOrder?: Uint;
  isTail?: MySQLBoolean;
  actualBlockSize?: Int;
  problemLevel?: ActualBlocksProblemLevelEnum;
  studentActualBlockDbNotionPageId?: string | null;  
  studentScheduleNotionPageId?: string | null;       
  coachPlanNotionPageId?: string | null;            
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

interface ActualBlock {
  actualBlockId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  defaultBlockId?: MySQLUintID;
  actualBlockName?: string;
  space?: Int;
  speed?: Int;
  lap?: Int;
  startDate?: NotionDate | null;
  endDate?: NotionDate | null;
  blockOrder?: Uint;
  isTail?: boolean;
  actualBlockSize?: Int;
  problemLevel?: ActualBlocksProblemLevelEnum;
  studentActualBlockDbNotionPageId?: NotionUUID | null;
  studentScheduleNotionPageId?: NotionUUID | null;
  coachPlanNotionPageId?: NotionUUID | null;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

interface UpdatesForCoachPlan {
  actualBlockId: MySQLUintID;
  actualBlockName?: string;
  space: Int;
  speed: Int;
  lap: Int;
  startDate: NotionDate | null;
  endDate: NotionDate | null;
  blockOrder: Uint;
  isTail: boolean;
  actualBlockSize: Int;
  problemLevel: ActualBlocksProblemLevelEnum;
}

function toActualBlock(row: Partial<MySQLActualBlock>): ActualBlock {
  try {
    const transformed: Partial<ActualBlock> = {
      actualBlockId: row.actualBlockId,
      studentId: row.studentId,
      subfieldId: row.subfieldId,
      defaultBlockId: row.defaultBlockId,
      actualBlockName: row.actualBlockName || "",
      space: row.space !== undefined ? toInt(row.space) : undefined,
      speed: row.speed !== undefined ? toInt(row.speed) : undefined,
      lap: row.lap !== undefined ? toInt(row.lap) : undefined,
      startDate: row.startDate ? convertTimeMySQLToNotion(row.startDate) : null,
      endDate: row.endDate ? convertTimeMySQLToNotion(row.endDate) : null,
      blockOrder: row.blockOrder !== undefined ? toUint(row.blockOrder) : undefined,
      problemLevel: row.problemLevel,
      isTail: row.isTail !== undefined ? toBoolean(row.isTail) : undefined,
      actualBlockSize: row.actualBlockSize !== undefined ? toInt(row.actualBlockSize) : undefined,
      studentActualBlockDbNotionPageId: row.studentActualBlockDbNotionPageId ? toNotionUUID(row.studentActualBlockDbNotionPageId) : null,
      studentScheduleNotionPageId: row.studentScheduleNotionPageId ? toNotionUUID(row.studentScheduleNotionPageId) : null,
      coachPlanNotionPageId: row.coachPlanNotionPageId ? toNotionUUID(row.coachPlanNotionPageId) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    // Remove all properties that are undefined
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as ActualBlock;
  } catch (error) {
    logger.error("Error converting row to ActualBlock:", error);
    throw error;
  }
}

function toMySQLActualBlock(data: Partial<ActualBlock>): MySQLActualBlock {
  try {
    const transformed: Partial<MySQLActualBlock> = {
      actualBlockId: data.actualBlockId,
      studentId: data.studentId,
      subfieldId: data.subfieldId,
      defaultBlockId: data.defaultBlockId,
      actualBlockName: data.actualBlockName,
      space: data.space,
      speed: data.speed,
      lap: data.lap,
      startDate: data.startDate ? convertTimeNotionToMySQL(data.startDate, true) as MySQLDate : undefined,
      endDate: data.endDate ? convertTimeNotionToMySQL(data.endDate, true) as MySQLDate : undefined,
      blockOrder: data.blockOrder,
      problemLevel: data.problemLevel,
      isTail: data.isTail !== undefined ? toMySQLBoolean(data.isTail) : undefined, 
      actualBlockSize: data.actualBlockSize,
      studentActualBlockDbNotionPageId: data.studentActualBlockDbNotionPageId,
      studentScheduleNotionPageId: data.studentScheduleNotionPageId,
      coachPlanNotionPageId: data.coachPlanNotionPageId,
    };
  
    // Remove properties that are undefined
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as MySQLActualBlock;
  } catch (error) {
    logger.error("Error converting data to MySQLActualBlock:", error);
    throw error;
  }
}

export class ActualBlocks {
  static async create(data: ActualBlock): Promise<number> {
    try {
      if (!data) {
        logger.error("Invalid data provided for creating an actual block.");
        throw new Error("Invalid data provided for creating an actual block.");
      }

      const payload = toMySQLActualBlock(data);

      const sql = `
        INSERT INTO actual_blocks
        (
          student_id,
          subfield_id,
          default_block_id,
          actual_block_name,
          space,
          speed,
          lap,
          start_date,
          end_date,
          block_order,
          is_tail,
          actual_block_size,
          student_actual_block_db_notion_page_id,
          student_schedule_notion_page_id,
          coach_plan_notion_page_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.query(sql, [
        payload.studentId,
        payload.subfieldId,
        payload.defaultBlockId || null,
        payload.actualBlockName,
        payload.space,
        payload.speed,
        payload.lap,
        payload.startDate || null,
        payload.endDate || null,
        payload.blockOrder,
        payload.isTail,
        payload.actualBlockSize,
        payload.studentActualBlockDbNotionPageId || null,
        payload.studentScheduleNotionPageId || null,
        payload.coachPlanNotionPageId || null,
      ]);

      return (result as { insertId: number }).insertId;
    } catch (error) {
      logger.error("Error creating an actual block", error);
      throw error;
    }
  }
  // TODO: Modify the rollback logic!
  static async createMultiple(data: ActualBlock[]): Promise<void> {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        logger.error("Invalid data provided for creating multiple actual blocks.");
        throw new Error("Invalid data for creating multiple actual blocks.");
      }

      // Convert each record to the DB payload
      const createData = data.map((e) => {
        const payload = toMySQLActualBlock(e);
        return [
          payload.studentId,
          payload.subfieldId,
          payload.defaultBlockId || null,
          payload.actualBlockName,
          payload.space,
          payload.speed,
          payload.lap,
          payload.startDate || null,
          payload.endDate || null,
          payload.blockOrder,
          payload.isTail,
          payload.actualBlockSize,
          payload.studentActualBlockDbNotionPageId || null,
          payload.studentScheduleNotionPageId || null,
          payload.coachPlanNotionPageId || null,
        ];
      });

      const sql = `
        INSERT INTO actual_blocks
        (
          student_id,
          subfield_id,
          default_block_id,
          actual_block_name,
          space,
          speed,
          lap,
          start_date,
          end_date,
          block_order,
          is_tail,
          actual_block_size,
          student_actual_block_db_notion_page_id,
          student_schedule_notion_page_id,
          coach_plan_notion_page_id
        )
        VALUES ?
      `;

      await db.beginTransaction();
      await db.query(sql, [createData]);
      await db.commit();
    } catch (error) {
      logger.error("Error creating multiple actual blocks", error);
      await db.rollback();
      throw error;
    }
  }

  static async findAll(): Promise<ActualBlock[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(`
        SELECT * FROM actual_blocks
      `);

      if (!Array.isArray(rows)) {
        logger.error("The result of 'findAll' query was not an array.");
        throw new Error("The result of 'findAll' query was not an array.");
      }

      if (rows.length === 0) {
        logger.warn("No blocks were found in findAll. ActualBlock.ts")
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLActualBlock[];
      return camelRows.map((row: Partial<MySQLActualBlock>) => toActualBlock(row));
    } catch (error) {
      logger.error("Error finding all actual blocks", error);
      throw error;
    }
  }

  static async findByActualBlockId(
    actualBlockId: MySQLUintID
  ): Promise<ActualBlock | null> {
    try {
      if (!actualBlockId) {
        logger.error("No actualBlockId provided to findByActualBlockId.");
        throw new Error("No actualBlockId provided to findByActualBlockId.");
      }

      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM actual_blocks WHERE actual_block_id = ?",
        [actualBlockId]
      );

      if (!Array.isArray(rows)) {
        logger.error("The result of 'findByActualBlockId' query was not an array.");
        throw new Error("The result of 'findByActualBlockId' query was not an array.");
      }

      if (!rows.length) {
        logger.warn(`No block found for actualBlockId: ${actualBlockId}`);
        return null;
      }

      const camelRow = convertToCamelCase(rows[0]) as unknown as MySQLActualBlock;
      return toActualBlock(camelRow);
    } catch (error) {
      logger.error(`Error finding actual block by ID: ${actualBlockId}`, error);
      throw error;
    }
  }

  static async findByStudentIdAndSubfieldId(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID
  ): Promise<ActualBlock[]> {
    try {
      if (!studentId || !subfieldId) {
        logger.error(
          "Invalid studentId or subfieldId provided to findByStudentIdAndSubfieldId."
        );
        throw new Error(
          "Invalid studentId or subfieldId provided to findByStudentIdAndSubfieldId."
        );
      }

      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM actual_blocks WHERE student_id = ? AND subfield_id = ?",
        [studentId, subfieldId]
      );

      if (!Array.isArray(rows)) {
        logger.error(
          "The result of 'findByStudentIdAndSubfieldId' query was not an array."
        );
        throw new Error(
          "The result of 'findByStudentIdAndSubfieldId' query was not an array."
        );
      }
      if (rows.length === 0) {
        logger.warn(`No blocks found for studentId: ${studentId} and subfieldId: ${subfieldId}`);
        return [];
      }

      const camelRows = convertToCamelCase(rows) as unknown as MySQLActualBlock[];
      return camelRows.map((row: Partial<MySQLActualBlock>) => toActualBlock(row));
    } catch (error) {
      logger.error(
        `Error finding actual blocks by studentId ${studentId} and subfieldId ${subfieldId}`,
        error
      );
      throw error;
    }
  }

  static async updateByActualBlockId(
    actualBlockId: MySQLUintID,
    updates: Partial<ActualBlock>
  ): Promise<boolean> {
    try {
      if (!actualBlockId || !updates || Object.keys(updates).length === 0) {
        logger.error(
          "Invalid input: actualBlockId and updates are required for updateByActualBlockId."
        );
        throw new Error(
          "Invalid input: actualBlockId and updates are required for updateByActualBlockId."
        );
      }

      // Convert to DB columns + values
      const dbPayload = convertToSnakeCase(toMySQLActualBlock(updates));

      // Build SET clause from the dbPayload keys
      const columns: string[] = [];
      const values: any[] = [];
      for (const [tsKey, dbValue] of Object.entries(dbPayload)) {
        if (dbValue === undefined) continue;
        columns.push(`${tsKey} = ?`);
        values.push(dbValue);
      }

      if (!columns.length) {
        // means nothing to update
        return false;
      }

      const setClause = columns.join(", ");
      const sql = `
        UPDATE actual_blocks
        SET ${setClause}
        WHERE actual_block_id = ?
      `;

      await db.query(sql, [...values, actualBlockId]);
      return true;
    } catch (error) {
      logger.error(`Error updating actual block with ID: ${actualBlockId}`, error);
      throw error;
    }
  }

  static async updateForCoachPlan(updates: UpdatesForCoachPlan[]): Promise<void> {
    try {
      if (!updates || updates.length === 0) {
        logger.error("Invalid input: updates are required for updateForCoachPlan.");
        throw new Error("Invalid input: updates are required for updateForCoachPlan.");
      }

      // Example: We'll only handle columns known to exist in the DB
      const updatableFields: (keyof MySQLActualBlock)[] = [
        "actualBlockName",
        "space",
        "speed",
        "lap",
        "startDate",
        "endDate",
        "blockOrder",
        "isTail",
        "actualBlockSize",
        "problemLevel",
      ];

      /**
       * We'll build something like:
       *   actual_block_name = CASE
       *     WHEN actual_block_id = X THEN 'some name'
       *     WHEN actual_block_id = Y THEN 'another name'
       *     ELSE actual_block_name
       *   END,
       *   ...
       */
      const cases: string[] = [];

      for (const field of updatableFields) {
        const columnName = convertTsKeyToColumn(field);
        let caseStmt = `\`${columnName}\` = CASE`;

        // Add WHEN ... THEN logic only if the update actually has a value for that field
        let hasAnyChangeForThisField = false;

        for (const u of updates) {
          const newValue = (u as any)[field];
          if (newValue !== undefined) {
            hasAnyChangeForThisField = true;
            const dbValue = toMySQLActualBlock({ [field]: newValue })[field];
            caseStmt += ` WHEN actual_block_id = ${u.actualBlockId} THEN ${dbEscape(dbValue)}`;
          }
        }

        caseStmt += ` ELSE \`${columnName}\` END`;

        // Only push the case statement if there's at least one WHEN clause
        if (hasAnyChangeForThisField) {
          cases.push(caseStmt);
        }
      }

      if (!cases.length) {
        // means no real updates
        logger.error("No valid fields to update in updateForCoachPlan");
        return;
      }

      // Collect all block IDs to update
      const blockIds = updates.map((update) => update.actualBlockId).join(",");

      const sql = `
        UPDATE actual_blocks
        SET 
          ${cases.join(", ")},
          updated_at = NOW()
        WHERE actual_block_id IN (${blockIds})
      `;

      await db.beginTransaction();
      await db.query(sql);
      await db.commit();
    } catch (error) {
      logger.error("Error updating multiple actual blocks for coach plan", error);
      await db.rollback();
      throw error;
    }
  }

  static async delete(id: MySQLUintID): Promise<number> {
    try {
      if (!id) {
        logger.error("No ID provided to delete an actual block.");
        throw new Error("No ID provided to delete an actual block.");
      }

      const [result] = await db.query(
        "DELETE FROM actual_blocks WHERE actual_block_id = ?",
        [id]
      );
      return (result as { affectedRows: number }).affectedRows;
    } catch (error) {
      logger.error(`Error deleting actual block with ID: ${id}`, error);
      throw error;
    }
  }
}


/**
 * Helper: convert our TypeScript property to actual DB column name.
 */
function convertTsKeyToColumn(tsKey: keyof MySQLActualBlock): string {
  switch (tsKey) {
    case "actualBlockId":
      return "actual_block_id";
    case "studentId":
      return "student_id";
    case "subfieldId":
      return "subfield_id";
    case "defaultBlockId":
      return "default_block_id";
    case "actualBlockName":
      return "actual_block_name";
    case "space":
      return "space";
    case "speed":
      return "speed";
    case "lap":
      return "lap";
    case "startDate":
      return "start_date";
    case "endDate":
      return "end_date";
    case "blockOrder":
      return "block_order";
    case "isTail":
      return "is_tail";
    case "actualBlockSize":
      return "actual_block_size";
    case "studentActualBlockDbNotionPageId":
      return "student_actual_block_db_notion_page_id";
    case "studentScheduleNotionPageId":
      return "student_schedule_notion_page_id";
    case "coachPlanNotionPageId":
      return "coach_plan_notion_page_id";
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    default:
      return tsKey as string; // fallback, but ideally handle all
  }
}
