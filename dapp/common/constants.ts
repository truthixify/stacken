// App Configuration
export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://stacken-rewards.vercel.app';

// Stacks Network Configuration
export const STACKS_NETWORK = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Contract Addresses
export const CONTRACTS = {
  CAMPAIGN_MANAGER: process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.campaign-manager',
  POINTS: process.env.NEXT_PUBLIC_POINTS_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.points',
  MOCK_TOKEN: process.env.NEXT_PUBLIC_MOCK_TOKEN_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token',
};

// Error Codes from contracts
export const ERROR_CODES = {
  UNAUTHORIZED: 100,
  INVALID_ADDRESS: 101,
  CAMPAIGN_NOT_FOUND: 104,
  INVALID_AMOUNT: 105,
  INVALID_TITLE: 106,
  INVALID_TIME_RANGE: 107,
  TRANSFER_FAILED: 108,
  TOKEN_NOT_ALLOWED: 109,
  CAMPAIGN_FINALIZED: 110,
  CAMPAIGN_NOT_ACTIVE: 111,
  INSUFFICIENT_FUNDS: 112,
  START_TIME_IN_PAST: 113,
  CAMPAIGN_TOO_SHORT: 114,
} as const;

// Campaign duration constants
export const MIN_CAMPAIGN_DURATION = 1008; // 7 days in blocks (144 blocks/day * 7 days)

// Points error codes
export const POINTS_ERROR_CODES = {
  UNAUTHORIZED: 401,
  INVALID_AMOUNT: 402,
  INVALID_MULTIPLIER: 406,
} as const;
