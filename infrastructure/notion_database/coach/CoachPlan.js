import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convert_rich_text";
import logger from "../../../utils/logger";
import { coachPlanColumns } from "../../../const/notionDatabaseColumns";
import { propertyToNotion } from "../../../utils/propertyHandler";
import { Properties } from "../../../const/notionTemplate";


export class CoachPlan {
  static async getCoachPlans(databaseId){
    try {
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching coachPlan list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        return {
          coachPlanId: item.id, 
          title: richTextToInlineText(properties.title),
          startDate: item.properties['開始日/終了日'].date.start,
          endDate: item.properties['開始日/終了日'].date.end || "",
          distSpeed: item.properties['配信数/回'].number,
          distSpace: item.properties['配信間隔'].number,
          isIrregular: item.properties['例外'].checkbox,
          subject: item.properties['科目'].select.name,
          blockOrder: item.properties['Order'].number,
        }
      });
    } catch(error) {
      logger.error("Failed to fetch coachPlan list:", error.message);
      throw error;
    }
  };
  static async createCoachPlans(databaseId, coachPlanList){
    try{
      const promises = coachPlanList.map(async coachPlan => {
        try { 
          
          const distSpeed = _.Number.getJSON('配信数/回', coachPlan.distSpeed);
          const distSpace = _.Number.getJSON('配信間隔', coachPlan.distSpace);
          const isIrregular = _.Checkbox.getJSON('例外', coachPlan.isIrregular);
          const subfield = _.Select.getJSON('科目', coachPlan.subject);
          const order = _.Select.getJSON('Order', coachPlan.order);
          const properties = _.Properties.getJSON(title, startEndDate, distSpeed, distSpace, isIrregular, subfield, order);
          const parent = _.Parent.getJSON("database_id", databaseId)
          // TODO: coachPlan: Add icon and cover
          const response = await notionAPI.createAPage(parent=parent, properties=properties);
          if(response.status !== 200){
            throw new Error(`Failed to create coachPlan "${title}"`);
          }
          return response;
        } catch(error) {
          logger.error(`Error creating coachPlan "${coachPlan.title}":`, error.message);
          return null;
        }
      })
      await Promise.all(promises);
    } catch(error) {
      logger.error("Failed to create coachPlan list:", error.message);
      throw error;
    }
  }
  /**
   * @description TODO: Modify this method to select specific properties to be updated.
   * @date 21/02/2025
   * @param {*} coachPlanId
   * @param {*} coachPlan
   * @returns {*} 
   * @memberof coachPlan
   */
  static async updateACoachPlan(coachPlanId, coachPlan){
    try{
      const title = _.Title.getJSON('項目', coachPlan.title);
      const startEndDate = _.Date.getJSON('開始日/終了日', {start: coachPlan.startDate, end: coachPlan.endDate});
      const distSpeed = _.Number.getJSON('配信数/回', coachPlan.distSpeed);
      const distSpace = _.Number.getJSON('配信間隔', coachPlan.distSpace);
      const isIrregular = _.Checkbox.getJSON('例外', coachPlan.isIrregular);
      const subfield = _.Select.getJSON('科目', coachPlan.subject);
      const order = _.Select.getJSON('Order', coachPlan.order);
      const properties = _.Properties.getJSON(title, startEndDate, distSpeed, distSpace, isIrregular, subfield, order);
      const response = await notionAPI.updateAPage(coachPlanId, properties);
      if(response.status!== 200){
        throw new Error(`Failed to update coachPlan "${coachPlan.title}"`);
      }
      return response;
    } catch(error) {
      logger.error(`Error updating coachPlan "${coachPlan.title}":`, error.message);
      throw error;
    }
  }
  static async updateAnOutputDate(coachPlanPageId, startDate, endDate){
    try {
      const startEndDate = propertyToNotion({
        propertyName: coachPlanColumns.outputPeriod.name,
        propertyContent: { start: startDate, end: endDate },
        propertyType: coachPlanColumns.outputPeriod.type
      });
      const response = await notionAPI.updateAPage(coachPlanPageId, Properties([
        startEndDate,
      ]));
      if(response.status!== 200){
        throw new Error(`Failed to update start and end date of coachPlan "${coachPlanPageId}"`);
      }
      return response;
    } catch (error) {
      logger.error(`Error updating start and end date of coachPlan "${coachPlanPageId}":`, error.message);
      throw error;
    }
  }
  static async deleteACoachPlan(coachPlanId){
    try{
      const response = await notionAPI.deleteAPage(coachPlanId);
      if(response.status!== 200){
        throw new Error(`Failed to delete coachPlan "${coachPlanId}"`);
      }
      return response;
    } catch(error) {
      logger.error(`Error deleting coachPlan "${coachPlanId}":`, error.message);
      throw error;
    }
  }
}