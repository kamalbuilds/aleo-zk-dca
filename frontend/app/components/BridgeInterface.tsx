'use client';

import { useState, useEffect } from 'react';
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import Image from 'next/image';
import { 
  validateAleoAddress, 
  validateEVMAddress,
  createBridgeTransferTransaction, 
  fetchPacketsByWallet,
  fetchPacketsByWalletAndChain,
  getBridgeStatus,
  SUPPORTED_TOKENS,
  CHAIN_IDS,
  CHAINS,
  PacketData,
  PacketListResponse
} from '../utils/verulink';
import styles from '../page.module.css';

type SupportedToken = keyof typeof SUPPORTED_TOKENS;

export default function BridgeInterface() {
  const { publicKey, connected, requestTransaction } = useWallet();
  
  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourceChain, setSourceChain] = useState<string>(CHAIN_IDS.ETH_SEPOLIA);
  const [destinationChain, setDestinationChain] = useState<string>(CHAIN_IDS.ALEO);
  const [token, setToken] = useState<SupportedToken>('vUSDC');
  const [amount, setAmount] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [packets, setPackets] = useState<PacketData[]>([]);
  const [activePacketFilter, setActivePacketFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [bridgeStatus, setBridgeStatus] = useState<{ 
    isOperational: boolean; 
    transferLimit: string; 
    supportedTokens: string[];
    supportedChains: string[];
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load bridge status on component mount
  useEffect(() => {
    async function loadBridgeStatus() {
      try {
        const status = await getBridgeStatus();
        setBridgeStatus(status);
      } catch (err) {
        console.error('Error loading bridge status:', err);
        setError('Failed to load bridge status');
      }
    }
    
    loadBridgeStatus();
  }, []);
  
  // Load packets when connected
  useEffect(() => {
    async function loadPackets() {
      if (!connected || !publicKey) return;
      
      setIsLoading(true);
      try {
        const response = await fetchPacketsByWallet(
          publicKey,
          activePacketFilter,
          currentPage,
          10
        );
        
        setPackets(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error loading packets:', err);
        setError('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (connected) {
      loadPackets();
    }
  }, [connected, publicKey, activePacketFilter, currentPage]);
  
  // Swap source and destination chains
  const handleSwapChains = () => {
    const temp = sourceChain;
    setSourceChain(destinationChain);
    setDestinationChain(temp);
    setError(null);
    setSuccess(null);
  };
  
  // Handle source chain selection
  const handleSourceChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceChain = e.target.value;
    setSourceChain(newSourceChain);
    
    // If both source and destination are the same, swap them
    if (newSourceChain === destinationChain) {
      if (newSourceChain === CHAIN_IDS.ALEO) {
        setDestinationChain(CHAIN_IDS.ETH_SEPOLIA);
      } else {
        setDestinationChain(CHAIN_IDS.ALEO);
      }
    }
  };
  
  // Handle destination chain selection
  const handleDestinationChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestinationChain = e.target.value;
    setDestinationChain(newDestinationChain);
    
    // If both source and destination are the same, swap them
    if (sourceChain === newDestinationChain) {
      if (newDestinationChain === CHAIN_IDS.ALEO) {
        setSourceChain(CHAIN_IDS.ETH_SEPOLIA);
      } else {
        setSourceChain(CHAIN_IDS.ALEO);
      }
    }
  };
  
  // Handle token selection
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToken(e.target.value as SupportedToken);
  };
  
  // Handle packet filter change
  const handlePacketFilterChange = (filter: 'all' | 'pending' | 'completed') => {
    setActivePacketFilter(filter);
    setCurrentPage(1);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Validate input fields
  const validateInputs = () => {
    setError(null);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!destinationAddress) {
      setError('Please enter a destination address');
      return false;
    }
    
    if (destinationChain === CHAIN_IDS.ALEO) {
      if (!validateAleoAddress(destinationAddress)) {
        setError('Invalid Aleo address format');
        return false;
      }
    } else {
      if (!validateEVMAddress(destinationAddress)) {
        setError('Invalid Ethereum address format');
        return false;
      }
    }
    
    return true;
  };
  
  // Handle bridge transfer
  const handleBridgeTransfer = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create transaction payload
      const txPayload = createBridgeTransferTransaction({
        sourceChainId: sourceChain,
        destinationChainId: destinationChain,
        tokenAddress: token,
        amount: amount,
        receiver: destinationAddress
      });
      
      // In a real implementation, you would:
      // 1. Connect to the appropriate wallet (Aleo or EVM)
      // 2. Send the transaction
      
      console.log('Transaction payload:', txPayload);
      
      if (sourceChain === CHAIN_IDS.ALEO) {
        if (!connected || !requestTransaction) {
          throw new Error('Please connect your Aleo wallet first');
        }
        
        // This would be implemented to make an actual transaction
        // const txId = await requestTransaction(txPayload);
        setSuccess(`Transaction would be sent from Aleo to ${CHAINS[destinationChain].name}`);
      } else {
        // This would use an EVM wallet like MetaMask or similar
        setSuccess(`Transaction would be sent from ${CHAINS[sourceChain].name} to Aleo`);
      }
      
      // Refresh packets list
      if (connected && publicKey) {
        const response = await fetchPacketsByWallet(
          publicKey,
          activePacketFilter,
          currentPage,
          10
        );
        
        setPackets(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      console.error('Bridge transfer error:', err);
      setError(err.message || 'Failed to process bridge transfer');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Format chain name
  const formatChainName = (chainId: string) => {
    return CHAINS[chainId]?.name || chainId;
  };
  
  // Render the bridge status information
  const renderBridgeStatus = () => {
    if (!bridgeStatus) {
      return <div className={styles.loadingStatus}>Loading bridge status...</div>;
    }
    
    return (
      <div className={styles.bridgeStatus}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status:</span>
          <span className={`${styles.statusValue} ${bridgeStatus.isOperational ? styles.operational : styles.nonOperational}`}>
            {bridgeStatus.isOperational ? 'Operational' : 'Maintenance'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Transfer Limit:</span>
          <span className={styles.statusValue}>{bridgeStatus.transferLimit} USD</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Supported Chains:</span>
          <span className={styles.statusValue}>
            {bridgeStatus.supportedChains.map(chain => formatChainName(chain)).join(', ')}
          </span>
        </div>
      </div>
    );
  };
  
  // Render chain selector
  const renderChainSelector = (
    label: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    isSource: boolean
  ) => {
    // Filter out Aleo for source if user is not connected to Aleo wallet
    const availableChains = Object.keys(CHAINS).filter(chainId => {
      if (isSource && chainId === CHAIN_IDS.ALEO && !connected) {
        return false;
      }
      return true;
    });
    
    return (
      <div className={styles.formGroup}>
        <label>{label}:</label>
        <div className={styles.chainSelectWrapper}>
          <select
            value={value}
            onChange={onChange}
            className={styles.select}
            disabled={isLoading}
          >
            {availableChains.map(chainId => (
              <option key={chainId} value={chainId}>
                {CHAINS[chainId].name}
              </option>
            ))}
          </select>
          {CHAINS[value].icon && (
            <div className={styles.chainIcon}>
              <Image 
                src={CHAINS[value].icon} 
                alt={CHAINS[value].name} 
                width={24} 
                height={24} 
              />
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render packets/transactions list
  const renderPackets = () => {
    if (!connected) {
      return (
        <div className={styles.connectWalletPrompt}>
          Connect your Aleo wallet to see your bridge transactions
        </div>
      );
    }
    
    if (isLoading && packets.length === 0) {
      return <div className={styles.loadingStatus}>Loading transactions...</div>;
    }
    
    if (packets.length === 0) {
      return <div className={styles.emptyStatus}>No transactions found</div>;
    }
    
    return (
      <div className={styles.packetsContainer}>
        <div className={styles.packetFilters}>
          <button 
            className={`${styles.filterButton} ${activePacketFilter === 'all' ? styles.activeFilter : ''}`}
            onClick={() => handlePacketFilterChange('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${activePacketFilter === 'pending' ? styles.activeFilter : ''}`}
            onClick={() => handlePacketFilterChange('pending')}
          >
            Pending
          </button>
          <button 
            className={`${styles.filterButton} ${activePacketFilter === 'completed' ? styles.activeFilter : ''}`}
            onClick={() => handlePacketFilterChange('completed')}
          >
            Completed
          </button>
        </div>
        
        <div className={styles.packetsList}>
          {packets.map((packet, index) => (
            <div key={index} className={styles.packetItem}>
              <div className={styles.packetHeader}>
                <div className={styles.packetId}>ID: {packet.packetId.substring(0, 12)}...</div>
                <div className={`${styles.packetStatus} ${styles[(typeof packet.status === 'string' ? packet.status.toLowerCase() : 'unknown')]}`}>
                  {typeof packet.status === 'string' ? packet.status : 'Unknown'}
                </div>
              </div>
              
              <div className={styles.packetDetails}>
                <div className={styles.packetRoute}>
                  <div className={styles.chainWithIcon}>
                    {CHAINS[packet.sourceChain]?.icon && (
                      <Image 
                        src={CHAINS[packet.sourceChain].icon} 
                        alt={formatChainName(packet.sourceChain)}
                        width={16} 
                        height={16} 
                      />
                    )}
                    <span>{formatChainName(packet.sourceChain)}</span>
                  </div>
                  <div className={styles.routeArrow}>→</div>
                  <div className={styles.chainWithIcon}>
                    {CHAINS[packet.destinationChain]?.icon && (
                      <Image 
                        src={CHAINS[packet.destinationChain].icon} 
                        alt={formatChainName(packet.destinationChain)}
                        width={16} 
                        height={16} 
                      />
                    )}
                    <span>{formatChainName(packet.destinationChain)}</span>
                  </div>
                </div>
                
                {packet.amount && (
                  <div className={styles.packetAmount}>
                    <span className={styles.detailLabel}>Amount:</span>
                    <span className={styles.detailValue}>{typeof packet.amount === 'object' ? JSON.stringify(packet.amount) : packet.amount}</span>
                  </div>
                )}
                
                {packet.timestamp && (
                  <div className={styles.packetTimestamp}>
                    <span className={styles.detailLabel}>Time:</span>
                    <span className={styles.detailValue}>{formatTimestamp(typeof packet.timestamp === 'number' ? packet.timestamp : Date.now())}</span>
                  </div>
                )}
                
                {packet.signatures !== undefined && (
                  <div className={styles.packetSignatures}>
                    <span className={styles.detailLabel}>Signatures:</span>
                    <span className={styles.detailValue}>{typeof packet.signatures === 'number' ? packet.signatures : 0}</span>
                  </div>
                )}
              </div>
              
              {typeof packet.status === 'string' && packet.status.toLowerCase() === 'pending' && 
               typeof packet.signatures === 'number' && packet.signatures >= 3 && (
                <button className={styles.claimButton}>
                  Claim
                </button>
              )}
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={styles.bridgeContainer}>
      <h2>Verulink Bridge</h2>
      <p className={styles.bridgeDescription}>
        Securely transfer assets between Ethereum, Base, Arbitrum, and Aleo blockchains
      </p>
      
      {renderBridgeStatus()}
      
      <div className={styles.bridgeControls}>
        <div className={styles.formRow}>
          {renderChainSelector('From Chain', sourceChain, handleSourceChainChange, true)}
          
          <button 
            className={styles.swapButton}
            onClick={handleSwapChains}
            disabled={isLoading}
          >
            ↔
          </button>
          
          {renderChainSelector('To Chain', destinationChain, handleDestinationChainChange, false)}
        </div>
        
        <div className={styles.formGroup}>
          <label>Asset:</label>
          <select
            value={token}
            onChange={handleTokenChange}
            className={styles.select}
            disabled={isLoading}
          >
            {Object.keys(SUPPORTED_TOKENS).map((tokenKey) => (
              <option key={tokenKey} value={tokenKey}>
                {tokenKey}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className={styles.input}
            disabled={isLoading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>
            Destination Address:
          </label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder={destinationChain === CHAIN_IDS.ALEO ? 'aleo1...' : '0x...'}
            className={styles.input}
            disabled={isLoading}
          />
        </div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        <button
          onClick={handleBridgeTransfer}
          disabled={
            isLoading || 
            (sourceChain === CHAIN_IDS.ALEO && !connected)
          }
          className={styles.bridgeButton}
        >
          {isLoading ? 'Processing...' : 'Bridge Assets'}
        </button>
        
        {sourceChain === CHAIN_IDS.ALEO && !connected && (
          <div className={styles.walletWarning}>
            You need to connect your Aleo wallet to transfer assets from Aleo
          </div>
        )}
      </div>
      
      <div className={styles.transactionsSection}>
        <h3>Your Bridge Transactions</h3>
        {renderPackets()}
      </div>
    </div>
  );
} 