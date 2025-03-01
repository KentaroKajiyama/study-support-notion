import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notionTemplate";
import * as subjectDB from "../../../const/problemDatabase";
import { propertyFromNotion, propertyToNotion } from "../../../utils/propertyHandler";
import { returnSubfieldColumns } from "../../../const/problemDatabase";

export class TopProblems {
  static async getTopProblems(databaseId){
    try {
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching topProblem list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        const topProblemId = item.id;
        const properties = item.properties;
        const subfieldName = propertyFromNotion(properties, '科目', 'status')
        const subfieldColumns = returnSubfieldColumns(subfieldName);
        return {
          topProblemId: topProblemId, 
          title: propertyFromNotion(properties, subfieldColumns.problemName.name, subfieldColumns.problemName.type), 
          subfield: subfieldName,
          answer: propertyFromNotion(properties, subfieldColumns.answer.name, subfieldColumns.answer.type), 
          understandingLevel: propertyFromNotion(properties, '理解度', 'status'), 
          isDifficult: propertyFromNotion(properties, '理解できない', 'checkbox'),
          area: propertyFromNotion(properties, subfieldColumns.area.name, subfieldColumns.area.type),
          section: propertyFromNotion(properties, subfieldColumns.section.name, subfieldColumns.section.type),
          subsection: propertyFromNotion(properties, subfieldColumns.subsection.name, subfieldColumns.subsection.type),
          optionLength: subfieldColumns.optionLength,
          option1: propertyFromNotion(properties, subfieldColumns.option1.name, subfieldColumns.option1.type),
          option2: propertyFromNotion(properties, subfieldColumns.option2.name, subfieldColumns.option2.type),
          option3: propertyFromNotion(properties, subfieldColumns.option3.name, subfieldColumns.option3.type),
          option4: propertyFromNotion(properties, subfieldColumns.option4.name, subfieldColumns.option4.type),
        }
      });
    } catch(error) {
      console.error("Failed to fetch topProblem list:", error.message);
      return [];
    }
  };
  static async createTopProblems(databaseId, topProblemList) {
    try {
      const promises = topProblemList.map(async (topProblem) => {
        try {
          const subfieldName = topProblem.subfield;
          const subfieldColumns = returnSubfieldColumns(subfieldName);
          const propertiesNode = []
          propertiesNode.push({ propertyName: subfieldColumns.problemName.name, propertyContent: topProblem.title, propertyType: 'title' });
          propertiesNode.push({ propertyName: subfieldColumns.answer.name, propertyContent: topProblem.answer, propertyType: subfieldColumns.answer.type });
          propertiesNode.push({ propertyName: '理解度', propertyContent: topProblem.understandingLevel, propertyType: 'status'});
          propertiesNode.push({ propertyName: '理解できない', propertyContent: topProblem.isDifficult, propertyType: 'checkbox' });
          propertiesNode.push({ propertyName: subfieldColumns.area.name, propertyContent: topProblem.area, propertyType: subfieldColumns.area.type });
          propertiesNode.push({ propertyName: subfieldColumns.section.name, propertyContent: topProblem.section, propertyType: subfieldColumns.section.type });
          propertiesNode.push({ propertyName: subfieldColumns.subsection.name, propertyContent: topProblem.subsection, propertyType: subfieldColumns.subsection.type });
          subfieldColumns.optionLength;
          for (let i = 1; i <= optionLengthObj.length;i++){
            const optionNum = `option${i}`;
            propertiesNode.push({ propertyName: subfieldColumns[optionNum].name, propertyContent: topProblem.option1, propertyType: subfieldColumns[optionNum].type });
          };
          const propertiesObj = propertiesNode.map(propertyNode => propertyToNotion(propertyNode));

          // Build the JSON for properties by combining each property's JSON string.
          const propertiesJSON = _.Properties.getJSON(propertiesObj);

          // Build the parent JSON (assuming your type is 'database_id' if you're creating pages in a database)
          const parentJSON = _.Parent.getJSON('database_id', databaseId);

          // topProblem: Add icon and cover if needed
          // e.g. const iconJSON = _.Icon.getJSON('emoji', '🐱');
          // or cover

          // Call your Notion API method to create a page.
          // The exact signature depends on your `notionAPI.createAPage` method.
          // Typically it might look like:
          // const response = await notionAPI.createAPage(parentJSON, propertiesJSON);
          // So ensure your `createAPage` can handle these JSON strings.

          const response = await notionAPI.createAPage(parentJSON, propertiesJSON);

          if (response.status !== 200) {
            throw new Error(`Failed to create topProblem "${title}"`);
          }
          return response;
        } catch (error) {
          console.error(`Error creating topProblem "${topProblem.title}":`, error.message);
          return null;
        }
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to create topProblem list:", error.message);
    }
  }

  /**
   * Updates a specific to-do in Notion by ID.
   * @static
   * @param {string} topProblemId - The ID of the to-do page in Notion.
   * @param {Object} topProblem - The updated to-do data.
   * @returns {Promise<Object|null>}
   */
  static async updateATopProblemStatusById(topProblemId, topProblem) {
    try {
      // Build the JSON for properties by combining each property's JSON string.
      const propertiesJSON = _.Properties.getJSON(
        _.Status.getJSON("理解度", topProblem.understanding_level),
        _.Checkbox.getJSON("理解できない", topProblem.isDifficult)
      );

      // Call your Notion API method to update the page.
      // e.g. const response = await notionAPI.updateAPage(topProblemId, propertiesJSON);
      const response = await notionAPI.updateAPage(topProblemId, propertiesJSON);

      if (response.status !== 200) {
        throw new Error(`Failed to update topProblem "${topProblem.title}"`);
      }
      return response;
    } catch (error) {
      console.error(`Error updating topProblem "${topProblem.title}":`, error.message);
      return null;
    }
  }
  
  static async deleteATopProblemById(topProblemId){
    try{
      const response = await notionAPI.deleteAPage(topProblemId);
      if (response.status!== 200){
        throw new Error(`Failed to delete topProblem "${topProblemId}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error deleting topProblem "${topProblemId}":`, error.message);
    }
  }
}