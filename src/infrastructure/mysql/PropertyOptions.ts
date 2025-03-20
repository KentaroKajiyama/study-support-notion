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


interface MySQLPropertyOption {
  propertyOptionId?: MySQLUintID,
  notionDbPropertyId?: MySQLUintID,
  optionKey?: string,
  optionValue?: string,
  createdAt?: MySQLTimestamp
}

export interface PropertyOption {
  propertyOptionId?: MySQLUintID,
  notionDbPropertyId?: MySQLUintID,
  optionKey?: string,
  optionValue?: string,
  createdAt?: MySQLTimestamp
};

function toPropertyOption(row: MySQLPropertyOption): PropertyOption {
  try {
    const transformed = {
      propertyOptionId: row.propertyOptionId,
      notionDbPropertyId: row.notionDbPropertyId,
      optionKey: row.optionKey,
      optionValue: row.optionValue,
      createdAt: row.createdAt
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting row to PropertyOption:', error);
    throw error;
  }
};

function toMySQLPropertyOption(data: PropertyOption): MySQLPropertyOption {
  if (data.notionDbPropertyId === null) {
    logger.error('Invalid notionDbPropertyId provided for creating a PropertyOption.');
    throw new Error('Invalid notionDbPropertyId provided for creating a PropertyOption.');
  }
  if (data.optionKey === null) {
    logger.error('Invalid optionKey provided for creating a PropertyOption.');
    throw new Error('Invalid optionKey provided for creating a PropertyOption.');
  }
  if (data.optionValue === null) {
    logger.error('Invalid optionValue provided for creating a PropertyOption.');
    throw new Error('Invalid optionValue provided for creating a PropertyOption.');
  }
  try {
    const transformed = {
      propertyOptionId: data.propertyOptionId,
      notionDbPropertyId: data.notionDbPropertyId,
      optionKey: data.optionKey,
      optionValue: data.optionValue,
      createdAt: data.createdAt
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    ) as MySQLPropertyOption;
  } catch (error) {
    logger.error('Error converting PropertyOption to MySQLPropertyOption:', error);
    throw error;
  }
}

export class PropertyOptions {
  static async findAll(): Promise<PropertyOption[]>{
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT * FROM property_options
        `
      );
      if (!Array.isArray(rows)) {
        logger.error('The result of "findAll" query was not an array.');
        throw new Error('There was an error in "findAll" query in PropertyOptions.ts');
      } else if (rows.length === 0) {
        logger.warn('No rows found in Rests.ts');
        return [];
      };
      return rows.map(row => toPropertyOption(convertToCamelCase(row) as MySQLPropertyOption)) as PropertyOption[];
    } catch (error) {
      logger.error('Error querying property_options:', error);
      throw error;
    }
  };
  static async findByPropertyOptionId(propertyOptionId: MySQLUintID): Promise<PropertyOption | null> {
    try {
      if (!propertyOptionId) {
        logger.error('No propertyOptionId provided to findByPropertyOptionId.');
        throw new Error('No propertyOptionId provided to findByPropertyOptionId.');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT * FROM property_options WHERE property_option_id =?
        `,
        [propertyOptionId]
      );
      if (!Array.isArray(rows)) {
        logger.error('The result of "findByPropertyOptionId" query was not an array.');
        throw new Error('There was an error in "findByPropertyOptionId" query in PropertyOptions.ts');
      } else if (rows.length === 0) {
        logger.warn('No options were found in the result of "findByPropertyOptionId" query in PropertyOptions.ts')
        return null;
      }
      return toPropertyOption(convertToCamelCase(rows[0]) as MySQLPropertyOption);
    } catch (error) {
      logger.error('Error querying property_options by ID:', error);
      throw error;
    }
  };
  static async findByNotionDbPropertyId(notionDbPropertyid: MySQLUintID): Promise<PropertyOption[]> {
    try {
      if (!notionDbPropertyid) {
        logger.error('No notionDbPropertyId provided to findByNotionDbPropertyId.');
        throw new Error('No notionDbPropertyId provided to findByNotionDbPropertyId.');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT * FROM property_options WHERE notion_db_property_id =?
        `,
        [notionDbPropertyid]
      );
      if (!Array.isArray(rows)) {
        logger.error('The result of "findByNotionDbPropertyId" query was not an array.');
        throw new Error('There was an error in "findByNotionDbPropertyId" query in PropertyOptions.ts');
      } else if (rows.length === 0) {
        logger.warn('No options were found in the result of "findByNotionDbPropertyId" query in PropertyOptions.ts')
        return [];
      }
      return rows.map(row => toPropertyOption(convertToCamelCase(row) as MySQLPropertyOption)) as PropertyOption[];
    } catch (error) {
      logger.error('Error querying property_options by notionDbPropertyId:', error);
      throw error;
    }
  };
  static async findByNotionDbPropertyIdAndOptionValue(notionDbPropertyid: MySQLUintID, optionValue: string): Promise<PropertyOption | null> {
    try {
      if (!notionDbPropertyid ||!optionValue) {
        logger.error('No notionDbPropertyId or optionValue provided to findByNotionDbPropertyIdAndOptionValue.');
        throw new Error('No notionDbPropertyId or optionValue provided to findByNotionDbPropertyIdAndOptionValue.');
      }
      const [rows] = await db.query<RowDataPacket[]>(
        `
          SELECT * FROM property_options WHERE notion_db_property_id =? AND option_value =?
        `,
        [notionDbPropertyid, optionValue]
      );
      if (!Array.isArray(rows)) {
        logger.error('The result of "findByNotionDbPropertyIdAndOptionValue" query was not an array.');
        throw new Error('There was an error in "findByNotionDbPropertyIdAndOptionValue" query in PropertyOptions.ts');
      } else if (rows.length === 0) {
        logger.warn('No options were found in the result of "findByNotionDbPropertyIdAndOptionValue" query in PropertyOptions.ts')
        return null;
      }
      return toPropertyOption(convertToCamelCase(rows[0]) as MySQLPropertyOption);
    } catch (error) {
      logger.error('Error querying property_options by notionDbPropertyId and optionValue:', error);
      throw error;
    }
  };
  static async create(data: PropertyOption): Promise<boolean> {
    try {
      if (!data) {
        logger.error('No data provided to create a PropertyOption.');
        throw new Error('No data provided to create a PropertyOption.');
      }
      if (data.notionDbPropertyId === undefined) {
        logger.error('No notionDbPropertyId provided to create a PropertyOption.');
        throw new Error('No notionDbPropertyId provided to create a PropertyOption.');
      }
      if (data.optionKey === undefined) {
        logger.error('No optionKey provided to create a PropertyOption.');
        throw new Error('No optionKey provided to create a PropertyOption.');
      }
      if (data.optionValue === undefined) {
        logger.error('No optionValue provided to create a PropertyOption.');
        throw new Error('No optionValue provided to create a PropertyOption.');
      }
      const mysqlData = toMySQLPropertyOption(data);
      const [result] = await db.query<ResultSetHeader>(
        `
          INSERT INTO property_options (notion_db_property_id, option_key, option_value) VALUES (?,?,?)
        `,
        [
          mysqlData.notionDbPropertyId, 
          mysqlData.optionKey, 
          mysqlData.optionValue
        ]
      );
      if (!result.insertId) {
        logger.error('No insertId returned from create query in PropertyOptions.ts');
        throw new Error('No insertId returned from create query in PropertyOptions.ts');
      }
      return true;
    } catch (error) {
      logger.error('Error creating PropertyOption:', error);
      throw error;
    }
  };
  static async update(propertyOptionId: MySQLUintID, updates: PropertyOption): Promise<boolean> {
    try {
      if (!propertyOptionId) {
        logger.error('No propertyOptionId provided to update a PropertyOption.');
        throw new Error('No propertyOptionId provided to update a PropertyOption.');
      }
      const payload = convertToSnakeCase(toPropertyOption(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);
      const setClause = columns.map(column => `${column} = ?`).join(', ');
      const [result] = await db.query<ResultSetHeader>(
        `
          UPDATE property_options SET ${setClause} WHERE property_option_id =?
        `,
        [...values, propertyOptionId]
      );
      if (result.affectedRows === 0) {
        logger.warn('No rows updated in update query in PropertyOptions.ts');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      logger.error('Error updating PropertyOption:', error);
      throw error;
    }
  };
  static async delete(propertyOptionId: MySQLUintID): Promise<boolean> {
    try {
      if (!propertyOptionId) {
        logger.error('No propertyOptionId provided to delete a PropertyOption.');
        throw new Error('No propertyOptionId provided to delete a PropertyOption.');
      }
      const [result] = await db.query<ResultSetHeader>(
        `
          DELETE FROM property_options WHERE property_option_id =?
        `,
        [propertyOptionId]
      );
      if (result.affectedRows === 0) {
        logger.warn('No rows deleted in delete query in PropertyOptions.ts');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      logger.error('Error deleting PropertyOption:', error);
      throw error;
    }
  };
}