import { 
  CheckboxPropertyResponse,
  NotionPagePropertyType, 
  NumberPropertyResponse, 
  PagePropertyResponse,
  TitlePropertyResponse,
  SelectPropertyResponse,
  FormulaPropertyResponse,
  NotionPropertyRequest,
  DatePropertyResponse,
  RelationPropertyResponse,
  StatusPropertyResponse,
  MultiSelectPropertyResponse
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
  MultiSelectResponseOption,
  multiSelectResponseHandler,
  MultiSelectResponseReturnType,
  MultiSelectRequestOption,
  multiSelectRequestHandler,
  MultiSelectRequestInputType,
  StatusResponseOption,
  statusResponseHandler,
  StatusResponseReturnType,
  StatusRequestOption,
  statusRequestHandler,
  StatusRequestInputType,
  FormulaResponseOption,
  formulaResponseHandler,
  FormulaResponseReturnType,
  dateResponseHandler,
  DateResponseOption,
  DateResponseReturnType,
  dateRequestHandler,
  DateRequestInputType,
  DateRequestOption,
  RelationRequestOption,
  relationRequestHandler,
  RelationRequestInputType,
  RelationResponseOption,
  relationResponseHandler,
  RelationResponseReturnType,
} from '@infrastructure/notion/property/index.js';

// TODO: Specify the option and return type.

type ResponseReturnOption = 
  | ''
  | TitleResponseOption
  | NumberResponseOption
  | SelectResponseOption
  | MultiSelectRequestOption
  | StatusResponseOption
  | FormulaResponseOption
  | DateResponseOption
  | RelationResponseOption

type ResponseReturnType = 
  | undefined
  | TitleResponseReturnType
  | NumberResponseReturnType
  | SelectResponseReturnType
  | MultiSelectResponseReturnType
  | StatusResponseReturnType
  | FormulaResponseReturnType
  | CheckboxResponseReturnType
  | DateResponseReturnType
  | RelationResponseReturnType

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
        return multiSelectResponseHandler(property as MultiSelectPropertyResponse, returnOption as MultiSelectResponseOption);
  
      case "date":
        return dateResponseHandler(property as DatePropertyResponse, returnOption as DateResponseOption);
  
      case "formula":
        return formulaResponseHandler(property as FormulaPropertyResponse, returnOption as FormulaResponseOption);
  
      case "relation":
        return relationResponseHandler(property as RelationPropertyResponse, returnOption as RelationResponseOption);
  
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
        return statusResponseHandler(property as StatusPropertyResponse, returnOption as StatusResponseOption)
  
      case "unique_id":
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
  | MultiSelectRequestOption
  | StatusRequestOption
  | CheckboxRequestOption
  | DateRequestOption
  | RelationRequestOption

type RequestInputType =
  | undefined
  | TitleRequestInputType
  | NumberRequestInputType
  | SelectRequestInputType
  | MultiSelectRequestInputType
  | StatusRequestInputType
  | CheckboxRequestInputType
  | DateRequestInputType
  | RelationRequestInputType

export function propertyDomainToRequest(
  domainProperty: RequestInputType, // TODO: Specify the domain property shape
  propertyType: NotionPagePropertyType,
  inputOption: RequestInputOption = ''
): NotionPropertyRequest | undefined {
  try {
    if (domainProperty === undefined) return undefined;
    switch (propertyType) {
      case "title":
        return titleRequestHandler(domainProperty as TitleRequestInputType, inputOption as TitleRequestOption);

      case "rich_text":
        // Handle rich text properties (e.g., convert to a readable string)
        break;

      case "number":
        return numberRequestHandler(domainProperty as NumberRequestInputType, inputOption as NumberRequestOption);

      case "select":
        return selectRequestHandler(domainProperty as SelectRequestInputType, inputOption as SelectRequestOption);

      case "multi_select":
        return multiSelectRequestHandler(domainProperty as MultiSelectRequestInputType, inputOption as MultiSelectRequestOption)

      case "date":
        return dateRequestHandler(domainProperty as DateRequestInputType, inputOption as DateRequestOption);

      case "formula":
        break

      case "relation":
        return relationRequestHandler(domainProperty as RelationRequestInputType, inputOption as RelationRequestOption);

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
        return checkboxRequestHandler(domainProperty as CheckboxRequestInputType, inputOption as CheckboxRequestOption);

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
        return statusRequestHandler(domainProperty as StatusRequestInputType, inputOption as StatusRequestOption)

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
