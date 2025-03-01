import NotionAPI from "../../notionAPI";
import * as _ from "../../../const/notion_template";
import { richTextToInlineText } from "../../../utils/convert_rich_text";
import logger from "../../../utils/logger";

/**
 * @description
 * @date 21/02/2025
 * @export
 * @class necessaryStudyTime
 */
export class NecessaryStudyTime {
  /**
   * Creates an instance of necessaryStudyTime.
   * @date 21/02/2025
   * @param {*} databaseId
   * @param {*} NecessaryStudyTime
   * @memberof NecessaryStudyTime
   */
  constructor(databaseId, necessaryStudyTime){
    this.databaseId = databaseId;
    this.necessaryStudyTime = necessaryStudyTime;
  }
  /**
   * @description
   * @date 21/02/2025
   * @returns {*} 
   * @memberof necessaryStudyTime
   */
  static async getNecessaryStudyTime(databaseId){
    try {
      const response = await NotionAPI.queryADatabase(databaseId);
      if (response.status !== 200){
        throw new Error(`Error fetching necessaryStudyTime list from Notion: ${response.statusText}`);
      }
      const data = response.data.results;
      return data.map(item => {
        return {
          necessaryStudyTimeId: item.id, 
          title: richTextToInlineText(item.properties.title), 
          modernJapaneseTime: item.properties.現代文.number,
          traditionalJapaneseTime: item.properties.古文.number,
          traditionalChineseTime: item.properties.漢文.number,
          mathTime: item.properties.数学.number,
          readingTime: item.properties.Reading.number,
          listeningAndSpeakingTime: item.properties["Listening&Speaking"].number,
          writingTime: item.properties.Writing.number,
          physicsTime: item.properties.物理.number,
          chemistryTime: item.properties.化学.number,
          biologyTime: item.properties.生物.number,
          japaneseHistoryTime: item.properties.日本史.number,
          worldHistoryTime: item.properties.世界史.number,
          geographyTime: item.properties.地理.number,
          totalTime: item.properties.合計時間.number,
          numberOfDay: item.properties.回数.number,
          totalNumberOfDay: item.properties["１周期日数"].number,
        }
      });
    } catch(error) {
      logger.error("Failed to fetch necessaryStudyTime list:", error.message);
      return [];
    }
  };
  /**
   * @description
   * @date 21/02/2025
   * @memberof necessaryStudyTime
   */
  async createNecessaryStudyTime(databaseId, necessaryStudyTime){
    try {
      const properties = _.Properties.getJSON(
        _.Title.getJSON("項目", necessaryStudyTime.title),
        _.Number.getJSON("現代文", necessaryStudyTime.modernJapaneseTime),
        _.Number.getJSON("古文", necessaryStudyTime.traditionalJapaneseTime),
        _.Number.getJSON("漢文", necessaryStudyTime.traditionalChineseTime),
        _.Number.getJSON("数学", necessaryStudyTime.mathTime),
        _.Number.getJSON("Reading", necessaryStudyTime.readingTime),
        _.Number.getJSON("Listening&Speaking", necessaryStudyTime.listeningAndSpeakingTime),
        _.Number.getJSON("Writing", necessaryStudyTime.writingTime),
        _.Number.getJSON("物理", necessaryStudyTime.physicsTime),
        _.Number.getJSON("化学", necessaryStudyTime.chemistryTime),
        _.Number.getJSON("生物", necessaryStudyTime.biologyTime),
        _.Number.getJSON("日本史", necessaryStudyTime.japaneseHistoryTime),
        _.Number.getJSON("世界史", necessaryStudyTime.worldHistoryTime),
        _.Number.getJSON("地理", necessaryStudyTime.geographyTime),
        _.Number.getJSON("合計時間", necessaryStudyTime.totalTime),
        _.Number.getJSON("回数", necessaryStudyTime.numberOfDay),
        _.Number.getJSON("１周期日数", necessaryStudyTime.totalNumberOfDay),
      );
      const parent = _.Parent("database_id", databaseId);
      // necessaryStudyTime: Add icon and cover
      const response = await NotionAPI.createAPage(parent=parent, properties=properties);
      if(response.status !== 200){
        throw new Error(`Failed to create necessaryStudyTime "${title}"`);
      }
      return response;
    } catch(error) {
      logger.error(`Error creating necessaryStudyTime "${necessaryStudyTime.title}":`, error.message);
      return null;
    }
  }
  /**
   * @description TODO: Modify this method to select specific properties to be updated.
   * @date 21/02/2025
   * @param {*} necessaryStudyTimeId
   * @param {*} necessaryStudyTime
   * @returns {*} 
   * @memberof necessaryStudyTime
   */
  async updateNecessaryStudyTime(necessaryStudyTimeId, necessaryStudyTime){
    try{
      const properties = _.Properties.getJSON(
        _.Title.getJSON("項目", necessaryStudyTime.title),
        _.Number.getJSON("現代文", necessaryStudyTime.modernJapaneseTime),
        _.Number.getJSON("古文", necessaryStudyTime.traditionalJapaneseTime),
        _.Number.getJSON("漢文", necessaryStudyTime.traditionalChineseTime),
        _.Number.getJSON("数学", necessaryStudyTime.mathTime),
        _.Number.getJSON("Reading", necessaryStudyTime.readingTime),
        _.Number.getJSON("Listening&Speaking", necessaryStudyTime.listeningAndSpeakingTime),
        _.Number.getJSON("Writing", necessaryStudyTime.writingTime),
        _.Number.getJSON("物理", necessaryStudyTime.physicsTime),
        _.Number.getJSON("化学", necessaryStudyTime.chemistryTime),
        _.Number.getJSON("生物", necessaryStudyTime.biologyTime),
        _.Number.getJSON("日本史", necessaryStudyTime.japaneseHistoryTime),
        _.Number.getJSON("世界史", necessaryStudyTime.worldHistoryTime),
        _.Number.getJSON("地理", necessaryStudyTime.geographyTime),
        _.Number.getJSON("合計時間", necessaryStudyTime.totalTime),
        _.Number.getJSON("回数", necessaryStudyTime.numberOfDay),
        _.Number.getJSON("１周期日数", necessaryStudyTime.totalNumberOfDay),
      );
      const response = await NotionAPI.updateAPage(necessaryStudyTimeId, properties);
      if(response.status!== 200){
        throw new Error(`Failed to update necessaryStudyTime "${necessaryStudyTime.title}"`);
      }
      return response;
    } catch(error) {
      logger.error(`Error updating necessaryStudyTime "${necessaryStudyTime.title}":`, error.message);
    }
  }
  /**
   * @description
   * @date 21/02/2025
   * @param {*} necessaryStudyTimeId
   * @returns {*} 
   * @memberof necessaryStudyTime
   */
  async deleteNecessaryStudyTime(necessaryStudyTimeId){
    try{
      const response = await NotionAPI.deleteAPage(necessaryStudyTimeId);
      if(response.status!== 200){
        throw new Error(`Failed to delete necessaryStudyTime "${necessaryStudyTimeId}"`);
      }
      return response;
    } catch(error) {
      logger.error(`Error deleting necessaryStudyTime "${necessaryStudyTimeId}":`, error.message);
    }
  }
}