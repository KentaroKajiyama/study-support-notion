import { addDays, subDays } from "date-fns";
import logger from "./logger";

export function formatDateWithOffset(dateObj, includeTime = false) {
  const date = dateObj;
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-based
  const day = pad(date.getDate());
  if (includeTime) {
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    // Get timezone offset in minutes
    const offsetMinutes = date.getTimezoneOffset();
    const offsetSign = offsetMinutes > 0 ? '-' : '+';
    const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const offsetMins = pad(Math.abs(offsetMinutes) % 60);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMins}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

export function myAddDays(notionDateString, addDaysNumber) {
  try {
    let includeTime = true;
    if (notionDateString.length === 10) {
      notionDateString = notionDateString+'T00:00:00.000+09:00'
      includeTime = false;
    };
    const dateObj = new Date(notionDateString);
    const newDate = addDays(dateObj, addDaysNumber);
    return formatDateWithOffset(newDate, includeTime);
  } catch (error) {
    logger.error(`Error in myAddDays: ${error.message}`);
    throw error;
  }
}

export function mySubDays(notionDateString, subDaysNumber) {
  try {
    let includeTime = true;
    if (notionDateString.length === 10) {
      notionDateString = notionDateString+'T00:00:00.000+09:00'
      includeTime = false;
    };
    const dateObj = new Date(notionDateString);
    const newDate = subDays(dateObj, subDaysNumber);
    return formatDateWithOffset(newDate, includeTime);
  } catch (error) {
    logger.error(`Error in mySubDays: ${error.message}`);
    throw error;
  }
}

export function date2MinusDate1(date1NotionString, date2NotionString) {
  if (date1NotionString.length === 10) {
    date1NotionString = date1NotionString+'T00:00:00.000+09:00'
  }
  if (date2NotionString.length === 10) {
    date2NotionString = date2NotionString+'T00:00:00.000+09:00'
  }
  const date1 = new Date(date1NotionString);
  const date2 = new Date(date2NotionString);
  const oneDay = 1000 * 60 * 60 * 24; 
  const diffInMs = Math.abs(date2 - date1); 
  return Math.floor(diffInMs / oneDay); 
}

export function isDate1EarlierThanOrSameWithDate2(date1NotionString, date2NotionString) {
  if (date1NotionString.length === 10) {
    date1NotionString = date1NotionString+'T00:00:00.000+09:00'
  }
  if (date2NotionString.length === 10) {
    date2NotionString = date2NotionString+'T00:00:00.000+09:00'
  }
  const date1 = new Date(date1NotionString);
  const date2 = new Date(date2NotionString);
  return date1 <= date2;
}

export function isDateBetween(targetDateString, startDateString, endDateString) {
  if (targetDateString.length === 10) {
    targetDateString = targetDateString+'T00:00:00.000+09:00'
  }
  if (startDateString.length === 10) {
    startDateString = startDateString+'T00:00:00.000+09:00'
  }
  if (endDateString.length === 10) {
    endDateString = endDateString+'T00:00:00.000+09:00'
  }
  const targetDate = new Date(targetDateString);
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  return targetDate >= startDate && targetDate <= endDate;
}