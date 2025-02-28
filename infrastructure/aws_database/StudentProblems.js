export class StudentProblems {
  static async create(data) {
    const sql = `
      INSERT INTO student_problems
      (student_problem_id, student_id, problem_id, actual_block_id, answer_status, is_difficult, understanding_level, try_count, difficult_count, wrong_count, review_level, review_count_down, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [
      data.studentProblemId,
      data.studentId,
      data.problemId,
      data.actualBlockId,
      data.answerStatus,
      data.isDifficult,
      data.understandingLevel,
      data.tryCount,
      data.difficultCount,
      data.wrongCount,
      data.reviewLevel,
      data.reviewCountDown
    ]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM student_problems');
    return rows;
  }

  static async findById(studentProblemId) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_problem_id = ?',
      [studentProblemId]
    );
    return rows[0] || null;
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_id = ?',
      [studentId]
    );
    return rows;
  }

  static async update(studentProblemId, updates) {
    if (!studentProblemId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: studentProblemId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE student_problems
      SET ${setClause}, updated_at = NOW()
      WHERE student_problem_id = ?
    `;

    await db.query(sql, [...values, studentProblemId]);
    return true;
  }

  static async delete(studentProblemId) {
    const [result] = await db.query(
      'DELETE FROM student_problems WHERE student_problem_id = ?',
      [studentProblemId]
    );
    return result.affectedRows;
  }
}
