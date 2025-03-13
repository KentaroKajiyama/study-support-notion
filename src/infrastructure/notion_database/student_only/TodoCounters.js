import logger from "../../../utils/logger";
import NotionAPI from "../../notionAPI";
import * as _ from "../../../const/notionTemplate";
import { propertyFromNotion, propertyToNotion } from "../../../utils/propertyHandler";
import { todoCounters } from "../../../const/notionDatabaseColumns";

export class TodoCounters {
  static async getTodoCounters(databaseId) {
    try {
      const response = await NotionAPI.queryADatabase(databaseId);
      if (response.status!== 200) {
        throw new Error(`Failed to fetch data from Notion. Status code: ${response.status}`);
      }
      return response.results.map(result => {
        return {
          id: result.id,
          subfieldId: propertyFromNotion(result.properties, todoCounters.subfieldId.name, todoCounters.subfieldId.type),
          subfieldName: propertyFromNotion(result.properties, todoCounters.subfieldName.name, todoCounters.subfieldName.type),
          remainingProbNum: propertyFromNotion(result.properties, todoCounters.remainingProbNum.name, todoCounters.remainingProbNum.type),
          diffFromTarget: propertyFromNotion(result.properties, todoCounters.diffFromTarget.name, todoCounters.diffFromTarget.type),
        }
      })
    } catch (error) {
      logger.error("Error in TodoCounters.getTodoCounters", error.message);
    }
  };
  static async createTodoCounters(databaseId, todoCounterList) {
    try {
      const promises = todoCounterList.map(async todoCounter => {
        try {
          const properties = _.Properties.getJSON(
            propertyToNotion({
              propertyName: todoCounters.subfieldId.name,
              propertyContent: todoCounter.subfieldId,
              propertyType: todoCounters.subfieldId.type,
            }),
            propertyToNotion({
              propertyName: todoCounters.subfieldName.name,
              propertyContent: todoCounter.subfieldName,
              propertyType: todoCounters.subfieldName.type,
            }),
            propertyToNotion({
              propertyName: todoCounters.remainingProbNum.name,
              propertyContent: todoCounter.remainingProbNum,
              propertyType: todoCounters.remainingProbNum.type,
            }),
            propertyToNotion({
              propertyName: todoCounters.diffFromTarget.name,
              propertyContent: todoCounter.diffFromTarget,
              propertyType: todoCounters.diffFromTarget.type,
            })
          );
          const promise = await NotionAPI.createAPage(databaseId, properties);
          if (promise.status!== 200) {
            throw new Error(`Failed to create TodoCounter "${todoCounter.subfieldName}"`);
          }
        } catch (error) {
          logger.error(`Failed to create TodoCounter "${todoCounter.subfieldName}":`, error.message);
        }
      })
      await Promise.all(promises);
    } catch (error) {
      logger.error("Error in TodoCounters.createTodoCounters", error.message);
    }
  };
  static async updateATodoCounter(todoCounterId, todoCounter) {
    try {
      const properties = _.Properties.getJSON(
        propertyToNotion({
          propertyName: todoCounters.subfieldId.name,
          propertyContent: todoCounter.subfieldId,
          propertyType: todoCounters.subfieldId.type,
        }),
        propertyToNotion({
          propertyName: todoCounters.subfieldName.name,
          propertyContent: todoCounter.subfieldName,
          propertyType: todoCounters.subfieldName.type,
        }),
        propertyToNotion({
          propertyName: todoCounters.remainingProbNum.name,
          propertyContent: todoCounter.remainingProbNum,
          propertyType: todoCounters.remainingProbNum.type,
        }),
        propertyToNotion({
          propertyName: todoCounters.diffFromTarget.name,
          propertyContent: todoCounter.diffFromTarget,
          propertyType: todoCounters.diffFromTarget.type,
        })
      );
      const response = await NotionAPI.updateAPage(todoCounterId, properties);
      if (response.status!== 200) {
        throw new Error(`Failed to update TodoCounter "${todoCounter.subfieldName}"`);
      }
    } catch (error) {
      logger.error(`Failed to update TodoCounter "${todoCounter.subfieldName}":`, error.message);
    }
  };
  static async deleteATodoCounter(todoCounterId) {
    try {
      const response = await NotionAPI.deleteAPage(todoCounterId);
      if (response.status!== 200) {
        throw new Error(`Failed to delete TodoCounter "${todoCounterId}"`);
      }
    } catch (error) {
      logger.error(`Failed to delete TodoCounter "${todoCounterId}":`, error.message);
    }
  };
}