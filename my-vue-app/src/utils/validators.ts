// validators.ts
// Placeholder for SEP-7 validation functions

export const isValidStellarPublicKey = (key: string): boolean => {
  // Basic check: G followed by 55 Base32 chars.
  // This is a simplified check. Real validation is more complex.
  return /^G[A-Z2-7]{55}$/.test(key);
};

export const isValidAssetCode = (code: string): boolean => {
  return /^[a-zA-Z0-9]{1,12}$/.test(code);
};

export const isValidAmount = (amount: string): boolean => {
  // Basic check for positive number
  if (amount.split('.').length > 2) {
    return false; // More than one decimal point
  }
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

// Add more validators as needed:
// isValidDomain, isBase64, isValidMemo, etc.
