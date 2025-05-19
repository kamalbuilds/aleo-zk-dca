"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import WalletButton from "./components/WalletButton";
import { createDCAPositionTransaction, cancelPositionTransaction, executeDCATransaction, DCA_PROGRAM_ID } from "./utils/transactions";
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";
import AddressDisplay from "./components/AddressDisplay";
import ANSLookup from "./components/ANSLookup";

interface DCAPosition {
  id: string;
  positionRecord: string; // Full record string for transactions
  inputTokenId: number;
  inputAmount: number;
  outputTokenId: number;
  interval: number;
  executionsRemaining: number;
  minOutputAmount: number;
  nextExecution: number;
}

interface TokenPair {
  id: number;
  name: string;
  symbol: string;
}

// Mock token pairs for interface
const AVAILABLE_TOKENS: TokenPair[] = [
  { id: 1, name: "Aleo Credits", symbol: "ALEO" },
  { id: 2, name: "USDC", symbol: "USDC" },
  { id: 3, name: "Wrapped Ethereum", symbol: "WETH" },
  { id: 4, name: "Wrapped Bitcoin", symbol: "WBTC" }
];

export default function Home() {
  // Wallet state
  const { 
    publicKey, 
    requestTransaction, 
    requestRecordPlaintexts,
    connected,
    connecting,
    disconnecting
  } = useWallet();
  
  // Form state
  const [inputToken, setInputToken] = useState<number>(1); // Default to ALEO
  const [outputToken, setOutputToken] = useState<number>(2); // Default to USDC
  const [inputAmount, setInputAmount] = useState<string>("100");
  const [interval, setInterval] = useState<string>("10");
  const [executionsRemaining, setExecutionsRemaining] = useState<string>("5");
  const [minOutputAmount, setMinOutputAmount] = useState<string>("90");
  
  // UI state
  const [isCreatingPosition, setIsCreatingPosition] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [positions, setPositions] = useState<DCAPosition[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'positions' | 'tools'>('create');
  const [logs, setLogs] = useState<string[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number>(0);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  
  // Helper to add log entries
  const addLog = useCallback((message: string) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toISOString()}] ${message}`]);
  }, []);

  // Fetch records when connected
  useEffect(() => {
    if (connected && !connecting && !disconnecting) {
      addLog(`Wallet connected: ${publicKey}`);
      fetchRecords();
      fetchCurrentBlockHeight();
    }
  }, [connected, connecting, disconnecting, publicKey]);

  // Fetch DCA positions from wallet records
  const fetchRecords = async () => {
    if (!connected || !requestRecordPlaintexts) {
      return;
    }

    try {
      addLog("Fetching DCA position records...");
      const records = await requestRecordPlaintexts(DCA_PROGRAM_ID);
      
      // Filter for DCAPosition records
      const positionRecords = records.filter(record => 
        record.plaintext.includes('DCAPosition') && 
        !record.spent
      );
      
      if (positionRecords.length > 0) {
        addLog(`Found ${positionRecords.length} active DCA positions`);
        
        // Parse records and update state
        const parsedPositions = positionRecords.map((record, index) => {
          // In a real implementation, you would parse the record structure
          // This is a simplified example that extracts values from the record plaintext
          
          // Mock parsing (in real implementation, parse the actual record)
          const plaintext = record.plaintext;
          const extractValue = (key: string) => {
            const regex = new RegExp(`${key}:\\s*(\\d+)\\w*\\.`);
            const match = plaintext.match(regex);
            return match ? parseInt(match[1]) : 0;
          };
          
          const positionId = `position-${index}-${Date.now()}`;
          const inputTokenId = extractValue("input_token_id");
          const inputAmount = extractValue("input_amount");
          const outputTokenId = extractValue("output_token_id");
          const interval = extractValue("interval");
          const nextExecution = extractValue("next_execution");
          const executionsRemaining = extractValue("executions_remaining");
          const minOutputAmount = extractValue("min_output_amount");
          
          return {
            id: positionId,
            positionRecord: record.plaintext,
            inputTokenId,
            inputAmount, 
            outputTokenId,
            interval,
            executionsRemaining,
            minOutputAmount,
            nextExecution
          };
        });
        
        setPositions(parsedPositions);
      } else {
        addLog("No active DCA positions found");
      }
    } catch (error: any) {
      addLog(`Error fetching records: ${error.message}`);
    }
  };

  // Fetch current block height (in a real implementation)
  const fetchCurrentBlockHeight = async () => {
    try {
      // This is a mock - in a real implementation you would:
      // 1. Use an Aleo API/SDK to get the current block height
      // 2. Or have a backend service provide this information
      
      // Mock block height (increments on each fetch for demo)
      setCurrentBlockHeight(prev => prev + 10);
      addLog(`Current block height: ${currentBlockHeight + 10}`);
    } catch (error: any) {
      addLog(`Error fetching block height: ${error.message}`);
    }
  };

  // Create a new DCA position
  const createDCAPosition = async () => {
    if (!publicKey) {
      addLog("Please connect your wallet first");
      return;
    }

    if (!requestTransaction) {
      addLog("Wallet does not support transactions");
      return;
    }
    
    setIsCreatingPosition(true);
    addLog("Creating DCA position...");
    
    try {
      setTransactionInProgress(true);
      
      const transaction = createDCAPositionTransaction(
        publicKey,
        Number(inputToken),
        Number(inputAmount),
        Number(outputToken),
        Number(interval),
        Number(executionsRemaining),
        Number(minOutputAmount),
        currentBlockHeight
      );
      
      const txId = await requestTransaction(transaction);
      
      addLog(`DCA position created! Transaction ID: ${txId}`);
      
      // In a real application, you would wait for the transaction to be confirmed
      // and then fetch the updated records
      
      // For demo purposes, we'll create a mock position
      const newPosition: DCAPosition = {
        id: `position-${Date.now()}`,
        positionRecord: "mock_position_record", // This would be the actual record in a real implementation
        inputTokenId: Number(inputToken),
        inputAmount: Number(inputAmount),
        outputTokenId: Number(outputToken),
        interval: Number(interval),
        executionsRemaining: Number(executionsRemaining),
        minOutputAmount: Number(minOutputAmount),
        nextExecution: currentBlockHeight + Number(interval)
      };
      
      setPositions([...positions, newPosition]);
      
      // Switch to positions tab
      setActiveTab('positions');
    } catch (error: any) {
      addLog(`Error creating position: ${error.message}`);
    } finally {
      setIsCreatingPosition(false);
      setTransactionInProgress(false);
    }
  };

  // Execute a DCA position
  const executeDCASwap = async (position: DCAPosition) => {
    if (!publicKey) throw new WalletNotConnectedError();
    if (!requestTransaction) {
      addLog("Wallet does not support transactions");
      return;
    }
    
    setIsExecuting(true);
    addLog(`Executing DCA position ${position.id}...`);
    
    try {
      setTransactionInProgress(true);
      
      // In a real implementation, you would have the token record to use
      // For demo purposes, we're using a placeholder
      const mockTokenRecord = "mock_token_record";
      
      const transaction = executeDCATransaction(
        publicKey,
        position.positionRecord,
        mockTokenRecord,
        currentBlockHeight
      );
      
      const txId = await requestTransaction(transaction);
      
      addLog(`DCA swap executed! Transaction ID: ${txId}`);
      
      // Update position in the UI
      const updatedPositions = positions.map(p => {
        if (p.id === position.id) {
          return {
            ...p,
            executionsRemaining: p.executionsRemaining > 0 ? p.executionsRemaining - 1 : 0,
            nextExecution: currentBlockHeight + p.interval
          };
        }
        return p;
      });
      
      setPositions(updatedPositions);
    } catch (error: any) {
      addLog(`Error executing swap: ${error.message}`);
    } finally {
      setIsExecuting(false);
      setTransactionInProgress(false);
    }
  };

  // Cancel a DCA position
  const cancelPosition = async (position: DCAPosition) => {
    if (!publicKey) throw new WalletNotConnectedError();
    if (!requestTransaction) {
      addLog("Wallet does not support transactions");
      return;
    }
    
    setIsCanceling(true);
    addLog(`Cancelling DCA position ${position.id}...`);
    
    try {
      setTransactionInProgress(true);
      
      const transaction = cancelPositionTransaction(
        publicKey,
        position.positionRecord
      );
      
      const txId = await requestTransaction(transaction);
      
      addLog(`DCA position cancelled! Transaction ID: ${txId}`);
      
      // Remove position from the UI
      const updatedPositions = positions.filter(p => p.id !== position.id);
      setPositions(updatedPositions);
    } catch (error: any) {
      addLog(`Error cancelling position: ${error.message}`);
    } finally {
      setIsCanceling(false);
      setTransactionInProgress(false);
    }
  };

  // Format a token name with symbol
  const formatToken = (tokenId: number) => {
    const token = AVAILABLE_TOKENS.find(t => t.id === tokenId);
    return token ? `${token.name} (${token.symbol})` : `Token #${tokenId}`;
  };

  return (
    <main className={styles.main}>
      <div className={styles.walletButtonContainer}>
        <WalletButton />
      </div>
      
      <div className={styles.description}>
        <h1 className={styles.title}>ZK-DCA: Privacy-Preserving Dollar-Cost Averaging</h1>
        <p className={styles.subtitle}>
          Setup recurring, private investments into crypto assets on Aleo
        </p>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/aleo.svg"
          alt="Aleo Logo"
          width={150}
          height={37}
          priority
        />
      </div>
      
      {/* Main DCA Interface */}
      <div className={styles.mainContent}>
        {!connected ? (
          <div className={styles.connectWalletPrompt}>
            <h2>Connect Your Wallet</h2>
            <p>Please connect an Aleo wallet to get started</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'create' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Create Position
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'positions' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('positions')}
              >
                Your Positions
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'tools' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                Tools
              </button>
            </div>
            
            {/* Create Position Form */}
            {activeTab === 'create' && (
              <div className={styles.tabContent}>
                <h2>Create DCA Position</h2>
                <p>Current Block Height: {currentBlockHeight}</p>
                
                <div className={styles.formGroup}>
                  <label>Input Token:</label>
                  <select 
                    value={inputToken} 
                    onChange={(e) => setInputToken(Number(e.target.value))}
                    className={styles.select}
                    disabled={transactionInProgress}
                  >
                    {AVAILABLE_TOKENS.map(token => (
                      <option key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Output Token:</label>
                  <select 
                    value={outputToken} 
                    onChange={(e) => setOutputToken(Number(e.target.value))}
                    className={styles.select}
                    disabled={transactionInProgress}
                  >
                    {AVAILABLE_TOKENS.map(token => (
                      <option key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Input Amount:</label>
                  <input 
                    type="number" 
                    value={inputAmount} 
                    onChange={(e) => setInputAmount(e.target.value)}
                    className={styles.input}
                    min="1"
                    disabled={transactionInProgress}
                  />
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
                
                <button 
                  onClick={createDCAPosition} 
                  disabled={!connected || isCreatingPosition || transactionInProgress}
                  className={styles.button}
                >
                  {isCreatingPosition 
                    ? 'Creating Position...' 
                    : 'Create DCA Position'
                  }
                </button>
              </div>
            )}
            
            {/* Positions List */}
            {activeTab === 'positions' && (
              <div className={styles.tabContent}>
                <h2>Your DCA Positions</h2>
                <div className={styles.positionActions}>
                  <button onClick={fetchRecords} className={styles.refreshButton} disabled={transactionInProgress}>
                    Refresh Positions
                  </button>
                </div>
                
                {positions.length === 0 ? (
                  <p>No positions yet. Create your first DCA position!</p>
                ) : (
                  <div className={styles.positionsList}>
                    {positions.map(position => (
                      <div key={position.id} className={styles.positionCard}>
                        <div className={styles.positionHeader}>
                          <strong>Position ID: </strong> {position.id}
                        </div>
                        <div className={styles.positionDetails}>
                          <div>
                            <strong>Owner: </strong>
                            {publicKey && <AddressDisplay address={publicKey} />}
                          </div>
                          <div>
                            <strong>Swapping: </strong>
                            {position.inputAmount} {formatToken(position.inputTokenId)} → {formatToken(position.outputTokenId)}
                          </div>
                          <div>
                            <strong>Interval: </strong>
                            Every {position.interval} blocks
                          </div>
                          <div>
                            <strong>Remaining: </strong>
                            {position.executionsRemaining} executions
                          </div>
                          <div>
                            <strong>Next Execution: </strong>
                            Block {position.nextExecution}
                          </div>
                        </div>
                        <div className={styles.positionActions}>
                          <button 
                            className={styles.actionButton}
                            onClick={() => executeDCASwap(position)}
                            disabled={isExecuting || isCanceling || transactionInProgress}
                          >
                            {isExecuting ? 'Executing...' : 'Execute Now'}
                          </button>
                          <button 
                            className={styles.actionButton}
                            onClick={() => cancelPosition(position)}
                            disabled={isExecuting || isCanceling || transactionInProgress}
                          >
                            {isCanceling ? 'Canceling...' : 'Cancel Position'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tools Tab Content */}
            {activeTab === 'tools' && (
              <div className={styles.tabContent}>
                <h2>Aleo Tools</h2>
                <p>Explore and interact with Aleo services</p>
                
                {/* ANS Lookup Component */}
                <ANSLookup />
                
                {/* Additional tools can be added here */}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Logs Section */}
      <div className={styles.logsSection}>
        <h3>Activity Log</h3>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Account Information */}
      {connected && publicKey && (
        <div className={styles.card}>
          <h3>Account Information</h3>
          <div className={styles.accountInfo}>
            <div className={styles.accountField}>
              <label>Address:</label>
              <AddressDisplay address={publicKey} showAvatar={true} />
            </div>
            
            {/* Keep other account information fields */}
          </div>
        </div>
      )}
    </main>
  );
}
