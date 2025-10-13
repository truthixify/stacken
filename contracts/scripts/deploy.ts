#!/usr/bin/env tsx

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interface NetworkConfig {
  cost: string;
  description: string;
}

const networks: Record<string, NetworkConfig> = {
  simnet: {
    cost: '--low-cost',
    description: 'Local simnet environment'
  },
  devnet: {
    cost: '--low-cost', 
    description: 'Devnet environment'
  },
  testnet: {
    cost: '--low-cost',
    description: 'Testnet environment'
  },
  mainnet: {
    cost: '--high-cost',
    description: 'Mainnet environment (REAL MONEY!)'
  }
};

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function executeCommand(command: string, description: string): boolean {
  console.log(`\n🔄 ${description}...`);
  console.log(`Running: ${command}`);
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, (error as Error).message);
    return false;
  }
}

async function deployToNetwork(network: string): Promise<boolean> {
  const config = networks[network];
  if (!config) {
    console.error(`❌ Unknown network: ${network}`);
    return false;
  }

  console.log(`\n🚀 Deploying to ${network.toUpperCase()} (${config.description})`);
  
  if (network === 'mainnet') {
    console.log('\n⚠️  WARNING: You are about to deploy to MAINNET!');
    console.log('This will use real STX tokens and cannot be undone.');
    const confirm = await askQuestion('Are you absolutely sure? (type "YES" to continue): ');
    if (confirm !== 'YES') {
      console.log('❌ Deployment cancelled');
      return false;
    }
  }

  // Generate deployment plan
  const generateCmd = `clarinet deployments generate --${network} ${config.cost}`;
  if (!executeCommand(generateCmd, `Generating ${network} deployment plan`)) {
    return false;
  }

  // Ask for confirmation before applying
  const apply = await askQuestion(`\nDo you want to apply the deployment to ${network}? (y/N): `);
  if (apply.toLowerCase() !== 'y' && apply.toLowerCase() !== 'yes') {
    console.log('❌ Deployment cancelled');
    return false;
  }

  // Apply deployment
  const applyCmd = `clarinet deployments apply --${network}`;
  const deploySuccess = executeCommand(applyCmd, `Applying ${network} deployment`);
  
  if (deploySuccess) {
    // Extract and update contract addresses
    const extractCmd = `tsx scripts/extract-addresses.ts ${network}`;
    executeCommand(extractCmd, `Updating dapp with ${network} contract addresses`);
  }
  
  return deploySuccess;
}

async function main(): Promise<void> {
  console.log('🏗️  Stacken Contracts Deployment Tool\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Available networks:');
    Object.entries(networks).forEach(([network, config]) => {
      console.log(`  ${network.padEnd(8)} - ${config.description}`);
    });
    console.log('\nUsage:');
    console.log('  npm run deploy <network>');
    console.log('  tsx scripts/deploy.ts <network>');
    console.log('\nExamples:');
    console.log('  npm run deploy testnet');
    console.log('  tsx scripts/deploy.ts simnet');
    rl.close();
    return;
  }

  const network = args[0].toLowerCase();
  
  if (!networks[network]) {
    console.error(`❌ Invalid network: ${network}`);
    console.log('Available networks:', Object.keys(networks).join(', '));
    rl.close();
    return;
  }

  const success = await deployToNetwork(network);
  
  if (success) {
    console.log(`\n🎉 Successfully deployed to ${network.toUpperCase()}!`);
  } else {
    console.log(`\n💥 Deployment to ${network.toUpperCase()} failed!`);
    process.exit(1);
  }
  
  rl.close();
}

main().catch((error) => {
  console.error('❌ Deployment script failed:', error);
  process.exit(1);
});