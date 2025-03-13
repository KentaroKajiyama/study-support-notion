import db from '../awsDB.js';
import logger from '../../utils/logger.js';
import { MySQLBoolean, toBoolean, toMySQLBoolean, MySQLTimestamp, MySQLUintID } from '../../const/mysqlType.js';
import { Uint, toUint } from '../../const/myTypes.js';
import { convertToCamelCase, convertToSnakeCase } from '../../utils/convertCase.js';


export interface MySQLTracker {
  trackerId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  actualBlockId?: MySQLUintID;
  studentProblemId?: MySQLUintID;
  remainingSpace?: Uint;
  isRest?: MySQLBoolean;
  currentLap?: Uint;
  isEnabled?: MySQLBoolean;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export interface Tracker {
  trackerId?: MySQLUintID;
  studentId?: MySQLUintID;
  subfieldId?: MySQLUintID;
  actualBlockId?: MySQLUintID;
  studentProblemId?: MySQLUintID;
  remainingSpace?: Uint;
  isRest?: boolean;
  currentLap?: Uint;
  isEnabled?: boolean;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

function toTracker(row: MySQLTracker): Tracker {
  try { 
    const transformed = {
    trackerId: row.trackerId,
    studentId: row.studentId,
    subfieldId: row.subfieldId,
    actualBlockId: row.actualBlockId,
    studentProblemId: row.studentProblemId,
    remainingSpace: row.remainingSpace,
    isRest: row.isRest && toBoolean(row.isRest),
    currentLap: row.currentLap,
    isEnabled: row.isEnabled && toBoolean(row.isEnabled),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    ) as Tracker;
  } catch (error) {
    logger.error(`Error converting MySQLTracker to Tracker: ${error}`);
    throw error;
  }
}

function toMySQLTracker(data: Tracker): MySQLTracker {
  try {
    if (data.studentId === null) throw new Error('studentId cannot be null');
    if (data.subfieldId === null) throw new Error('subfieldId cannot be null');
    if (data.actualBlockId === null) throw new Error('actualBlockId cannot be null');
    if (data.studentProblemId === null) throw new Error('studentProblemId cannot be null');
    const transformed = {
    trackerId: data.trackerId,
    studentId: data.studentId,
    subfieldId: data.subfieldId,
    actualBlockId: data.actualBlockId,
    studentProblemId: data.studentProblemId,
    remainingSpace: data.remainingSpace && toUint(data.remainingSpace),
    isRest: data.isRest && toMySQLBoolean(data.isRest),
    currentLap: data.currentLap && toUint(data.currentLap),
    isEnabled: data.isEnabled && toMySQLBoolean(data.isEnabled),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error(`Error converting Tracker to MySQLTracker: ${error}`);
    throw error;
  }
}

export class Trackers {
  static async create(data: {
    studentId: MySQLUintID;
    subfieldId: MySQLUintID;
    actualBlockId?: MySQLUintID;
    studentProblemId?: MySQLUintID;
    order?: Uint; 
    remainingSpace?: Uint; 
    isRest?: boolean; 
    lap?: Uint; 
  }): Promise<boolean> {
    try {
      if (!data.studentId) {
        logger.error("Missing required studentId for creating tracker.");
        throw new Error("Invalid input for creating a tracker.");
      }

      const payload = toMySQLTracker(data);

      const sql = `
        INSERT INTO trackers
          (student_id, subfield_id, actual_block_id, student_problem_id,
          remaining_space, is_rest, current_lap, is_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        payload.studentId,
        payload.subfieldId,
        payload.actualBlockId,
        payload.studentProblemId,
        payload.remainingSpace || 0,
        payload.isRest || 0,
        payload.currentLap || 0, 
        payload.isEnabled || 0
      ]);

      const { affectedRows } = result as { affectedRows: number };
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error creating tracker:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Tracker[]> {
    try {
      const [rows] = await db.query('SELECT * FROM trackers');
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findAll' query was not an array.");
        throw new Error("Result of 'findAll' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn("No trackers were found in findAll Trackers.ts")
      }

      return rows.map(row => toTracker(convertToCamelCase(row) as MySQLTracker));
    } catch (error) {
      logger.error("Error finding all trackers:", error);
      throw error;
    }
  }

  static async findById(trackerId: MySQLUintID): Promise<Tracker | null> {
    try {
      if (!trackerId) {
        logger.error("No trackerId provided to findById.");
        throw new Error("Invalid trackerId.");
      }

      const [rows] = await db.query(
        'SELECT * FROM trackers WHERE tracker_id = ?',
        [trackerId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findById' query was not an array.");
        throw new Error("Result of 'findById' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn("No Tracker was found")
        return null;
      }

      const rowCamel = convertToCamelCase(rows[0]) as MySQLTracker;
      return toTracker(rowCamel);
    } catch (error) {
      logger.error(`Error finding tracker by ID: ${trackerId}`, error);
      throw error;
    }
  }

  static async findByStudentId(studentId: MySQLUintID): Promise<Tracker[]> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findByStudentId.");
        throw new Error("Invalid studentId.");
      }

      const [rows] = await db.query(
        'SELECT * FROM trackers WHERE student_id = ?',
        [studentId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByStudentId' query was not an array.");
        throw new Error("Result of 'findByStudentId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn("No trackers were found by studentId")
        return [];
      }

      return rows.map(row => toTracker(convertToCamelCase(row) as MySQLTracker));
    } catch (error) {
      logger.error(`Error finding trackers by studentId: ${studentId}`, error);
      throw error;
    }
  }

  static async findByCompositeKey(
    studentId: MySQLUintID,
    subfieldId: MySQLUintID
  ): Promise<Tracker[]> {
    try {
      if (!studentId || !subfieldId) {
        logger.error("Invalid input to findByCompositeKey: missing IDs.");
        throw new Error("studentId and subfieldId are required.");
      }

      const [rows] = await db.query(
        'SELECT * FROM trackers WHERE student_id = ? AND subfield_id = ?',
        [studentId, subfieldId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByCompositeKey' query was not an array.");
        throw new Error("Result of 'findByCompositeKey' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn("No trackers were found by composite key")
        return [];
      }

      return rows.map(row => toTracker(convertToCamelCase(row) as MySQLTracker));
    } catch (error) {
      logger.error(
        `Error finding trackers by compositeKey (sId=${studentId}, sfId=${subfieldId}):`,
        error
      );
      throw error;
    }
  }

  static async findByStudentProblemId(
    studentProblemId: MySQLUintID
  ): Promise<Tracker[]> {
    try {
      if (!studentProblemId) {
        logger.error("No studentProblemId provided to findByStudentProblemId.");
        throw new Error("Invalid studentProblemId.");
      }

      const [rows] = await db.query(
        'SELECT * FROM trackers WHERE student_problem_id = ?',
        [studentProblemId]
      );
      if (!Array.isArray(rows)) {
        logger.error("Result of 'findByStudentProblemId' query was not an array.");
        throw new Error("Result of 'findByStudentProblemId' query was not an array.");
      } else if (rows.length === 0) {
        logger.warn("No trackers were found by studentProblemId")
        return [];
      }

      return rows.map(row => toTracker(convertToCamelCase(row) as MySQLTracker));
    } catch (error) {
      logger.error(
        `Error finding trackers by studentProblemId: ${studentProblemId}`,
        error
      );
      throw error;
    }
  }

  static async update(
    trackerId: MySQLUintID,
    updates: Partial<Tracker>
  ): Promise<boolean> {
    try {
      if (!trackerId || !updates || Object.keys(updates).length === 0) {
        logger.error("Invalid input: trackerId and data are required.");
        throw new Error("trackerId and updates are required for update.");
      }

      // Convert domain updates -> DB fields
      const payload = convertToSnakeCase(toMySQLTracker(updates));
      const columns = Object.keys(payload);
      const values = Object.values(payload);

      if (columns.length === 0) {
        // nothing to update
        return false;
      }

      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const sql = `
        UPDATE trackers
        SET ${setClause}
        WHERE tracker_id = ?
      `;

      const [result] = await db.query(sql, [...values, trackerId]);
      const { affectedRows } = result as { affectedRows: number };
      if (affectedRows > 0) {
        return true;
      } else {
        logger.warn("No rows updated in updateTracker.ts");
        return false;
      }
    } catch (error) {
      logger.error(`Error updating tracker with ID: ${trackerId}`, error);
      throw error;
    }
  }

  static async updateRemainingSpace(
    trackerId: MySQLUintID,
    remainingSpace: Uint
  ): Promise<boolean> {
    return this.update(trackerId, { remainingSpace: remainingSpace});
  }

  static async updateLap(trackerId: MySQLUintID, currentLap: Uint): Promise<boolean> {
    return this.update(trackerId, { currentLap: currentLap });
  }

  static async updateIsRest(trackerId: MySQLUintID, isRest: boolean): Promise<boolean> {
    return this.update(trackerId, { isRest: isRest });
  }

  static async updateAllTrackersStatusByStudentId(
    studentId: MySQLUintID,
    isEnabled: boolean
  ): Promise<boolean> {
    try {
      if (!studentId) {
        logger.error("Invalid studentId for updateAllTrackersStatusByStudentId.");
        throw new Error("studentId is required for updateAllTrackersStatusByStudentId.");
      }

      const sql = `
        UPDATE trackers
        SET is_enabled = ?
        WHERE student_id = ?
      `;

      const [result] = await db.query(sql, [isEnabled ? 1 : 0, studentId]);

      const { affectedRows } = result as { affectedRows: number };
      if (affectedRows > 0) {
        return true;
      } else {
        logger.warn("No rows updated in updateAllTrackersStatusByStudentId.ts");
        return false;
      }
    } catch (error) {
      logger.error(
        `Error updating all trackers' status by studentId: ${studentId}`,
        error
      );
      throw error;
    } 
  }

  static async delete(trackerId: MySQLUintID): Promise<boolean> {
    try {
      if (!trackerId) {
        logger.error("No trackerId provided to delete a tracker.");
        throw new Error("Invalid trackerId for deletion.");
      }

      const [result] = await db.query(
        'DELETE FROM trackers WHERE tracker_id = ?',
        [trackerId]
      );

      const { affectedRows } = result as { affectedRows: number };
      if (affectedRows > 0) {
        return true;
      } else {
        logger.warn("No rows deleted in deleteTracker.ts");
        return false;
      }
    } catch (error) {
      logger.error(`Error deleting tracker with ID: ${trackerId}`, error);
      throw error;
    }
  }
}
