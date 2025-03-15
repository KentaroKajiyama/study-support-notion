import { addDays, subDays } from "date-fns";
import { logger } from '@utils/index.js';
import {
  MySQLDate,
  MySQLDateTime,
  MySQLTimestamp,
  MySQLDateOrTime,
  NotionDate, 
  NotionDateString, 
  NotionDateTimeString
} from '@domain/types/index.js';

export function formatDateWithOffset(dateObj: Date, includeTime: boolean = false, isTimestamp: boolean = false): NotionDate {
  const pad = (num: number): string => String(num).padStart(2, "0");
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());

  if (includeTime) {
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());
    return isTimestamp
    ? (`${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z` as NotionDate) 
    : (`${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000+09:00` as NotionDate);
  }
  return `${year}-${month}-${day}` as NotionDateString;
}

function isNotionDateTimeString(date: NotionDate): date is NotionDateTimeString {
  return date.length !== 10; // Only "YYYY-MM-DD" format
}

export function convertTimeMySQLToNotion(mysqlDateTime: MySQLDateOrTime | undefined | null, coerceToDate: boolean = false, coerceToTime: boolean = false): NotionDate | null{
  try {
    let dateObj: Date;
    let includeTime: boolean;
    let isTimestamp: boolean = false;

    if (
      mysqlDateTime === undefined ||
      mysqlDateTime === null 
    ) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(mysqlDateTime)) {
      // Case: MySQL Date (YYYY-MM-DD)
      dateObj = new Date(`${mysqlDateTime}T00:00:00.000+09:00`); // Assume JST for DATETIME
      includeTime = false;
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(mysqlDateTime)) {
      // Case: MySQL Datetime or Timestamp (YYYY-MM-DD HH:MM:SS)
      dateObj = new Date(mysqlDateTime.replace(" ", "T") + "Z"); // Assume UTC for TIMESTAMP
      includeTime = true;
      
      // If TIMESTAMP, enforce UTC
      if (mysqlDateTime.endsWith("Z")) {
        isTimestamp = true;
      }
    } else {
      throw new Error("Invalid MySQL date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM:SS.");
    }

    if (coerceToDate) includeTime = false;
    if (coerceToTime) includeTime = true;

    // Convert to Notion date format
    return formatDateWithOffset(dateObj, includeTime, isTimestamp);
  } catch (error) {
    console.error(`Error in convertMySQLToNotion: ${(error as Error).message}`);
    throw error;
  }
}

export function convertTimeNotionToMySQL(notionDate: NotionDate | undefined | null, coerceToDate: boolean = false, coerceToTime: boolean = false): MySQLDateOrTime | null {
  try {
    let dateObj: Date;
    let includeTime: boolean;
    let isTimestamp: boolean = false;

    if (
      notionDate === undefined ||
      notionDate === null 
    ) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(notionDate)) {
      // Case: Notion Date (YYYY-MM-DD)
      dateObj = new Date(`${notionDate}T00:00:00.000+09:00`); // Assume JST for MySQL DATETIME
      includeTime = false;
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(notionDate)) {
      // Case: Notion DateTime (YYYY-MM-DDTHH:MM:SS.sssZ)
      dateObj = new Date(notionDate); // Already UTC
      includeTime = true;
      isTimestamp = true;
    } else {
      throw new Error("Invalid Notion date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.sssZ.");
    }

    // Format to MySQL Date or Datetime or Timestamp
    const pad = (num: number): string => String(num).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    const month = pad(dateObj.getUTCMonth() + 1);
    const day = pad(dateObj.getUTCDate());
    if (coerceToDate) includeTime = false;
    if (coerceToTime) includeTime = true;

    if (includeTime) {
      const hours = pad(dateObj.getUTCHours());
      const minutes = pad(dateObj.getUTCMinutes());
      const seconds = pad(dateObj.getUTCSeconds());
      return isTimestamp
        ? (`${year}-${month}-${day} ${hours}:${minutes}:${seconds}Z` as MySQLTimestamp) // Ensure UTC format
        : (`${year}-${month}-${day} ${hours}:${minutes}:${seconds}` as MySQLDateTime);
    }
    return `${year}-${month}-${day}` as MySQLDate;
  } catch (error) {
    console.error(`Error in convertNotionToMySQL: ${(error as Error).message}`);
    throw error;
  }
}

export function myAddDays(notionDateString: NotionDate, addDaysNumber: number): NotionDate {
  try {
    let includeTime = !isNotionDateTimeString(notionDateString);
    if (!includeTime) {
      notionDateString = `${notionDateString}T00:00:00.000+09:00` as NotionDateTimeString;
    }
    const dateObj = new Date(notionDateString);
    const newDate = addDays(dateObj, addDaysNumber);
    return formatDateWithOffset(newDate, includeTime);
  } catch (error) {
    logger.error(`Error in myAddDays: ${(error as Error).message}`);
    throw error;
  }
}

export function mySubDays(notionDateString: NotionDate, subDaysNumber: number): NotionDate {
  try {
    let includeTime = !isNotionDateTimeString(notionDateString);
    if (!includeTime) {
      notionDateString = `${notionDateString}T00:00:00.000+09:00` as NotionDateTimeString;
    }
    const dateObj = new Date(notionDateString);
    const newDate = subDays(dateObj, subDaysNumber);
    return formatDateWithOffset(newDate, includeTime);
  } catch (error) {
    logger.error(`Error in mySubDays: ${(error as Error).message}`);
    throw error;
  }
}

export function date2MinusDate1(date1NotionString: NotionDate, date2NotionString: NotionDate): number {
  const normalizeDate = (dateString: NotionDate): Date => {
    if (dateString.length === 10) {
      dateString = `${dateString}T00:00:00.000+09:00` as NotionDateTimeString;
    }
    return new Date(dateString);
  };

  const date1 = normalizeDate(date1NotionString);
  const date2 = normalizeDate(date2NotionString);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / oneDay);
}

export function isDate1EarlierThanOrSameWithDate2(date1NotionString: NotionDate, date2NotionString: NotionDate): boolean {
  const normalizeDate = (dateString: NotionDate): Date => {
    if (dateString.length === 10) {
      dateString = `${dateString}T00:00:00.000+09:00` as NotionDateTimeString;
    }
    return new Date(dateString);
  };

  const date1 = normalizeDate(date1NotionString);
  const date2 = normalizeDate(date2NotionString);
  return date1 <= date2;
}

export function isDateBetween(targetDateString: NotionDate, startDateString: NotionDate, endDateString: NotionDate): boolean {
  const normalizeDate = (dateString: NotionDate): Date => {
    if (dateString.length === 10) {
      dateString = `${dateString}T00:00:00.000+09:00` as NotionDateTimeString;
    }
    return new Date(dateString);
  };

  const targetDate = normalizeDate(targetDateString);
  const startDate = normalizeDate(startDateString);
  const endDate = normalizeDate(endDateString);
  
  return targetDate >= startDate && targetDate <= endDate;
}
