import { AleoTransaction } from "@demox-labs/aleo-wallet-adapter-base";

// The name of our deployed DCA program
export const DCA_PROGRAM_ID = "zk_dca_arcane_finance.aleo";

/**
 * Creates a DCA position transaction
 */
export function createDCAPositionTransaction(
  publicKey: string,
  inputTokenId: number,
  inputAmount: number,
  outputTokenId: number,
  interval: number,
  executionsRemaining: number,
  minOutputAmount: number,
  blockHeight: number
): AleoTransaction {
  return {
    address: publicKey,
    chainId: "testnetbeta",
    transitions: [{
      program: DCA_PROGRAM_ID,
      functionName: "create_position",
      inputs: [
        `${inputTokenId}u64`,
        `${inputAmount}u64`,
        `${outputTokenId}u64`,
        `${interval}u32`,
        `${executionsRemaining}u32`,
        `${minOutputAmount}u64`,
        `${blockHeight}u32`
      ]
    }],
    fee: 1000000, // fees in microcredits
    feePrivate: false,
  };
}

/**
 * Creates a transaction to execute a DCA swap
 */
export function executeDCATransaction(
  publicKey: string,
  positionRecord: string,
  tokenRecord: string,
  blockHeight: number
): AleoTransaction {
  return {
    address: publicKey,
    chainId: "testnetbeta",
    transitions: [{
      program: DCA_PROGRAM_ID,
      functionName: "execute_dca",
      inputs: [
        positionRecord,
        tokenRecord,
        `${blockHeight}u32`
      ]
    }],
    fee: 1000000, // fees in microcredits
    feePrivate: false,
  };
}

/**
 * Creates a transaction to cancel a DCA position
 */
export function cancelPositionTransaction(
  publicKey: string,
  positionRecord: string
): AleoTransaction {
  return {
    address: publicKey,
    chainId: "testnetbeta",
    transitions: [{
      program: DCA_PROGRAM_ID,
      functionName: "cancel_position",
      inputs: [positionRecord]
    }],
    fee: 1000000, // fees in microcredits
    feePrivate: false,
  };
} 