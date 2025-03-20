import { getNotionClient } from "@infrastructure/notionClient.js";
import { 
  logger,
  ensureValue 
} from "@utils/index.js";
import { Client } from "@notionhq/client";
import { 
  UpdatePageParameters,
  QueryDatabaseResponse,
  PropertyFilter,
  PageObjectResponse,
  EmojiRequest,
  BlockObjectRequest,
  CreatePageParameters
} from "@notionhq/client/build/src/api-endpoints.js";
import { 
  CoverExternal,
  IconUnion,
  NotionUUID,
  ParentRequest,
  URLString,
  isNotionUUID,
  isValidURLRegex,
  toNotionUUID,
  toURLString,
} from "@domain/types/index.js";
import { 
  callNotionWithAdvancedErrorHandling 
} from "@infrastructure/notionAPI.js";

const notionClient: Client = getNotionClient();

const maxRetries = 3;

type filter = 
  | {
      or: Array<
        | PropertyFilter
        | { or: Array<PropertyFilter> }
        | { and: Array<PropertyFilter> }
      >
    }
  | {
      and: Array<
        | PropertyFilter
        | { or: Array<PropertyFilter> }
        | { and: Array<PropertyFilter> }
      >
    }
  | PropertyFilter 
  | null

export abstract class NotionRepository<TDomain, TResponse, TRequest> {

  protected abstract toDomain(response: TResponse): TDomain;
  protected abstract toNotion(domain: TDomain): TRequest;

  async createAPage(
    domainParent: NotionUUID,
    parentOption: 'page_id'|'database_id',
    domainProperties: TDomain,
    domainIcon: EmojiRequest | URLString | NotionUUID | null,
    iconOption: 'emoji' | 'external' | 'custom_emoji' | null,
    domainCover:  URLString | null,
    coverOption: 'external' | null,
    children: Array<BlockObjectRequest>,
  ): Promise<NotionUUID | null> {
    try {
      const parent: ParentRequest = (() => {
        switch (parentOption) {
          case 'page_id':
            return { page_id: ensureValue(domainParent, 'you cannot select the page_id option without providing domainParent with page_id') };
          case 'database_id':
            return { database_id: ensureValue(domainParent, 'you cannot select the database_id option without providing domainParent with database_id') };
          default:
            throw new Error("Invalid parent option, you must provide domainParent with page_id or database_id");
        }
      })();
      const properties = this.toNotion(domainProperties) as CreatePageParameters["properties"];
      const icon: IconUnion | null = (() => {
        switch (iconOption) {
          case 'emoji':
            const ensuredIcon = ensureValue(domainIcon);
            if (isValidURLRegex(ensuredIcon) || isNotionUUID(ensuredIcon)) throw new Error("Invalid combination of domainIcon and Icon option");
            return { emoji: ensuredIcon };
          case 'external':
            return { external: { url: toURLString(ensureValue(domainIcon))} };
          case 'custom_emoji':
            return { custom_emoji: { id: toNotionUUID(ensureValue(domainIcon)) } };
          default:
            return null;
        }
      })();
      const cover: CoverExternal | null = (() => {
        if (coverOption === 'external') {
          return { external: { url: ensureValue(domainCover) } };
        }
        return null;
      })();
      const payload: CreatePageParameters = {
        parent: parent,
        properties: properties,
        icon: icon,
        cover: cover,
        children: children,
      }
      logger.debug(`payload: ${JSON.stringify(payload)}`);
      const response = await callNotionWithAdvancedErrorHandling(
        async () => {
          try {
            return await notionClient.pages.create(payload);
          } catch (error) {
            logger.error("Error creating page in Notion\n");
            throw error;
          }
        },
        maxRetries
      ) as PageObjectResponse;
      if (!response) {
        logger.warn('No response from Notion API for page creation');
        return null;
      }
      return toNotionUUID(response.id);
    } catch (error) {
      logger.error("Error creating page in Notion\n");
      throw error;
    }
  } 

  async createAPageOnlyWithProperties(
    domainParent: NotionUUID,
    parentOption: 'page_id'|'database_id',
    domainProperties: TDomain
  ): Promise<NotionUUID|null> {
    try {
      logger.debug('domainProperties: ' + JSON.stringify(domainProperties))
      return await this.createAPage(
        domainParent,
        parentOption,
        domainProperties,
        null,
        null,
        null,
        null,
        []
      );
    } catch(error) {
      logger.error("Error creating page only with properties in Notion\n");
      throw error;
    }
  };

  async retrieveAPage(
    pageId: NotionUUID
  ): Promise<TDomain | null> {
    try {
      const response = await callNotionWithAdvancedErrorHandling(
        async () => {
          try {
            return await notionClient.pages.retrieve({ page_id: pageId });
          } catch (error) {
            logger.error("Error retrieving page from Notion\n");
            throw error;
          }
        },
        maxRetries
      ) as PageObjectResponse;
      if (!response) {
        logger.warn('No response from Notion API for page id: ${pageId}');
        return null;
      }
      return this.toDomain(response.properties as TResponse)
    } catch (error) {
      logger.error("Error retrieving page from Notion\n");
      throw error;
    }
  }

  async updatePageProperties(
    pageId: NotionUUID,
    updates: TDomain 
  ): Promise<TDomain | null> {
    try { 
      const properties = this.toNotion(updates) as UpdatePageParameters["properties"];
      const payload: UpdatePageParameters = {
        page_id: pageId,
        properties: properties,
      };
      const response = await callNotionWithAdvancedErrorHandling(
        async () => {
          try {
            return await notionClient.pages.update(payload);
          } catch (error) {
            logger.error("Error updating properties in Notion\n");
            throw error;
          }
        },
        maxRetries
      ) as PageObjectResponse;
      if (!response) {
        logger.warn('No response from Notion API for page id: ${pageId}');
        return null;
      }
      return this.toDomain(response.properties as TResponse);
    } catch (error) {
      logger.error("Error updating Notion page properties, pageId: ${pageId}\n");
      throw error;
    }
  };

  async deleteAPage(
    pageId: NotionUUID
  ): Promise<TDomain|null> {
    try {
      const payload: UpdatePageParameters = {
        page_id: pageId,
        archived: true 
      };
      const response = await callNotionWithAdvancedErrorHandling(
        async () => {
          try {
            return await notionClient.pages.update(payload);
          } catch (error) {
            logger.error("Error deleting a page in Notion\n");
            throw error;
          }
        },
        maxRetries
      ) as PageObjectResponse;
      if (!response) {
        logger.warn(`No response from Notion API for page id: ${pageId}`);
        return null;
      }
      return this.toDomain(response.properties as TResponse);
    } catch (error) {
      logger.error("Error deleting page in Notion\n");
      throw error;
    }
  }

  async restoreAPage(
    pageId: NotionUUID
  ): Promise<TDomain | null> {
    try {
      const payload: UpdatePageParameters = {
        page_id: pageId,
        archived: false 
      };
      const response = await callNotionWithAdvancedErrorHandling(
        async () => {
          try {
            return await notionClient.pages.update(payload);
          } catch (error) {
            logger.error("Error restoring a page in Notion\n");
            throw error;
          }
        },
        maxRetries
      ) as PageObjectResponse;
      if (!response) {
        logger.warn(`No response from Notion API for page id: ${pageId}`);
        return null;
      }
      return this.toDomain(response.properties as TResponse);
    } catch (error) {
      logger.error("Error restoring page in Notion\n");
      throw error;
    }
  }

  async queryADatabase(
    databaseId: NotionUUID,
    sortProperties: Array<{ property: string; direction: "ascending" | "descending" }> = [],
    filter: filter = null,
  ): Promise<TDomain[]> {
    try {
      let results: QueryDatabaseResponse["results"] = [];
      let cursor: string | null = null;

      do {
        const response = await callNotionWithAdvancedErrorHandling(
          async () => {
            try {
              return await notionClient.databases.query({
                database_id: databaseId,
                sorts: sortProperties.length > 0 ? sortProperties : undefined,
                filter: filter || undefined,
                start_cursor: cursor || undefined,
              })
            } catch (error) {
              logger.error("Error querying database from Notion\n");
              throw error;
            }
          },
          maxRetries
        )

        results.push(...response.results);
        cursor = response.next_cursor || null;
      } while (cursor);

      if (results.length === 0) {
        logger.warn(`No response from Notion API for database id: ${databaseId}`);
        return [];
      };

      return results
        .filter((res): res is PageObjectResponse => "properties" in res)
        .map((res: PageObjectResponse) => this.toDomain(res.properties as TResponse));
    } catch (error) {
      logger.error(`Error querying database from Notion API for database id: ${databaseId}`);
      throw error;
    }
  }
}

