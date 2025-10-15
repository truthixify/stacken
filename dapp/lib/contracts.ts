// Contract addresses and constants (auto-generated)
// Generated on: 2025-10-15T01:24:50.524Z
// Network: TESTNET

// Deployer address - can create point-only missions
export const DEPLOYER_ADDRESS = 'ST1NT7B5W1DD8XR19XQATTS7H0MSBTSC7ECMY5FNF';

// Helper function to check if an address is the deployer
export const isDeployerAddress = (address: string | undefined): boolean => {
  return address === DEPLOYER_ADDRESS;
};

// Contract addresses
export const CONTRACTS = {
  POINTS: 'ST1NT7B5W1DD8XR19XQATTS7H0MSBTSC7ECMY5FNF.points',
  MISSION_MANAGER: 'ST1NT7B5W1DD8XR19XQATTS7H0MSBTSC7ECMY5FNF.mission-manager',
  MOCK_TOKEN: 'ST1NT7B5W1DD8XR19XQATTS7H0MSBTSC7ECMY5FNF.mock-token',
};

// Network configuration
export const STACKS_NETWORK = 'testnet';

// Legacy exports for backward compatibility
export const POINTS_CONTRACT = CONTRACTS.POINTS;
export const MISSION_MANAGER_CONTRACT = CONTRACTS.MISSION_MANAGER;
export const MOCK_TOKEN_CONTRACT = CONTRACTS.MOCK_TOKEN;
