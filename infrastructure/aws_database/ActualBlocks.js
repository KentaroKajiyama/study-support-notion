import db from '../aws_db';

export class ActualBlocks {
  static async create(data) {
    const sql = `
      INSERT INTO actual_blocks
      (actual_block_id, student_id, subfield_id, default_block_id, actual_block_name, space, speed, number_of_laps, head_order, tail_order, start_day, end_day, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [
      data.actualBlockId,
      data.studentId,
      data.subfieldId,
      data.defaultBlockId,
      data.actualBlockName,
      data.space,
      data.speed,
      data.numberOfLaps,
      data.headOrder,
      data.tailOrder,
      data.startDay,
      data.endDay
    ]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM actual_blocks');
    return rows;
  }

  static async findByActualBlockId(actualBlockId) {
    const [rows] = await db.query(
      'SELECT * FROM actual_blocks WHERE actual_block_id = ?',
      [actualBlockId]
    );
    return rows || null;
  }

  static async findByStudentIdAndSubfieldId(studentId, subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM actual_blocks WHERE student_id = ? AND subfield_id = ?',
      [studentId, subfieldId]
    );
    return rows;
  }

  static async findByCompositeKey(studentId, subfieldId, defaultBlockId) {
    const [rows] = await db.query(
      `SELECT * FROM actual_blocks WHERE student_id = ? AND subfield_id = ? AND default_block_id = ?`,
      [studentId, subfieldId, defaultBlockId]
    );
    return rows || null;
  }

  static async update(actualBlockId, updates) {
    if (!actualBlockId || !updates || Object.keys(updates).length === 0) {
      throw new Error("Invalid input: actualBlockId and updates are required.");
    }

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    const sql = `
      UPDATE actual_blocks
      SET ${setClause}, updated_at = NOW()
      WHERE actual_block_id = ?
    `;

    await db.query(sql, [...values, actualBlockId]);
    return true;
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM actual_blocks WHERE actual_block_id = ?',
      [id]
    );
    return result.affectedRows;
  }
}