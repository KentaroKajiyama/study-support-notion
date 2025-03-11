import db from '../aws_db';
import { convertToCamelCase } from '../../utils/lodash';

export class Problems {
  static async create(data) {
    const sql = `
      INSERT INTO problems
      (problem_id, subfield_id, default_block_id, student_id, problem_name, answer, area, section, subsection, reference, problem_level, option1, option2, option3, option4, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [
      data.problemId,
      data.subfieldId,
      data.defaultBlockId,
      data.studentId,
      data.problemName,
      data.answer,
      data.area,
      data.section,
      data.subsection,
      data.reference,
      data.problemLevel,
      data.option1,
      data.option2,
      data.option3,
      data.option4
    ]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM problems');
    return convertToCamelCase(rows);
  }

  static async findById(problemId) {
    const [rows] = await db.query(
      'SELECT * FROM problems WHERE problem_id = ?',
      [problemId]
    );
    return convertToCamelCase(rows);
  }

  static async findBySubfieldId(subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM problems WHERE subfield_id = ?',
      [subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async update(problemId, updates) {
    if (!problemId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: problemId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE problems
      SET ${setClause}, updated_at = NOW()
      WHERE problem_id = ?
    `;

    await db.query(sql, [...values, problemId]);
    return true;
  }

  static async delete(problemId) {
    const [result] = await db.query(
      'DELETE FROM problems WHERE problem_id = ?',
      [problemId]
    );
    return convertToCamelCase(result.affectedRows);
  }
}