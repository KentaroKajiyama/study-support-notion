import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
} from "@utils/index.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  NotionDbPropertiesPropertyTypeEnum,
  isValidNotionDbPropertiesPropertyType
} from '@domain/types/index.js';
import { RowDataPacket, ResultSetHeader } from "mysql2";


interface MySQLNotionDbProperty {
  notionDbPropertyId?: MySQLUintID;
  dbName?: string;
  programName?: string;
  propertyName?: string;
  propertyType?: NotionDbPropertiesPropertyTypeEnum;
  createdAt?: MySQLTimestamp;
}

interface NotionDbProperty{
  notionDbPropertyId?: MySQLUintID;
  dbName?: string;
  programName?: string;
  propertyName?: string;
  propertyType?: NotionDbPropertiesPropertyTypeEnum;
  createdAt?: MySQLTimestamp;
}

function toNotionDbProperty(row: MySQLNotionDbProperty): NotionDbProperty {
  try {
    const transformed = {
      notionDbPropertyId: row.notionDbPropertyId,
      dbName: row.dbName,
      programName: row.programName,
      propertyName: row.propertyName,
      propertyType: row.propertyType,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    ) as NotionDbProperty;
  } catch (error) {
    logger.error('Error converting row to NotionDbProperty:', error);
    throw error;
  }
}

function toMySQLNotionDbProperty(row: NotionDbProperty): MySQLNotionDbProperty {
  try {
    if(row.propertyType !== undefined && !isValidNotionDbPropertiesPropertyType(row.propertyType)){
      throw new Error('Invalid NotionDbPropertyId in NotionDbProperties.ts')
    }
    const transformed: Partial<MySQLNotionDbProperty> = {
      notionDbPropertyId: row.notionDbPropertyId,
      dbName: row.dbName,
      programName: row.programName,
      propertyName: row.propertyName,
      propertyType: row.propertyType,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    ) as MySQLNotionDbProperty;
  } catch (error) {
    logger.error(`Error converting MySQLNotionDbProperty to NotionDbProperty: ${error}`);
    throw error;
  }
}

export class NotionDbProperties {
  static async create(data: NotionDbProperty): Promise<boolean> {
    try {
      if (!data) {
        logger.error("Invalid data provided for creating a notion db property.");
        throw new Error("Invalid data provided for creating a notion db property.");
      }
      const payload = toMySQLNotionDbProperty(data);
      const sql = `
        INSERT INTO notion_db_properties
        (db_name, program_name, property_name, property_type)
        VALUES
        (?,?,?,?)
      `;
      const [result] = await db.query<ResultSetHeader>(sql, Object.values(payload));
      if (result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during creation of notion db property in NotionDbProperties.ts');
        return false;
      }
    } catch (error) {
      logger.error('Failed to create notion db property in NotionDbProperties.ts,', error);
      throw error;
    }
  };
  static async findALL(): Promise<NotionDbProperty[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT notion_db_property_id, db_name, program_name, property_name, property_type 
          FROM notion_db_properties
        `
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findALL' query was not an array.");
        throw new Error("Result of 'findALL' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No notion db properties found in NotionDbProperties.ts')
        return [];
      }
      return rows.map(row => toNotionDbProperty(convertToCamelCase(row) as MySQLNotionDbProperty)) as NotionDbProperty[];
    } catch (error) {
      logger.error('Error querying notion_db_properties:', error);
      throw error;
    }
  };

  static async findByNotionDbPropertyId(notionDbPropertyId: MySQLUintID): Promise<NotionDbProperty | null> {
    try {
      if (!notionDbPropertyId) {
        throw new Error('Invalid notionDbPropertyId');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT notion_db_property_id, db_name, program_name, property_name, property_type 
          FROM notion_db_properties 
          WHERE notion_db_property_id =?
        `,
        [notionDbPropertyId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByNotionDbPropertyId' query was not an array.");
        throw new Error("Result of 'findByNotionDbPropertyId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No notion db property found with provided notionDbPropertyId in NotionDbProperties.ts')
        return null;
      }
      return toNotionDbProperty(convertToCamelCase(rows[0]) as MySQLNotionDbProperty);
    } catch (error) {
      logger.error(`Error finding notion db property by ID: ${notionDbPropertyId}`, error);
      throw error;
    }
  };

  static async findByDbNameAndPropertyName(dbName: string, propertyName: string): Promise<NotionDbProperty | null> {
    try {
      if (!dbName ||!propertyName) {
        throw new Error('Invalid dbName or propertyName');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT notion_db_property_id, db_name, program_name, property_name, property_type 
          FROM notion_db_properties 
          WHERE db_name =? AND property_name =?
        `,
        [dbName, propertyName]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByDbNameAndPropertyName' query was not an array.");
        throw new Error("Result of 'findByDbNameAndPropertyName' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn('No notion db property found with provided dbName and propertyName in NotionDbProperties.ts')
        return null;
      }
      return toNotionDbProperty(convertToCamelCase(rows[0]) as MySQLNotionDbProperty);
    } catch (error) {
      logger.error(`Error finding notion db property by dbName and propertyName: ${dbName}, ${propertyName}`, error);
      throw error;
    }
  };

  static async update(notionDbPropertyId: MySQLUintID, updates: NotionDbProperty): Promise<boolean> {
    try {
      if (!notionDbPropertyId ||!updates) {
        logger.error("Invalid notionDbPropertyId or updates provided for updating.");
        throw new Error("Invalid notionDbPropertyId or updates provided for updating.");
      }
      const payload = convertToSnakeCase(toMySQLNotionDbProperty(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);
      const setClause = columns.map(column => `${column} = ?`).join(', ');
      const sql = `
        UPDATE notion_db_properties
        SET ${setClause}
        WHERE notion_db_property_id =?
      `;
      const [result] = await db.query<ResultSetHeader>(sql,[...values, notionDbPropertyId]);
      if (result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during update of notion db property in NotionDbProperties.ts');
        return false;
      }
    } catch (error) {
      logger.error('Failed to update notion db property in NotionDbProperties.ts:', error);
      throw error;
    }
  };

  static async delete(notionDbPropertyId: MySQLUintID): Promise<boolean> {
    try {
      if (!notionDbPropertyId) {
        logger.error('Invalid notionDbPropertyId provided for deletion.');
        throw new Error('Invalid notionDbPropertyId provided for deletion.');
      }
      const sql = `
        DELETE FROM notion_db_properties
        WHERE notion_db_property_id =?
      `;
      const [result] = await db.query<ResultSetHeader>(sql, [notionDbPropertyId]);
      if (result.affectedRows > 0) {
        return true;
      } else {
        logger.warn('No rows were affected during deletion of notion db property in NotionDbProperties.ts');
        return false;
      }
    } catch (error) {
      logger.error('Failed to delete notion db property in NotionDbProperties.ts:', error);
      throw error;
    }
  };
}