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

function updateDappEnv(addresses: Record<string, string>, network: string): boolean {
  const envPath = path.join(__dirname, '../../dapp/.env.local');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Remove existing contract address lines
    const lines = envContent.split('\n').filter(line => 
      !line.startsWith('NEXT_PUBLIC_FACTORY_CONTRACT=') &&
      !line.startsWith('NEXT_PUBLIC_POINTS_CONTRACT=') &&
      !line.startsWith('NEXT_PUBLIC_CAMPAIGN_CONTRACT=') &&
      !line.startsWith('NEXT_PUBLIC_CAMPAIGN_MANAGER_CONTRACT=') &&
      !line.startsWith('NEXT_PUBLIC_MOCK_TOKEN_CONTRACT=') &&
      !line.startsWith('NEXT_PUBLIC_MOCK-TOKEN_CONTRACT=') &&
      !line.startsWith('NEXT_PUBLIC_STACKS_NETWORK=')
    );

    // Add new contract addresses
    lines.push('');
    lines.push(`# Contract addresses for ${network.toUpperCase()} (auto-generated)`);
    lines.push(`NEXT_PUBLIC_STACKS_NETWORK=${network}`);
    
    Object.entries(addresses).forEach(([contractName, address]) => {
      // Handle special contract names
      let envVarName = contractName;
      if (contractName === 'MOCK-TOKEN') {
        envVarName = 'MOCK_TOKEN';
      } else if (contractName === 'MISSION-MANAGER') {
        envVarName = 'CAMPAIGN_MANAGER';
      }
      lines.push(`NEXT_PUBLIC_${envVarName}_CONTRACT=${address}`);
    });

    const newContent = lines.join('\n');
    fs.writeFileSync(envPath, newContent);
    
    console.log(`✅ Updated dapp/.env.local with ${network} contract addresses`);
    return true;
  } catch (error) {
    console.error('❌ Error updating .env.local:', (error as Error).message);
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

  // Update dapp environment
  const success = updateDappEnv(addresses, network);
  
  if (success) {
    console.log(`\n🎉 Successfully updated contract addresses for ${network.toUpperCase()}!`);
    console.log('\n💡 Next steps:');
    console.log('1. Restart your Next.js development server');
    console.log('2. Verify the contract addresses in your dapp');
  } else {
    console.log(`\n💥 Failed to update contract addresses for ${network.toUpperCase()}!`);
    process.exit(1);
  }
}

main();