import NotionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { propertyFromNotion, propertyToNotion } from "../../../utils/propertyHandler";
import logger from "../../../utils/logger";

export class StudentsOverviews {
  static async getStudentsOverviews(databaseId){
    try {
      const response = await NotionAPI.queryADatabase(databaseId);
      if (response.status!== 200){
        throw new Error(`Failed to fetch data from Notion. Status code: ${response.status}`);
      }
      return response.results.map(result => {
        return {
          studentOverviewId: result.id,
          studentName: propertyFromNotion(result.properties, '氏名', 'title'),
          lineName: propertyFromNotion(result.properties, 'LINE名前', 'rich_text'),
          alertSubfields: propertyFromNotion(result.properties, 'アラート科目', 'multi_select'),
          chatStatus: propertyFromNotion(result.properties, 'チャット', 'status')
        }
      });
    } catch (error) {
      logger.error(`Error fetching students overviews: ${error}`);
      throw error;
    }
  };
  
  static async createStudentsOverviews(databaseId, studentsOverviewsList){
    try {
      const promises = studentsOverviewsList.map(async studentsOverview => {
        const properties = _.Properties.getJSON(
          propertyToNotion({ propertyName: '氏名', propertyContent: studentsOverview.studentName, propertyType: 'title'}),
          propertyToNotion({ propertyName: 'LINE名前', propertyContent: studentsOverview.lineName, propertyType: 'rich_text'}),
          propertyToNotion({ propertyName: 'アラート科目', propertyContent: studentsOverview.alertSubfields, propertyType:'multi_select'}),
          propertyToNotion({ propertyName: 'チャット', propertyContent: studentsOverview.chatStatus, propertyType:'status'})
        );
        const response = await NotionAPI.createAPage(databaseId, properties);
        if(response.status!== 200){
          throw new Error(`Failed to create students overview for "${studentsOverview.studentName}"`);
        }
      })
      Promise.all(promises);
    } catch (error) {
      logger.error(`Error creating students overviews: ${error}`);
      throw error;
    }
  };
  static async updateAStudentsOverview(studentOverviewId, studentsOverview){
    try {
      const properties = _.Properties.getJSON(
        propertyToNotion({ propertyName: '氏名', propertyContent: studentsOverview.studentName, propertyType: 'title'}),
        propertyToNotion({ propertyName: 'LINE名前', propertyContent: studentsOverview.lineName, propertyType: 'rich_text'}),
        propertyToNotion({ propertyName: 'アラート科目', propertyContent: studentsOverview.alertSubfields, propertyType:'multi_select'}),
        propertyToNotion({ propertyName: 'チャット', propertyContent: studentsOverview.chatStatus, propertyType:'status'})
      );
      const response = await NotionAPI.updateAPage(studentOverviewId, properties);
      if(response.status!== 200){
        throw new Error(`Failed to create students overview for "${studentsOverview.studentName}"`);
      }
    } catch (error) {
      logger.error(`Error updating students overviews: ${error}`);
      throw error;
    }
  };
  static async deleteStudnedOverview(studentOverviewId){
    try{
      const response = await NotionAPI.deleteAPage(studentOverviewId);
      if (response.status!== 200) {
        throw new Error(`Failed to delete students overview "${studentOverviewId}"`);
      }
    } catch(error) {
      logger.error(`Error deleting students overview: ${error}`);
      throw error;
    }
  }
}