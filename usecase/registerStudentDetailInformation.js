import { StudentDetailInformation } from '../../infrastructure/notion_database/coach/StudentDetailInformation.js';
import { Students } from "../../infrastructure/aws_database/Students.js";
import convertToSnakeCase from "../../utils/lodash.js";
import { sendBlockDefault } from '../domain/coach/distributionToCoach.js';
import { studentInfoDetail } from "../../const/notionDatabaseColumns.js";
import { Subjects } from '../../infrastructure/aws_database/Subjects.js';
import logger from '../utils/logger.js';
import NotionAPI from '../infrastructure/notionAPI.js'
import { studentsOverviewsColumns } from '../const/notionDatabaseColumns.js';
import { propertyFromNotion, propertyToNotion } from '../utils/propertyHandler.js';
import { Properties } from '../const/notionTemplate.js';
import { StudentSubjectInformation } from '../../infrastructure/aws_database/StudentSubjectInformation.js';

export async function registerStudentDetailInfo(studentId) {
  try {
    const studentDetailInfo = await Students.findForDetailRegistrationByStudentId(studentId)[0];
    const infoDetailDatabaseId = studentDetailInfo.student_detail_info_db_id;
    const studentOverviewPageId = studentDetailInfo.student_overview_page_id;
    const planDatabaseId = studentDetailInfo.coach_plan_db_id;
    const irregularDatabaseId = studentDetailInfo.coach_irregular_db_id;
    const studentInfoNotion = await StudentDetailInformation.getAStudentDetailInformation(infoDetailDatabaseId)[0];
    const subjectsInfo = await Subjects.findAllSubjectNames().map(row => {
        return {
          subjectId: row.subject_id,
          subjectName: row.subject_name,
        }
      }
    );
    const changedSubjects = [];
    for (const subjectInfo of subjectsInfo) {
      const subjectId = subjectInfo.subject_id;
      const subjectName = subjectInfo.subject_name;
      const coachInfo = studentInfoNotion.find(info => info.subject === subjectName);
      if (coachInfo && coachInfo[`${subjectName}${studentInfoDetail.subfieldModification}`] === '変更あり') {
        changedSubjects.push({
          subjectId: subjectId,
          subjectName: subjectName
        });
      }
    }
    if (changedSubjects.length === 0) {
      const updateInfo = {
        studentId: studentId,
        studentName: studentInfoNotion[studentInfoDetail.studentName],
        parentName: studentInfoNotion[studentInfoDetail.parentName],
        parentEmail: studentInfoNotion[studentInfoDetail.parentEmail],
        parentPhone: studentInfoNotion[studentInfoDetail.parentPhone],
        goal: studentInfoNotion[studentInfoDetail.goal]
      }
      const existingData = await Students.findByStudentId(studentId);
      if (existingData.length === 0) {
        await Students.create(convertToSnakeCase(updateInfo));
      } else {
        await Students.update(studentId, convertToSnakeCase(updateInfo));
      }
    } else {
      const updateInfo = {
        studentId: studentId,
        studentName: studentInfoNotion[studentInfoDetail.studentName],
        parentName: studentInfoNotion[studentInfoDetail.parentName],
        parentEmail: studentInfoNotion[studentInfoDetail.parentEmail],
        parentPhone: studentInfoNotion[studentInfoDetail.parentPhone],
        goal: studentInfoNotion[studentInfoDetail.goal]
      };
      const updateStudentSubjectList = [];
      for (const subjectInfo of changedSubjects) {
        updateStudentSubjectList.push({
          subjectId: subjectInfo.subjectId,
          subfieldLevel: studentInfoNotion[`${subjectName}${studentInfoDetail.subfieldLevel}`],
          subfieldGoal: studentInfoNotion[`${subjectName}${studentInfoDetail.subfieldGoal}`],
          subfieldGoalLevel: studentInfoNotion[`${subjectName}${studentInfoDetail.subfieldGoalLevel}`]
        })
      };
      const promises = [];
      promises.push(async () => {
        const existingData = await Students.findByStudentId(studentId);
        if (existingData.length === 0) {
          await Students.create(convertToSnakeCase(updateInfo));
        } else {
          await Students.update(studentId, convertToSnakeCase(updateInfo));
        }
      });
      const studentSubjectList = await StudentSubjectInformation.findByStudentId(studentId);
      promises.push(async () => {
        for (const updateStudentSubjectInfo of updateStudentSubjectList) {
          const existingObject = studentSubjectList.find(e => e.subject_id === updateStudentSubjectInfo.subjectId);
          if (existingObject !== undefined) {
            const updateData = {
              subjectLevel: updateStudentSubjectInfo.subjectLevel
            };
            await StudentSubjectInformation.update(existingObject.student_subject_information_id, convertToSnakeCase(updateData));
          } else {
            const newData = {
              studentId: studentId,
              subjectId: updateStudentSubjectInfo.subjectId,
              subjectLevel: updateStudentSubjectInfo.subjectLevel,
              goalDescription: updateStudentSubjectInfo.subfieldGoal,
              goalLevel: updateStudentSubjectInfo.subfieldGoalLevel,
            };
            await StudentSubjectInformation.create(convertToSnakeCase(newData));
          }
        }
      });
      // Distribute the new default blocks to the coach plan db for each updated subfield.
      // TODO: In this implementation, we have only one simple update operation. This enables us to distribute blocks only in the default manner.
      // TODO: This implementation should be more flexible. You should implement modification version of this. Not only the scrap & build version.
      const defaultBlocksPromises = changedSubjects.map(async subjectInfo => {
        const subfieldData = await Subjects.findSubfieldAndSubjectBySubjectName(subjectInfo.subjectName);
        const subjectLevel = await StudentSubjectInformation.findByCompositeKey(studentId, subjectInfo.subjectId)
        const subfieldIds = subfieldData.map(data => data.subfield_id);
        await Promise.all(subfieldIds.map(async subfieldId => {
          await sendBlockDefault(studentId, planDatabaseId, irregularDatabaseId, subfieldId, subjectLevel);
        }));
      })
      await Promise.all(...promises, ...defaultBlocksPromises);
      // Update the student overview info
      const response = await NotionAPI.retrieveAPage(studentOverviewPageId);
      const existingModifiedSubfieldNames = propertyFromNotion({
        propertiesArray: response.properties,
        propertyName: studentsOverviewsColumns.planModifiedSubfieldNames.name,
        propertyType: studentsOverviewsColumns.planModifiedSubfieldNames.type
      });
      const updatedModifiedSubfieldNames = [...new Set([...existingModifiedSubfieldNames,...changedSubjects])];
      await NotionAPI.updatePageProperties(studentOverviewPageId, Properties([
        propertyToNotion({
          propertyName: studentsOverviewsColumns.planModifiedSubfieldNames.name,
          propertyContent: updatedModifiedSubfieldNames,
          propertyType: studentsOverviewsColumns.planModifiedSubfieldNames.type
        }),
        propertyToNotion({
          propertyName: studentsOverviewsColumns.planStatus.name,
          propertyContent: studentsOverviewsColumns.planStatus.uncompleted,
          propertyType: studentsOverviewsColumns.planStatus.type
        })
      ]))
    };
  } catch (error) {
    logger.error('Error in registerStudentDetailInfo', error.message);
    throw error;
  }
};

