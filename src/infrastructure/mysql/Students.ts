import db from "@infrastructure/awsDB.js";
import { 
  logger, 
  convertToCamelCase, 
  convertToSnakeCase,
  convertTimeMySQLToNotion,
  convertTimeNotionToMySQL
} from "@utils/index.js";
import {
  MySQLUintID,
  MySQLTimestamp,
  MySQLDate,
  PhoneNumber,
  toPhoneNumber,
  Email,
  toEmail,
  toNotionUUID,
  NotionUUID,
  NotionDate,
  toMySQLUintID
} from '@domain/types/index.js';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  Student
} from '@domain/student/index.js';


export interface MySQLStudent {
  studentId?: MySQLUintID;
  studentName?: string;
  parentName?: string;
  parentPhoneNumber?: string;
  parentEmail?: string;
  examDate?: MySQLDate;
  studentPageId?: string;
  todoDbId?: string;
  remainingDbId?: string;
  wrongDbId?: string;
  isDifficultDbId?: string;
  todoCounterDbId?: string;
  studentScheduleDbId?: string;
  studentOverviewPageId?: string;
  studentInfoDetailDbId?: string;
  coachRestDbId?: string;
  coachPlanDbId?: string;
  coachIrregularDbId?: string;
  necessaryStudyTimeDbId?: string;
  goalDescription?: string;
  createdAt?: MySQLTimestamp;
  updatedAt?: MySQLTimestamp;
}

export function toStudent(row: MySQLStudent): Student {
  try {
    logger.debug(`row: ${JSON.stringify(row)}`);
    const transformed: Student = {
      studentId: row.studentId,
      studentName: row.studentName,
      parentName: row.parentName,
      parentPhoneNumber:
        row.parentPhoneNumber != undefined
          ? toPhoneNumber(row.parentPhoneNumber)
          : undefined,
      parentEmail:
        row.parentEmail != undefined
          ? toEmail(row.parentEmail)
          : undefined,
      examDate:
        row.examDate != undefined
          ? (convertTimeMySQLToNotion(row.examDate) as NotionDate)
          : undefined,
      studentPageId:
        row.studentPageId != undefined
          ? toNotionUUID(row.studentPageId)
          : undefined,
      todoDbId:
        row.todoDbId != undefined
          ? toNotionUUID(row.todoDbId)
          : undefined,
      remainingDbId:
        row.remainingDbId != undefined
          ? toNotionUUID(row.remainingDbId)
          : undefined,
      wrongDbId:
        row.wrongDbId != undefined
          ? toNotionUUID(row.wrongDbId)
          : undefined,
      isDifficultDbId:
        row.isDifficultDbId != undefined
          ? toNotionUUID(row.isDifficultDbId)
          : undefined,
      todoCounterDbId:
        row.todoCounterDbId != undefined
          ? toNotionUUID(row.todoCounterDbId)
          : undefined,
      studentScheduleDbId:
        row.studentScheduleDbId != undefined
          ? toNotionUUID(row.studentScheduleDbId)
          : undefined,
      studentOverviewPageId:
        row.studentOverviewPageId != undefined
          ? toNotionUUID(row.studentOverviewPageId)
          : undefined,
      studentInfoDetailDbId:
        row.studentInfoDetailDbId != undefined
          ? toNotionUUID(row.studentInfoDetailDbId)
          : undefined,
      coachRestDbId:
        row.coachRestDbId != undefined
          ? toNotionUUID(row.coachRestDbId)
          : undefined,
      coachPlanDbId:
        row.coachPlanDbId != undefined
          ? toNotionUUID(row.coachPlanDbId)
          : undefined,
      coachIrregularDbId:
        row.coachIrregularDbId != undefined
          ? toNotionUUID(row.coachIrregularDbId)
          : undefined,
      necessaryStudyTimeDbId:
        row.necessaryStudyTimeDbId != undefined
          ? toNotionUUID(row.necessaryStudyTimeDbId)
          : undefined,
      goalDescription: row.goalDescription,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    // Remove undefined fields
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value != undefined)
    ) as Student;
  } catch (error) {
    logger.error('Error transforming MySQLStudent to Student:', error);
    throw error;
  }
}

export function toMySQLStudent(data: Student): MySQLStudent {
  try {
    const transformed: MySQLStudent = {
      studentId: data.studentId,
      studentName: data.studentName,
      parentName: data.parentName,
      parentPhoneNumber: data.parentPhoneNumber,
      parentEmail: data.parentEmail,
      examDate:
        data.examDate !== undefined
          ? (convertTimeNotionToMySQL(data.examDate) as MySQLDate)
          : undefined,
      studentPageId: data.studentPageId,
      todoDbId: data.todoDbId,
      remainingDbId: data.remainingDbId,
      wrongDbId: data.wrongDbId,
      isDifficultDbId: data.isDifficultDbId,
      todoCounterDbId: data.todoCounterDbId,
      studentScheduleDbId: data.studentScheduleDbId,
      studentOverviewPageId: data.studentOverviewPageId,
      studentInfoDetailDbId: data.studentInfoDetailDbId,
      coachRestDbId: data.coachRestDbId,
      coachPlanDbId: data.coachPlanDbId,
      coachIrregularDbId: data.coachIrregularDbId,
      necessaryStudyTimeDbId: data.necessaryStudyTimeDbId,
      goalDescription: data.goalDescription,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value != undefined)
    ) as MySQLStudent;
  } catch (error) {
    logger.error('Error transforming Student to MySQLStudent:', error);
    throw error;
  }
}

export class Students {
  static async create(data: Student): Promise<MySQLUintID> {
    try {
      if (!data) {
        logger.error("No data provided for creating a student.");
        throw new Error("Invalid data for creating a student.");
      }

      const payload = toMySQLStudent(data);

      logger.debug(`payload: ${JSON.stringify(payload)}`);

      const sql = `
        INSERT INTO students (
          student_name,
          parent_name,
          parent_phone_number,
          parent_email,
          exam_date,
          student_only_page_id,
          todo_db_id,
          remaining_db_id,
          wrong_db_id,
          is_difficult_db_id,
          todo_counter_db_id,
          student_schedule_db_id,
          student_overview_page_id,
          coach_rest_db_id,
          coach_plan_db_id,
          coach_irregular_db_id,
          necessary_study_time_db_id,
          goal_description
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `;

      const [result] = await db.query<ResultSetHeader>(sql, [
        payload.studentName,
        payload.parentName ?? null,
        payload.parentPhoneNumber ?? null,
        payload.parentEmail ?? null,
        payload.examDate ?? null,
        payload.studentPageId ?? null,
        payload.todoDbId ?? null,
        payload.remainingDbId ?? null,
        payload.wrongDbId ?? null,
        payload.isDifficultDbId ?? null,
        payload.todoCounterDbId ?? null,
        payload.studentScheduleDbId ?? null,
        payload.studentOverviewPageId ?? null,
        payload.coachRestDbId ?? null,
        payload.coachPlanDbId ?? null,
        payload.coachIrregularDbId ?? null,
        payload.necessaryStudyTimeDbId ?? null,
        payload.goalDescription ?? null
      ]);

      logger.info(`Student info has been created succeedly. StudentName: ${payload.studentName} in Students.ts`);

      if (result.affectedRows > 0) {
        return toMySQLUintID(result.insertId);
      } else {
        throw new Error(`Failed to insert student information. payload: ${payload}`);
      }
    } catch (error) {
      logger.error(`Error creating a student. data: ${JSON.stringify(data)}`);
      throw error;
    }
  }

  static async findAll(): Promise<Student[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM students`);
      if (rows.length === 0) {
        logger.warn("No students found in Students.ts");
        return [];
      }
      logger.debug(`rows: ${JSON.stringify(rows)}`);
      logger.debug(`rows[0]: ${JSON.stringify(rows[0])}`)

      return rows.map(row => toStudent(convertToCamelCase(row) as MySQLStudent)) as Student[];
    } catch (error) {
      logger.error("Error finding all students:", error);
      throw error;
    }
  }

  static async findOnlyTopProblemDBIds(): Promise<{
    studentId: MySQLUintID;
    remainingDbId: NotionUUID | null;
    todoDbId: NotionUUID | null;
    wrongDbId: NotionUUID | null;
    isDifficultDbId: NotionUUID | null;
  }[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(`
        SELECT student_id, remaining_db_id, todo_db_id, wrong_db_id, is_difficult_db_id
        FROM students
      `);
      if (rows.length === 0) {
        logger.warn("No students found in Students.ts");
        return [];
      }

      return rows.map(row => toStudent(convertToCamelCase(row) as MySQLStudent)) as {
                                                                                      studentId: MySQLUintID;
                                                                                      remainingDbId: NotionUUID | null;
                                                                                      todoDbId: NotionUUID | null;
                                                                                      wrongDbId: NotionUUID | null;
                                                                                      isDifficultDbId: NotionUUID | null;
                                                                                    }[]
    } catch (error) {
      logger.error("Error finding only top problem DB IDs:", error);
      throw error;
    }
  }

  static async findByStudentId(studentId: MySQLUintID): Promise<Student | null> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findByStudentId.");
        throw new Error("Invalid studentId in findByStudentId.");
      }

      const [rows] = await db.query(
        `SELECT * FROM students WHERE student_id = ?`,
        [studentId]
      );

      if (!Array.isArray(rows)) {
        throw new Error("Invalid rows in findByStudentId");
      } else if (rows.length === 0) {
        logger.warn("No student was found in findByStudentId Students.ts")
        return null;
      }

      return toStudent(convertToCamelCase(rows[0]) as MySQLStudent) as Student;
    } catch (error) {
      logger.error(`Error finding student by studentId: ${studentId}`, error);
      throw error;
    }
  }

  static async findByNotionUserId(
    notionUserId: NotionUUID
  ): Promise<Student | null> {
    try {
      if (!notionUserId) {
        logger.error("No notionUserId provided to findByNotionUserId.");
        throw new Error("Invalid notionUserId in findByNotionUserId.");
      }

      const [rows] = await db.query(
        `SELECT * FROM students WHERE student_notion_user_id = ?`,
        [notionUserId]
      );
      if (!Array.isArray(rows)) {
        throw new Error("Invalid rows in findByNotionUserId");
      } else if (rows.length === 0) {
        logger.warn("No student was found in findByNotionUserId Students.ts")
        return null;
      } else if (rows.length >= 2) {
        logger.warn(
          "Multiple students found with the same notionUserId in findByNotionUserId Students.ts"
        );
      }

      return toStudent(convertToCamelCase(rows[0]) as MySQLStudent);
    } catch (error) {
      logger.error(
        `Error finding students by notionUserId: ${notionUserId}`,
        error
      );
      throw error;
    }
  }

  static async findOnlyOverviewPageIdByStudentId(
    studentId: MySQLUintID
  ): Promise<NotionUUID | null> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findOnlyOverviewPageIdByStudentId.");
        throw new Error("Invalid studentId in findOnlyOverviewPageIdByStudentId.");
      }

      const [rows] = await db.query(
        `
          SELECT student_overview_page_id
          FROM students
          WHERE student_id = ?
        `,
        [studentId]
      );
      if (!Array.isArray(rows)) {
        throw new Error("Invalid rows in findByStudentId");
      } else if (rows.length === 0) {
        logger.warn("No student was found in findByStudentId Students.ts")
        return null;
      }

      return toStudent(convertToCamelCase(rows[0]) as MySQLStudent).studentOverviewPageId as NotionUUID;
    } catch (error) {
      logger.error(
        `Error finding overview pageId by studentId: ${studentId}`,
        error
      );
      throw error;
    }
  }

  static async findForDetailRegistrationByStudentId(
    studentId: MySQLUintID
  ): Promise<{
    studentOverviewPageId: NotionUUID | null,
    coachPlanDbId: NotionUUID | null;
    studentDetailInfoDbId: NotionUUID | null;
    coachIrregularDbId: NotionUUID | null;
  } | null> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to findForDetailRegistrationByStudentId.");
        throw new Error("Invalid studentId in findForDetailRegistrationByStudentId.");
      }

      // Adjust column names if they differ in your table
      const [rows] = await db.query(
        `
          SELECT student_overview_page_id, coach_plan_db_id, student_detail_info_db_id
          FROM students
          WHERE student_id = ?
        `,
        [studentId]
      );
      if (!Array.isArray(rows)) {
        throw new Error("Invalid rows in findByStudentId");
      } else if (rows.length === 0) {
        logger.warn("No student was found in findByStudentId Students.ts")
        return null;
      }

      const rowCamel = convertToCamelCase(rows[0]) as Student;
      return {
        studentOverviewPageId: rowCamel.studentOverviewPageId ?? null,
        coachPlanDbId: rowCamel.coachPlanDbId ?? null,
        studentDetailInfoDbId: rowCamel.studentInfoDetailDbId ?? null,
        coachIrregularDbId: rowCamel.coachIrregularDbId?? null,
      };
    } catch (error) {
      logger.error(
        `Error finding detail registration by studentId: ${studentId}`,
        error
      );
      throw error;
    }
  }

  static async update(
    studentId: MySQLUintID,
    updates: Partial<Student>
  ): Promise<boolean> {
    try {
      if (!studentId || !updates || Object.keys(updates).length === 0) {
        logger.error("Invalid input: studentId and updates are required for update.");
        throw new Error("Invalid input: studentId and updates are required for update.");
      }
      
      const payload = convertToSnakeCase(toMySQLStudent(updates));

      const columns = Object.keys(payload);
      const values = Object.values(payload);

      if (columns.length === 0) {
        // Nothing to update
        return false;
      }

      const setClause = columns.map(col => `${col} = ?`).join(", ");
      const sql = `
        UPDATE students
        SET ${setClause},
            updated_at = NOW()
        WHERE student_id = ?
      `;

      await db.query(sql, [...values, studentId]);
      return true;
    } catch (error) {
      logger.error(`Error updating student with ID: ${studentId}`, error);
      throw error;
    }
  }

  static async delete(studentId: MySQLUintID): Promise<boolean> {
    try {
      if (!studentId) {
        logger.error("No studentId provided to delete a student.");
        throw new Error("Invalid studentId in delete method.");
      }

      await db.query(
        `DELETE FROM students WHERE student_id = ?`,
        [studentId]
      );
      
      return true;
    } catch (error) {
      logger.error(`Error deleting student with ID: ${studentId}`, error);
      throw error;
    }
  }
}
