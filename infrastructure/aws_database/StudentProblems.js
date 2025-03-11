import db from '../awsDB.js';
import { convertToCamelCase } from '../../utils/lodash';
import logger from '../../utils/logger.js';

export class StudentProblemsAWS {
  static async create(data) {
    const sql = `
      INSERT INTO student_problems
      (student_problem_id, student_id, problem_id, actual_block_id, notion_page_id, answer_status, is_difficult, understanding_level, try_count, difficult_count, wrong_count, review_level, review_count_down, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [
      data.studentProblemId,
      data.studentId,
      data.problemId,
      data.actualBlockId,
      data.notionPageId,
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
    return convertToCamelCase(rows);
  }

  static async findById(studentProblemId) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_problem_id = ?',
      [studentProblemId]
    );
    return convertToCamelCase(rows);
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_id = ?',
      [studentId]
    );
    return convertToCamelCase(rows);
  }

  static async findByStudentIdAndSubfieldId(studentId, subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_id =? AND subfield_id =?',
      [studentId, subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async findByCompositeKeyProblemOrder(studentId, subfieldId, problemOrderOverall) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_id =? AND subfield_id =? AND problem_order_overall =?',
      [studentId, subfieldId, problemOrderOverall]
    );
    return convertToCamelCase(rows);
  }

  static async findByCompositeKeyInBlockOrder(studentId, subfieldId, problemOrderInBlock) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_id =? AND subfield_id =? AND problem_in_block_order =?',
      [studentId, subfieldId, problemOrderInBlock]
    );
    return convertToCamelCase(rows);
  }

  static async findWithSubfieldIdByNotionPageId(notionPageId) {
    const [rows] = await db.query(
      `
        SELECT *, problems.subfieldId 
        FROM student_problems
        INNER JOIN problems ON problems.problem_id = student_problems.problem_id
        WHERE notion_page_id =?
      `,
      [notionPageId]
    );
    return convertToCamelCase(rows);
  }

  static async findByBlockInfoAndStudentInfo(studentId, actualBlockId, problemInBlockOrder) {
    const [rows] = await db.query(
      'SELECT * FROM student_problems WHERE student_id =? AND actual_block_id =? AND problem_in_block_order =?',
      [studentId, actualBlockId, problemInBlockOrder]
    );
    return convertToCamelCase(rows);
  }

  static async findNotionPageIdsByCompositekey(studentId, subfieldId, actualBlockId) {
    const [rows] = await db.query(
      'SELECT notion_page_id FROM student_problems WHERE student_id =? AND subfield_id =? AND actual_block_id =?',
      [studentId, subfieldId, actualBlockId]
    );
    return convertToCamelCase(rows);
  }

  static async findNotionPageIdByStudentProblemId(studentProblemId) {
    const [rows] = await db.query(
      'SELECT notion_page_id FROM student_problems WHERE student_problem_id =?',
      [studentProblemId]
    );
    return convertToCamelCase(rows);
  }

  static async findWithSubfieldIdByStudentProblemId(studentProblemId) {
    try {
      const [rows] = await db.query(
        `
          SELECT *, problems.subfield_id 
          FROM student_problems 
          INNER JOIN problems ON problems.problem_id = student_problems.problem_id
          WHERE student_problems.student_problem_id =?
        `,
        [studentProblemId]
      );
      return convertToCamelCase(rows);
    } catch (error) {
      logger.error('Error finding problem for review:', error);
      throw error;
    }
  }

  /**
   * @description Additionally returns subfield_id
   * @date 04/03/2025
   * @static
   * @memberof StudentProblemsAWS
   */
  static async findAllProblemsForReview(subfieldId, reviewSpeed) {
    const [rows] = await db.query(
      `
      SELECT *, problems.subfield_id, subfields.subfield_name
      FROM student_problems 
      INNER JOIN problems ON problems.problem_id = student_problems.problem_id
      INNER JOIN subfields ON subfields.subfield_id = problems.subfield_id
      WHERE student_problems.review_count_down = 0, problems.subfield_id = ?
      ORDER BY student_problems.review_available_date ASC
      LIMIT ?
      `,
      [subfieldId, reviewSpeed]
    );
    return convertToCamelCase(rows);
  }

  static async updateReviewCountDown() {
    await db.query(
      `
      UPDATE student_problems
      SET review_count_down = GREATEST(review_count_down - 1, 0)
      WHERE review_count_down > 0
      `
    );
    return true;
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

  static async updateForCoachPlan(updates) {
    try {
      const studentProblemIds = updates.map(update => update.studentProblemId).join(',');
      const actualBlockIdCases = updates.map(update => `WHEN student_problem_id = ${update.studentProblemId} THEN ${update.actualBlockId}`).join(' ');
      const probOverallOrderCases = updates.map(update => `WHEN student_problem_id = ${update.studentProblemId} THEN ${update.probOverallOrder}`).join(' ');
      const probInBlockOrderCases = updates.map(update => `WHEN student_problem_id = ${update.studentProblemId} THEN ${update.probInBlockOrder}`).join(' ');
      const sql = `
        UPDATE student_problems
        SET 
          actual_block_id = CASE ${actualBlockIdCases} END,
          problem_order_overall = CASE ${probOverallOrderCases} END,
          problem_in_block_order = CASE ${probInBlockOrderCases} END,
        WHEN student_problem_id IN ${studentProblemIds}
      `
      await db.beginTransaction();
      await db.query(sql);
      await db.commit();
    } catch (error) {
      logger.error("Error updating student problems for coach plan:", error.message);
      throw new Error("Error updating student problems for coach plan.");
    } finally {
      await db.end();
    }
  }

  static async delete(studentProblemId) {
    const [result] = await db.query(
      'DELETE FROM student_problems WHERE student_problem_id = ?',
      [studentProblemId]
    );
    return convertToCamelCase(result.affectedRows);
  }
}
