import { 
  CheckboxPropertyResponse,
  NotionPagePropertyType, 
  NumberPropertyResponse, 
  PagePropertyResponse,
  TitlePropertyResponse,
  SelectPropertyResponse,
  FormulaPropertyResponse,
  NotionPropertyRequest,
  DatePropertyResponse
} from "@domain/types/index.js";
import {
  TitleResponseOption,
  titleResponseHandler,
  TitleResponseReturnType,
  TitleRequestOption,
  titleRequestHandler,
  TitleRequestInputType,
  NumberResponseOption,
  numberResponseHandler,
  NumberResponseReturnType,
  NumberRequestOption,
  numberRequestHandler,
  NumberRequestInputType,
  CheckboxResponseOption, 
  checkboxResponseHandler, 
  CheckboxResponseReturnType,
  CheckboxRequestOption,
  checkboxRequestHandler,
  CheckboxRequestInputType,
  SelectResponseOption,
  selectResponseHandler,
  SelectResponseReturnType,
  SelectRequestOption,
  selectRequestHandler,
  SelectRequestInputType,
  FormulaResponseOption,
  formulaResponseHandler,
  FormulaResponseReturnType,
  dateResponseHandler,
  DateResponseOption,
  DateResponseReturnType,
  dateRequestHandler,
  DateRequestInputType,
  DateRequestOption,
} from '@infrastructure/notion/property/index.js';

// TODO: Specify the option and return type.

type ResponseReturnOption = 
  | ''
  | TitleResponseOption
  | NumberResponseOption
  | SelectResponseOption
  | FormulaResponseOption
  | DateResponseOption

type ResponseReturnType = 
  | undefined
  | TitleResponseReturnType
  | NumberResponseReturnType
  | SelectResponseReturnType
  | FormulaResponseReturnType
  | CheckboxResponseReturnType
  | DateResponseReturnType

export function propertyResponseToDomain(
  property: PagePropertyResponse,
  returnOption: ResponseReturnOption
): ResponseReturnType {
  try {
    switch (property.type) {
      case "title":
        return titleResponseHandler(property as TitlePropertyResponse, returnOption as TitleResponseOption);
  
      case "rich_text":
        // Handle rich text properties (e.g., convert to a readable string)
        break;
  
      case "number":
        return numberResponseHandler(property as NumberPropertyResponse, returnOption as NumberResponseOption);
  
      case "select":
        return selectResponseHandler(property as SelectPropertyResponse, returnOption as SelectResponseOption);
  
      case "multi_select":
        // Handle multi-select properties (e.g., return an array of selected options)
        break;
  
      case "date":
        return dateResponseHandler(property as DatePropertyResponse, returnOption as DateResponseOption);
  
      case "formula":
        return formulaResponseHandler(property as FormulaPropertyResponse, returnOption as FormulaResponseOption);
  
      case "relation":
        // Handle relation properties (e.g., extract linked page IDs)
        break;
  
      case "rollup":
        // Handle rollup properties (e.g., aggregate values from related records)
        break;
  
      case "people":
        // Handle people properties (e.g., return user IDs or names)
        break;
  
      case "files":
        // Handle files properties (e.g., return array of file URLs)
        break;
  
      case "checkbox":
        return checkboxResponseHandler(property as CheckboxPropertyResponse, returnOption as CheckboxResponseOption);
  
      case "url":
        // Handle URL properties (e.g., return the string URL)
        break;
  
      case "email":
        // Handle email properties (e.g., return email string)
        break;
  
      case "phone_number":
        // Handle phone number properties (e.g., return phone number string)
        break;
  
      case "created_time":
        // Handle created_time properties (e.g., return timestamp or formatted date)
        break;
  
      case "created_by":
        // Handle created_by properties (e.g., return user ID or name)
        break;
  
      case "last_edited_time":
        // Handle last_edited_time properties (e.g., return timestamp or formatted date)
        break;
  
      case "last_edited_by":
        // Handle last_edited_by properties (e.g., return user ID or name)
        break;
  
      case "status":
        // Handle status properties (e.g., return status value or label)
        break;
  
      case "unique_id":
        // Handle unique_id properties (e.g., return the unique identifier)
        break;
  
      case "verification":
        // Handle verification properties (e.g., return verification status or details)
        break;
  
      default:
        // Handle unknown property type
        throw new Error(`Unsupported property type: ${property.type}`);
    }
  } catch (error) {
    throw new Error(`Error converting property response to domain: ${error}`);
  }
}

type RequestInputOption = 
  | ''
  | TitleRequestOption
  | NumberRequestOption
  | SelectRequestOption
  | CheckboxRequestOption
  | DateRequestOption

type RequestInputType =
  | undefined
  | TitleRequestInputType
  | NumberRequestInputType
  | SelectRequestInputType
  | CheckboxRequestInputType
  | DateRequestInputType

export function propertyDomainToRequest(
  domainProperty: RequestInputType, // TODO: Specify the domain property shape
  propertyType: NotionPagePropertyType,
  returnOption: RequestInputOption = ''
): NotionPropertyRequest | undefined {
  try {
    if (domainProperty === undefined) return undefined;
    switch (propertyType) {
      case "title":
        return titleRequestHandler(domainProperty as TitleRequestInputType, returnOption as TitleRequestOption);

      case "rich_text":
        // Handle rich text properties (e.g., convert to a readable string)
        break;

      case "number":
        return numberRequestHandler(domainProperty as NumberRequestInputType, returnOption as NumberRequestOption);

      case "select":
        return selectRequestHandler(domainProperty as SelectRequestInputType, returnOption as SelectRequestOption);

      case "multi_select":
        // Handle multi-select properties (e.g., return an array of selected options)
        break;

      case "date":
        return dateRequestHandler(domainProperty as DateRequestInputType, returnOption as DateRequestOption);

      case "formula":
        break

      case "relation":
        // Handle relation properties (e.g., extract linked page IDs)
        break;

      case "rollup":
        // Handle rollup properties (e.g., aggregate values from related records)
        break;

      case "people":
        // Handle people properties (e.g., return user IDs or names)
        break;

      case "files":
        // Handle files properties (e.g., return array of file URLs)
        break;

      case "checkbox":
        return checkboxRequestHandler(domainProperty as CheckboxRequestInputType, returnOption as CheckboxRequestOption);

      case "url":
        // Handle URL properties (e.g., return the string URL)
        break;

      case "email":
        // Handle email properties (e.g., return email string)
        break;

      case "phone_number":
        // Handle phone number properties (e.g., return phone number string)
        break;

      case "created_time":
        // Handle created_time properties (e.g., return timestamp or formatted date)
        break;

      case "created_by":
        // Handle created_by properties (e.g., return user ID or name)
        break;

      case "last_edited_time":
        // Handle last_edited_time properties (e.g., return timestamp or formatted date)
        break;

      case "last_edited_by":
        // Handle last_edited_by properties (e.g., return user ID or name)
        break;

      case "status":
        // Handle status properties (e.g., return status value or label)
        break;

      case "unique_id":
        // Handle unique_id properties (e.g., return the unique identifier)
        break;

      case "verification":
        // Handle verification properties (e.g., return verification status or details)
        break;

      default:
        // Handle unknown property type
        throw new Error(`Unsupported property type: ${propertyType}`);
    } 
  } catch (error) {
    throw new Error(`Error converting property domain to request: ${error}`);
  }
}
