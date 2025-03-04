import db from '../aws_db';

export class Trackers {
  static async create({ studentId, subfieldId, actualBlockId, studentProblemId, order, remainingSpace = 0, isRest = 0, lap }) {
    const sql = `
      INSERT INTO trackers
      (student_id, subfield_id, actual_block_id, student_problem_id, present_order, remaining_space, is_rest, lap, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, actualBlockId, studentProblemId, order, remainingSpace, isRest, lap]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM trackers');
    return rows;
  }

  static async findById(trackerId) {
    const [rows] = await db.query(
      'SELECT * FROM trackers WHERE tracker_id = ?',
      [trackerId]
    );
    return rows[0] || null;
  }

  static async findBystudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM trackers WHERE student_id =?',
      [studentId]
    );
    return rows;
  }

  static async update(trackerId, data) {
    if (!trackerId || !data || Object.keys(data).length === 0) {
      throw new Error("Invalid input: trackerId and data are required.");
    }

    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE trackers
      SET ${setClause}, updated_at = NOW()
      WHERE tracker_id = ?
    `;

    await db.query(sql, [...values, trackerId]);
    return true;
  }

  static async updateRemainingSpace(trackerId, remainingSpace) {
    return update(trackerId, { remaining_space: remainingSpace });
  }

  static async updateLap(trackerId, lap) {
    return update(trackerId, { lap: lap });
  }

  static async updateIsRest(trackerId) {
    return update(trackerId, { is_rest: 0 });
  }

  static async delete(trackerId) {
    const [result] = await db.query(
      'DELETE FROM trackers WHERE tracker_id = ?',
      [trackerId]
    );
    return result.affectedRows;
  }
}
