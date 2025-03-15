import fs from 'fs';
import { NotionDbProperties } from '../infrastructure/aws_tables/NotionDbProperties.js';
import { PropertyOptions } from '../infrastructure/aws_tables/PropertyOptions.js';
import { logger } from '@utils/index.js';
import { MySQLUintID } from '@domain/types/index.js';

export const generatePropertiesTypes = async () => {
  try {
    const properties = await NotionDbProperties.findALL();
    const propertyOptions = await PropertyOptions.findAll();

    let output = `// 🚀 Auto-generated file. DO NOT EDIT manually.\n\n`;

    const propertyTypeSet = new Set<string>();
    const propertyObject: Record<string, Record<string, { propertyName: string; propertyType: string; options?: Record<string, string> }>> = {};
    const optionMap: Record<MySQLUintID, Record<string, string>> = {};

    propertyOptions.forEach(({ notionDbPropertyId, optionKey, optionValue }) => {
      if (!optionMap[notionDbPropertyId]) optionMap[notionDbPropertyId] = {};
      optionMap[notionDbPropertyId][optionKey] = optionValue;
    });

    properties.forEach(({ notionDbPropertyId, dbName, programName, propertyName, propertyType }) => {
      if (!propertyObject[dbName]) propertyObject[dbName] = {};

      const propertyData: { propertyName: string; propertyType: string; options?: Record<string, string> } = { propertyName, propertyType };
      if (optionMap[notionDbPropertyId]) propertyData.options = optionMap[notionDbPropertyId];

      propertyObject[dbName][programName] = propertyData;

      propertyTypeSet.add(`"${propertyType}"`);
    })

    for (const [dbName, nameAndTypeObjects] of Object.entries(propertyObject)) {
      const typeName = `${dbName.charAt(0).toUpperCase() + dbName.slice(1)}PropertyName`;
      const propertyNames = Object.keys(nameAndTypeObjects).map(key => {`"${nameAndTypeObjects[key].propertyName}"`}).join(" | ");
      output += `export type ${typeName} = ${propertyNames};\n\n`;
    }

    const allTypes = Object.keys(propertyObject)
      .map((dbName) => `${dbName.charAt(0).toUpperCase() + dbName.slice(1)}PropertyName`)
      .join(" | ");
    output += `export type PropertyName = ${allTypes};\n`;

    const propertyTypeArray = Array.from(propertyTypeSet).join(" | ");
    output += `export type PropertyType = ${propertyTypeArray};\n\n`;

    output += `export const notionProperties = ${JSON.stringify(propertyObject, null, 2)} as const;\n`;

    fs.writeFileSync("../const/notionProperties.ts", output);
    logger.info("✅ Generated notionProperties.ts successfully!");
  } catch (error : any) {
    logger.error("Error generating notionDatabaseProperties.ts:", error.message);
    throw error;
  } 
};