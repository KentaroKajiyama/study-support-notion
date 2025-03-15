export const ensureValue = <T>(value: T | null | undefined, errorMsg = "Value cannot be null or undefined!"): T => {
  if (value == null) {
    throw new Error(errorMsg);
  }
  return value;
};
