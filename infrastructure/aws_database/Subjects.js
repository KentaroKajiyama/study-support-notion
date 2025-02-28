import db from '../aws_db';

export class subjects {
  static async create({ subjectId, subjectName }) {
    const [result] = await db.query(
      `INSERT INTO subjects (subject_id, subject_name, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [subjectId, subjectName]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query(`SELECT * FROM subjects`);
    return rows;
  }

  static async findBysubjectId(subjectId) {
    const [rows] = await db.query(
      `SELECT * FROM subjects WHERE subject_id = ?`,
      [subjectId]
    );
    return rows || null;
  }

  static async findBysubjectName(subjectName) {
    const [rows] = await db.query(
      `SELECT * FROM subjects WHERE subject_name = ?`,
      [subjectName]
    );
    return rows || null;
  }
  
  static async findBySubjectId(subjectId) {
    const [rows] = await db.query(
      `SELECT * FROM subjects WHERE subject_id = ?`,
      [subjectId]
    );
    return rows || null;
  }

  static async update(id, { subjectName }) {
    const [result] = await db.query(
      `UPDATE subjects
       SET subject_name = ?, updated_at = NOW()
       WHERE subject_id = ?`,
      [subjectId, subjectName, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM subjects WHERE subject_id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}