import notionAPI from '../../notionAPI';
import * as _ from '../../../const/notion_template';
import { richTextToInlineText } from '../../../utils/convert_rich_text';

/**
 * @description A class to handle CRUD operations for the CoachStudentInformation database
 * @date 21/02/2025
 * @export
 * @class CoachStudentInformation
 */
export class StudentDetailInformation {
  // 1) Define all column names/arrays as static properties
  static titleColumn = '氏名';

  // Columns that should be stored as 'Select' in Notion (教科)
  static subjectColumns = [
    '英語',
    '数学',
    '国語',
    '物理',
    '化学',
    '生物',
    '日本史',
    '世界史',
    '地理'
  ];

  // Columns that should be stored as 'Number' in Notion (教科目標レベル)
  static subjectGoalLevelColumns = [
    '英語目標レベル',
    '数学目標レベル',
    '国語目標レベル',
    '物理目標レベル',
    '化学目標レベル',
    '生物目標レベル',
    '日本史目標レベル',
    '世界史目標レベル',
    '地理目標レベル'
  ];

  // Columns that should be stored as 'Status' in Notion (教科変更)
  static subjectChangeColumns = [
    '英語変更',
    '数学変更',
    '国語変更',
    '物理変更',
    '化学変更',
    '生物変更',
    '日本史変更',
    '世界史変更',
    '地理変更'
  ];

  /**
   * Helper method: Convert a single studentDetailInformation (object) into Notion page properties.
   * Decides property type based on configured columns.
   *
   * @param {Object} studentDetailInformation - A single row of data (key-value pairs).
   * @returns {Object} A Notion properties object.
   */
  static buildProperties(studentDetailInformation) {
    const properties = []

    // Loop over each key in the studentDetailInformation
    for (const [columnName, value] of Object.entries(studentDetailInformation)) {
      // 1) Title property for '氏名'
      if (columnName === titleColumn) {
        properties.push(_.Title.getJSON(columnName, value));
      }
      // 2) Select for '教科'
      else if (subjectColumns.includes(columnName)) {
        properties.push(_.Select.getJSON(columnName, value));
      }
      // 3) Number for '教科目標レベル'
      else if (subjectGoalLevelColumns.includes(columnName)) {
        properties.push(_.Number.getJSON(columnName, value));
      }
      // 4) Status for '教科変更'
      else if (subjectChangeColumns.includes(columnName)) {
        properties.push(_.Status.getJSON(columnName, value));
      }
      // 5) Everything else -> RichText
      else {
        properties.push(_.RichText.getJSON(columnName, value));
      }
    }
    return properties;
  }

  /**
   * Fetch all studentDetailInformations from the CoachStudentInformation database in Notion.
   * @param {string} databaseId - The Notion database ID to query.
   * @returns {Array} An array of parsed studentDetailInformations.
   */
  static async getAStudentDetailInformation(databaseId) {
    try {
      const response = await notionAPI.queryADatabase(databaseId);
      if (response.status !== 200) {
        throw new Error(`Error fetching data from Notion: ${response.statusText}`);
      }
      const data = response.results;
      // Convert each Notion result into a row object
      return data.map(item => {
        const studentDetailInformationId = item.id;
        const props = item.properties;
        let studentData = { studentDetailInformationId };

        // Title Column (氏名):
        if (props[titleColumn]) {
          const studentName = richTextToInlineText(props[titleColumn]);
          studentData[titleColumn] = studentName;
        }

        // Example for subjectColumns (Select):
        for (const subject of subjectColumns) {
          if (props[subject]?.select?.name) {
            studentData[subject] = props[subject].select.name;
          }
        }

        // Example for subjectGoalLevelColumns (Number):
        for (const level of subjectGoalLevelColumns) {
          if (props[level]?.number !== undefined) {
            studentData[level] = props[level].number;
          }
        }

        // Example for subjectChangeColumns (Status):
        for (const change of subjectChangeColumns) {
          if (props[change]?.status?.name) {
            studentData[change] = props[change].status.name;
          }
        }

        // Everything else -> RichText
        Object.keys(props).forEach(key => {
          if (
            key === titleColumn ||
            subjectColumns.includes(key) ||
            subjectGoalLevelColumns.includes(key) ||
            subjectChangeColumns.includes(key)
          ) {
            return;
          }
          const rich_text = props[key]?.rich_text;
          if (rich_text) {
            studentData[key] = richTextToInlineText(rich_text);
          }
        });
        return studentData;
      });
    } catch (error) {
      console.error('Failed to fetch StudentDetailInformation:', error.message);
      return [];
    }
  }

  /**
   * Create multiple studentDetailInformations in the CoachStudentInformation database.
   * @param {string} databaseId - The Notion database ID.
   * @param {Array} informationList - The data array you want to create in Notion.
   */
  static async createAStudentDetailInformation(databaseId, studentData) {
    // Instead of this.studentDatas, use informationList
      try {
        const properties = buildProperties(studentData);
        const parent = _.Parent.getJSON('database_id', databaseId);

        // Create a new page in Notion
        const response = await notionAPI.createAPage(parent, properties);
        if (response.status !== 200) {
          throw new Error(`Failed to create studentData for '${studentData[this.titleColumn]}'`);
        }
        return response;
      } catch (error) {
        console.error(
          `Error creating studentData for '${studentData[this.titleColumn]}':`,
          error.message
        );
        return null;
      }
    }

  /**
   * Update a single studentDetailInformation in the CoachStudentInformation database.
   * @param {string} studentDetailInformationId - The Notion page ID to update.
   * @param {Object} studentDetailInformation - The updated data object.
   */
  static async updateAStudentDetailInformation(studentDetailInformationId, studentDetailInformation) {
    try {
      const properties = buildProperties(studentDetailInformation);
      const response = await notionAPI.updateAPage(studentDetailInformationId, properties);
      if (response.status !== 200) {
        throw new Error(`Failed to update studentDetailInformation for '${studentDetailInformation[titleColumn]}'`);
      }
      return response;
    } catch (error) {
      console.error(
        `Error updating studentDetailInformation for '${studentDetailInformation[titleColumn]}':`,
        error.message
      );
      return null;
    }
  }

  /**
   * Delete a single studentDetailInformation from the CoachStudentInformation database in Notion.
   * @param {string} studentDetailInformationId - The Notion page ID to delete.
   */
  static async deleteAStudentDetailInformation(studentDetailInformationId) {
    try {
      const response = await notionAPI.deleteAPage(studentDetailInformationId);
      if (response.status !== 200) {
        throw new Error(`Failed to delete studentDetailInformation with ID '${studentDetailInformationId}'`);
      }
      return response;
    } catch (error) {
      console.error(`Error deleting studentDetailInformation with ID '${studentDetailInformationId}':`, error.message);
      return null;
    }
  }
}
