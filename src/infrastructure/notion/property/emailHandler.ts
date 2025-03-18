import { 
  Email, 
  EmailPropertyRequest,
  EmailPropertyResponse,
  isEmail
} from "@domain/types/index.js"
import {
  logger
} from '@utils/logger.js'


export type EmailResponseOption = 
  | 'email'

export type EmailResponseReturnType =
  | Email
  | null;

export function emailResponseHandler(emailProp: EmailPropertyResponse, option: EmailResponseOption): EmailResponseReturnType {
  switch (option) {
    case 'email':
      if (emailProp.email !== null && isEmail(emailProp.email)) {
        return emailProp.email;
      } else if (emailProp.email === null) {
        logger.warn('Email property response is null')
        return null
      } else {
        throw new Error('Invalid email property response');
      }
  }
}

export type EmailRequestOption = 
  | 'email'

export type EmailRequestInputType = 
  | Email
  | null;

export function emailRequestHandler(input: EmailRequestInputType, option: EmailRequestOption): EmailPropertyRequest {
  switch (option) {
    case 'email':
      if (input !== null && isEmail(input)) {
        return { type: 'email', email: input };
      } else if (input === null) {
        return { type: 'email', email: null };
      } else {
        throw new Error('Invalid email input');
      };
    default:
      throw new Error('Invalid email request option');
  }
}

