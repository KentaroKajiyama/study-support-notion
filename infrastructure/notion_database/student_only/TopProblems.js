import NotionAPI from "../../notionAPI";
import * as _ from "../../../const/notionTemplate";
import { propertyFromNotion, propertyToNotion } from "../../../utils/propertyHandler";
import { returnSubfieldColumns } from "../../../const/problemDatabase";
import { probAnalysis } from "../../../const/problemAnalysis";
import logger from "../../../utils/logger";

export class TopProblems {
  static async getTopProblems(databaseId){
    try {
      const response = await NotionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching topProblem list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        const topProblemPageId = item.id;
        const properties = item.properties;
        const subfieldName = propertyFromNotion(properties, '科目', 'status')
        const subfieldColumns = returnSubfieldColumns(subfieldName);
        return {
          topProblemPageId: topProblemPageId, 
          title: propertyFromNotion(properties, subfieldColumns.problemName.name, subfieldColumns.problemName.type), 
          subfieldName: subfieldName,
          answer: propertyFromNotion(properties, subfieldColumns.answer.name, subfieldColumns.answer.type), 
          ansStatus: propertyFromNotion(properties, probAnalysis.ansStatus.name, probAnalysis.ansStatus.type), 
          isDifficult: propertyFromNotion(properties, probAnalysis.isDifficult.name, probAnalysis.isDifficult.type),
          reviewLevel: propertyFromNotion(properties, probAnalysis.reviewLevel.name, probAnalysis.reviewLevel.type),
          area: propertyFromNotion(properties, subfieldColumns.area.name, subfieldColumns.area.type),
          section: propertyFromNotion(properties, subfieldColumns.section.name, subfieldColumns.section.type),
          subsection: propertyFromNotion(properties, subfieldColumns.subsection.name, subfieldColumns.subsection.type),
          optionLength: subfieldColumns.optionLength,
          option1: propertyFromNotion(properties, subfieldColumns.option1.name, subfieldColumns.option1.type),
          option2: propertyFromNotion(properties, subfieldColumns.option2.name, subfieldColumns.option2.type),
          option3: propertyFromNotion(properties, subfieldColumns.option3.name, subfieldColumns.option3.type),
          option4: propertyFromNotion(properties, subfieldColumns.option4.name, subfieldColumns.option4.type),
          notionPageId: propertyFromNotion(properties, probAnalysis.probId.name, probAnalysis.probId.type)
        }
      });
    } catch(error) {
      logger.error("Failed to fetch topProblem list:", error.message);
      return [];
    }
  };
  static async getATopPageProblem(topProblemPageId){
    try {
      const response = await NotionAPI.retrieveAPage(topProblemPageId);
      if (response.status !== 200){
        throw new Error(`Error fetching topProblem list from Notion: ${response.statusText}`);
      }
      const properties = response.properties;
      const subfieldName = propertyFromNotion(properties, '科目', 'status');
      const subfieldColumns = returnSubfieldColumns(subfieldName);
      return {
        topProblemPageId: topProblemPageId, 
        title: propertyFromNotion(properties, subfieldColumns.problemName.name, subfieldColumns.problemName.type), 
        subfieldName: subfieldName,
        answer: propertyFromNotion(properties, subfieldColumns.answer.name, subfieldColumns.answer.type), 
        ansStatus: propertyFromNotion(properties, probAnalysis.ansStatus.name, probAnalysis.ansStatus.type), 
        isDifficult: propertyFromNotion(properties, probAnalysis.isDifficult.name, probAnalysis.isDifficult.type),
        reviewLevel: propertyFromNotion(properties, probAnalysis.reviewLevel.name, probAnalysis.reviewLevel.type),
        area: propertyFromNotion(properties, subfieldColumns.area.name, subfieldColumns.area.type),
        section: propertyFromNotion(properties, subfieldColumns.section.name, subfieldColumns.section.type),
        subsection: propertyFromNotion(properties, subfieldColumns.subsection.name, subfieldColumns.subsection.type),
        optionLength: subfieldColumns.optionLength,
        option1: propertyFromNotion(properties, subfieldColumns.option1.name, subfieldColumns.option1.type),
        option2: propertyFromNotion(properties, subfieldColumns.option2.name, subfieldColumns.option2.type),
        option3: propertyFromNotion(properties, subfieldColumns.option3.name, subfieldColumns.option3.type),
        option4: propertyFromNotion(properties, subfieldColumns.option4.name, subfieldColumns.option4.type),
        notionPageId: propertyFromNotion(properties, probAnalysis.probId.name, probAnalysis.probId.type)
      };
    } catch(error) {
      logger.error("Failed to fetch topProblem list:", error.message);
      return null;
    }
  }
  static async createTopProblems(databaseId, topProblemList) {
    try {
      const promises = topProblemList.map(async (topProblem) => {
        try {
          const subfieldColumns = returnSubfieldColumns(topProblem.subfieldName);
          const propertiesNode = []
          propertiesNode.push({ propertyName: subfieldColumns.problemName.name, propertyContent: topProblem.problemName, propertyType: subfieldColumns.problemName.type });
          propertiesNode.push({ propertyName: subfieldColumns.answer.name, propertyContent: topProblem.answer, propertyType: subfieldColumns.answer.type });
          propertiesNode.push({ propertyName: probAnalysis.ansStatus.name, propertyContent: topProblem.ansStatus, propertyType: probAnalysis.ansStatus.type });
          propertiesNode.push({ propertyName: probAnalysis.isDifficult.name, propertyContent: topProblem.isDifficult, propertyType: probAnalysis.isDifficult.type });
          propertiesNode.push({ propertyName: probAnalysis.reviewLevel.name, propertyContent: topProblem.reviewLevel, propertyType: probAnalysis.reviewLevel.type })
          propertiesNode.push({ propertyName: subfieldColumns.area.name, propertyContent: topProblem.area, propertyType: subfieldColumns.area.type });
          propertiesNode.push({ propertyName: subfieldColumns.section.name, propertyContent: topProblem.section, propertyType: subfieldColumns.section.type });
          propertiesNode.push({ propertyName: subfieldColumns.subsection.name, propertyContent: topProblem.subsection, propertyType: subfieldColumns.subsection.type });
          for (let i = 1; i <= subfieldColumns.optionLength;i++){
            const optionNum = `option${i}`;
            propertiesNode.push({ propertyName: subfieldColumns[optionNum].name, propertyContent: topProblem[optionNum], propertyType: subfieldColumns[optionNum].type });
          };
          const propertiesObj = propertiesNode.map(propertyNode => propertyToNotion(propertyNode));
          // Build the JSON for properties by combining each property's JSON string.
          const propertiesJSON = _.Properties.getJSON(propertiesObj);
          // Build the parent JSON (assuming your type is 'database_id' if you're creating pages in a database)
          const parentJSON = _.Parent.getJSON('database_id', databaseId);
          // TODO:topProblem: Add icon and cover if needed
          // e.g. const iconJSON = _.Icon.getJSON('emoji', '🐱');
          // or cover
          const response = await NotionAPI.createAPage(parentJSON, propertiesJSON);
          if (response.status !== 200) {
            throw new Error(`Failed to create topProblem "${title}"`);
          }
        } catch (error) {
          logger.error(`Error creating topProblem "${topProblem.problemName}":`, error.message);
        }
      });
      await Promise.all(promises);
    } catch (error) {
      logger.error("Failed to create topProblem list:", error.message);
    }
  }
  
  static async updateATopProblemAnsStatusById(topProblemPageId, topProblem) {
    try {
      // Build the JSON for properties by combining each property's JSON string.
      const propertiesJSON = _.Properties.getJSON(
        propertyToNotion({
          propertyName: probAnalysis.ansStatus.name,
          propertyContent: topProblem.ansStatus,
          propertyType: probAnalysis.ansStatus.type
        }),
      );

      // Call your Notion API method to update the page.
      // e.g. const response = await NotionAPI.updateAPage(topProblemPageId, propertiesJSON);
      const response = await NotionAPI.updateAPage(topProblemPageId, propertiesJSON);

      if (response.status !== 200) {
        throw new Error(`Failed to update topProblem "${topProblem.problemName}"`);
      }
      return response;
    } catch (error) {
      logger.error(`Error updating topProblem "${topProblem.problemName}":`, error.message);
      return null;
    }
  }
  static async updateATopProblemIsDifficultById(topProblemPageId, topProblem) {
    try {
      // Build the JSON for properties by combining each property's JSON string.
      const propertiesJSON = _.Properties.getJSON(
        propertyToNotion({
          propertyName: probAnalysis.ansStatus.name,
          propertyContent: topProblem.isDifficult,
          propertyType: probAnalysis.ansStatus.type
        }),
      );

      // Call your Notion API method to update the page.
      // e.g. const response = await NotionAPI.updateAPage(topProblemPageId, propertiesJSON);
      const response = await NotionAPI.updateAPage(topProblemPageId, propertiesJSON);

      if (response.status !== 200) {
        throw new Error(`Failed to update topProblem "${topProblem.problemName}"`);
      }
      return response;
    } catch (error) {
      logger.error(`Error updating topProblem "${topProblem.problemName}":`, error.message);
      return null;
    }
  }

  static async updateATopProblemStatusById(topProblemPageId, topProblem) {
    try {
      // Build the JSON for properties by combining each property's JSON string.
      const propertiesJSON = _.Properties.getJSON(
        propertyToNotion({
          propertyName: probAnalysis.ansStatus.name,
          propertyContent: topProblem.ansStatus,
          propertyType: probAnalysis.ansStatus.type
        }),
        propertyToNotion({
          propertyName: probAnalysis.isDifficult.name,
          propertyContent: topProblem.isDifficult,
          propertyType: probAnalysis.isDifficult.type
        })
      );

      // Call your Notion API method to update the page.
      // e.g. const response = await NotionAPI.updateAPage(topProblemPageId, propertiesJSON);
      const response = await NotionAPI.updateAPage(topProblemPageId, propertiesJSON);

      if (response.status !== 200) {
        throw new Error(`Failed to update topProblem "${topProblem.problemName}"`);
      }
      return response;
    } catch (error) {
      logger.error(`Error updating topProblem "${topProblem.problemName}":`, error.message);
      return null;
    }
  }
  
  static async deleteATopProblemById(topProblemPageId){
    try{
      const response = await NotionAPI.deleteAPage(topProblemPageId);
      if (response.status!== 200){
        throw new Error(`Failed to delete topProblem "${topProblemPageId}"`);
      }
      return response;
    } catch(error) {
      logger.error(`Error deleting topProblem "${topProblemPageId}":`, error.message);
    }
  }
}