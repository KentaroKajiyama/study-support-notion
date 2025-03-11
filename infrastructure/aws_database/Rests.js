import db from '../aws_db';
import { convertToCamelCase } from '../../utils/lodash';

export class Rests {

  static async create({ studentId, subfieldId, startDate, endDate }) {
    const sql = `
      INSERT INTO rests
      (student_id, subfield_id, start_date, end_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, startDate, endDate]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM rests');
    return convertToCamelCase(rows);
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM rests WHERE student_id = ?',
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async findByNotionPageId(pageId) {
    const [rows] = await db.query(
      'SELECT * FROM rests WHERE notion_page_id = ?',
      [pageId]
    );
    return convertToCamelCase(rows);
  }

  static async findByCompositeKey(studentId, subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM rests WHERE student_id = ? AND subfield_id = ?',
      [studentId, subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async update(restId, { startDate, endDate }) {
    const sql = `
      UPDATE rests
      SET start_date = ?, end_date = ?, updated_at = NOW()
      WHERE rest_id = ?
    `;
    const [result] = await db.query(sql, [startDate, endDate, restId]);
    return convertToCamelCase(result.affectedRows);
  }

  static async delete(restId) {
    const [result] = await db.query(
      'DELETE FROM rests WHERE rest_id = ?',
      [restId]
    );
    return convertToCamelCase(result.affectedRows);
  }
}