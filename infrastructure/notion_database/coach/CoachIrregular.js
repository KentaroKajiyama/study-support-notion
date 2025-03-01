import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convert_rich_text";

/**
 * @description
 * @date 21/02/2025
 * @export
 * @class coachIrregular
 */
export class CoachIrregular {
  /**
   * @description
   * @date 21/02/2025
   * @returns {*} 
   * @memberof coachIrregular
   */
  static async getCoachIrregulars(databaseId){
    try {
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching coachIrregular list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        const coachIrregularId = item.id;
        const properties = item.properties;
        // coachIrregular: This needs to be confirmed whether the mention type is correct. (coachIrregular: From a mention to a real page)
        const title = richTextToInlineText(properties.title)
        const modification = properties['変更'].status.name;
        const insertNumber = properties['挿入先番号'].number;
        const subfield = properties['科目'].select.name;
        const order = properties['Order'].number;

        return {
          coachIrregularId: coachIrregularId, 
          title: title, 
          modification: modification,
          insertNumber: insertNumber,
          subfield: subfield,
          order: order,
        }
      });
    } catch(error) {
      console.error("Failed to fetch coachIrregular list:", error.message);
      return [];
    }
  };
  /**
   * @description
   * @date 21/02/2025
   * @memberof coachIrregular
   */
  static async createCoachIrregulars(databaseId, coachIrregularList){
    try{
      const promises = coachIrregularList.map(async coachIrregular => {
        try { 
          const title = _.Title.getJSON('項目', coachIrregular.title);
          const modification = _.Status.getJSON('変更', coachIrregular.modification);
          const insertNumber = _.Number.getJSON('挿入先番号', coachIrregular.insertNumber);
          const subfield = _.Select('科目', coachIrregular.subfield);
          const order = _.Number.getJSON('Order', coachIrregular.order);
          const properties = _.Properties.getJSON(title, modification, insertNumber, subfield, order);
          const parent = _.Parent.getJSON("database_id", databaseId)
          // coachIrregular: Add icon and cover
          const response = await notionAPI.createAPage(parent=parent, properties=properties);
          if(response.status !== 200){
            throw new Error(`Failed to create coachIrregular "${title}"`);
          }
          return response;
        } catch(error) {
          console.error(`Error creating coachIrregular "${coachIrregular.title}":`, error.message);
          return null;
        }
      })
      Promise.all(promises);
    } catch(error) {
      console.error("Failed to create coachIrregular list:", error.message);
    }
  }
  /**
   * @description TODO: Modify this method to select specific properties to be updated.
   * @date 21/02/2025
   * @param {*} coachIrregularId
   * @param {*} coachIrregular
   * @returns {*} 
   * @memberof coachIrregular
   */
  static async updateACoachIrregular(coachIrregularId, coachIrregular){
    try{
      const title = _.Title.getJSON('項目', coachIrregular.title);
      const modification = _.Status.getJSON('変更', coachIrregular.modification);
      const insertNumber = _.Number.getJSON('挿入先番号', coachIrregular.insertNumber);
      const subfield = _.Select('科目', coachIrregular.subfield);
      const order = _.Number.getJSON('Order', coachIrregular.order);
      const properties = _.Properties.getJSON(title, modification, insertNumber, subfield, order);
      const response = await notionAPI.updateAPage(coachIrregularId, properties);
      if(response.status!== 200){
        throw new Error(`Failed to update coachIrregular "${coachIrregular.title}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error updating coachIrregular "${coachIrregular.title}":`, error.message);
    }
  }
  /**
   * @description
   * @date 21/02/2025
   * @param {*} coachIrregularId
   * @returns {*} 
   * @memberof coachIrregular
   */
  static async deleteACoachIrregular(coachIrregularId){
    try{
      const response = await notionAPI.deleteAPage(coachIrregularId);
      if(response.status!== 200){
        throw new Error(`Failed to delete coachIrregular "${coachIrregularId}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error deleting coachIrregular "${coachIrregularId}":`, error.message);
    }
  }
}