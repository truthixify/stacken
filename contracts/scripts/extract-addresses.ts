#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DeploymentPlan {
    plan?: {
        batches?: Array<{
            transactions?: Array<{
                'contract-publish'?: {
                    'contract-name': string;
                    'expected-sender': string;
                };
                'emulated-contract-publish'?: {
                    'contract-name': string;
                    'emulated-sender': string;
                };
            }>;
        }>;
    };
}

function parseYamlSimple(content: string): { contractNames: string[], deployerAddresses: string[] } {
    const lines = content.split('\n');
    const contractNames: string[] = [];
    const deployerAddresses: string[] = [];

    for (const line of lines) {
        if (line.trim() === '' || line.trim().startsWith('#')) continue;

        const trimmed = line.trim();

        if (trimmed.includes(':')) {
            const [key, value] = trimmed.split(':', 2);
            const cleanKey = key.trim().replace(/^-\s*/, '');
            const cleanValue = value ? value.trim().replace(/^["']|["']$/g, '') : '';

            if (cleanKey === 'contract-name' && cleanValue) {
                contractNames.push(cleanValue);
            }
            if ((cleanKey === 'expected-sender' || cleanKey === 'emulated-sender') && cleanValue) {
                deployerAddresses.push(cleanValue);
            }
        }
    }

    return { contractNames, deployerAddresses };
}

function extractAddressesFromPlan(planPath: string, network: string): Record<string, string> | null {
    try {
        if (!fs.existsSync(planPath)) {
            console.log(`⚠️  No deployment plan found for ${network} at ${planPath}`);
            return null;
        }

        const planContent = fs.readFileSync(planPath, 'utf8');
        const { contractNames, deployerAddresses } = parseYamlSimple(planContent);

        const addresses: Record<string, string> = {};

        // Use the first deployer address (typically all contracts use the same deployer)
        const deployerAddress = deployerAddresses[0];

        if (deployerAddress && contractNames.length > 0) {
            contractNames.forEach(contractName => {
                const fullAddress = `${deployerAddress}.${contractName}`;
                addresses[contractName.toUpperCase()] = fullAddress;
            });
        }

        return Object.keys(addresses).length > 0 ? addresses : null;
    } catch (error) {
        console.error(`❌ Error reading deployment plan for ${network}:`, (error as Error).message);
        return null;
    }
}

function generateContractsFile(addresses: Record<string, string>, network: string): boolean {
    const contractsPath = path.join(__dirname, '../../dapp/lib/contracts.ts');

    try {
        // Get the deployer address (first address from the deployment)
        const deployerAddress = Object.values(addresses)[0]?.split('.')[0] || '';

        // Generate the contracts.ts file content
        const contractsContent = `// Contract addresses and constants (auto-generated)
// Generated on: ${new Date().toISOString()}
// Network: ${network.toUpperCase()}

// Deployer address - can create point-only missions
export const DEPLOYER_ADDRESS = '${deployerAddress}';

// Helper function to check if an address is the deployer
export const isDeployerAddress = (address: string | undefined): boolean => {
  return address === DEPLOYER_ADDRESS;
};

// Contract addresses
export const CONTRACTS = {${Object.entries(addresses).map(([contractName, address]) => {
            // Handle special contract names for consistent naming
            let keyName = contractName;
            if (contractName === 'MOCK-TOKEN') {
                keyName = 'MOCK_TOKEN';
            } else if (contractName === 'MISSION-MANAGER') {
                keyName = 'MISSION_MANAGER';
            }
            return `\n  ${keyName}: '${address}',`;
        }).join('')}
};

// Network configuration
export const STACKS_NETWORK = '${network}';

// Legacy exports for backward compatibility
export const POINTS_CONTRACT = CONTRACTS.POINTS;
export const MISSION_MANAGER_CONTRACT = CONTRACTS.MISSION_MANAGER;
export const MOCK_TOKEN_CONTRACT = CONTRACTS.MOCK_TOKEN;
`;

        fs.writeFileSync(contractsPath, contractsContent);

        console.log(`✅ Generated dapp/lib/contracts.ts with ${network} contract addresses`);
        return true;
    } catch (error) {
        console.error('❌ Error generating contracts.ts:', (error as Error).message);
        return false;
    }
}

function main(): void {
    const args = process.argv.slice(2);
    const network = args[0] || 'testnet';

    console.log(`🔍 Extracting contract addresses for ${network.toUpperCase()}...`);

    const planPath = path.join(__dirname, `../deployments/default.${network}-plan.yaml`);
    const addresses = extractAddressesFromPlan(planPath, network);

    if (!addresses) {
        console.log(`❌ Could not extract addresses for ${network}`);
        process.exit(1);
    }

    console.log('\n📋 Found contract addresses:');
    Object.entries(addresses).forEach(([name, address]) => {
        console.log(`  ${name.padEnd(12)}: ${address}`);
    });

    // Generate contracts.ts file
    const success = generateContractsFile(addresses, network);

    if (success) {
        console.log(`\n🎉 Successfully generated contracts.ts for ${network.toUpperCase()}!`);
        console.log('\n💡 Next steps:');
        console.log('1. Restart your Next.js development server');
        console.log('2. Verify the contract addresses in your dapp');
    } else {
        console.log(`\n💥 Failed to generate contracts.ts for ${network.toUpperCase()}!`);
        process.exit(1);
    }
}

main();