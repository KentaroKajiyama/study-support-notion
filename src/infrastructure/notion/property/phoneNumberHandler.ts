import { 
  PhoneNumber,
  PhoneNumberPropertyRequest, 
  PhoneNumberPropertyResponse, 
  toPhoneNumber
} from "@domain/types/index.js";
import {
  logger
} from "@utils/index.js";

export type PhoneNumberResponseOption = 
  | 'phone number'

export type PhoneNumberResponseReturnType =
  | PhoneNumber
  | null;

export function phoneNumberResponseHandler(phoneNumberProp: PhoneNumberPropertyResponse, option: PhoneNumberResponseOption): PhoneNumberResponseReturnType {
  switch (option) {
    case 'phone number':
      if (phoneNumberProp.phone_number === null) logger.warn('Phone number is null');
      
      return phoneNumberProp.phone_number===null? null: toPhoneNumber(phoneNumberProp.phone_number);
    default:
      throw new Error('Invalid option for phoneNumberResponseHandler');
  }
}

export type PhoneNumberRequestOption = 
  | 'phone number'

export type PhoneNumberRequestInputType =
  | string
  | null;

export function phoneNumberRequestHandler(input: PhoneNumberRequestInputType, option: PhoneNumberRequestOption): PhoneNumberPropertyRequest {
  switch (option) {
    case 'phone number':
      return { phone_number: input === null? null : toPhoneNumber(input) };
    default:
      throw new Error('Invalid option for phoneNumberRequestHandler');
  }
}