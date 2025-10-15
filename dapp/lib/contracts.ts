// Contract addresses and constants (auto-generated)
// Generated on: 2025-10-15T21:23:53.002Z
// Network: TESTNET

// Deployer address - can create point-only missions
export const DEPLOYER_ADDRESS = 'ST27BRNTD1X5699QZMHDTBH77D42XNY8SNMM9KND5';

// Helper function to check if an address is the deployer
export const isDeployerAddress = (address: string | undefined): boolean => {
  return address === DEPLOYER_ADDRESS;
};

// Contract addresses
export const CONTRACTS = {
  POINTS: 'ST27BRNTD1X5699QZMHDTBH77D42XNY8SNMM9KND5.points',
  MISSION_MANAGER: 'ST27BRNTD1X5699QZMHDTBH77D42XNY8SNMM9KND5.mission-manager',
  MOCK_TOKEN: 'ST27BRNTD1X5699QZMHDTBH77D42XNY8SNMM9KND5.mock-token',
};

// Network configuration
export const STACKS_NETWORK = 'testnet';

// Legacy exports for backward compatibility
export const POINTS_CONTRACT = CONTRACTS.POINTS;
export const MISSION_MANAGER_CONTRACT = CONTRACTS.MISSION_MANAGER;
export const MOCK_TOKEN_CONTRACT = CONTRACTS.MOCK_TOKEN;
