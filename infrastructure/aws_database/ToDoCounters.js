import db from '../aws_db';

export class ToDoCounters {
  static async create({ studentId, subfieldId, count = 0 }) {
    const sql = `
      INSERT INTO todo_counters (student_id, subfield_id, count, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, count]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM todo_counters');
    return rows;
  }

  static async findByToDoCountersId(todoCountersId) {
    const [rows] = await db.query(
      'SELECT * FROM todo_counters WHERE todo_counters_id = ?',
      [todoCountersId]
    );
    return rows[0] || null;
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM todo_counters WHERE student_id = ?',
      [studentId]
    );
    return rows;
  }

  static async update(todoCountersId, { count }) {
    const sql = `
      UPDATE todo_counters
      SET count = ?, updated_at = NOW()
      WHERE todo_counters_id = ?
    `;
    const [result] = await db.query(sql, [count, todoCountersId]);
    return result.affectedRows;
  }

  static async delete(todoCountersId) {
    const [result] = await db.query(
      'DELETE FROM todo_counters WHERE todo_counters_id = ?',
      [todoCountersId]
    );
    return result.affectedRows;
  }
}import db from '../aws_db';

export class ToDoCounters {
  constructor({
    todoCountersId,
    studentId,
    subfieldId,
    count,
    createdAt,
    updatedAt
  }) {
    this.todoCountersId = todoCountersId;
    this.studentId = studentId;
    this.subfieldId = subfieldId;
    this.count = count;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async create({ studentId, subfieldId, count = 0 }) {
    const sql = `
      INSERT INTO todo_counters (student_id, subfield_id, count, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [studentId, subfieldId, count]);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM todo_counters');
    return rows;
  }

  static async findByToDoCountersId(todoCountersId) {
    const [rows] = await db.query(
      'SELECT * FROM todo_counters WHERE todo_counters_id = ?',
      [todoCountersId]
    );
    return rows[0] || null;
  }

  static async findByStudentId(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM todo_counters WHERE student_id = ?',
      [studentId]
    );
    return rows;
  }

  static async update(todoCountersId, { count }) {
    const sql = `
      UPDATE todo_counters
      SET count = ?, updated_at = NOW()
      WHERE todo_counters_id = ?
    `;
    const [result] = await db.query(sql, [count, todoCountersId]);
    return result.affectedRows;
  }

  static async delete(todoCountersId) {
    const [result] = await db.query(
      'DELETE FROM todo_counters WHERE todo_counters_id = ?',
      [todoCountersId]
    );
    return result.affectedRows;
  }
}