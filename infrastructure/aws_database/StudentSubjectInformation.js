import db from '../aws_db';

export class StudentSubjectInformation {
  static async create({ studentId, subjectId, subjectLevel, goalDescription, goalLevel, reviewSize, reviewSpace }) {
    const sql = `
      INSERT INTO student_subject_information
      (student_id, subject_id, subject_level, goal_description, goal_level, review_size, review_space, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [
      studentId,
      subjectId,
      subjectLevel,
      goalDescription,
      goalLevel,
      reviewSize,
      reviewSpace
    ]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM student_subject_information');
    return rows;
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM student_subject_information WHERE student_id = ?',
      [studentId]
    );
    return rows;
  }

  static async findByCompositeKey(studentId, subjectId) {
    const [rows] = await db.query(
      'SELECT * FROM student_subject_information WHERE student_id = ? AND subject_id = ?',
      [studentId, subjectId]
    );
    return rows || null;
  }

  static async update(studentSubjectInformationId, updates) {
    if (!studentSubjectInformationId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: studentSubjectInformationId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE student_subject_information
      SET ${setClause}, updated_at = NOW()
      WHERE student_subject_information_id = ?
    `;

    await db.query(sql, [...values, studentSubjectInformationId]);
    return true;
  }

  static async delete(studentSubjectInformationId) {
    const sql = `
      DELETE FROM student_subject_information
      WHERE student_subject_information_id = ?
    `;
    await db.query(sql, [studentSubjectInformationId]);
    return true;
  }
}
