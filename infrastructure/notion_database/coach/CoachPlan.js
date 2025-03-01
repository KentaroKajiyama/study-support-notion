import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convert_rich_text";

/**
 * @description
 * @date 21/02/2025
 * @export
 * @class CoachPlan
 */
export class CoachPlan {
  /**
   * @description
   * @date 21/02/2025
   * @returns {*} 
   * @memberof coachPlan
   */
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
      console.error("Failed to fetch coachPlan list:", error.message);
      return [];
    }
  };
  /**
   * @description
   * @date 21/02/2025
   * @memberof coachPlan
   */
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
          console.error(`Error creating coachPlan "${coachPlan.title}":`, error.message);
          return null;
        }
      })
      Promise.all(promises);
    } catch(error) {
      console.error("Failed to create coachPlan list:", error.message);
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
      console.error(`Error updating coachPlan "${coachPlan.title}":`, error.message);
    }
  }
  /**
   * @description
   * @date 21/02/2025
   * @param {*} coachPlanId
   * @returns {*} 
   * @memberof coachPlan
   */
  static async deleteACoachPlan(coachPlanId){
    try{
      const response = await notionAPI.deleteAPage(coachPlanId);
      if(response.status!== 200){
        throw new Error(`Failed to delete coachPlan "${coachPlanId}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error deleting coachPlan "${coachPlanId}":`, error.message);
    }
  }
}