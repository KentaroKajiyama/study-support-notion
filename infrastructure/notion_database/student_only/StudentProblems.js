import NotionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { propertyFromNotion, propertyToNotion } from "../../../utils/propertyHandler";
import logger from "../../../utils/logger";
import { returnSubfieldProperties } from "../../../const/problemDatabase";
import { probAnalysis } from "../../../const/problemAnalysis";

export class StudentProblemsNotion {
  static async getStudentProblems(databaseId, subfieldName) {
    try {
      const response = await NotionAPI.queryADatabase(databaseId);
      if (response.status!== 200) {
        throw new Error(`Failed to fetch data from Notion. Status code: ${response.status}`);
      }
      const subfieldProperties = returnSubfieldProperties(subfieldName);
      return response.results.map(result => {
        const problemObj = {
          problemId: response.id,
          problemName: propertyFromNotion(response.properties, subfieldProperties.problemName.name, subfieldProperties.problemName.type),
          area: propertyFromNotion(response.properties, subfieldProperties.area.name, subfieldProperties.area.type),
          answer: propertyFromNotion(response.properties, subfieldProperties.answer.name, subfieldProperties.answer.type),
          section: propertyFromNotion(response.properties, subfieldProperties.section.name, subfieldProperties.section.type),
          subsection: propertyFromNotion(response.properties, subfieldProperties.subsection.name, subfieldProperties.subsection.type),
          optionLength: subfieldProperties.optionLength,
          answerStatus: propertyFromNotion(response.properties, probAnalysis.ansStatus.name, probAnalysis.ansStatus.type),
          isDifficult: propertyFromNotion(response.properties, probAnalysis.isDifficult.name, probAnalysis.isDifficult.type),
          understandingLevel: propertyFromNotion(response.properties, probAnalysis.understandingLevel.name, probAnalysis.understandingLevel.type),
          tryNumber: propertyFromNotion(response.properties, probAnalysis.tryNumber.name, probAnalysis.tryNumber.type),
          wrongCount: propertyFromNotion(response.properties, probAnalysis.wrongCount.name, probAnalysis.wrongCount.type),
          reviewLevel: propertyFromNotion(response.properties, probAnalysis.reviewLevel.name, probAnalysis.reviewLevel.type),
          blockName: propertyFromNotion(response.properties, 'ブロック名', 'select')
        };
        for (let i = 1; i <= subfieldProperties.optionLength; i++) {
          problemObj[`problemOption${i}`] = propertyFromNotion(response.properties, optionName, subfieldProperties[`option${i}`].type);
        };
        return problemObj;
      })
    } catch (error) {
      logger.error("Error fetching student problems from Notion:", error.message);
    }
  };
  static async getAStudentProblem(studentProblemPageId) {
    try {
      const response = await NotionAPI.retrieveAPage(studentProblemPageId);
      if (response.status!== 200) {
        throw new Error(`Failed to fetch data from Notion. Status code: ${response.status}`);
      }
      const subfieldProperties = returnSubfieldProperties(subfieldName);
      const problemObj = {
        problemId: response.id,
        problemName: propertyFromNotion(response.properties, subfieldProperties.problemName.name, subfieldProperties.problemName.type),
        area: propertyFromNotion(response.properties, subfieldProperties.area.name, subfieldProperties.area.type),
        answer: propertyFromNotion(response.properties, subfieldProperties.answer.name, subfieldProperties.answer.type),
        section: propertyFromNotion(response.properties, subfieldProperties.section.name, subfieldProperties.section.type),
        subsection: propertyFromNotion(response.properties, subfieldProperties.subsection.name, subfieldProperties.subsection.type),
        optionLength: subfieldProperties.optionLength,
        answerStatus: propertyFromNotion(response.properties, probAnalysis.ansStatus.name, probAnalysis.ansStatus.type),
        isDifficult: propertyFromNotion(response.properties, probAnalysis.isDifficult.name, probAnalysis.isDifficult.type),
        understandingLevel: propertyFromNotion(response.properties, probAnalysis.understandingLevel.name, probAnalysis.understandingLevel.type),
        tryNumber: propertyFromNotion(response.properties, probAnalysis.tryNumber.name, probAnalysis.tryNumber.type),
        wrongCount: propertyFromNotion(response.properties, probAnalysis.wrongCount.name, probAnalysis.wrongCount.type),
        reviewLevel: propertyFromNotion(response.properties, probAnalysis.reviewLevel.name, probAnalysis.reviewLevel.type),
        blockName: propertyFromNotion(response.properties, 'ブロック名', 'select')
      };
      for (let i = 1; i <= subfieldProperties.optionLength; i++) {
        problemObj[`problemOption${i}`] = propertyFromNotion(response.properties, optionName, subfieldProperties[`option${i}`].type);
      };
      return problemObj;
    } catch (error) {
      logger.error("Error fetching student problem from Notion:", error.message);
    }
  }
  // TODO: Copy page content?
  static async createStudentProblems(databaseId, subfieldName, problemObjs) {
    try {
      const subfieldProperties = returnSubfieldProperties(subfieldName);
      const promises = problemObjs.map(async problemObj => {
        const propertiesObjs = Object.keys(problemObj).map(key => {
          switch (key) {
            case 'problemName':
              return propertyToNotion({
                propertyName: subfieldProperties.problemName.name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties.problemName.type
              });
            case 'area':
              return propertyToNotion({
                propertyName: subfieldProperties.area.name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties.area.type
              });
            case 'answer':
              return propertyToNotion({
                propertyName: subfieldProperties.answer.name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties.answer.type
              });
            case 'section':
              return propertyToNotion({
                propertyName: subfieldProperties.section.name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties.section.type
              });
            case 'subsection':
              return propertyToNotion({
                propertyName: subfieldProperties.subsection.name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties.subsection.type
              });
            case 'optionLength':
              return null;
            case 'problemOption1':
              return propertyToNotion({
                propertyName: subfieldProperties[`option1`].name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties[`option1`].type
              });
            case 'problemOption2':
              return propertyToNotion({
                propertyName: subfieldProperties[`option2`].name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties[`option2`].type
              });
            case 'problemOption3':
              return propertyToNotion({
                propertyName: subfieldProperties[`option3`].name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties[`option3`].type
              });
            case 'problemOption4':
              return propertyToNotion({
                propertyName: subfieldProperties[`option4`].name,
                propertyContent: problemObj[key],
                propertyType: subfieldProperties[`option4`].type
              });
            case 'answerStatus':
              return propertyToNotion({
                propertyName: probAnalysis.ansStatus.name,
                propertyContent: problemObj[key],
                propertyType: probAnalysis.ansStatus.type
              });
            case 'isDifficult':
              return propertyToNotion({
                propertyName: probAnalysis.isDifficult.name,
                propertyContent: problemObj[key],
                propertyType: probAnalysis.isDifficult.type
              });
            case 'understandingLevel':
              return propertyToNotion({
                propertyName: probAnalysis.understandingLevel.name,
                propertyContent: problemObj[key],
                propertyType: probAnalysis.understandingLevel.type
              });
            case 'tryNumber':
              return propertyToNotion({
                propertyName: probAnalysis.tryNumber.name,
                propertyContent: problemObj[key],
                propertyType: probAnalysis.tryNumber.type
              });
            case 'wrongCount':
              return propertyToNotion({
                propertyName: probAnalysis.wrongCount.name,
                propertyContent: problemObj[key],
                propertyType: probAnalysis.wrongCount.type
              });
            case 'reviewLevel':
              return propertyToNotion({
                propertyName: probAnalysis.reviewLevel.name,
                propertyContent: problemObj[key],
                propertyType: probAnalysis.reviewLevel.type
              });
            case 'blockName':
              return propertyToNotion({
                propertyName: 'ブロック名',
                propertyContent: problemObj[key],
                propertyType:'select'
              });
            default:
              return null;
          }
        });
        const response = await NotionAPI.createAPage(databaseId, propertiesObjs.filter(item => item !== null));
        if (response.status!== 200) {
          throw new Error(`Failed to create student problem "${problemObj.problemName}"`);
        };
      })
      Promise.all(promises);
    } catch (error) {
      logger.error("Error creating student problems in Notion:", error.message);
    }
  };
  static async updateAStudentProblem(problemId, subfieldName, problemObj) {
    try {
      const subfieldProperties = returnSubfieldProperties(subfieldName);
      const propertiesObjs = Object.keys(problemObj).map(key => {
        switch (key) {
          case 'problemName':
            return propertyToNotion({
              propertyName: subfieldProperties.problemName.name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties.problemName.type
            });
          case 'area':
            return propertyToNotion({
              propertyName: subfieldProperties.area.name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties.area.type
            });
          case 'answer':
            return propertyToNotion({
              propertyName: subfieldProperties.answer.name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties.answer.type
            });
          case 'section':
            return propertyToNotion({
              propertyName: subfieldProperties.section.name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties.section.type
            });
          case 'subsection':
            return propertyToNotion({
              propertyName: subfieldProperties.subsection.name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties.subsection.type
            });
          case 'optionLength':
            return null;
          case 'problemOption1':
            return propertyToNotion({
              propertyName: subfieldProperties[`option1`].name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties[`option1`].type
            });
          case 'problemOption2':
            return propertyToNotion({
              propertyName: subfieldProperties[`option2`].name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties[`option2`].type
            });
          case 'problemOption3':
            return propertyToNotion({
              propertyName: subfieldProperties[`option3`].name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties[`option3`].type
            });
          case 'problemOption4':
            return propertyToNotion({
              propertyName: subfieldProperties[`option4`].name,
              propertyContent: problemObj[key],
              propertyType: subfieldProperties[`option4`].type
            });
          case 'answerStatus':
            return propertyToNotion({
              propertyName: probAnalysis.ansStatus.name,
              propertyContent: problemObj[key],
              propertyType: probAnalysis.ansStatus.type
            });
          case 'isDifficult':
            return propertyToNotion({
              propertyName: probAnalysis.isDifficult.name,
              propertyContent: problemObj[key],
              propertyType: probAnalysis.isDifficult.type
            });
          case 'understandingLevel':
            return propertyToNotion({
              propertyName: probAnalysis.understandingLevel.name,
              propertyContent: problemObj[key],
              propertyType: probAnalysis.understandingLevel.type
            });
          case 'tryNumber':
            return propertyToNotion({
              propertyName: probAnalysis.tryNumber.name,
              propertyContent: problemObj[key],
              propertyType: probAnalysis.tryNumber.type
            });
          case 'wrongCount':
            return propertyToNotion({
              propertyName: probAnalysis.wrongCount.name,
              propertyContent: problemObj[key],
              propertyType: probAnalysis.wrongCount.type
            });
          case 'reviewLevel':
            return propertyToNotion({
              propertyName: probAnalysis.reviewLevel.name,
              propertyContent: problemObj[key],
              propertyType: probAnalysis.reviewLevel.type
            });
          case 'blockName':
            return propertyToNotion({
              propertyName: 'ブロック名',
              propertyContent: problemObj[key],
              propertyType:'select'
            });
          default:
            return null;
        }
      });
      const response = await NotionAPI.updateAPage(problemId, propertiesObjs.filter(item => item !== null));
      if (response.status!== 200) {
        throw new Error(`Failed to create student problem "${problemObj.problemName}"`);
      };
    } catch (error) {
      logger.error("Error updating student problem in Notion:", error.message);
    }
  };
  static async deleteAStudentProblem(problemId) {
    try {
      const response = await NotionAPI.deleteAPage(problemId);
      if (response.status!== 200) {
        throw new Error(`Failed to delete student problem "${problemId}"`);
      }
    } catch (error) {
      logger.error("Error deleting student problem in Notion:", error.message);
    }
  };
}