'use client';

import { useState, useEffect } from 'react';
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import Image from 'next/image';
import styles from '../page.module.css';
import { validateAleoAddress, validateEVMAddress } from '../utils/verulink';
import { createDCAPositionTransaction, DCA_PROGRAM_ID } from '../utils/transactions';

// Define supported EVM chains
const EVM_CHAINS = {
  ETH_MAINNET: {
    id: '1',
    name: 'Ethereum',
    icon: '/ethereum.svg',
    testnet: false
  },
  ETH_SEPOLIA: {
    id: '11155111',
    name: 'Ethereum Sepolia',
    icon: '/ethereum.svg',
    testnet: true
  },
  BASE: {
    id: '8453',
    name: 'Base',
    icon: '/base.svg',
    testnet: false
  },
  BASE_SEPOLIA: {
    id: '84532',
    name: 'Base Sepolia',
    icon: '/base.svg',
    testnet: true
  },
  ARBITRUM: {
    id: '42161',
    name: 'Arbitrum One',
    icon: '/arbitrum.svg',
    testnet: false
  },
  ARBITRUM_SEPOLIA: {
    id: '421614',
    name: 'Arbitrum Sepolia',
    icon: '/arbitrum.svg',
    testnet: true
  }
};

// Define tokens that can be bridged
const BRIDGEABLE_TOKENS = [
  { id: 1, name: 'USDC', symbol: 'USDC', icon: '/usdc.svg', chains: ['1', '11155111', '8453', '84532', '42161', '421614'] },
  { id: 2, name: 'USDT', symbol: 'USDT', icon: '/usdt.svg', chains: ['1', '11155111', '8453', '84532', '42161', '421614'] },
  { id: 3, name: 'ETH', symbol: 'ETH', icon: '/ethereum.svg', chains: ['1', '11155111', '8453', '84532', '42161', '421614'] },
  { id: 4, name: 'Wrapped BTC', symbol: 'WBTC', icon: '/wbtc.svg', chains: ['1', '11155111', '42161', '421614'] },
];

export default function CrossChainDCA() {
  const { publicKey, connected, requestTransaction } = useWallet();
  
  // Form state for cross-chain DCA
  const [sourceChain, setSourceChain] = useState<string>(EVM_CHAINS.ETH_SEPOLIA.id);
  const [sourceToken, setSourceToken] = useState<number>(1); // Default to USDC
  const [sourceAmount, setSourceAmount] = useState<string>('100');
  const [targetToken, setTargetToken] = useState<number>(3); // Default to ETH
  const [interval, setInterval] = useState<string>('10');
  const [executionsRemaining, setExecutionsRemaining] = useState<string>('5');
  const [minOutputAmount, setMinOutputAmount] = useState<string>('90');
  const [evmWalletAddress, setEvmWalletAddress] = useState<string>('');
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number>(1000); // Mock value
  
  // UI State
  const [isCreatingPosition, setIsCreatingPosition] = useState<boolean>(false);
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'bridge' | 'dca'>('bridge');
  
  // Fetch mock current block height
  useEffect(() => {
    // In a real implementation, you would fetch the actual block height
    setCurrentBlockHeight(prev => prev + 10);
  }, []);
  
  // Filter tokens by source chain
  const getAvailableTokens = (chainId: string) => {
    return BRIDGEABLE_TOKENS.filter(token => token.chains.includes(chainId));
  };

  // Validate EVM wallet connection
  const validateEvmWallet = () => {
    if (!evmWalletAddress) {
      setError('Please connect your EVM wallet');
      return false;
    }
    
    if (!validateEVMAddress(evmWalletAddress)) {
      setError('Invalid EVM wallet address');
      return false;
    }
    
    return true;
  };
  
  // Validate form inputs
  const validateInputs = () => {
    setError(null);
    
    if (!sourceAmount || parseFloat(sourceAmount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!validateEvmWallet()) {
      return false;
    }
    
    return true;
  };
  
  // Handle bridging assets from EVM to Aleo
  const handleBridgeAssets = async () => {
    if (!validateInputs()) return;
    
    setIsBridging(true);
    setError(null);
    setTransactionInProgress(true);
    
    try {
      // In a real implementation, you would:
      // 1. Connect to the EVM wallet
      // 2. Approve token spending if needed
      // 3. Initiate the bridge transaction using Verilink bridge
      
      // Mock successful bridge (in reality this would be an async operation)
      setTimeout(() => {
        setSuccess(`Successfully initiated bridge of ${sourceAmount} ${BRIDGEABLE_TOKENS.find(t => t.id === sourceToken)?.symbol} from ${Object.values(EVM_CHAINS).find(c => c.id === sourceChain)?.name} to Aleo`);
        setStep('dca');
        setTransactionInProgress(false);
        setIsBridging(false);
      }, 2000);
    } catch (error: any) {
      setError(`Error bridging assets: ${error.message}`);
      setTransactionInProgress(false);
      setIsBridging(false);
    }
  };
  
  // Create DCA position with bridged assets
  const createCrossChainDCA = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your Aleo wallet');
      return;
    }
    
    if (!requestTransaction) {
      setError('Wallet does not support transactions');
      return;
    }
    
    setIsCreatingPosition(true);
    setError(null);
    setTransactionInProgress(true);
    
    try {
      // Create the DCA position using the same function as regular DCA
      const transaction = createDCAPositionTransaction(
        publicKey,
        sourceToken, // Input token (bridged from EVM)
        parseInt(sourceAmount),
        targetToken,
        parseInt(interval),
        parseInt(executionsRemaining),
        parseInt(minOutputAmount),
        currentBlockHeight
      );
      
      const txId = await requestTransaction(transaction);
      
      setSuccess(`Successfully created DCA position with bridged assets! Transaction ID: ${txId}`);
    } catch (error: any) {
      setError(`Error creating DCA position: ${error.message}`);
    } finally {
      setIsCreatingPosition(false);
      setTransactionInProgress(false);
    }
  };

  return (
    <div className={styles.crossChainContainer}>
      <div className={styles.crossChainHeader}>
        <h2>Cross-Chain DCA with Verilink Bridge</h2>
        <p>Create DCA positions on Aleo using assets from Ethereum, Base, and Arbitrum networks</p>
      </div>
      
      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step === 'bridge' ? styles.activeStep : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepLabel}>Bridge Assets</div>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step === 'dca' ? styles.activeStep : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepLabel}>Create DCA Position</div>
        </div>
      </div>
      
      {/* Bridge Assets Form */}
      {step === 'bridge' && (
        <div className={styles.formContainer}>
          <h3>Bridge Assets from EVM to Aleo</h3>
          
          <div className={styles.formGroup}>
            <label>Source Chain:</label>
            <select 
              value={sourceChain} 
              onChange={(e) => setSourceChain(e.target.value)}
              className={styles.select}
              disabled={transactionInProgress}
            >
              {Object.values(EVM_CHAINS).map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Source Token:</label>
            <select 
              value={sourceToken} 
              onChange={(e) => setSourceToken(parseInt(e.target.value))}
              className={styles.select}
              disabled={transactionInProgress}
            >
              {getAvailableTokens(sourceChain).map(token => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Amount:</label>
            <input 
              type="number" 
              value={sourceAmount} 
              onChange={(e) => setSourceAmount(e.target.value)}
              className={styles.input}
              min="1"
              disabled={transactionInProgress}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>EVM Wallet Address:</label>
            <input 
              type="text" 
              value={evmWalletAddress} 
              onChange={(e) => setEvmWalletAddress(e.target.value)}
              className={styles.input}
              placeholder="0x..."
              disabled={transactionInProgress}
            />
          </div>
          
          <button 
            onClick={handleBridgeAssets} 
            disabled={isBridging || transactionInProgress}
            className={styles.button}
          >
            {isBridging ? 'Bridging Assets...' : 'Bridge Assets to Aleo'}
          </button>
        </div>
      )}
      
      {/* Create DCA Position Form */}
      {step === 'dca' && (
        <div className={styles.formContainer}>
          <h3>Create DCA Position with Bridged Assets</h3>
          
          <div className={styles.bridgeSuccessMessage}>
            <div className={styles.successIcon}>✓</div>
            <div>
              <strong>Assets Bridged Successfully!</strong>
              <p>Your assets are now available on Aleo to create a DCA position.</p>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Input Token (Bridged):</label>
            <div className={styles.tokenDisplay}>
              {BRIDGEABLE_TOKENS.find(t => t.id === sourceToken)?.name} ({BRIDGEABLE_TOKENS.find(t => t.id === sourceToken)?.symbol})
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Input Amount:</label>
            <div className={styles.tokenDisplay}>
              {sourceAmount}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Target Token:</label>
            <select 
              value={targetToken} 
              onChange={(e) => setTargetToken(parseInt(e.target.value))}
              className={styles.select}
              disabled={transactionInProgress}
            >
              {BRIDGEABLE_TOKENS.map(token => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Execution Interval (blocks):</label>
            <input 
              type="number" 
              value={interval} 
              onChange={(e) => setInterval(e.target.value)}
              className={styles.input}
              min="1"
              disabled={transactionInProgress}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Executions Remaining:</label>
            <input 
              type="number" 
              value={executionsRemaining} 
              onChange={(e) => setExecutionsRemaining(e.target.value)}
              className={styles.input}
              min="1"
              disabled={transactionInProgress}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Minimum Output Amount:</label>
            <input 
              type="number" 
              value={minOutputAmount} 
              onChange={(e) => setMinOutputAmount(e.target.value)}
              className={styles.input}
              min="1"
              disabled={transactionInProgress}
            />
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              onClick={() => setStep('bridge')} 
              className={styles.secondaryButton}
              disabled={isCreatingPosition || transactionInProgress}
            >
              Back to Bridge
            </button>
            
            <button 
              onClick={createCrossChainDCA} 
              disabled={!connected || isCreatingPosition || transactionInProgress}
              className={styles.button}
            >
              {isCreatingPosition ? 'Creating Position...' : 'Create Cross-Chain DCA'}
            </button>
          </div>
        </div>
      )}
      
      {/* Error and Success Messages */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}
      
      {/* Informational Section */}
      <div className={styles.infoSection}>
        <h3>About Cross-Chain DCA</h3>
        <p>
          This feature allows you to create privacy-preserving Dollar Cost Averaging (DCA) positions on Aleo using assets from EVM-compatible blockchains.
        </p>
        <div className={styles.infoBenefits}>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>🔒</div>
            <div className={styles.benefitText}>
              <strong>Privacy-Preserving</strong>
              <p>Your DCA strategy is private on Aleo's zero-knowledge blockchain</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>🌉</div>
            <div className={styles.benefitText}>
              <strong>Cross-Chain Bridge</strong>
              <p>Powered by Verilink secure bridge technology</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>💱</div>
            <div className={styles.benefitText}>
              <strong>Multi-Chain Support</strong>
              <p>Use assets from Ethereum, Base, Arbitrum and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}