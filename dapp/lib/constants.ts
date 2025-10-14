// Contract and system constants

// Deployer address - can create point-only campaigns
export const DEPLOYER_ADDRESS = 'ST1FZXTTFT9J4YPJ17Z9T914PGZH2WJ6F8JGBNM0T';

// Helper function to check if an address is the deployer
export const isDeployerAddress = (address: string | undefined): boolean => {
  return address === DEPLOYER_ADDRESS;
};

// Contract addresses
export const CONTRACTS = {
  POINTS: process.env.NEXT_PUBLIC_POINTS_CONTRACT || 'ST1FZXTTFT9J4YPJ17Z9T914PGZH2WJ6F8JGBNM0T.points',
  CAMPAIGN_MANAGER: process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_CONTRACT || 'ST1FZXTTFT9J4YPJ17Z9T914PGZH2WJ6F8JGBNM0T.mission-manager',
  MOCK_TOKEN: process.env.NEXT_PUBLIC_MOCK_TOKEN_CONTRACT || 'ST1FZXTTFT9J4YPJ17Z9T914PGZH2WJ6F8JGBNM0T.mock-token',
};

// Network configuration
export const STACKS_NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';