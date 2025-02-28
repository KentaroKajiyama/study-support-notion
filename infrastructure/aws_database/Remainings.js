import db from '../aws_db';

export class Remainings {
  static async create({ studentId, subfieldId, targetDay, examDay }) {
    const sql = `
      INSERT INTO remainings
      (student_id, subfield_id, target_day, exam_day, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, targetDay, examDay]);
    return result.affectedRows;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM remainings');
    return rows;
  }

  static async findByCompositeKey(studentId, subfieldId) {
    const [rows] = await db.query(
      `SELECT * FROM remainings WHERE student_id = ? AND subfield_id = ?`,
      [studentId, subfieldId]
    );
    return rows[0] || null;
  }

  static async update(remainingId, updates) {
    if (!remainingId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: remainingId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE remainings
      SET ${setClause}, updated_at = NOW()
      WHERE remaining_id = ?
    `;

    await db.query(sql, [...values, remainingId]);
    return true;
  }

  static async delete(studentId, subfieldId) {
    const [result] = await db.query(
      `DELETE FROM remainings WHERE student_id = ? AND subfield_id = ?`,
      [studentId, subfieldId]
    );
    return result.affectedRows;
  }
}
