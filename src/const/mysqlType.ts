export type MySQLUintID = number & { __uintid__: void }
export function toMySQLUintID(value: number): MySQLUintID {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Value must be a non-negative integer in toMySQLUintID function.");
  }
  return value as MySQLUintID;
};

export function isMySQLUintID(value: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/** Defines MySQL date format (YYYY-MM-DD) */
export type MySQLDate = `${number}-${number}-${number}`; // Example: "2025-03-12"

/** Defines MySQL datetime format (YYYY-MM-DD HH:MM:SS) */
export type MySQLDateTime = `${number}-${number}-${number} ${number}:${number}:${number}`; // Example: "2025-03-12 15:30:45"
export type MySQLTimestamp = `${number}-${number}-${number} ${number}:${number}:${number}`;

/** Accepts either a MySQL date or datetime */
export type MySQLDateOrTime = MySQLDate | MySQLDateTime | MySQLTimestamp;

export type MySQLBoolean = 0 | 1;

export function toBoolean(value: MySQLBoolean): boolean {
  return value === 1;
}

export function toMySQLBoolean(value: boolean): MySQLBoolean {
  return value ? 1 : 0;
}

export function dbEscape(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  // If it's a boolean, MySQL expects 0 or 1
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}
