/**
 * Smart Contract Configuration
 * 
 * This file provides type-safe access to all contract addresses
 * and dApp configuration from environment variables.
 */

// Type definitions for better IDE support
export type ContractAddresses = {
  token: string;
  nft: string;
  staking: string;
  governance: string;
  reward: string;
  vault: string;
  factory: string;
  router: string;
  treasury: string;
  multisig: string;
};

export type NetworkConfig = {
  networkId: number;
  chainName: string;
  rpcUrl: string;
  blockExplorer: string;
};

export type DAppConfig = {
  appName: string;
  appVersion: string;
  network: NetworkConfig;
  contracts: ContractAddresses;
  subgraphUrl: string;
  ipfsGateway: string;
  enableAnalytics: boolean;
  enableNotifications: boolean;
};

// Helper function to get environment variable with fallback
const getEnv = (key: string, fallback: string = ''): string => {
  return process.env[key] || fallback;
};

const getEnvBoolean = (key: string, fallback: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

const getEnvNumber = (key: string, fallback: number = 0): number => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return parseInt(value, 10) || fallback;
};

// Main configuration object
export const dAppConfig: DAppConfig = {
  appName: getEnv('NEXT_PUBLIC_APP_NAME', 'My dApp'),
  appVersion: getEnv('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  
  network: {
    networkId: getEnvNumber('NEXT_PUBLIC_NETWORK_ID', 1),
    chainName: getEnv('NEXT_PUBLIC_CHAIN_NAME', 'Ethereum Mainnet'),
    rpcUrl: getEnv('NEXT_PUBLIC_RPC_URL', 'https://mainnet.infura.io/v3/'),
    blockExplorer: getEnv('NEXT_PUBLIC_BLOCK_EXPLORER', 'https://etherscan.io'),
  },
  
  contracts: {
    token: getEnv('NEXT_PUBLIC_TOKEN_CONTRACT'),
    nft: getEnv('NEXT_PUBLIC_NFT_CONTRACT'),
    staking: getEnv('NEXT_PUBLIC_STAKING_CONTRACT'),
    governance: getEnv('NEXT_PUBLIC_GOVERNANCE_CONTRACT'),
    reward: getEnv('NEXT_PUBLIC_REWARD_CONTRACT'),
    vault: getEnv('NEXT_PUBLIC_VAULT_CONTRACT'),
    factory: getEnv('NEXT_PUBLIC_FACTORY_CONTRACT'),
    router: getEnv('NEXT_PUBLIC_ROUTER_CONTRACT'),
    treasury: getEnv('NEXT_PUBLIC_TREASURY_CONTRACT'),
    multisig: getEnv('NEXT_PUBLIC_MULTISIG_CONTRACT'),
  },
  
  subgraphUrl: getEnv('NEXT_PUBLIC_SUBGRAPH_URL', ''),
  ipfsGateway: getEnv('NEXT_PUBLIC_IPFS_GATEWAY', 'https://ipfs.io/ipfs/'),
  enableAnalytics: getEnvBoolean('NEXT_PUBLIC_ENABLE_ANALYTICS', true),
  enableNotifications: getEnvBoolean('NEXT_PUBLIC_ENABLE_NOTIFICATIONS', true),
};

// Export individual parts for convenience
export const contracts = dAppConfig.contracts;
export const network = dAppConfig.network;

// Validation function (optional, but recommended)
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if critical contract addresses are set
  Object.entries(contracts).forEach(([key, value]) => {
    if (!value || value === '') {
      errors.push(`Missing contract address for: ${key}`);
    }
  });
  
  // Check network configuration
  if (!network.rpcUrl) {
    errors.push('Missing RPC URL');
  }
  
  if (network.networkId === 0) {
    errors.push('Invalid network ID');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper to get contract address by name
export const getContractAddress = (contractName: keyof ContractAddresses): string => {
  return contracts[contractName];
};

// Helper to check if we're on testnet
export const isTestnet = (): boolean => {
  return network.networkId !== 1 && network.networkId !== 137; // Not mainnet or Polygon
};

export default dAppConfig;

