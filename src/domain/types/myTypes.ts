import {
  logger
} from '@utils/index.js';

export type Uint = number & { __uint__: void }
export function toUint(value: number): Uint {
  if (!isUint(value)) {
    throw new Error("Value must be a non-negative int in toUint function.");
  }
  return value as Uint;
}

export function isUint(value: number): value is Uint {
  return Number.isInteger(value) && value >= 0;
}

export type Int = number & { __int__: void };

export function isInt(value: number): value is Int {
  return Number.isInteger(value);
}

export function toInt(value: number): Int {
  if (!isInt(value)) {
    throw new Error(`Invalid int: ${value}`);
  }
  return value as Int;
}

export type PhoneNumber = string & { readonly __brand: unique symbol };
export type Email = string & { readonly __brand: unique symbol };

export function isPhoneNumber(value: string): value is PhoneNumber {
  return typeof value === "string" && /^\+?[0-9\s-]+$/.test(value);
}

export function toPhoneNumber(value: string): PhoneNumber {
  if (!isPhoneNumber(value)) {
    throw new Error("Invalid phone number format");
  }
  return value as PhoneNumber;
}

export function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function toEmail(value: string): Email {
  if (!isEmail(value)) {
    throw new Error("Invalid email format");
  }
  return value as Email;
}

export type URLString = string & { __type: "URL" };

const URL_REGEX = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/;

export function isValidURLRegex(url: string): url is URLString {
  return URL_REGEX.test(url);
}

export function toURLString(value: string): URLString {
  if (!isValidURLRegex(value)) {
    throw new Error("Invalid URL format");
  }
  logger.debug(`${value} is a valid URL`);
  return value as URLString;
}

