import db from '../aws_db';

export class Subfields {
  static async create({ subfieldId, subjectId, subfieldName }) {
    const [result] = await db.query(
      `INSERT INTO subfields (subfield_id, subject_id, subfield_name, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [subfieldId, subjectId, subfieldName]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query(`SELECT * FROM subfields`);
    return rows;
  }

  static async findBySubfieldId(subfieldId) {
    const [rows] = await db.query(
      `SELECT * FROM subfields WHERE subfield_id = ?`,
      [subfieldId]
    );
    return rows || null;
  }

  static async findBySubfieldName(subfieldName) {
    const [rows] = await db.query(
      `SELECT * FROM subfields WHERE subfield_name = ?`,
      [subfieldName]
    );
    return rows || null;
  }
  
  static async findBySubjectId(subjectId) {
    const [rows] = await db.query(
      `SELECT * FROM subfields WHERE subject_id = ?`,
      [subjectId]
    );
    return rows || null;
  }

  static async update(id, { subjectId, subfieldName }) {
    const [result] = await db.query(
      `UPDATE subfields
       SET subject_id = ?, subfield_name = ?, updated_at = NOW()
       WHERE subfield_id = ?`,
      [subjectId, subfieldName, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM subfields WHERE subfield_id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}