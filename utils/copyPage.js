import NotionAPI from '../infrastructure/notionAPI';
import logger from './logger';
import { Properties, Parent } from '../const/notionTemplate';

export const copyPageCreate = async (sourcePageId, targetDatabaseId) => {
  try {
    const response_to_retrieve = await NotionAPI.retrieveAPage(sourcePageId);
    if (response_to_retrieve.status!== 200) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    }
    const targetDatabaseProperties = await NotionAPI.retrieveADatabase(targetDatabaseId).properties;
    const propertiesList = Object.keys(response_to_retrieve.results.properties).map(key => {
      if (!targetDatabaseProperties.hasOwnProperty(key)) {
        logger.error(`Property "${key}" not found in target database "${targetDatabaseId}"`);
        return null;
      }
      const property = response_to_retrieve.results.properties[key];
      return {
        [key]: {
          [property.type]: property[property.type]
        }
      }
    });
    const properties = Properties.getJSON(propertiesList);
    const parent = Parent.getJSON('database_id', targetDatabaseId);
    const response_to_create = await NotionAPI.createAPage(parent, properties);
    if (response_to_create.status!== 200) {
      throw new Error(`Failed to create page "${targetDatabaseId}"`);
    }
    await copyBlockChildrenUpdate(sourcePageId, response_to_create.id);
    return response_to_create.id;
  } catch (error) {
    logger.error(`Error copying page "${sourcePageId}" to "${targetDatabaseId}":`, error.message);
    throw error;
  }
}

export const copyPageUpdate = async (sourcePageId, targetPageId) => {
  try {
    const response_to_retrieve = await NotionAPI.retrieveAPage(sourcePageId);
    if (response_to_retrieve.status!== 200) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    }
    const targetPageProperties = await NotionAPI.retrieveAPage(targetPageId).properties;
    const propertiesList = Object.keys(response_to_retrieve.results.properties).map(key => {
      if (!targetPageProperties.hasOwnProperty(key)) {
        logger.error(`Property "${key}" not found in target page "${targetPageId}"`);
        return null;
      }
      const property = response_to_retrieve.results.properties[key];
      return {
        [key]: {
          [property.type]: property[property.type]
        }
      }
    });
    const properties = Properties.getJSON(propertiesList);
    const response_to_update = await NotionAPI.updatePageProperties(targetPageId, properties);
    if (response_to_update.status!== 200) {
      throw new Error(`Failed to create page "${targetDatabaseId}"`);
    }
    await copyBlockChildrenUpdate(sourcePageId, targetPageId);
  } catch (error) {
    logger.error(`Error copying page "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
}

export const copyBlockChildrenUpdate = async (sourceBlockId, targetBlockId) => {
  try { 
    const response_to_delete = await deleteAllBlockChildren(targetBlockId);
    if (response_to_delete.status!== 200) {
      throw new Error(`Failed to delete children of block "${targetBlockId}"`);
    }
    const response_to_retrieve = await NotionAPI.retrieveBlockChildren(sourceBlockId);
    if (response_to_retrieve.status!== 200) {
      throw new Error(`Failed to retrieve children of block "${sourceBlockId}"`);
    }
    const nestedBlockIdObjs = []
    const children = response.results.map((result, index) => {
      if (result.has_children) {
        nestedBlockIdObjs.push({sourceBlockId: result.id, blockIndex: index});
      };
      return result[result.type];
    });
    const response_to_append = await NotionAPI.appendBlockChildren(targetBlockId, children);
    if (response_to_append.status!== 200) {
      throw new Error(`Failed to append children to block "${targetBlockId}"`);
    }
    Promise.all(nestedBlockIdObjs.map(async({sourceBlockId, blockIndex}) => {
      const targetBlockId = response_to_append.results[blockIndex];
      await copyBlockChildrenUpdate(sourceBlockId, targetBlockId);
    }));
  } catch (error) {
    logger.error(`Error copying block children from "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
}

export const copyPagePropertiesUpdate = async (sourcePageId, targetPageId) => {
  try {
    const response_to_retrieve = await NotionAPI.retrieveAPage(sourcePageId);
    if (response_to_retrieve.status!== 200) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    }
    const targetPageProperties = await NotionAPI.retrieveAPage(targetPageId).properties;
    const propertiesList = Object.keys(response_to_retrieve.results.properties).map(key => {
      if (!targetPageProperties.hasOwnProperty(key)) {
        logger.error(`Property "${key}" not found in target page "${targetPageId}"`);
        return null;
      }
      const property = response_to_retrieve.results.properties[key];
      return {
        [key]: {
          [property.type]: property[property.type]
        }
      }
    });
    const properties = Properties.getJSON(propertiesList)
    const response_to_update = await NotionAPI.updatePageProperties(targetPageId, properties);
    if (response_to_update.status!== 200) {
      throw new Error(`Failed to update properties of page "${targetPageId}"`);
    }
  } catch (error) {
    logger.error(`Error copying page properties from "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
}

export const deleteAllBlockChildren = async (targetBlockId) => {
  try {
    const response_to_retrieve = await NotionAPI.retrieveBlockChildren(targetBlockId);
    if (response_to_retrieve.status!== 200) {
      throw new Error(`Failed to retrieve children of block "${targetBlockId}"`);
    }
    const childrenIds = response_to_retrieve.results.map(result => result.id);
    await Promise.all(childrenIds.map(async childId => await NotionAPI.deleteABlock(childId)));
  } catch (error) {
    logger.error(`Error deleting all children from block "${targetBlockId}":`, error.message);
    throw error;
  }
}