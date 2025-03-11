import db from '../aws_db';
import { convertToCamelCase, convertToSnakeCase } from '../../utils/lodash';

export class StudentSubfieldTraces {
  static async create({ studentId, subfieldId, targetDay, examDay }) {
    const sql = `
      INSERT INTO student_subfield_traces
      (student_id, subfield_id, todo_counter, remaining_day, actual_end_date, target_date, exam_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, targetDay, examDay]);
    return convertToCamelCase(result.affectedRows);
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM student_subfield_traces');
    return convertToCamelCase(rows);
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM student_subfield_traces WHERE student_id = ?',
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async findOnlySubfieldInfoByStudentId(studentId) {
    const [rows] = await db.query(
      `SELECT student_subfield_traces.subfield_id, subfields.subfield_name 
      FROM student_subfield_traces 
      INNER JOIN subfields ON student_subfield_traces.subfield_id = subfields.subfield_id
      WHERE student_id = ?`,
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async findOnlyReviewAlertByStudentId(studentId) {
    const [rows] = await db.query(
      `SELECT student_subfield_traces.student_id, student_subfield_traces.subfield_id, student_subfield_traces.review_alert, subfields.subfield_name
      FROM student_subfield_traces
      INNER JOIN subfields ON student_subfield_traces.subfield_id = subfields.subfield_id
      WHERE student_id = ?`,
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async findByCompositeKey(studentId, subfieldId) {
    const [rows] = await db.query(
      `SELECT * FROM student_subfield_traces WHERE student_id = ? AND subfield_id = ?`,
      [studentId, subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async findOnlyTodoRemainingCounterByCompositeKey(studentId, subfieldId) {
    const [rows] = await db.query(
      `SELECT todo_remaining_counter FROM student_subfield_traces WHERE student_id =? AND subfield_id =?`,
      [studentId, subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async update(traceId, updates) {
    if (!traceId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: traceId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE student_subfield_traces
      SET ${setClause}, updated_at = NOW()
      WHERE trace_id = ?
    `;

    await db.query(sql, [...values, traceId]);
    return true;
  }

  static async updateByCompositekey(studentId, subfieldId, updates) {
    try {
      updates = convertToSnakeCase(updates);
      const columns = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = columns.map(col => `${col} = ?`).join(", ");

      const sql = `
        UPDATE student_subfield_traces
        SET ${setClause}, updated_at = NOW()
        WHERE student_id =? AND subfield_id =?
      `;
      await db.beginTransaction();
      await db.query(sql, [...values, studentId, subfieldId]);
      await db.commit();
    } catch (error) {
      await db.rollback();
      throw new Error("Invalid input: updates must be an object.");
    } finally {
      await db.end();
    }
  }

  static async delete(studentId, subfieldId) {
    const [result] = await db.query(
      `DELETE FROM student_subfield_traces WHERE student_id = ? AND subfield_id = ?`,
      [studentId, subfieldId]
    );
    return convertToCamelCase(result.affectedRows);
  }
}
