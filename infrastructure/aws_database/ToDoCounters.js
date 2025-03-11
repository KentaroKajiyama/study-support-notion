import db from '../aws_db';
import { convertToCamelCase } from '../../utils/lodash';

export class ToDoCounters {
  static async create({ studentId, subfieldId, count = 0 }) {
    const sql = `
      INSERT INTO todo_counters (student_id, subfield_id, count, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, count]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM todo_counters');
    return convertToCamelCase(rows);
  }

  static async findByToDoCountersId(todoCountersId) {
    const [rows] = await db.query(
      'SELECT * FROM todo_counters WHERE todo_counters_id = ?',
      [todoCountersId]
    );
    return convertToCamelCase(rows);
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM todo_counters WHERE student_id = ?',
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async update(todoCountersId, { count }) {
    const sql = `
      UPDATE todo_counters
      SET count = ?, updated_at = NOW()
      WHERE todo_counters_id = ?
    `;
    const [result] = await db.query(sql, [count, todoCountersId]);
    return convertToCamelCase(result.affectedRows);
  }

  static async delete(todoCountersId) {
    const [result] = await db.query(
      'DELETE FROM todo_counters WHERE todo_counters_id = ?',
      [todoCountersId]
    );
    return convertToCamelCase(result.affectedRows);
  }
}