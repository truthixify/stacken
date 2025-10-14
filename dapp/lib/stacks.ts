import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  principalCV,
  someCV,
  noneCV,
  listCV,
  tupleCV,
  contractPrincipalCV,
  callReadOnlyFunction,
  cvToJSON,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { CONTRACTS, STACKS_NETWORK } from '../common/constants';

// Network configuration
export const getStacksNetwork = () => {
  return STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

// Contract interaction functions
export const createCampaign = async (
  senderKey: string,
  title: string,
  description: string,
  tokenAddress: string | null,
  tokenAmount: number,
  totalPoints: number,
  startTime: number,
  endTime: number
) => {
  const network = getStacksNetwork();

  const txOptions = {
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'create-campaign',
    functionArgs: [
      stringUtf8CV(title),
      stringUtf8CV(description),
      tokenAddress
        ? someCV(contractPrincipalCV(tokenAddress.split('.')[0], tokenAddress.split('.')[1]))
        : noneCV(),
      uintCV(tokenAmount),
      uintCV(totalPoints),
      uintCV(startTime),
      uintCV(endTime),
    ],
    senderKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return await broadcastTransaction(transaction, network);
};

export const awardPoints = async (
  senderKey: string,
  userAddress: string,
  points: number,
  reason: string
) => {
  const network = getStacksNetwork();

  const txOptions = {
    contractAddress: CONTRACTS.POINTS.split('.')[0],
    contractName: CONTRACTS.POINTS.split('.')[1],
    functionName: 'award-points',
    functionArgs: [principalCV(userAddress), uintCV(points), stringUtf8CV(reason)],
    senderKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return await broadcastTransaction(transaction, network);
};

export const distributeRewards = async (
  senderKey: string,
  campaignId: number,
  tokenContract: string | null,
  distributions: Array<{ recipient: string; amount: number; points: number }>
) => {
  const network = getStacksNetwork();

  const distributionList = listCV(
    distributions.map(d =>
      tupleCV({
        recipient: principalCV(d.recipient),
        amount: uintCV(d.amount),
        points: uintCV(d.points),
      })
    )
  );

  const txOptions = {
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'distribute-rewards',
    functionArgs: [
      uintCV(campaignId),
      tokenContract
        ? someCV(contractPrincipalCV(tokenContract.split('.')[0], tokenContract.split('.')[1]))
        : noneCV(),
      distributionList,
    ],
    senderKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return await broadcastTransaction(transaction, network);
};

export const finalizeCampaign = async (senderKey: string, campaignId: number) => {
  const network = getStacksNetwork();

  const txOptions = {
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'finalize-campaign',
    functionArgs: [uintCV(campaignId)],
    senderKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return await broadcastTransaction(transaction, network);
};

// Read-only contract calls
export const getCampaignInfo = async (campaignId: number) => {
  const network = getStacksNetwork();

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'get-campaign-info',
    functionArgs: [uintCV(campaignId)],
    network,
    senderAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
  });

  return cvToJSON(result);
};

export const getUserPoints = async (userAddress: string) => {
  const network = getStacksNetwork();

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACTS.POINTS.split('.')[0],
    contractName: CONTRACTS.POINTS.split('.')[1],
    functionName: 'get-user-points',
    functionArgs: [principalCV(userAddress)],
    network,
    senderAddress: CONTRACTS.POINTS.split('.')[0],
  });

  return cvToJSON(result);
};

export const getCampaignCount = async () => {
  const network = getStacksNetwork();

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'get-campaign-count',
    functionArgs: [],
    network,
    senderAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
  });

  return cvToJSON(result);
};

export const isCampaignActive = async (campaignId: number) => {
  const network = getStacksNetwork();

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'is-campaign-active',
    functionArgs: [uintCV(campaignId)],
    network,
    senderAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
  });

  return cvToJSON(result);
};

export const getUserAchievements = async (userAddress: string) => {
  const network = getStacksNetwork();

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACTS.POINTS.split('.')[0],
    contractName: CONTRACTS.POINTS.split('.')[1],
    functionName: 'get-user-achievements',
    functionArgs: [principalCV(userAddress)],
    network,
    senderAddress: CONTRACTS.POINTS.split('.')[0],
  });

  return cvToJSON(result);
};

export const isTokenAllowed = async (tokenAddress: string) => {
  const network = getStacksNetwork();

  const result = await callReadOnlyFunction({
    contractAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
    contractName: CONTRACTS.CAMPAIGN_MANAGER.split('.')[1],
    functionName: 'is-token-allowed',
    functionArgs: [principalCV(tokenAddress)],
    network,
    senderAddress: CONTRACTS.CAMPAIGN_MANAGER.split('.')[0],
  });

  return cvToJSON(result);
};
