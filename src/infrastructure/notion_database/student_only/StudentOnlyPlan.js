import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notionTemplate";
import { richTextToInlineText } from "../../../utils/convert_rich_text";
import logger from "../../../utils/logger";
import { propertyToNotion } from "../../../utils/propertyHandler";
import { Properties } from "../../../const/notionTemplate";
import { studentOnlyPlanColumns } from "../../../const/notionDatabaseColumns";

export class StudentOnlyPlan{
  static async getStudentOnlyPlans(databaseId){
    try {
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status!== 200){
        throw new Error(`Failed to fetch data from Notion. Status code: ${response.status}`);
      }
      const studentOnlyPlans = response.results.map(result => {
        return {
          id: result.id,
          title: richTextToInlineText(result.properties.title.rich_text),
          subfield: result.properties.科目.select.name,
          startDate: result.properties.期間.date.start,
          endDate: result.properties.期間.date.end || "",
        };
      });
      return studentOnlyPlans;
    } catch(error) {
      logger.error("Error getting student only plans from Notion:", error.message);
      throw error;
    }
  };
  static async createStudentOnlyPlans(databaseId, studentOnlyPlans){
    try {
      const promises = studentOnlyPlans.map(async plan => {
        const title = _.Title.getJSON("項目", plan.title);
        const subfield = _.Select.getJSON("科目", plan.subfield);
        const date = _.Date.getJSON("期間", {start: plan.startDate, end: plan.endDate});
        const properties = _.Properties(title, subfield, date);
        const parent = _.Parent.getJSON("database_id", databaseId);
        const response = await notionAPI.createAPage(parent=parent, properties=properties);
        if(response.status!== 200){
          throw new Error(`Failed to create student only plan "${plan.title}"`);
        }
      })
      Promise.all(promises);
    } catch(error) {
      logger.error("Error creating student only plan in Notion:", error.message);
      throw error;
    }
  };
  static async updateAStudentOnlyPlan(studentOnlyPlan){
    try {
      const title = _.Title.getJSON("項目", studentOnlyPlan.title);
      const subfield = _.Select.getJSON("科目", studentOnlyPlan.subfield);
      const date = _.Date.getJSON("期間", {start: studentOnlyPlan.startDate, end: studentOnlyPlan.endDate});
      const properties = _.Properties(title, subfield, date);
      const response = await notionAPI.updatePageProperties(studentOnlyPlan.id, properties);
      if(response.status!== 200){
        throw new Error(`Failed to update student only plan "${studentOnlyPlan.title}"`);
      }
    } catch(error) {
      logger.error(`Error updating student only plan "${studentOnlyPlan.title}":`, error.message);
      throw error;
    }
  };
  static async updateAPeriod(studentOnlyPlanPageId, startDate, endDate) {
    try {
      const response = await notionAPI.updatePageProperties(studentOnlyPlanPageId, Properties([
        propertyToNotion({
          propertyName: studentOnlyPlanColumns.period.name,
          propertyContent: {start: startDate, end: endDate},
          propertyType: studentOnlyPlanColumns.period.type
        })
      ]));
      if(response.status!== 200){
        throw new Error(`Failed to update period in student only plan "${studentOnlyPlanPageId}"`);
      }
    } catch (error) {
      logger.error("Error updating output date in Notion:", error.message);
      throw error;
    }
  };
  static async deleteAStudentOnlyPlan(studentOnlyPlanId){
    try{
      const response = await notionAPI.deleteAPage(studentOnlyPlanId);
      if(response.status!== 200){
        throw new Error(`Failed to delete student only plan "${studentOnlyPlanId}"`);
      }
    } catch(error) {
      logger.error(`Error deleting student only plan "${studentOnlyPlanId}":`, error.message);
      throw error;
    }
  };
}