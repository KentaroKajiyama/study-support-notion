import NotionAPI from "../infrastructure/notionAPI.js";
import logger from "./logger.js";
import { Properties, Parent } from "../const/myNotionType.js";
import { 
  IdRequest,
  PartialPageObjectResponse,
  GetPageResponse,
  PageObjectResponse
} from "@notionhq/client/build/src/api-endpoints.js";

interface NotionBlock {
  id: string;
  has_children?: boolean;
  type: string;
  [key: string]: any;
}

/**
 * Copies a Notion page from one database to another.
 */
export const copyPageCreate = async (sourcePageId: IdRequest, targetDatabaseId: IdRequest): Promise<string> => {
  try {
    const responseToRetrieve: GetPageResponse = await NotionAPI.retrieveAPage(sourcePageId);
    
    if (!("properties" in responseToRetrieve)) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    }

    const targetDatabaseProperties = (await NotionAPI.retrieveADatabase(targetDatabaseId)).properties;

    const propertiesList = Object.keys(responseToRetrieve.properties)
      .filter((key) => targetDatabaseProperties.hasOwnProperty(key))
      .map((key) => ({
        [key]: { [responseToRetrieve.properties[key].type]: responseToRetrieve.properties[key][responseToRetrieve.properties[key].type] },
      }));

    const properties = Properties.getJSON(propertiesList);
    const parent = Parent.getJSON("database_id", targetDatabaseId);
    const response_to_create = await NotionAPI.createAPage(parent, properties);

    await copyBlockChildrenUpdate(sourcePageId, response_to_create.id);
    return response_to_create.id;
  } catch (error: any) {
    logger.error(`Error copying page "${sourcePageId}" to "${targetDatabaseId}":`, error.message);
    throw error;
  }
};

/**
 * Copies and updates a Notion page from one location to another.
 */
export const copyPageUpdate = async (sourcePageId: string, targetPageId: string): Promise<void> => {
  try {
    const responseToRetrieve: GetPageResponse = await NotionAPI.retrieveAPage(sourcePageId);
    const targetPageProperties = (await NotionAPI.retrieveAPage(targetPageId)).properties;

    const propertiesList = Object.keys(responseToRetrieve.properties)
      .filter((key) => targetPageProperties.hasOwnProperty(key))
      .map((key) => ({
        [key]: { [responseToRetrieve.properties[key].type]: responseToRetrieve.properties[key][responseToRetrieve.properties[key].type] },
      }));

    const properties = Properties.getJSON(propertiesList);
    await NotionAPI.updatePageProperties(targetPageId, properties);

    await copyBlockChildrenUpdate(sourcePageId, targetPageId);
  } catch (error: any) {
    logger.error(`Error copying page "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
};

/**
 * Copies all block children from one block to another.
 */
export const copyBlockChildrenUpdate = async (sourceBlockId: string, targetBlockId: string): Promise<void> => {
  try {
    await deleteAllBlockChildren(targetBlockId);

    const responseToRetrieve = await NotionAPI.retrieveBlockChildren(sourceBlockId);
    const nestedBlockIdObjs: { sourceBlockId: string; blockIndex: number }[] = [];

    const children = responseToRetrieve.results.map((result: NotionBlock, index: number) => {
      if (result.has_children) {
        nestedBlockIdObjs.push({ sourceBlockId: result.id, blockIndex: index });
      }
      return result[result.type];
    });

    const response_to_append = await NotionAPI.appendBlockChildren(targetBlockId, children);

    await Promise.all(
      nestedBlockIdObjs.map(async ({ sourceBlockId, blockIndex }) => {
        const targetBlockId = response_to_append.results[blockIndex].id;
        await copyBlockChildrenUpdate(sourceBlockId, targetBlockId);
      })
    );
  } catch (error: any) {
    logger.error(`Error copying block children from "${sourceBlockId}" to "${targetBlockId}":`, error.message);
    throw error;
  }
};

/**
 * Copies properties from one Notion page to another.
 */
export const copyPagePropertiesUpdate = async (sourcePageId: string, targetPageId: string): Promise<void> => {
  try {
    const responseToRetrieve: GetPageResponse = await NotionAPI.retrieveAPage(sourcePageId);
    const targetPageProperties = (await NotionAPI.retrieveAPage(targetPageId)).properties;

    const propertiesList = Object.keys(responseToRetrieve.properties)
      .filter((key) => targetPageProperties.hasOwnProperty(key))
      .map((key) => ({
        [key]: { [responseToRetrieve.properties[key].type]: responseToRetrieve.properties[key][responseToRetrieve.properties[key].type] },
      }));

    const properties = Properties.getJSON(propertiesList);
    await NotionAPI.updatePageProperties(targetPageId, properties);
  } catch (error: any) {
    logger.error(`Error copying page properties from "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
};

/**
 * Deletes all children of a given block.
 */
export const deleteAllBlockChildren = async (targetBlockId: string): Promise<void> => {
  try {
    const responseToRetrieve = await NotionAPI.retrieveBlockChildren(targetBlockId);
    const childrenIds = responseToRetrieve.results.map((result: NotionBlock) => result.id);

    await Promise.all(childrenIds.map(async (childId) => await NotionAPI.deleteABlock(childId)));
  } catch (error: any) {
    logger.error(`Error deleting all children from block "${targetBlockId}":`, error.message);
    throw error;
  }
};
