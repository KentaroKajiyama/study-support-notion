import {
  ensureValue, 
  logger
} from '@utils/index.js';
import { 
  MySQLUintID, 
  StudentSubjectInformationSubjectGoalLevelEnum, 
  StudentSubjectInformationSubjectLevelEnum, 
  SubfieldsSubfieldNameEnum, 
  SubjectsSubjectNameEnum
} from '@domain/types/index.js';
import {
  Students,
  Subjects,
  StudentSubjectInformationData,
} from '@infrastructure/mysql/index.js';
import { 
  NotionStudentDetailInformation,
  NotionStudentOverviews
} from '@infrastructure/notion/index.js';
import { 
  DomainStudentDetailInformation 
} from '@domain/coach/StudentDetailInformation.js';
import {
  sendBlockDefault
} from '@usecase/index.js';

export async function registerStudentDetailInfo(
  studentId: MySQLUintID
) {
  try {
    const studentDetailInfo = ensureValue(await Students.findForDetailRegistrationByStudentId(studentId));
    const infoDetailDatabaseId = ensureValue(studentDetailInfo.studentDetailInfoDbId);
    const studentOverviewPageId = ensureValue(studentDetailInfo.studentOverviewPageId);
    const planDatabaseId = ensureValue(studentDetailInfo.coachPlanDbId);
    const irregularDatabaseId = ensureValue(studentDetailInfo.coachIrregularDbId);
    const notionStudentDetailInformation = new NotionStudentDetailInformation();
    const studentInfoNotion = await notionStudentDetailInformation.queryADatabase(infoDetailDatabaseId)
                                .then((rows) => {
                                  if (rows.length === 0) {
                                    throw new Error (`There is no student detail information`);
                                  } else if (rows.length >= 2) {
                                    logger.warn("There is more than one student detail information")
                                    return rows[0];
                                  } else {
                                    return rows[0];
                                  }
                                });
    const subjectsInfo = (await Subjects.findAll()).map(row => {
        return {
          subjectId: row.subjectId,
          subjectName: row.subjectName,
        }
      }
    );
    const changedSubjects = [];
    for (const subjectInfo of subjectsInfo) {
      const subjectId = ensureValue(subjectInfo.subjectId);
      const subjectName = ensureValue(subjectInfo.subjectName);
      if (studentInfoNotion.levelModifiedSubjectNames?.includes(subjectName)) {
        changedSubjects.push({
          subjectId: subjectId,
          subjectName: subjectName
        });
      }
    }
    if (changedSubjects.length === 0) {
      const updateInfo = {
        studentId: studentId,
        studentName: studentInfoNotion.studentName,
        parentName: studentInfoNotion.parentName,
        parentEmail: studentInfoNotion.parentEmail,
        parentPhoneNumber: studentInfoNotion.parentPhoneNumber,
        goal: studentInfoNotion.goal,
        registeredSubjectNames: studentInfoNotion.registeredSubjectNames,
      }
      const existingData = await Students.findByStudentId(studentId);
      if (existingData === null) {
        await Students.create(updateInfo);
      } else {
        await Students.update(studentId, updateInfo);
      }
    } else {
      const updateInfo = {
        studentId: studentId,
        studentName: studentInfoNotion.studentName,
        parentName: studentInfoNotion.parentName,
        parentEmail: studentInfoNotion.parentEmail,
        parentPhoneNumber: studentInfoNotion.parentPhoneNumber,
        goal: studentInfoNotion.goal,
        registeredSubjectNames: studentInfoNotion.registeredSubjectNames,
        changedSubjects: [],
      };
      const updateStudentSubjectList: {
        subjectId: MySQLUintID;
        subjectLevel: StudentSubjectInformationSubjectLevelEnum;
        subjectGoal: string;
        subjectGoalLevel: StudentSubjectInformationSubjectGoalLevelEnum;
      }[] = [];
      for (const subjectInfo of changedSubjects) {
        const { subjectLevel, subjectGoal, subjectGoalLevel } = subjectInfoHelper(studentInfoNotion, subjectInfo.subjectName);
        updateStudentSubjectList.push({
          subjectId: subjectInfo.subjectId,
          subjectLevel: subjectLevel,
          subjectGoal: subjectGoal,
          subjectGoalLevel: subjectGoalLevel
        })
      };
      const promises = [];
      promises.push((async () => {
        const existingData = ensureValue(await Students.findByStudentId(studentId));
        if (existingData === null) {
          await Students.create(updateInfo);
        } else {
          await Students.update(studentId, updateInfo);
        }
      })());
      const studentSubjectList = await StudentSubjectInformationData.findByStudentId(studentId);
      promises.push((async () => {
        for (const updateStudentSubjectInfo of updateStudentSubjectList) {
          const existingObject = studentSubjectList.find(e => e.subjectId === updateStudentSubjectInfo.subjectId);
          if (existingObject !== undefined) {
            const updateData = {
              subjectLevel: updateStudentSubjectInfo.subjectLevel
            };
            await StudentSubjectInformationData.update(
              ensureValue(existingObject.studentSubjectInformationId), 
              updateData
            );
          } else {
            const newData = {
              studentId: studentId,
              subjectId: updateStudentSubjectInfo.subjectId,
              subjectLevel: updateStudentSubjectInfo.subjectLevel,
              goalDescription: updateStudentSubjectInfo.subjectGoal,
              goalLevel: updateStudentSubjectInfo.subjectGoalLevel,
            };
            await StudentSubjectInformationData.create(newData);
          }
        }
      })());
      // Distribute the new default blocks to the coach plan db for each updated subfield.
      // TODO: In this implementation, we have only one simple update operation. This enables us to distribute blocks only in the default manner.
      // TODO: This implementation should be more flexible. You should implement modification version of this. Not only the scrap & build version.
      const defaultBlocksPromises = changedSubjects.map(async subjectInfo => {
        const subfieldData = await Subjects.findSubfieldAndSubjectBySubjectName(subjectInfo.subjectName);
        const subjectLevel = ensureValue(
          ensureValue(await StudentSubjectInformationData.findByCompositeKey(studentId, subjectInfo.subjectId)).subjectLevel
        )
        const subfieldIds = subfieldData.map(data => data.subfieldId);
        await Promise.all(subfieldIds.map(async subfieldId => {
          await sendBlockDefault(studentId, planDatabaseId, irregularDatabaseId, subfieldId, subjectLevel);
        }));
      })
      await Promise.all([...promises, ...defaultBlocksPromises]);
      // Update the student overview info
      const notionStudentOverviews = new NotionStudentOverviews();
      // const domainStudentOverview = ensureValue(await notionStudentOverviews.retrieveAPage(studentOverviewPageId));
      // const existingModifiedSubfieldNames = domain;
      // const updatedModifiedSubfieldNames = [...new Set([...existingModifiedSubfieldNames,...changedSubjects])];
      await notionStudentOverviews.updatePageProperties(
        studentOverviewPageId,
        {
          planStatus: 'シミュレーション中',
        } 
      )
    };
  } catch (error) {
    logger.error('Error in registerStudentDetailInfo', error);
    throw error;
  }
};

function subjectInfoHelper(
  studentInfoNotion: DomainStudentDetailInformation, 
  subjectName: SubjectsSubjectNameEnum
): {
  subjectLevel: StudentSubjectInformationSubjectLevelEnum,
  subjectGoal: string,
  subjectGoalLevel: StudentSubjectInformationSubjectGoalLevelEnum
} {
  try {
    switch(subjectName) {
      case '国語':
        return {
          subjectLevel: ensureValue(studentInfoNotion.japaneseLevel),
          subjectGoal: ensureValue(studentInfoNotion.japaneseGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.japaneseGoalLevel)
        };
      case '数学':
        return {
          subjectLevel: ensureValue(studentInfoNotion.mathLevel),
          subjectGoal: ensureValue(studentInfoNotion.mathGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.mathGoalLevel)
        };
      case '英語':
        return {
          subjectLevel: ensureValue(studentInfoNotion.englishLevel),
          subjectGoal: ensureValue(studentInfoNotion.englishGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.englishGoalLevel)
        };
      case '物理':
        return {
          subjectLevel: ensureValue(studentInfoNotion.physicsLevel),
          subjectGoal: ensureValue(studentInfoNotion.physicsGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.physicsGoalLevel)
        };
      case '化学':
        return {
          subjectLevel: ensureValue(studentInfoNotion.chemistryLevel),
          subjectGoal: ensureValue(studentInfoNotion.chemistryGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.chemistryGoalLevel)
        };
      case '生物':
        return {
          subjectLevel: ensureValue(studentInfoNotion.biologyLevel),
          subjectGoal: ensureValue(studentInfoNotion.biologyGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.biologyGoalLevel)
        };
      case '日本史':
        return {
          subjectLevel: ensureValue(studentInfoNotion.japaneseHistoryLevel),
          subjectGoal: ensureValue(studentInfoNotion.japaneseHistoryGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.japaneseHistoryGoalLevel)
        };
      case '世界史':
        return {
          subjectLevel: ensureValue(studentInfoNotion.worldHistoryLevel),
          subjectGoal: ensureValue(studentInfoNotion.worldHistoryGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.worldHistoryGoalLevel)
        };
      case '地理':
        return {
          subjectLevel: ensureValue(studentInfoNotion.geographyLevel),
          subjectGoal: ensureValue(studentInfoNotion.geographyGoalDescription),
          subjectGoalLevel: ensureValue(studentInfoNotion.geographyGoalLevel)
        };
      default:
        throw new Error(`Invalid subject name: ${subjectName}`);
    }
  } catch (error) {
    logger.error('Error in subjectInfoHelper', error);
    throw error;
  }
}