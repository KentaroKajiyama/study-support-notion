import db from '../awsDB';
import logger from '../../utils/logger';
import { convertToCamelCase } from '../../utils/lodash';

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

  static async createMultiple(data) {
    try {
      const createData = data.map(e => { return [
        e.student_id, 
        e.subfield_id, 
        e.default_block_id,
        e.actualBlockName,
        e.space,
        e.speed,
        e.lap,
        e.block_order
      ]})
      const sql = `
      INSERT INTO actual_blocks
      (student_id, subfield_id, default_block_id, actual_block_name, space, speed, lap, block_order)
      VALUES ?
      `;
      await db.beginTransaction();
      await db.query(sql, [createData]);
      await db.commit();
    } catch (error) {
      await db.rollback();
      logger.error('Error creating multiple actual blocks', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM actual_blocks');
    return convertToCamelCase(rows);
  }

  static async findByActualBlockId(actualBlockId) {
    const [rows] = await db.query(
      'SELECT * FROM actual_blocks WHERE actual_block_id = ?',
      [actualBlockId]
    );
    return convertToCamelCase(rows);
  }

  static async findByStudentIdAndSubfieldId(studentId, subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM actual_blocks WHERE student_id = ? AND subfield_id = ?',
      [studentId, subfieldId]
    );
    return convertToCamelCase(rows);
  }

  static async findByCompositeKey(studentId, subfieldId, defaultBlockId) {
    const [rows] = await db.query(
      `SELECT * FROM actual_blocks WHERE student_id = ? AND subfield_id = ? AND default_block_id = ?`,
      [studentId, subfieldId, defaultBlockId]
    );
    return convertToCamelCase(rows);
  }

  static async findByBlockOrderAndStudentInfo(studentId, subfieldId, blockOrder) {
    const [rows] = await db.query(
      `SELECT * FROM actual_blocks WHERE student_id =? AND subfield_id =? AND block_order =?`,
      [studentId, subfieldId, blockOrder]
    );
    return convertToCamelCase(rows);
  }

  static async findActualBlockIdAndSubfieldIdByCoachPlanPageId(coachPlanPageId) {
    const [rows] = await db.query(
      'SELECT actual_block_id, subfield_id FROM actual_blocks WHERE notion_page_id_for_coach_plan =?',
      [notionPageId]
    );
    return convertToCamelCase(rows);
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

  static async updateForCoachPlan(updates) {
    try {
      if (!updates || Object.keys(updates).length === 0) {
        throw new Error("Invalid input: updates are required.");
      }
      const actualBlockIds = updates.map(update => update.actualBlockId).join(',');
      const actualBlockNameCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.actualBlockName}`).join(' ');
      const speedCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.speed}`).join(' ');
      const spaceCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.space}`).join(' ');
      const lapCases = updates.map(update=> `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.lap}`).join(' ');
      const headOrderCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.headOrder}`).join(' ');
      const tailOrderCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.tailOrder}`).join(' ');
      const startDateCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN '${update.startDate}'`).join(' ');
      const endDateCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN '${update.endDate}'`).join(' ');
      const blockOrderCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.blockOrder}`).join(' ');
      const isTailCases = updates.map(update => `WHEN actual_block_id = ${update.actualBlockId} THEN ${update.isTail}`).join(' ');
  
      const sql = `
        UPDATE actual_blocks
        SET 
          actual_block_name = ${actualBlockNameCases} END,
          speed = CASE ${speedCases} END,
          space = CASE ${spaceCases} END,
          lap = CASE ${lapCases} END,
          head_order = CASE ${headOrderCases} END,
          tail_order = CASE ${tailOrderCases} END,
          start_day = CASE ${startDateCases} END,
          end_day = CASE ${endDateCases} END,
          block_order = CASE ${blockOrderCases} END,
          is_tail = CASE ${isTailCases} END,
          updated_at = NOW()
        WHERE actual_block_id IN (${actualBlockIds})
      `
      await db.beginTransaction();
      await db.query(sql);
      await db.commit();
    } catch (error) {
      await db.rollback();
      logger.error('Error updating multiple actual blocks for coach plan', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM actual_blocks WHERE actual_block_id = ?',
      [id]
    );
    return convertToCamelCase(result.affectedRows);
  }
}