import NotionAPI from "../infrastructure/notionAPI.js";
import logger from "../src/utils/logger.js";
import { japaneseHistoryColumns } from "../src/const/problemDatabase.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { propertyFromNotion } from "../src/utils/propertyHandler.js";
import { probAnalysis } from "../src/const/problemAnalysis.js";
import { json } from "stream/consumers";

const __filename = fileURLToPath(import.meta.url);
const __dirnameVar = path.dirname(__filename);
dotenv.config({ path: './config/.env'})
const databaseId = '1a9b95a4c61980ef81f2f152d5e366b5';
(async (databaseId) => {
  try {
    const results = await NotionAPI.queryADatabase(databaseId, { filter :{
      property: japaneseHistoryColumns.area.name,
      [japaneseHistoryColumns.area.type]: {
        equals: '弥生時代',
      },
    }});
    const result = results.map(result => propertyFromNotion({
      propertiesObj: result.properties,
      propertyName: probAnalysis.tryNumber.name,
      propertyType: probAnalysis.tryNumber.type
    }))
    logger.info(JSON.stringify(result));
  } catch (error) {
    logger.error("An error occurred while fetching data from Notion: ", error);
  }
})(databaseId);