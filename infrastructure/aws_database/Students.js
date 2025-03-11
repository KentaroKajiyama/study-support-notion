import db from '../aws_db';

export class Students {
  static async create(data) {
    const sql = `
      INSERT INTO students (
        student_id, student_name, parent_name, parent_phone_number,
        exam_date, student_page, todo_db, remaining_db, wrong_db,
        difficult_db, student_progress_db, student_only_plan_db,
        coach_page, coach_record_db, coach_plan_db, coach_student_db,
        goal_description, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      data.studentId,
      data.studentName,
      data.parentName,
      data.parentPhoneNumber,
      data.examDate,
      data.studentPage,
      data.todoDb,
      data.remainingDb,
      data.wrongDb,
      data.difficultDb,
      data.studentProgressDb,
      data.studentOnlyPlanDb,
      data.coachPage,
      data.coachRecordDb,
      data.coachPlanDb,
      data.coachStudentDb,
      data.goalDescription
    ]);

    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query(`SELECT * FROM students`);
    return rows;
  }

  static async findOnlyTopProblemDBIds() {
    const [rows] = await db.query(
      `
        SELECT student_id, todo_db_id, wrong_db_id, is_difficult_db_id
        FROM students
      `
    );
    return rows;
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      `SELECT * FROM students WHERE student_id = ?`,
      [studentId]
    );
    return rows || null;
  }

  static async findOnlyOverviewPageIdByStudentId(studentId) {
    const [rows] = await db.query(
      `
        SELECT student_overview_page_id
        FROM students
        WHERE student_id =?
      `,
      [studentId]
    );
    return rows;
  }

  static async findForDetailRegistrationByStudentId(studentId) {
    const [rows] = await db.query(
      `
      SELECT coach_plan_db_id, student_detail_info_db_id
      FROM students
      WHERE student_id =?
      `,
      [studentId]
    );
    return rows;
  }

  static async update(studentId, updates) {
    if (!studentId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: studentId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE students
      SET ${setClause}, updated_at = NOW()
      WHERE student_id = ?
    `;

    await db.query(sql, [...values, studentId]);
    return true;
  }

  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM students WHERE student_id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}