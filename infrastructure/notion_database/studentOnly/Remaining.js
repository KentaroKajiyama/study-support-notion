import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convertRichText";

/**
 * @typedef {Object} SubfieldDict
 * @property {number} id - Unique identifier for the page.
 * @property {string} name - Name of the subfield.
 * @property {string} subject - Associated subject.
 * @property {number} remaining - Remaining count of something (e.g., pages, questions).
 * 
 * @typedef {SubfieldDict[]} subfieldDictList
 * @description subfieldDictList format: list of { id: page_id, name: str, subject: str, remaining: number }
 * @date 22/02/2025
 * @export
 * @class Remaining
 */
export class Remaining {
  /**
   * @description
   * @date 22/02/2025
   * @static
   * @returns {*} 
   * @memberof Remaining
   */
  static async getRemainingsAll(){
    try{
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Failed to fetch data from Notion: ${response.statusText}`);
      }
      const subfieldDictList = response.results.map(result => {
        return {
          id : result.id,
          name: richTextToInlineText(result.properties.科目.title.rich_text),
          subject: result.properties.教科.select.name,
          remaining: result.properties.入試までの日数.number
        };
      })
      return subfieldDictList;
    } catch(error) {
      console.error("Error fetching data:", error.message);
      return [];
    }
  }
  /**
   * @description
   * @date 22/02/2025
   * @static
   * @param {*} subfieldDictList
   * @returns {*} 
   * @memberof Remaining
   */
  static async createRemaining(databaseId, subfieldDictList){
    try{
      await this.deleteRemainingsAll();
      const promises = subfieldDictList.map(async (subfield_dict) => {
        try {
          const nameProperty = _.Title.getJSON("科目", subfield_dict.name)
          if (!subject_candidate.includes(subfield_dict.subject)) {
            throw new Error(`Invalid subject: ${subfield_dict.subject}`);
          }
          const subjectProperty = _.Select.getJSON("教科", subfield_dict.subject)
      
          if (subfield_dict.remaining <= 0) {
            throw new Error("Remaining days must be greater than 0");
          }
          const remainingProperty = _.Number.getJSON("入試までの日数", subfield_dict.remaining)
      
          const properties = _.Properties.getJSON(nameProperty, subjectProperty, remainingProperty);
          const parent = _.Parent.getJSON('database_id', databaseId);
          const response = await notionAPI.createAPage(parent, properties);
      
          // ✅ Check for successful response (assuming status or id exists)
          if (response.status !== 200) {
            throw new Error(`Failed to create page for ${subfield_dict.name}`);
          }
      
          console.log(`Page created successfully for ${subfield_dict.name}:`, response.id);
          return response;
        } catch (error) {
          console.error(`Error processing subject "${subfield_dict.name}":`, error.message);
          return null;
        }
      });
      await Promise.all(promises);
    } catch(error) {
      console.error("Error creating data:", error.message);
      return null;
    }
  }
  /**
   * @description Updates only the remaining day property.
   * @date 22/02/2025
   * @static
   * @param {*} subfieldDictList
   * @returns {*} 
   * @memberof Remaining
   */
  static async updateRemainingsAll(subfieldDictList){
    try {
      const current_subfieldDictList = this.getRemaining();
      const promises = subfieldDictList.map(async (subfield_dict) => {
        try {
          const current_subfield_dict = current_subfieldDictList.find(cd => cd.name === subfield_dict.name);
          if (subfield_dict.remaining <= 0) {
            throw new Error("Remaining days must be greater than 0");
          }
          const remainingProperty = _.Number.getJSON("入試までの日数", subfield_dict.remaining)
          const page_id = current_subfield_dict.id;
          const properties = _.Properties.getJSON(remainingProperty);
          const response = await notionAPI.updateAPage(page_id, properties);
          if(response !== 200){
            throw new Error(`Failed to update page for ${subfield_dict.name}`);
          }
        } catch(error) {
          console.error(`Error updating subject "${subfield_dict.name}":`, error.message);
        }
      })
      await Promise.all(promises);
    } catch(error) {
      console.error("Error updating data of Remaining DB:", error.message);
      return null;
    }
  }
  /**
   * @description
   * @date 22/02/2025
   * @static
   * @memberof Remaining
   */
  static async deleteRemainingsAll(databaseId){
    try {
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status!== 200){
        throw new Error(`Failed to fetch data from Notion: ${response.statusText}`);
      }
      const block_id_list = response.results.map(result => result.id);
      await Promise.all(
        block_id_list.map(async block_id => await notionAPI.deleteABlock(block_id))
      );
    } catch(error) {
      console.error("Error deleting data of Remaining DB:", error.message);
    };
  }
}