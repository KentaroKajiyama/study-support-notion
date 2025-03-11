import db from '../aws_db';
import { convertToCamelCase } from '../../utils/lodash';

export class Trackers {
  static async create({ studentId, subfieldId, actualBlockId, studentProblemId, order, remainingSpace = 0, isRest = 0, lap }) {
    const sql = `
      INSERT INTO trackers
      (student_id, subfield_id, actual_block_id, student_problem_id, present_order, remaining_space, is_rest, lap, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, actualBlockId, studentProblemId, order, remainingSpace, isRest, lap]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM trackers');
    return convertToCamelCase(rows);
  }

  static async findById(trackerId) {
    const [rows] = await db.query(
      'SELECT * FROM trackers WHERE tracker_id = ?',
      [trackerId]
    );
    return convertToCamelCase(rows);
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM trackers WHERE student_id =?',
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async findByCompositeKey(studentId, subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM trackers WHERE student_id =? AND subfield_id =?',
      [studentId, subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async findByStudentProblemId(studentProblemId) {
    const [rows] = await db.query(
      'SELECT * FROM trackers WHERE student_problem_id =?',
      [studentProblemId]
    );
    return convertToCamelCase(rows);
  }

  static async update(trackerId, data) {
    if (!trackerId || !data || Object.keys(data).length === 0) {
      throw new Error("Invalid input: trackerId and data are required.");
    }

    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE trackers
      SET ${setClause}, updated_at = NOW()
      WHERE tracker_id = ?
    `;

    await db.query(sql, [...values, trackerId]);
    return true;
  }

  static async updateRemainingSpace(trackerId, remainingSpace) {
    return update(trackerId, { remaining_space: remainingSpace });
  }

  static async updateLap(trackerId, lap) {
    return update(trackerId, { lap: lap });
  }

  static async updateIsRest(trackerId) {
    return update(trackerId, { is_rest: 0 });
  }

  static async updateAllTrackersStatusByStudentId(studentId, isEnabled) {
    try {
      const sql = `
      UPDATE trackers
      SET is_enabled = ? 
      WHERE student_id =?
      `;
      await db.beginTransaction();
      await db.query(sql, [isEnabled ? 1 : 0, studentId]);
      await db.commit();
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.end();
    }
  }

  static async delete(trackerId) {
    const [result] = await db.query(
      'DELETE FROM trackers WHERE tracker_id = ?',
      [trackerId]
    );
    return convertToCamelCase(result.affectedRows);
  }
}
