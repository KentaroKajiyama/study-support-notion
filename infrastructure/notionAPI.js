import { getNotionClient } from "./notionClient"
import logger from "../utils/logger";

const notionClient = getNotionClient();

export default class NotionAPI {
  /**
   * @description
   * @date 21/02/2025
   * @param {*} cover
   * @param {*} icon
   * @param {*} parent
   * @param {*} properties
   * @param {*} children
   * @returns {*} 
   * @memberof notionAPI
   */
  static async createAPage(cover, icon, parent, properties, children){
    try{
      const payload = {
        cover: cover,
        icon: icon,
        parent: parent,
        properties: properties,
        children: children
      }
      return await notionClient.pages.create(payload);
    } catch(error) {
      logger.error("Error creating page in Notion:", error.message);
      throw error;
    }
  };
  static async retrieveAPage(pageId){
    try{
      return await notionClient.pages.retrieve(pageId);
    } catch(error) {
      logger.error("Error retrieving page from Notion:", error.message);
      throw error;
    }
  };
  static async updatePageProperties(pageId, properties){
    try{
      const payload = {
        page_id: pageId,
        properties: properties
      }
      return await notionClient.pages.update(payload);
    } catch(error) {
      logger.error("Error updating properties in Notion:", error.message);
      throw error;
    }
  };
  static async deleteAPage(pageId) {
    try {
      const payload = {
        page_id: pageId,
        archived: true,
      }
      return await notionClient.pages.update(payload);
    } catch(error) {
      logger.error("Error deleting page in Notion:", error.message);
      throw error;
    }
  };
  static async restoreAPage(pageId) {
    try {
      const payload = {
        page_id: pageId,
        archived: false,
      }
      return await notionClient.pages.update(payload);
    } catch(error) {
      logger.error("Error restoring page in Notion:", error.message);
      throw error;
    }
  };
  static async appendBlockChildren(blockId, children){
    try {
      const payload = {
        block_id: blockId,
        children: children
      }
      return await notionClient.blocks.children.append(payload);
    } catch(error) {
      logger.error("Error appending block children to Notion:", error.message);
      throw error;
    }
  }
  static async retrieveABlock(blockId){
    try{
      return await notionClient.blocks.retrieve(blockId);
    } catch(error) {
      logger.error("Error retrieving block from Notion:", error.message);
      throw error;
    }
  }
  /**
   * @description TODO: take pagenation into account
   * @date 20/02/2025
   * @param {*} block_id
   * @returns {*} 
   * @memberof notionAPI
   */
  static async retrieveBlockChildren(blockId){
    try{
      return await notionClient.blocks.children.list({
        block_id: blockId
      });
    } catch(error) {
      logger.error("Error retrieving block children from Notion:", error.message);
      throw error;
    }
  }
  static async updateABlock(blockId, block){
    try{
      const payload = {
        block_id: blockId,
        block: block
      }
      return await notionClient.blocks.update(payload);
    } catch(error) {
      logger.error("Error updating block in Notion:", error.message);
      throw error;
    }
  }
  static async deleteABlock(blockId){
    try {
      const payload = {
        block_id: blockId
      }
      return await notionClient.blocks.delete(payload);
    } catch(error) {
      logger.error("Error deleting block from Notion:", error.message);
      throw error;
    }
  }
  /**
   * Queries a Notion database with optional sorting and filtering.
   * Automatically fetches all pages if results exceed 100 items (pagination).
   *
   * @param {string} databaseId - The Notion database ID to query.
   * @param {Array<Object>} [sortProperties=[]] - Optional array of sorting rules.
   * Each sorting rule should have:
   *   - `property` (string): The column to sort by.
   *   - `direction` ("ascending" | "descending"): The sorting direction.
   * 
   * @example
   * // Sort by "Created" in descending order
   * const sortProperties = [
   *   { property: "Created", direction: "descending" }
   * ];
   * 
   * @param {Object|null} [filter=null] - Optional filter criteria to narrow results.
   * Filter conditions vary depending on the property type (text, select, date, etc.).
   * 
   * @example
   * // Filter tasks where "Status" is "In Progress"
   * const filter = {
   *   property: "Status",
   *   select: { equals: "In Progress" }
   * };
   * 
   * @example
   * // Filter tasks where "Priority" is either "High" or "Medium"
   * const filter = {
   *   or: [
   *     { property: "Priority", select: { equals: "High" } },
   *     { property: "Priority", select: { equals: "Medium" } }
   *   ]
   * };
   * 
   * @example
   * // Filter records created after a specific date
   * const filter = {
   *   property: "Created",
   *   date: { after: "2024-01-01" }
   * };
   * 
   * @returns {Promise<Array<Object>>} - Returns an array of all matching database items.
   * 
   * @example
   * // Query the database with sorting and filtering
   * const results = await queryADatabase("your-database-id", sortProperties, filter);
   * console.log(results);
   * 
   * @throws {Error} If the Notion API request fails.
   */
  static async queryADatabase(databaseId, sortProperties = [], filter = null) {
    try {
      let results = [];
      let cursor = null;

      do {
        const response = await notionClient.databases.query({
          database_id: databaseId,
          sorts: sortProperties.length > 0 ? sortProperties : undefined,
          filter: filter || undefined,
          start_cursor: cursor || undefined
        });

        results.push(...response.results);
        cursor = response.next_cursor; // Get the next cursor for pagination

      } while (cursor); // Continue fetching until there's no more cursor

      return results;
    } catch (error) {
      logger.error("Error querying database from Notion:", error.message);
      throw error;
    }
  }

  static async queryADatabaseWithFilter(databaseId, sortProperties, filter){
    try{
      const sorts = sortProperties.map(property => property)
      return await notionClient.databases.query({
        database_id: databaseId,
        sorts: sorts,
        filter: filter
      });
    } catch(error) {
      logger.error("Error querying database from Notion with filter:", error.message);
      throw error;
    }
  }

  static async retrieveADatabase(databaseId){
    try{
      return await notionClient.databases.retrieve({
        database_id: databaseId
      });
    } catch(error) {
      logger.error("Error retrieving database from Notion:", error.message);
      throw error;
    }
  }
}