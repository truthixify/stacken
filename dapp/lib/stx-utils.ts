// STX conversion utilities
// STX uses 6 decimal places (1 STX = 1,000,000 microSTX)

export const STX_DECIMALS = 6;
export const STX_MULTIPLIER = Math.pow(10, STX_DECIMALS); // 1,000,000

/**
 * Convert STX amount to microSTX for contract calls
 * @param stxAmount - Amount in STX (e.g., 1.5)
 * @returns Amount in microSTX (e.g., 1500000)
 */
export const stxToMicroStx = (stxAmount: number): number => {
  return Math.floor(stxAmount * STX_MULTIPLIER);
};

/**
 * Convert microSTX to STX for display
 * @param microStxAmount - Amount in microSTX (e.g., 1500000)
 * @returns Amount in STX (e.g., 1.5)
 */
export const microStxToStx = (microStxAmount: number): number => {
  return microStxAmount / STX_MULTIPLIER;
};

/**
 * Format STX amount for display with proper decimals
 * @param stxAmount - Amount in STX
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string (e.g., "1.50 STX")
 */
export const formatStxAmount = (stxAmount: number, decimals: number = 2): string => {
  return `${stxAmount.toFixed(decimals)} STX`;
};

/**
 * Format microSTX amount for display
 * @param microStxAmount - Amount in microSTX
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string (e.g., "1.50 STX")
 */
export const formatMicroStxAmount = (microStxAmount: number, decimals: number = 2): string => {
  const stxAmount = microStxToStx(microStxAmount);
  return formatStxAmount(stxAmount, decimals);
};

/**
 * Convert token amount based on token decimals
 * @param amount - Human readable amount
 * @param decimals - Token decimals (default: 6 for STX)
 * @returns Amount scaled for contract
 */
export const scaleTokenAmount = (amount: number, decimals: number = 6): number => {
  return Math.floor(amount * Math.pow(10, decimals));
};

/**
 * Convert scaled token amount back to human readable
 * @param scaledAmount - Scaled amount from contract
 * @param decimals - Token decimals (default: 6 for STX)
 * @returns Human readable amount
 */
export const unscaleTokenAmount = (scaledAmount: number, decimals: number = 6): number => {
  return scaledAmount / Math.pow(10, decimals);
};
