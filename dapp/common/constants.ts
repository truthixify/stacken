// App Configuration
export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://stacken-rewards.vercel.app';

// Stacks Network Configuration
export const STACKS_NETWORK = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet') as
  | 'testnet'
  | 'mainnet';

// Contract Addresses (imported from auto-generated contracts.ts)
export { CONTRACTS, STACKS_NETWORK as GENERATED_STACKS_NETWORK } from '../lib/contracts';

// Error Codes from contracts
export const ERROR_CODES = {
  UNAUTHORIZED: 100,
  INVALID_ADDRESS: 101,
  MISSION_NOT_FOUND: 104,
  INVALID_AMOUNT: 105,
  INVALID_TITLE: 106,
  INVALID_TIME_RANGE: 107,
  TRANSFER_FAILED: 108,
  TOKEN_NOT_ALLOWED: 109,
  MISSION_FINALIZED: 110,
  MISSION_NOT_ACTIVE: 111,
  INSUFFICIENT_FUNDS: 112,
  START_TIME_IN_PAST: 113,
  MISSION_TOO_SHORT: 114,
} as const;

// Mission duration constants
export const MIN_MISSION_DURATION = 1008; // 7 days in blocks (144 blocks/day * 7 days)

// Points error codes
export const POINTS_ERROR_CODES = {
  UNAUTHORIZED: 401,
  INVALID_AMOUNT: 402,
  INVALID_MULTIPLIER: 406,
} as const;
