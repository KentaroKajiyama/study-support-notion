import NotionAPI from "../../notionAPI";
import * as _ from "../../../const/notionTemplate";
import { propertyFromNotion, propertyToNotion } from "../../../utils/propertyHandler";
import { returnSubfieldProperties } from "../../../const/problemDatabase";
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
        const subfieldProperties = returnSubfieldProperties(subfieldName);
        return {
          topProblemPageId: topProblemPageId, 
          title: propertyFromNotion(properties, subfieldProperties.problemName.name, subfieldProperties.problemName.type), 
          subfieldName: subfieldName,
          answer: propertyFromNotion(properties, subfieldProperties.answer.name, subfieldProperties.answer.type), 
          ansStatus: propertyFromNotion(properties, probAnalysis.ansStatus.name, probAnalysis.ansStatus.type), 
          isDifficult: propertyFromNotion(properties, probAnalysis.isDifficult.name, probAnalysis.isDifficult.type),
          reviewLevel: propertyFromNotion(properties, probAnalysis.reviewLevel.name, probAnalysis.reviewLevel.type),
          area: propertyFromNotion(properties, subfieldProperties.area.name, subfieldProperties.area.type),
          section: propertyFromNotion(properties, subfieldProperties.section.name, subfieldProperties.section.type),
          subsection: propertyFromNotion(properties, subfieldProperties.subsection.name, subfieldProperties.subsection.type),
          optionLength: subfieldProperties.optionLength,
          option1: propertyFromNotion(properties, subfieldProperties.option1.name, subfieldProperties.option1.type),
          option2: propertyFromNotion(properties, subfieldProperties.option2.name, subfieldProperties.option2.type),
          option3: propertyFromNotion(properties, subfieldProperties.option3.name, subfieldProperties.option3.type),
          option4: propertyFromNotion(properties, subfieldProperties.option4.name, subfieldProperties.option4.type),
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
      const subfieldProperties = returnSubfieldProperties(subfieldName);
      return {
        topProblemPageId: topProblemPageId, 
        title: propertyFromNotion(properties, subfieldProperties.problemName.name, subfieldProperties.problemName.type), 
        subfieldName: subfieldName,
        answer: propertyFromNotion(properties, subfieldProperties.answer.name, subfieldProperties.answer.type), 
        ansStatus: propertyFromNotion(properties, probAnalysis.ansStatus.name, probAnalysis.ansStatus.type), 
        isDifficult: propertyFromNotion(properties, probAnalysis.isDifficult.name, probAnalysis.isDifficult.type),
        reviewLevel: propertyFromNotion(properties, probAnalysis.reviewLevel.name, probAnalysis.reviewLevel.type),
        area: propertyFromNotion(properties, subfieldProperties.area.name, subfieldProperties.area.type),
        section: propertyFromNotion(properties, subfieldProperties.section.name, subfieldProperties.section.type),
        subsection: propertyFromNotion(properties, subfieldProperties.subsection.name, subfieldProperties.subsection.type),
        optionLength: subfieldProperties.optionLength,
        option1: propertyFromNotion(properties, subfieldProperties.option1.name, subfieldProperties.option1.type),
        option2: propertyFromNotion(properties, subfieldProperties.option2.name, subfieldProperties.option2.type),
        option3: propertyFromNotion(properties, subfieldProperties.option3.name, subfieldProperties.option3.type),
        option4: propertyFromNotion(properties, subfieldProperties.option4.name, subfieldProperties.option4.type),
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
          const subfieldProperties = returnSubfieldProperties(topProblem.subfieldName);
          const propertiesNode = []
          propertiesNode.push({ propertyName: subfieldProperties.problemName.name, propertyContent: topProblem.problemName, propertyType: subfieldProperties.problemName.type });
          propertiesNode.push({ propertyName: subfieldProperties.answer.name, propertyContent: topProblem.answer, propertyType: subfieldProperties.answer.type });
          propertiesNode.push({ propertyName: probAnalysis.ansStatus.name, propertyContent: topProblem.ansStatus, propertyType: probAnalysis.ansStatus.type });
          propertiesNode.push({ propertyName: probAnalysis.isDifficult.name, propertyContent: topProblem.isDifficult, propertyType: probAnalysis.isDifficult.type });
          propertiesNode.push({ propertyName: probAnalysis.reviewLevel.name, propertyContent: topProblem.reviewLevel, propertyType: probAnalysis.reviewLevel.type })
          propertiesNode.push({ propertyName: subfieldProperties.area.name, propertyContent: topProblem.area, propertyType: subfieldProperties.area.type });
          propertiesNode.push({ propertyName: subfieldProperties.section.name, propertyContent: topProblem.section, propertyType: subfieldProperties.section.type });
          propertiesNode.push({ propertyName: subfieldProperties.subsection.name, propertyContent: topProblem.subsection, propertyType: subfieldProperties.subsection.type });
          for (let i = 1; i <= subfieldProperties.optionLength;i++){
            const optionNum = `option${i}`;
            propertiesNode.push({ propertyName: subfieldProperties[optionNum].name, propertyContent: topProblem[optionNum], propertyType: subfieldProperties[optionNum].type });
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