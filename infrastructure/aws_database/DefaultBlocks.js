import db from '../aws_db';

export class DefaultBlocks {
  constructor({
    defaultBlockId,
    subfieldId,
    blockName,
    blockOrder,
    space,
    speed,
    size,
    averageExpectedTime,
    createdAt,
    updatedAt
  }) {
    this.defaultBlockId = defaultBlockId;
    this.subfieldId = subfieldId;
    this.blockName = blockName;
    this.blockOrder = blockOrder;
    this.space = space;
    this.speed = speed;
    this.size = size;
    this.averageExpectedTime = averageExpectedTime;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async create({
    defaultBlockId,
    subfieldId,
    blockName,
    blockOrder,
    space,
    speed,
    size,
    averageExpectedTime
  }) {
    const sql = `
      INSERT INTO default_blocks
      (default_block_id, subfield_id, block_name, block_order, space, speed, size, average_expected_time, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [
      defaultBlockId,
      subfieldId,
      blockName,
      blockOrder,
      space,
      speed,
      size,
      averageExpectedTime
    ]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM default_blocks');
    return rows;
  }

  static async findByDefaultBlockId(defaultBlockId) {
    const [rows] = await db.query(
      'SELECT * FROM default_blocks WHERE default_block_id = ?',
      [defaultBlockId]
    );
    return rows || null;
  }

  static async findBySubfieldId(subfieldId) {
    const [rows] = await db.query(
      'SELECT * FROM default_blocks WHERE subfield_id = ?',
      [subfieldId]
    );
    return rows;
  }

  static async findByCompositeKey(subfieldId, blockName) {
    const [rows] = await db.query(
      'SELECT * FROM default_blocks WHERE subfield_id = ? AND block_name = ?',
      [subfieldId, blockName]
    );
    return rows || null;
  }

  static async update(id, { subfieldId, blockName, blockOrder, space, speed, size, averageExpectedTime }) {
    const sql = `
      UPDATE default_blocks
      SET
        subfield_id = ?,
        block_name = ?,
        block_order = ?,
        space = ?,
        speed = ?,
        size = ?,
        average_expected_time = ?,
        updated_at = NOW()
      WHERE default_block_id = ?
    `;
    const [result] = await db.query(sql, [
      subfieldId,
      blockName,
      blockOrder,
      space,
      speed,
      size,
      averageExpectedTime,
      id
    ]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM default_blocks WHERE default_block_id = ?',
      [id]
    );
    return result.affectedRows;
  }
}
