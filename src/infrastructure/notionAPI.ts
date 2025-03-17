import { getNotionClient } from "@infrastructure/notionClient.js";
import { logger } from "@utils/index.js";
import { Client } from "@notionhq/client";
import { 
  CreatePageParameters,
  GetPageResponse,
  UpdatePageParameters,
  AppendBlockChildrenParameters,
  GetBlockResponse,
  QueryDatabaseResponse,
  CreatePageResponse,
  UpdatePageResponse,
  AppendBlockChildrenResponse,
  ListBlockChildrenResponse,
  IdRequest,
  PropertyFilter,
  GetDatabaseResponse,
  BlockObjectRequest,
  NumberFormat,
  PropertyDescriptionRequest,
  StringRequest,
  EmptyObject,
  SelectColor,
  RollupFunction,
  EmojiRequest,
  TextRequest,
  RichTextItemRequest,
  CreateDatabaseParameters,
  UpdateDatabaseParameters
} from "@notionhq/client/build/src/api-endpoints.js";
import {
  isNotionClientError,
  APIResponseError,
  UnknownHTTPResponseError,
  RequestTimeoutError,
  APIErrorCode,
} from "@notionhq/client/build/src/errors.js";

const notionClient: Client = getNotionClient();

const maxRetries = 3;

export default class NotionAPI {
  static async createAPage(
    parent: CreatePageParameters["parent"],
    properties: CreatePageParameters["properties"],
    icon?: CreatePageParameters["icon"],
    cover?: CreatePageParameters["cover"],
    children?: CreatePageParameters["children"]
  ): Promise<CreatePageResponse> {
    const payload: CreatePageParameters = {
      parent: parent,
      properties: properties,
      icon: icon,
      cover: cover,
      children: children,
    };
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.pages.create(payload);
        } catch (error) {
          logger.error("Error creating page in Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  };

  static async retrieveAPage(pageId: IdRequest): Promise<GetPageResponse> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.pages.retrieve({ page_id: pageId });
        } catch (error) {
          logger.error("Error retrieving page from Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  }

  static async updatePageProperties(
    pageId: IdRequest,
    properties: UpdatePageParameters["properties"]
  ): Promise<UpdatePageResponse> {
    const payload: UpdatePageParameters = {
      page_id: pageId,
      properties: properties,
    };
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.pages.update(payload);
        } catch (error) {
          logger.error("Error updating properties in Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  };

  static async deleteAPage(pageId: IdRequest): Promise<UpdatePageResponse> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await this.updatePageProperties(pageId, { archived: true });
        } catch (error) {
          logger.error("Error deleting page in Notion\n");
          throw error;
        }
      },
      maxRetries
    );
  }

  static async restoreAPage(pageId: string): Promise<UpdatePageResponse> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await this.updatePageProperties(pageId, { archived: false });
        } catch (error) {
          logger.error("Error restoring page in Notion\n");
          throw error;
        }
      },
      maxRetries
    );
  }

  static async appendBlockChildren(
    blockId: IdRequest,
    children: Array<BlockObjectRequest>,
    after?: IdRequest
  ): Promise<AppendBlockChildrenResponse> {
    const payload: AppendBlockChildrenParameters = {
      block_id: blockId,
      children: children,
      after: after,
    };
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.blocks.children.append(payload);
        } catch (error) {
          logger.error("Error appending block children to Notion\n");
          throw error;
        }
      },
      maxRetries
    );
  }

  static async retrieveABlock(blockId: IdRequest): Promise<GetBlockResponse> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.blocks.retrieve({ block_id: blockId })
        } catch (error) {
          logger.error("Error retrieving block from Notion\n");
          throw error;
        }
      }
    )
  }

  static async retrieveBlockChildren(blockId: IdRequest): Promise<ListBlockChildrenResponse> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.blocks.children.list({ block_id: blockId });
        } catch (error) {
          logger.error("Error retrieving block children from Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  }

  static async updateABlock(blockId: IdRequest, block: any): Promise<any> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.blocks.update({ block_id: blockId, ...block });
        } catch (error) {
          logger.error("Error updating block in Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  }

  static async deleteABlock(blockId: IdRequest): Promise<any> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.blocks.delete({ block_id: blockId });
        } catch (error) {
          logger.error("Error deleting block in Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  }

  static async createADatabase(
    parent: { page_id: IdRequest; type?: "page_id" } | { database_id: IdRequest; type?: 'database_id' },
    properties: Record<
      string,
      | {
          number: { format?: NumberFormat }
          type?: "number"
          description?: PropertyDescriptionRequest | null
        }
      | {
          formula: { expression?: string }
          type?: "formula"
          description?: PropertyDescriptionRequest | null
        }
      | {
          select: {
            options?: Array<{
              name: StringRequest
              color?: SelectColor
              description?: StringRequest | null
            }>
          }
          type?: "select"
          description?: PropertyDescriptionRequest | null
        }
      | {
          multi_select: {
            options?: Array<{
              name: StringRequest
              color?: SelectColor
              description?: StringRequest | null
            }>
          }
          type?: "multi_select"
          description?: PropertyDescriptionRequest | null
        }
      | {
          relation:
            | {
                single_property: EmptyObject
                database_id: IdRequest
                type?: "single_property"
              }
            | {
                dual_property: Record<string, never>
                database_id: IdRequest
                type?: "dual_property"
              }
          type?: "relation"
          description?: PropertyDescriptionRequest | null
        }
      | {
          rollup:
            | {
                rollup_property_name: string
                relation_property_name: string
                function: RollupFunction
                rollup_property_id?: string
                relation_property_id?: string
              }
            | {
                rollup_property_name: string
                relation_property_id: string
                function: RollupFunction
                relation_property_name?: string
                rollup_property_id?: string
              }
            | {
                relation_property_name: string
                rollup_property_id: string
                function: RollupFunction
                rollup_property_name?: string
                relation_property_id?: string
              }
            | {
                rollup_property_id: string
                relation_property_id: string
                function: RollupFunction
                rollup_property_name?: string
                relation_property_name?: string
              }
          type?: "rollup"
          description?: PropertyDescriptionRequest | null
        }
      | {
          unique_id: { prefix?: string | null }
          type?: "unique_id"
          description?: PropertyDescriptionRequest | null
        }
      | {
          title: EmptyObject
          type?: "title"
          description?: PropertyDescriptionRequest | null
        }
      | {
          rich_text: EmptyObject
          type?: "rich_text"
          description?: PropertyDescriptionRequest | null
        }
      | {
          url: EmptyObject
          type?: "url"
          description?: PropertyDescriptionRequest | null
        }
      | {
          people: EmptyObject
          type?: "people"
          description?: PropertyDescriptionRequest | null
        }
      | {
          files: EmptyObject
          type?: "files"
          description?: PropertyDescriptionRequest | null
        }
      | {
          email: EmptyObject
          type?: "email"
          description?: PropertyDescriptionRequest | null
        }
      | {
          phone_number: EmptyObject
          type?: "phone_number"
          description?: PropertyDescriptionRequest | null
        }
      | {
          date: EmptyObject
          type?: "date"
          description?: PropertyDescriptionRequest | null
        }
      | {
          checkbox: EmptyObject
          type?: "checkbox"
          description?: PropertyDescriptionRequest | null
        }
      | {
          created_by: EmptyObject
          type?: "created_by"
          description?: PropertyDescriptionRequest | null
        }
      | {
          created_time: EmptyObject
          type?: "created_time"
          description?: PropertyDescriptionRequest | null
        }
      | {
          last_edited_by: EmptyObject
          type?: "last_edited_by"
          description?: PropertyDescriptionRequest | null
        }
      | {
          last_edited_time: EmptyObject
          type?: "last_edited_time"
          description?: PropertyDescriptionRequest | null
        }
      >,
    icon?:
    | { emoji: EmojiRequest; type?: "emoji" }
    | null
    | { external: { url: TextRequest }; type?: "external" }
    | null
    | {
        custom_emoji: { id: IdRequest; name?: string; url?: string }
        type?: "custom_emoji"
      }
    | null,
    cover?: { external: { url: TextRequest }; type?: "external" } | null,
    title?: Array<RichTextItemRequest>,
    description?: Array<RichTextItemRequest>,
    is_inline?: boolean
  ) {
    const payload : CreateDatabaseParameters = {
      parent: parent,
      properties: properties,
      icon: icon,
      cover: cover,
      title: title,
      description: description,
      is_inline: is_inline,
    }
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.databases.create(payload);
        } catch (error) {
          logger.error("Error creating database in Notion\n");
          throw error;
        }
      },
      maxRetries
    )
  }

  static async queryADatabase(
    databaseId: IdRequest,
    sortProperties: Array<{ property: string; direction: "ascending" | "descending" }> = [],
    filter: | {
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
            | null = null,
  ): Promise<QueryDatabaseResponse["results"]> {
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

    return results;
  }

  static async retrieveADatabase(databaseId: IdRequest): Promise<GetDatabaseResponse> {
    return await callNotionWithAdvancedErrorHandling(
      async () => {
        try {
          return await notionClient.databases.retrieve({ database_id: databaseId });
        } catch (error) {
          logger.error("Error retrieving database from Notion\n");
          throw error;
        }
      },
      maxRetries
    );
  }

  static async updateADatabase(
    databaseId: IdRequest,
    title?: Array<RichTextItemRequest>,
    description?: Array<RichTextItemRequest>,
    icon?:
      | { emoji: EmojiRequest; type?: "emoji" }
      | null
      | { external: { url: TextRequest }; type?: "external" }
      | null
      | {
          custom_emoji: { id: IdRequest; name?: string; url?: string }
          type?: "custom_emoji"
        }
      | null,
    cover?: { external: { url: TextRequest }; type?: "external" } | null,
    properties?: Record<
      string,
      | {
          number: { format?: NumberFormat }
          type?: "number"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          formula: { expression?: string }
          type?: "formula"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          select: {
            options?: Array<
              | {
                  id: StringRequest
                  name?: StringRequest
                  color?: SelectColor
                  description?: StringRequest | null
                }
              | {
                  name: StringRequest
                  id?: StringRequest
                  color?: SelectColor
                  description?: StringRequest | null
                }
            >
          }
          type?: "select"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          multi_select: {
            options?: Array<
              | {
                  id: StringRequest
                  name?: StringRequest
                  color?: SelectColor
                  description?: StringRequest | null
                }
              | {
                  name: StringRequest
                  id?: StringRequest
                  color?: SelectColor
                  description?: StringRequest | null
                }
            >
          }
          type?: "multi_select"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          relation:
            | {
                single_property: EmptyObject
                database_id: IdRequest
                type?: "single_property"
              }
            | {
                dual_property: Record<string, never>
                database_id: IdRequest
                type?: "dual_property"
              }
          type?: "relation"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          rollup:
            | {
                rollup_property_name: string
                relation_property_name: string
                function: RollupFunction
                rollup_property_id?: string
                relation_property_id?: string
              }
            | {
                rollup_property_name: string
                relation_property_id: string
                function: RollupFunction
                relation_property_name?: string
                rollup_property_id?: string
              }
            | {
                relation_property_name: string
                rollup_property_id: string
                function: RollupFunction
                rollup_property_name?: string
                relation_property_id?: string
              }
            | {
                rollup_property_id: string
                relation_property_id: string
                function: RollupFunction
                rollup_property_name?: string
                relation_property_name?: string
              }
          type?: "rollup"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          unique_id: { prefix?: string | null }
          type?: "unique_id"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          title: EmptyObject
          type?: "title"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          rich_text: EmptyObject
          type?: "rich_text"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          url: EmptyObject
          type?: "url"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          people: EmptyObject
          type?: "people"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          files: EmptyObject
          type?: "files"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          email: EmptyObject
          type?: "email"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          phone_number: EmptyObject
          type?: "phone_number"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          date: EmptyObject
          type?: "date"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          checkbox: EmptyObject
          type?: "checkbox"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          created_by: EmptyObject
          type?: "created_by"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          created_time: EmptyObject
          type?: "created_time"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          last_edited_by: EmptyObject
          type?: "last_edited_by"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | {
          last_edited_time: EmptyObject
          type?: "last_edited_time"
          name?: string
          description?: PropertyDescriptionRequest | null
        }
      | null
      | { name: string }
      | null
      >,
      is_inline?: boolean,
      archived?: boolean,
      in_trash?: boolean
    ) {
      const payload : UpdateDatabaseParameters = {
        database_id: databaseId,
        title: title,
        description: description,
        icon: icon,
        cover: cover,
        properties: properties,
        is_inline: is_inline,
        archived: archived,
        in_trash: in_trash
      };
      return await callNotionWithAdvancedErrorHandling(
        async () => {
          try {
            return await notionClient.databases.update(payload);
          } catch (error) {
            logger.error('Error update a database from Notion\n');
            throw error;
          }
        }, 
        maxRetries
      )
    }
}

// Error handling
function exponentialBackoff(attempt: number): Promise<void> {
  // e.g. attempt=1 => 1000ms, attempt=2 => 2000ms, attempt=3 => 4000ms, ...
  const delay = 1000 * 2 ** (attempt - 1)
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function callNotionWithAdvancedErrorHandling<T>(
  notionCall: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Make the actual Notion API call
      const result = await notionCall()
      return result
    } catch (error: unknown) {
      // 1. Check if it's a Notion error at all
      if (isNotionClientError(error)) {
        // 2. Narrow down further:
        if (APIResponseError.isAPIResponseError(error)) {
          // It's an APIResponseError => we can switch on the known API error codes
          switch (error.code) {
            // Some errors are "transient," so we might choose to retry
            case APIErrorCode.RateLimited:
            case APIErrorCode.InternalServerError:
            case APIErrorCode.ServiceUnavailable:
              // Retry logic with exponential backoff
              if (attempt < maxRetries) {
                logger.warn(
                  `Attempt #${attempt} failed with transient error [${error.code}]. Retrying...`
                )
                await exponentialBackoff(attempt)
                continue
              } else {
                // Exhausted all retries — rethrow
                throw error
              }

            // For other API errors, handle them or just throw
            case APIErrorCode.Unauthorized:
              logger.error("Unauthorized. Check your Notion token.")
              throw error

            case APIErrorCode.ObjectNotFound:
              logger.error("Notion object not found:", error.message)
              throw error

            case APIErrorCode.RestrictedResource:
              logger.error("You do not have permission to access this resource.")
              throw error

            case APIErrorCode.RateLimited:
              // Already handled above; shown here just for completeness
              throw error

            case APIErrorCode.InvalidJSON:
              logger.error("Invalid JSON response from Notion:", error.message)
              throw error
            
            case APIErrorCode.InvalidRequestURL:
              logger.error("Invalid request URL:", error.message)
              throw error

            case APIErrorCode.InvalidRequest:
              logger.error("Invalid request:", error.message)
              throw error
            
            case APIErrorCode.ValidationError:
              logger.error("Validation error:", error.message)
              throw error

            case APIErrorCode.ConflictError:
              logger.error("Conflict error:", error.message)
              throw error
            
            default:
              // We use a default to catch unhandled codes
              // If the SDK introduces a new code, TypeScript can warn here
              const exhaustiveCheck: never = error.code
              logger.error(
                "Unhandled Notion API Error code:",
                exhaustiveCheck,
                error.message
              )
              throw error
          }
        } else if (RequestTimeoutError.isRequestTimeoutError(error)) {
          // Specifically a request-timeout scenario
          if (attempt < maxRetries) {
            logger.warn(
              `Notion request timed out on attempt #${attempt}. Retrying...`
            )
            await exponentialBackoff(attempt)
            continue
          } else {
            throw error
          }
        } else if (UnknownHTTPResponseError.isUnknownHTTPResponseError(error)) {
          // The SDK couldn't parse the error body into a known shape
          // Decide if you want to retry or just throw
          logger.error("Unknown HTTP Response Error from Notion:", error.message)
          throw error
        } else {
          // Another Notion error that doesn't match the above checks
          // Possibly a new type of NotionClientError
          logger.error("Unexpected NotionClientError:", error)
          throw error
        }
      } else {
        // 3. Not a Notion error at all - e.g., a Node.js error, network error, etc.
        logger.error("A non-Notion error occurred:", error)
        throw error
      }
    }
  }
  // We only get here if we didn't return or throw during the loop (very unlikely)
  throw new Error("Max retries exceeded.")
}