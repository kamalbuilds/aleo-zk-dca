/**
 * Verulink Bridge Integration Utilities
 * This file contains utility functions for interacting with the Verulink bridge
 * between Aleo, Ethereum, Base, and Arbitrum.
 */

// Base URL for Verulink API
const VERULINK_API_BASE_URL = 'https://aleobridge-be-development.b08qlu4v33brq.us-east-1.cs.amazonlightsail.com/v1';

// Chain IDs as per Verulink documentation
export const CHAIN_IDS = {
  ALEO: '6694886634403',
  ETH_SEPOLIA: '28556963657430695',
  BASE_SEPOLIA: '443067135441324596',
  ARBITRUM_SEPOLIA: '438861435819683566'
};

// Chain configuration for UI display
export const CHAINS = {
  [CHAIN_IDS.ALEO]: {
    name: 'Aleo',
    symbol: 'ALEO',
    icon: '/aleo.svg'
  },
  [CHAIN_IDS.ETH_SEPOLIA]: {
    name: 'Ethereum (Sepolia)',
    symbol: 'ETH',
    icon: '/ethereum.svg'
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    name: 'Base (Sepolia)',
    symbol: 'ETH',
    icon: '/base.svg'
  },
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    name: 'Arbitrum (Sepolia)',
    symbol: 'ETH',
    icon: '/arbitrum.svg'
  }
};

// Mainnet contract addresses for Verulink
const VERULINK_CONTRACTS = {
  ethereum: {
    bridge: '0x7440176A6F367D3Fad1754519bD8033EAF173133',
    tokenService: '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170'
  },
  base: {
    bridge: '0x7440176A6F367D3Fad1754519bD8033EAF173133', // Using the same address as example
    tokenService: '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170' // Using the same address as example
  },
  arbitrum: {
    bridge: '0x7440176A6F367D3Fad1754519bD8033EAF173133', // Using the same address as example
    tokenService: '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170' // Using the same address as example
  },
  aleo: {
    bridge: 'vlink_token_bridge_v1.aleo',
    tokenService: 'vlink_token_service_v1.aleo'
  }
};

// Supported token IDs on Aleo
const SUPPORTED_TOKENS = {
  vUSDC: '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
  vUSDT: '7311977476241952331367670434347097026669181172395481678807963832961201831695field',
  vETH: '1381601714105276218895759962490543360839827276760458984912661726715051428034field'
};

/**
 * Validates an Aleo address format
 * @param address Aleo address to validate
 * @returns Boolean indicating if the address is valid
 */
export function validateAleoAddress(address: string): boolean {
  // Basic validation - Aleo addresses start with "aleo1" and are 63 characters long
  return address.startsWith('aleo1') && address.length === 63;
}

/**
 * Validates an Ethereum/EVM address format
 * @param address Ethereum address to validate
 * @returns Boolean indicating if the address is valid
 */
export function validateEVMAddress(address: string): boolean {
  // Basic validation - Ethereum addresses start with "0x" and are 42 characters long
  return address.startsWith('0x') && address.length === 42;
}

/**
 * Interface for bridge transfer params
 */
export interface BridgeTransferParams {
  sourceChainId: string;       // Source chain ID
  destinationChainId: string;  // Destination chain ID
  tokenAddress: string;        // ERC20 token address (or "ETH" for native token)
  amount: string;              // Amount to transfer in the smallest unit (wei for ETH, etc.)
  receiver: string;            // Receiver address on destination chain
}

/**
 * Creates a transfer transaction for bridging assets between chains
 * @param params Transfer parameters
 * @returns Transaction payload to be sent to a wallet
 */
export function createBridgeTransferTransaction(params: BridgeTransferParams) {
  const { sourceChainId, destinationChainId, tokenAddress, amount, receiver } = params;
  
  // Validate addresses based on destination chain
  if (destinationChainId === CHAIN_IDS.ALEO) {
    if (!validateAleoAddress(receiver)) {
      throw new Error('Invalid Aleo address format');
    }
  } else {
    if (!validateEVMAddress(receiver)) {
      throw new Error('Invalid EVM address format');
    }
  }
  
  // Format transaction data based on source chain
  if (sourceChainId !== CHAIN_IDS.ALEO) {
    // EVM to Aleo transaction
    let targetContract;
    
    switch (sourceChainId) {
      case CHAIN_IDS.ETH_SEPOLIA:
        targetContract = VERULINK_CONTRACTS.ethereum.tokenService;
        break;
      case CHAIN_IDS.BASE_SEPOLIA:
        targetContract = VERULINK_CONTRACTS.base.tokenService;
        break;
      case CHAIN_IDS.ARBITRUM_SEPOLIA:
        targetContract = VERULINK_CONTRACTS.arbitrum.tokenService;
        break;
      default:
        throw new Error('Unsupported source chain');
    }
    
    if (tokenAddress.toLowerCase() === 'eth') {
      return {
        to: targetContract,
        value: amount,
        data: `0x${Buffer.from(receiver).toString('hex')}`, // Simplified
        method: 'transfer(string)',
        chainId: sourceChainId
      };
    } else {
      return {
        to: targetContract,
        value: '0', // No ETH sent with ERC20 transfers
        data: `0x${Buffer.from(tokenAddress + amount + receiver).toString('hex')}`, // Simplified
        method: 'transfer(address,uint256,string)',
        chainId: sourceChainId
      };
    }
  } else {
    // Aleo to EVM transaction
    return {
      program: VERULINK_CONTRACTS.aleo.tokenService,
      function: 'transfer',
      inputs: [
        tokenAddress,
        amount,
        receiver,
        destinationChainId
      ]
    };
  }
}

/**
 * Interface for packet data
 */
export interface PacketData {
  packetId: string;
  version: string;
  destinationAddress: string;
  sourceAddress: string;
  destinationChain: string;
  sourceChain: string;
  status: string;
  tokenAddress?: string;
  amount?: string;
  signatures?: number;
  timestamp?: number | "pending";
  [key: string]: any; // For additional fields
}

/**
 * Interface for packet list response
 */
export interface PacketListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: PacketData[];
}

/**
 * Fetches packets for a specific wallet and chain
 * @param wallet Wallet address (Aleo or EVM)
 * @param chainId Chain ID
 * @param filter Filter status ('all', 'completed', 'pending')
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with packets data
 */
export async function fetchPacketsByWalletAndChain(
  wallet: string,
  chainId: string,
  filter: 'all' | 'completed' | 'pending' = 'all',
  page: number = 1,
  limit: number = 10
): Promise<PacketListResponse> {
  try {
    const url = new URL(`${VERULINK_API_BASE_URL}/packet/${wallet}/${chainId}`);
    url.searchParams.append('filter', filter);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      if (response.status === 404) {
        return { totalItems: 0, totalPages: 0, currentPage: page, data: [] };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching packets by wallet and chain:', error);
    return { totalItems: 0, totalPages: 0, currentPage: page, data: [] };
  }
}

/**
 * Fetches packets for a specific wallet
 * @param wallet Wallet address (Aleo or EVM)
 * @param filter Filter status ('all', 'completed', 'pending')
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with packets data
 */
export async function fetchPacketsByWallet(
  wallet: string,
  filter: 'all' | 'completed' | 'pending' = 'all',
  page: number = 1,
  limit: number = 10
): Promise<PacketListResponse> {
  try {
    const url = new URL(`${VERULINK_API_BASE_URL}/packet/wallet/${wallet}`);
    url.searchParams.append('filter', filter);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      if (response.status === 404) {
        return { totalItems: 0, totalPages: 0, currentPage: page, data: [] };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching packets by wallet:', error);
    return { totalItems: 0, totalPages: 0, currentPage: page, data: [] };
  }
}

/**
 * Fetches packets for a specific chain
 * @param chainId Chain ID
 * @param filter Filter status ('all', 'completed', 'pending')
 * @param minSignatureCount Minimum signature count
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with packets data
 */
export async function fetchPacketsByChain(
  chainId: string,
  filter: 'all' | 'completed' | 'pending' = 'all',
  minSignatureCount: number = 0,
  page: number = 1,
  limit: number = 10
): Promise<PacketListResponse> {
  try {
    const url = new URL(`${VERULINK_API_BASE_URL}/packet/${chainId}`);
    url.searchParams.append('filter', filter);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    if (minSignatureCount > 0) {
      url.searchParams.append('min_signature_count', minSignatureCount.toString());
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      if (response.status === 404) {
        return { totalItems: 0, totalPages: 0, currentPage: page, data: [] };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching packets by chain:', error);
    return { totalItems: 0, totalPages: 0, currentPage: page, data: [] };
  }
}

/**
 * Gets the current bridge status
 * This would fetch actual data from an API or blockchain in a real implementation
 * @returns Promise with bridge status information
 */
export async function getBridgeStatus(): Promise<{
  isOperational: boolean;
  transferLimit: string;
  supportedTokens: string[];
  supportedChains: string[];
}> {
  // This would typically involve calling an API or the blockchain
  // Returning mock data for now
  return {
    isOperational: true,
    transferLimit: '100000',
    supportedTokens: Object.keys(SUPPORTED_TOKENS),
    supportedChains: [
      CHAIN_IDS.ALEO,
      CHAIN_IDS.ETH_SEPOLIA, 
      CHAIN_IDS.BASE_SEPOLIA, 
      CHAIN_IDS.ARBITRUM_SEPOLIA
    ]
  };
}

/**
 * Gets the token balance on Aleo for a given address and token
 * @param address Aleo address
 * @param token Token identifier
 * @returns Promise with balance information
 */
export async function getTokenBalance(address: string, token: string): Promise<string> {
  // This would query the Aleo blockchain for token balance
  // Returning a mock value for now
  return '0';
}

// Export token constants for convenience
export { VERULINK_CONTRACTS, SUPPORTED_TOKENS }; 