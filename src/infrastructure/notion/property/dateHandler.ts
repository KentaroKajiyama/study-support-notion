import { DatePropertyRequest, DatePropertyResponse, NotionDate } from "@domain/types/index.js";
import { logger } from "@utils/index.js";


export type DateResponseOption = "start date" | "end date" | "";
export type DateResponseReturnType = NotionDate | null;

export function dateResponseHandler(dateProperty: DatePropertyResponse, option: DateResponseOption): DateResponseReturnType {
  switch (option) {
    case "":
    case "start date":
      if (dateProperty.date === null) {
        logger.warn("date property is null")
        return null;
      }
      return dateProperty.date.start as NotionDate;
    case "end date":
      if (dateProperty.date === null) {
        logger.warn("date property is null")
        return null;
      }
      return dateProperty.date.end as NotionDate;
    default:
      throw new Error(`Invalid date response option: ${option}`)
  }
};

export type DateRequestOption = 'date'|'';
export type DateRequestInputType = { start: NotionDate, end: NotionDate|null };

export function dateRequestHandler(input: DateRequestInputType, option: DateRequestOption): DatePropertyRequest {
  switch (option) {
    case "":
    case "date":
      return {
        date: { start: input.start, end: input.end },
        type: 'date',
      };
    default:
      throw new Error(`Invalid date request option: ${option}`);
  }
};