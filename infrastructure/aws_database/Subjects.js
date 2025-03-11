import db from '../awsDB';
import { convertToCamelCase } from '../../utils/lodash';

export class Subjects {
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
    return convertToCamelCase(rows);
  }

  static async findAllSubjectNames() {
    const [rows] = await db.query(`SELECT subject_name FROM subjects`);
    return convertToCamelCase(rows);
  }

  static async findBysubjectId(subjectId) {
    const [rows] = await db.query(
      `SELECT * FROM subjects WHERE subject_id = ?`,
      [subjectId]
    );
    return convertToCamelCase(rows);
  }

  static async findBysubjectName(subjectName) {
    const [rows] = await db.query(
      `SELECT * FROM subjects WHERE subject_name = ?`,
      [subjectName]
    );
    return convertToCamelCase(rows);
  }

  static async findSubfieldAndSubjectBySubjectName(subjectName) {
    const [rows] = await db.query(
      `SELECT subjects.subject_id, subjects.subject_name, subfields.subfield_id, subfields.subfield_name
       FROM subjects 
       INNER JOIN subfields ON subjects.subject_id = subfields.subject_id
       WHERE subjects.subject_name = ?`,
      [subjectName]
    );
    return convertToCamelCase(rows);
  }
  
  static async findBySubjectId(subjectId) {
    const [rows] = await db.query(
      `SELECT * FROM subjects WHERE subject_id = ?`,
      [subjectId]
    );
    return convertToCamelCase(rows);
  }

  static async update(id, { subjectName }) {
    const [result] = await db.query(
      `UPDATE subjects
       SET subject_name = ?, updated_at = NOW()
       WHERE subject_id = ?`,
      [subjectId, subjectName, id]
    );
    return convertToCamelCase(result.affectedRows);
  }

  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM subjects WHERE subject_id = ?`,
      [id]
    );
    return convertToCamelCase(result.affectedRows);
  }
}