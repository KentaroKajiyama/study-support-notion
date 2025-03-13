import notionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convert_rich_text";

/**
 * @description
 * @date 21/02/2025
 * @export
 * @class CoachRecord
 */
export class CoachRecord {
  /**
   * Creates an instance of CoachRecord.
   * @date 21/02/2025
   * @param {*} databaseId
   * @param {*} coachRecordList
   * @memberof CoachRecord
   */
  constructor(databaseId, coachRecordList){
    this.databaseId = databaseId;
    this.coachRecordList = coachRecordList;
  }
  /**
   * @description
   * @date 21/02/2025
   * @returns {*} 
   * @memberof CoachRecord
   */
  getCoachRecord(){
    try {
      const response = notionAPI.queryADatabase(this.databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching coachRecord list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        const coachRecordId = item.id;
        const properties = item.properties;
        // coachRecord: This needs to be confirmed whether the mention type is correct. (coachRecord: From a mention to a real page)
        const { title_text, mention_list } = richTextToInlineText(properties.title)
        const understandingLevel = properties.理解度.status.name;
        const tryNumber = properties.挑戦回数.number;
        const wrongNumber = properties.不正解回数.number;
        const isDifficult = properties.理解できない.checkbox;
        const subject = properties.教科.select.name;

        return {
          coachRecordId: coachRecordId, 
          title: title_text, 
          mention: mention_list[0], 
          understandingLevel: understandingLevel,
          tryNumber: tryNumber, 
          wrongNumber: wrongNumber, 
          isDifficult: isDifficult,
          subject: subject,
        }
      });
    } catch(error) {
      console.error("Failed to fetch coachRecord list:", error.message);
      return [];
    }
  };
  /**
   * @description
   * @date 21/02/2025
   * @memberof CoachRecord
   */
  async createCoachRecord(){
    try{
      const promises = this.coachRecordList.map(async coachRecord => {
        try { 
          const title = coachRecord.title;
          const mention = coachRecord.mention;
          const understandingLevel = coachRecord.understandingLevel;
          const tryNumber = coachRecord.tryNumber;
          const wrongNumber = coachRecord.wrongNumber;
          const isDifficult = coachRecord.isDifficult;
          const subject = coachRecord.subject;
          const properties = _.Properties();
          // coachRecord: fix inlineTextConverter
          properties.addProperty(_.Title("項目", title).getJSON());
          properties.addProperty(_.Status("理解度", understandingLevel).getJSON());
          properties.addProperty(_.Number("挑戦回数", tryNumber).getJSON());
          properties.addProperty(_.Number("不正解回数", wrongNumber).getJSON());
          properties.addProperty(_.Checkbox("理解できない", isDifficult).getJSON());
          properties.addProperty(_.Select("教科", subject).getJSON());
          const parent = _.Parent("database_id", this.databaseId).getJSON();
          // coachRecord: Add icon and cover
          const response = await notionAPI.createAPage(parent=parent, properties=properties);
          if(response.status !== 200){
            throw new Error(`Failed to create coachRecord "${title}"`);
          }
          return response;
        } catch(error) {
          console.error(`Error creating coachRecord "${coachRecord.title}":`, error.message);
          return null;
        }
      })
      Promise.all(promises);
    } catch(error) {
      console.error("Failed to create coachRecord list:", error.message);
    }
  }
  /**
   * @description TODO: Modify this method to select specific properties to be updated.
   * @date 21/02/2025
   * @param {*} coachRecordId
   * @param {*} coachRecord
   * @returns {*} 
   * @memberof CoachRecord
   */
  async updateCoachRecord(coachRecordId, coachRecord){
    try{
      const properties = _.Properties();
      properties.addProperty(_.Title("項目", coachRecord.title).getJSON());
      properties.addProperty(_.Status("理解度", coachRecord.understandingLevel).getJSON());
      properties.addProperty(_.Number("挑戦回数", coachRecord.tryNumber).getJSON());
      properties.addProperty(_.Number("不正解回数", coachRecord.wrongNumber).getJSON());
      properties.addProperty(_.Checkbox("理解できない", coachRecord.coachRecordy).getJSON());
      properties.addProperty(_.Select("教科", coachRecord.subject).getJSON());
      const response = await notionAPI.updateAPage(coachRecordId, properties);
      if(response.status!== 200){
        throw new Error(`Failed to update coachRecord "${coachRecord.title}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error updating coachRecord "${coachRecord.title}":`, error.message);
    }
  }
  /**
   * @description
   * @date 21/02/2025
   * @param {*} coachRecordId
   * @returns {*} 
   * @memberof CoachRecord
   */
  async deleteCoachRecord(coachRecordId){
    try{
      const response = await notionAPI.deleteAPage(coachRecordId);
      if(response.status!== 200){
        throw new Error(`Failed to delete coachRecord "${coachRecordId}"`);
      }
      return response;
    } catch(error) {
      console.error(`Error deleting coachRecord "${coachRecordId}":`, error.message);
    }
  }
}