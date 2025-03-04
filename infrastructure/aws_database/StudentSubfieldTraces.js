import db from '../aws_db';

export class StudentSubfieldTraces {
  static async create({ studentId, subfieldId, targetDay, examDay }) {
    const sql = `
      INSERT INTO student_subfield_traces
      (student_id, subfield_id, todo_counter, remaining_day, actual_end_date, target_date, exam_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, targetDay, examDay]);
    return result.affectedRows;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM student_subfield_traces');
    return rows;
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM student_subfield_traces WHERE student_id = ?',
      [studentId]
    );
    return rows;
  }

  static async findOnlySubfieldIdsByStudentId(studentId) {
    const [rows] = await db.query(
      `SELECT student_subfield_traces.subfield_id, subfields.subfield_name 
      FROM student_subfield_traces 
      INNER JOIN subfields ON student_subfield_traces.subfield_id = subfields.subfield_id
      WHERE student_id = ?`,
      [studentId]
    );
    return rows;
  }

  static async findByCompositeKey(studentId, subfieldId) {
    const [rows] = await db.query(
      `SELECT * FROM student_subfield_traces WHERE student_id = ? AND subfield_id = ?`,
      [studentId, subfieldId]
    );
    return rows || null;
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

  static async delete(studentId, subfieldId) {
    const [result] = await db.query(
      `DELETE FROM student_subfield_traces WHERE student_id = ? AND subfield_id = ?`,
      [studentId, subfieldId]
    );
    return result.affectedRows;
  }
}
