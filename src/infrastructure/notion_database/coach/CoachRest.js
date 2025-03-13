import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convert_rich_text";

/**
 * @description
 * @date 21/02/2025
 * @export
 * @class coachRest
 */
export class CoachRest {
  /**
   * @description
   * @date 21/02/2025
   * @returns {*} 
   * @memberof coachRest
   */
  static async getCoachRests(databaseId){
    try {
      const response = notionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching coachRest list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        return {
          coachRestId: item.id, 
          title: richTextToInlineText(item.properties.title), 
          startDate: item.properties['開始日/終了日'].date.start,
          endDate: item.properties['開始日/終了日'].date.end,
          subject: item.properties['科目'].select.name,
        }
      });
    } catch(error) {
      console.error("Failed to fetch coachRest list:", error.message);
      return [];
    }
  };
  /**
   * @description
   * @date 21/02/2025
   * @memberof coachRest
   */
  static async createCoachRests(databaseId, coachRestList){
    try{
      const promises = coachRestList.map(async coachRest => {
        try { 
          const properties = _.Properties.getJSON(
            _.Title.getJSON('項目', coachRest.title),
            _.Date.getJSON('開始日/終了日', {start: coachRest.startDate, end: coachRest.endDate}),
            _.Select.getJSON('科目', coachRest.subject)
          );
          const parent = _.Parent("database_id", databaseId).getJSON();
          // coachRest: Add icon and cover
          const response = await notionAPI.createAPage(parent=parent, properties=properties);
          if(response.status !== 200){
            throw new Error(`Failed to create coachRest "${title}"`);
          }
          return response;
        } catch(error) {
          console.error(`Error creating coachRest "${coachRest.title}":`, error.message);
          return null;
        }
      })
      Promise.all(promises);
    } catch(error) {
      console.error("Failed to create coachRest list:", error.message);
    }
  }
  /**
   * @description TODO: Modify this method to select specific properties to be updated.
   * @date 21/02/2025
   * @param {*} coachRestId
   * @param {*} coachRest
   * @returns {*} 
   * @memberof coachRest
   */
  static async updateACoachRest(coachRestId, coachRest){
    try{
      const properties = _.Properties.getJSON(
        _.Title.getJSON('項目', coachRest.title),
        _.Date.getJSON('開始日/終了日', {start: coachRest.startDate, end: coachRest.endDate}),
        _.Select.getJSON('科目', coachRest.subject)
      );
      const response = await notionAPI.updateAPage(coachRestId, properties);
      if(response.status!== 200){
        throw new Error(`Failed to update coachRest "${coachRest.title}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error updating coachRest "${coachRest.title}":`, error.message);
    }
  }
  /**
   * @description
   * @date 21/02/2025
   * @param {*} coachRestId
   * @returns {*} 
   * @memberof coachRest
   */
  static async deleteACoachRest(coachRestId){
    try{
      const response = await notionAPI.deleteAPage(coachRestId);
      if(response.status!== 200){
        throw new Error(`Failed to delete coachRest "${coachRestId}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error deleting coachRest "${coachRestId}":`, error.message);
    }
  }
}