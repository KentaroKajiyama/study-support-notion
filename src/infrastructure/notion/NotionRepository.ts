import { getNotionClient } from "@infrastructure/notionClient.js";
import { logger } from "@utils/index.js";
import { Client } from "@notionhq/client";
import { 
  UpdatePageParameters,
  QueryDatabaseResponse,
  PropertyFilter,
  PageObjectResponse
} from "@notionhq/client/build/src/api-endpoints.js";
import {
  isNotionClientError,
  APIResponseError,
  UnknownHTTPResponseError,
  RequestTimeoutError,
  APIErrorCode,
} from "@notionhq/client/build/src/errors.js";
import { NotionUUID } from "@domain/types/myNotionType.js";

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
      const response =  await this.updatePageProperties(pageId, this.toDomain({ archived: true } as unknown as TResponse));
      if (!response) {
        logger.warn(`No response from Notion API for page id: ${pageId}`);
        return null;
      }
      return response
    } catch (error) {
      logger.error("Error deleting page in Notion\n");
      throw error;
    }
  }

  async restoreAPage(
    pageId: NotionUUID
  ): Promise<TDomain | null> {
    try {
      const response = await this.updatePageProperties(pageId, this.toDomain({ archived: false } as unknown as TResponse));
      if (!response) {
        logger.warn(`No response from Notion API for page id: ${pageId}`);
        return null;
      }
      return response
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

// Error handling
function exponentialBackoff(attempt: number): Promise<void> {
  // e.g. attempt=1 => 1000ms, attempt=2 => 2000ms, attempt=3 => 4000ms, ...
  const delay = 1000 * 2 ** (attempt - 1)
  return new Promise((resolve) => setTimeout(resolve, delay))
}

async function callNotionWithAdvancedErrorHandling<T>(
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