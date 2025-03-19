import NotionAPI from "@infrastructure/notionAPI.js";
import { logger } from "@utils/index.js";
import { 
  CreatePageParameters,
  GetPageResponse,
  PageObjectResponse,
  UpdatePageParameters,
  BlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints.js";
import { 
  BlockObjectRequest, 
  NotionPagePropertiesTypeArray, 
  NotionUUID, 
  ParentRequest, 
  toNotionUUID 
} from "@domain/types/myNotionTypes.js";

interface NotionBlock {
  id: string;
  has_children?: boolean;
  type: string;
  [key: string]: any;
}

export const copyPageCreate = async (sourcePageId: NotionUUID, targetDatabaseId: NotionUUID): Promise<NotionUUID> => {
  try {
    const responseToRetrieve: GetPageResponse = await NotionAPI.retrieveAPage(sourcePageId);
    
    if (!("properties" in responseToRetrieve)) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    }

    const targetDatabaseProperties = (await NotionAPI.retrieveADatabase(targetDatabaseId)).properties;

    const propertiesList = Object.keys(responseToRetrieve.properties)
      .filter((key) => targetDatabaseProperties.hasOwnProperty(key))
      .map((key) => {
        const property = responseToRetrieve.properties[key];

        if (
          typeof property === "object" 
          && property !== null 
          && "type" in property 
          && property.type in property
          && NotionPagePropertiesTypeArray.includes(property.type)
        ) {
          return {
            [key]: {
              [property.type]: property[property.type as keyof typeof property]
            } as CreatePageParameters["properties"][string] 
          };
        } else {
          throw new Error(`Unexpected property format for key: ${key}`);
        }
      });

    const properties = propertiesList.reduce((acc, obj) => {
      const key = Object.keys(obj)[0];
      acc[key] = obj[key];
      return acc;
    }, {} as CreatePageParameters["properties"]);

    const parent: ParentRequest = {database_id: targetDatabaseId, type: "database_id"};

    const icon:CreatePageParameters['icon'] = (() => {
      if (responseToRetrieve.icon === null) return null;
      switch (responseToRetrieve.icon.type) {
        case 'emoji':
          return { emoji: responseToRetrieve.icon.emoji, type: responseToRetrieve.icon.type }
        case 'external':
          return { external: { url: responseToRetrieve.icon.external.url }, type: responseToRetrieve.icon.type }
        case 'custom_emoji':
          return { custom_emoji: { id: responseToRetrieve.icon.custom_emoji.id, name: responseToRetrieve.icon.custom_emoji.name, url: responseToRetrieve.icon.custom_emoji.url }, type: responseToRetrieve.icon.type }
        default:
          throw new Error(`Unexpected icon type: ${responseToRetrieve.icon.type}`);
      }
    })();

    const cover: CreatePageParameters['cover'] = (() => {
      if (responseToRetrieve.cover === null) return null;
      switch (responseToRetrieve.cover.type) {
        case 'external':
          return { external: { url: responseToRetrieve.cover.external.url }, type: responseToRetrieve.cover.type }
        case 'file':
          logger.warn("internal saved cover is not supported by Notion API.")
          return null
        default:
          throw new Error(`Unexpected cover type: ${responseToRetrieve.cover}`);
      }
    })();

    const responseToCreate = await NotionAPI.createAPage(parent, properties as CreatePageParameters["properties"], icon, cover);

    await copyBlockChildrenUpdate(sourcePageId, toNotionUUID(responseToCreate.id));
    return toNotionUUID(responseToCreate.id);
  } catch (error: any) {
    logger.error(`Error copying page "${sourcePageId}" to "${targetDatabaseId}":`, error.message);
    throw error;
  }
};

export const copyPageUpdate = async (sourcePageId: NotionUUID, targetPageId: NotionUUID): Promise<void> => {
  try {
    const responseToRetrieve: GetPageResponse = await NotionAPI.retrieveAPage(sourcePageId);

    if (!("properties" in responseToRetrieve)) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    } 
    const targetPageProperties = (await NotionAPI.retrieveAPage(targetPageId) as PageObjectResponse).properties;

    const propertiesList = Object.keys(responseToRetrieve.properties)
      .filter((key) => targetPageProperties?.hasOwnProperty(key))
      .map((key) => {
        const property = responseToRetrieve.properties[key];

        if (
          typeof property === "object" 
          && property !== null 
          && "type" in property 
          && property.type in property
          && NotionPagePropertiesTypeArray.includes(property.type)
        ) {
          return {
            [key]: {
              [property.type]: property[property.type as keyof typeof property]
            } as  NonNullable<UpdatePageParameters["properties"]>[string]
          };
        } else {
          throw new Error(`Unexpected property format for key: ${key}`);
        }
      });

    const properties = propertiesList.reduce((acc, obj) => {
      const key = Object.keys(obj)[0];
      acc[key] = obj[key];
      return acc;
    }, {} as  NonNullable<UpdatePageParameters["properties"]>);

    const icon:CreatePageParameters['icon'] = (() => {
      if (responseToRetrieve.icon === null) return null;
      switch (responseToRetrieve.icon.type) {
        case 'emoji':
          return { emoji: responseToRetrieve.icon.emoji, type: responseToRetrieve.icon.type }
        case 'external':
          return { external: { url: responseToRetrieve.icon.external.url }, type: responseToRetrieve.icon.type }
        case 'custom_emoji':
          return { custom_emoji: { id: responseToRetrieve.icon.custom_emoji.id, name: responseToRetrieve.icon.custom_emoji.name, url: responseToRetrieve.icon.custom_emoji.url }, type: responseToRetrieve.icon.type }
        default:
          throw new Error(`Unexpected icon type: ${responseToRetrieve.icon.type}`);
      }
    })();

    const cover: CreatePageParameters['cover'] = (() => {
      if (responseToRetrieve.cover === null) return null;
      switch (responseToRetrieve.cover.type) {
        case 'external':
          return { external: { url: responseToRetrieve.cover.external.url }, type: responseToRetrieve.cover.type }
        case 'file':
          logger.warn("internal saved cover is not supported by Notion API.")
          return null
        default:
          throw new Error(`Unexpected cover type: ${responseToRetrieve.cover}`);
      }
    })();

    await NotionAPI.updatePageProperties(targetPageId, properties as UpdatePageParameters["properties"], icon, cover);

    await copyBlockChildrenUpdate(sourcePageId, targetPageId);
  } catch (error: any) {
    logger.error(`Error copying page "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
};

export const copyBlockChildrenUpdate = async (sourceBlockId: NotionUUID, targetBlockId: NotionUUID): Promise<void> => {
  try {
    await deleteAllBlockChildren(targetBlockId);

    const responseToRetrieve = await NotionAPI.retrieveBlockChildren(sourceBlockId);
    const nestedBlockIdObjs: { sourceBlockId: string; blockIndex: number }[] = [];
    // logger.debug(`Retrieved results: ${JSON.stringify(responseToRetrieve.results)}`);

    const children = responseToRetrieve.results
    .filter((result): result is BlockObjectResponse => "type" in result)
    .map((result: NotionBlock, index: number) => {
      if (result.has_children) {
        nestedBlockIdObjs.push({ sourceBlockId: result.id, blockIndex: index });
      }
      return {
        type: result.type,
        [result.type]: result[result.type]
      } as BlockObjectRequest
    });

    const responseToAppend = await NotionAPI.appendBlockChildren(targetBlockId, children);

    await Promise.all(
      nestedBlockIdObjs.map(async ({ sourceBlockId, blockIndex }) => {
        const targetBlockId = responseToAppend.results[blockIndex].id;
        await copyBlockChildrenUpdate(toNotionUUID(sourceBlockId), toNotionUUID(targetBlockId));
      })
    );
  } catch (error: any) {
    logger.error(`Error copying block children from "${sourceBlockId}" to "${targetBlockId}":`, error.message);
    throw error;
  }
};

export const copyPagePropertiesUpdate = async (sourcePageId: NotionUUID, targetPageId: NotionUUID): Promise<void> => {
  try {
    const responseToRetrieve: GetPageResponse = await NotionAPI.retrieveAPage(sourcePageId);

    if (!("properties" in responseToRetrieve)) {
      throw new Error(`Failed to retrieve properties of page "${sourcePageId}"`);
    } 
    const targetPageProperties = (await NotionAPI.retrieveAPage(targetPageId) as PageObjectResponse).properties;

    const propertiesList = Object.keys(responseToRetrieve.properties)
      .filter((key) => targetPageProperties?.hasOwnProperty(key))
      .map((key) => {
        const property = responseToRetrieve.properties[key];

        if (
          typeof property === "object" 
          && property !== null 
          && "type" in property 
          && property.type in property
          && NotionPagePropertiesTypeArray.includes(property.type)
        ) {
          return {
            [key]: {
              [property.type]: property[property.type as keyof typeof property]
            } as  NonNullable<UpdatePageParameters["properties"]>[string]
          };
        } else {
          throw new Error(`Unexpected property format for key: ${key}`);
        }
      });

    const properties = propertiesList.reduce((acc, obj) => {
      const key = Object.keys(obj)[0];
      acc[key] = obj[key];
      return acc;
    }, {} as  NonNullable<UpdatePageParameters["properties"]>);
    await NotionAPI.updatePageProperties(targetPageId, properties as UpdatePageParameters["properties"]);
  } catch (error: any) {
    logger.error(`Error copying page properties from "${sourcePageId}" to "${targetPageId}":`, error.message);
    throw error;
  }
};

export const deleteAllBlockChildren = async (targetBlockId: string): Promise<void> => {
  try {
    const responseToRetrieve = await NotionAPI.retrieveBlockChildren(targetBlockId);
    const childrenIds = responseToRetrieve.results
      .filter((result): result is BlockObjectResponse => "type" in result)
      .map((result: NotionBlock) => result.id);

    await Promise.all(childrenIds.map(async (childId) => await NotionAPI.deleteABlock(childId)));
  } catch (error: any) {
    logger.error(`Error deleting all children from block "${targetBlockId}":`, error.message);
    throw error;
  }
};
