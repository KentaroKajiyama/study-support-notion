import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
  convertTimeMySQLToNotion,
  convertTimeNotionToMySQL,
  isDate1EarlierThanOrSameWithDate2,
  mySubDays
} from "@utils/index.js";
import {
  isMySQLUintID,
  MySQLUintID,
  MySQLTimestamp,
  MySQLDate,
  isNotionUUID,
  toNotionUUID,
  NotionUUID,
  NotionDate,
  toMySQLUintID
} from '@domain/types/index.js';
import { RowDataPacket, ResultSetHeader } from "mysql2";


export interface MySQLRest {
  restId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  notionPageId?: string;
  restName?: string;
  startDate?: MySQLDate;
  endDate?: MySQLDate;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface Rest {
  restId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  notionPageId?: NotionUUID;
  restName?: string;
  startDate?: NotionDate;
  endDate?: NotionDate;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

function toRest(row: MySQLRest): Rest {
  try {
    const transformed = {
      restId: row.restId,
      studentId: row.studentId,
      subfieldId: row.subfieldId,
      notionPageId: row.notionPageId && toNotionUUID(row.notionPageId),
      restName: row.restName,
      startDate: row.startDate && convertTimeMySQLToNotion(row.startDate, true),
      endDate: row.endDate && convertTimeMySQLToNotion(row.endDate, true),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    logger.debug(`transformed: {${JSON.stringify(transformed)}}`)
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    ) as Rest
  } catch (error) {
    logger.error('Error transforming MySQLRest to Rest:', error);
    throw error;
  }
};

function toMySQLRest(data: Rest): MySQLRest {
  try {
    const transformed = {
      restId: data.restId,
      studentId: data.studentId,
      subfieldId: data.subfieldId,
      notionPageId: data.notionPageId,
      restName: data.restName,
      startDate: data.startDate && convertTimeNotionToMySQL(data.startDate),
      endDate: data.endDate && convertTimeNotionToMySQL(data.endDate),
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    ) as MySQLRest
  } catch(error) {
    logger.error('Error transforming Rest to MySQLRest:', error);
    throw error;
  }
}

export class Rests {

  static async create(data: Rest): Promise<MySQLUintID> {
    try {
      const payload = toMySQLRest(data);
      const sql = `
        INSERT INTO rests
        (student_id, subfield_id, rest_name, start_date, end_date)
        VALUES (?,?,?,?,?)
      `;
      const [result] = await db.query(sql, [
        payload.studentId,
        payload.subfieldId,
        payload.restName,
        payload.startDate,
        payload.endDate,
      ]);
      return toMySQLUintID((result as { insertId: number }).insertId);
    } catch (error) {
      logger.error('Error creating Rest:', error);
      throw error;
    }
  }

  static async findAll(): Promise<Rest[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM rests');
      if (rows.length === 0) {
        logger.warn('No rows found in Rests.ts');
        return [];
      };
      return rows.map(row => toRest(convertToCamelCase(row) as MySQLRest)) as Rest[];
    } catch (error) {
      logger.error('Error fetching all Rests:', error);
      throw error;
    }
  }

  static async findByStudentId(studentId: MySQLUintID): Promise<Rest[]> {
    try {
      if (!studentId) {
        throw new Error('Invalid studentId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM rests WHERE student_id = ?',
        [studentId]
      );
      if (rows.length === 0) {
        logger.warn('No rows found in Rests.ts');
        return [];
      };
      return rows.map(row => toRest(convertToCamelCase(row) as MySQLRest)) as Rest[];
    } catch (error) {
      logger.error('Error fetching Rests by studentId:', error);
      throw error;
    }
  }

  static async findByNotionPageId(notionPageId: NotionUUID) {
    try {
      if (!isNotionUUID(notionPageId)) {
        throw new Error('Invalid notionPageId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM rests WHERE notion_page_id = ?',
        [notionPageId]
      );
      if (rows.length === 0) {
        logger.warn('No rows found in Rests.ts');
        return [];
      };
      return rows.map(row => toRest(convertToCamelCase(row) as MySQLRest)) as Rest[];
    } catch (error) {
      logger.error('Error fetching Rests by notionPageId:', error);
      throw error;
    }
  }

  static async findByCompositeKey(studentId: MySQLUintID, subfieldId: MySQLUintID) {
    try {
      if (!isMySQLUintID(studentId) || !isMySQLUintID(subfieldId)) {
        throw new Error('Invalid composite key, both keys must be MySQLUintID in Rests.ts');
      }
      if (!studentId ||!subfieldId) {
        throw new Error('Invalid composite key in Rests.ts');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM rests WHERE student_id = ? AND subfield_id = ?',
        [studentId, subfieldId]
      );
      if (rows.length === 0) {
        logger.warn('No rows found in Rests.ts');
        return [];
      };
      return rows.map(row => toRest(convertToCamelCase(row) as MySQLRest)) as Rest[];
    } catch (error) {
      logger.error('Error fetching Rests by composite key:', error);
      throw error;
    }
  }

  static async update(restId: MySQLUintID, updates: Rest): Promise<boolean>{
    try {
      if (!isMySQLUintID(restId)) {
        throw new Error('Invalid restId');
      }
      if (updates == null){
        logger.warn('No updates in Problem.ts!')
        return false;
      }
      const parsedUpdates = (() => {
        if (!updates.startDate && !updates.endDate) {
          throw new Error('At least one of startDate or endDate must be provided');
        }
        if (updates.startDate && updates.endDate && isDate1EarlierThanOrSameWithDate2(updates.endDate, mySubDays(updates.startDate, 1))) {
          throw new Error('startDate cannot be after endDate');
        }
        return convertToSnakeCase(toMySQLRest(updates))
      })();
      logger.debug(`updates: ${JSON.stringify(updates)})})}`)
      logger.debug(`parsedUpdates: ${JSON.stringify(parsedUpdates)}`)
      const columns = Object.keys(parsedUpdates);
      const values = Object.values(parsedUpdates);
      const setClause = columns.map(col => `${col} = ?`).join(", ");
      const sql = `
        UPDATE rests
        SET ${setClause}
        WHERE rest_id = ?
      `;
      logger.debug(`sql: ${sql}`);
      const [result] = await db.query(sql, [
        ...values,
        restId,
      ]);
      return true;
    } catch (error) {
      logger.error('Error updating Rest:', error);
      throw error;
    }
  }

  static async delete(restId: MySQLUintID): Promise<boolean> {
    try {
      if (!isMySQLUintID(restId)) {
        throw new Error('Invalid restId');
      }
      const sql = 'DELETE FROM rests WHERE rest_id =?';
      const [result] = await db.query<ResultSetHeader>(sql, [restId]);
      if (result.affectedRows === 0) {
        logger.warn('No rows were affected during deletion of Rest row in Rest.ts');
        return false; 
      }
      return true
    } catch (error) {
      logger.error('Error deleting Rest:', error);
      throw error;
    }
  }
}