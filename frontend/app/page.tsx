"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface UserAccount {
  privateKey: string;
  viewKey: string;
  address: string;
}

interface DCAPosition {
  id: string;
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
  // User account state
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);
  
  // Form state
  const [inputToken, setInputToken] = useState<number>(1); // Default to ALEO
  const [outputToken, setOutputToken] = useState<number>(2); // Default to USDC
  const [inputAmount, setInputAmount] = useState<string>("100");
  const [interval, setInterval] = useState<string>("10");
  const [executionsRemaining, setExecutionsRemaining] = useState<string>("5");
  const [minOutputAmount, setMinOutputAmount] = useState<string>("90");
  
  // UI state
  const [isCreatingPosition, setIsCreatingPosition] = useState<boolean>(false);
  const [positions, setPositions] = useState<DCAPosition[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'positions'>('create');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Setup worker
  const workerRef = useRef<Worker>();

  // Helper to add log entries
  const addLog = useCallback((message: string) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toISOString()}] ${message}`]);
  }, []);

  // Setup worker communication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker(new URL("worker.ts", import.meta.url));
      workerRef.current.onmessage = (event) => {
        const { type, result } = event.data;
        
        // Add to logs
        addLog(`Received ${type} response`);
        
        if (type === "createAccount") {
          setAccount(result);
          addLog(`Created account: ${result.address.slice(0, 10)}...`);
        } 
        else if (type === "getBlockHeight") {
          if (result.success) {
            setCurrentBlockHeight(result.blockHeight);
            addLog(`Current block height: ${result.blockHeight}`);
          } else {
            addLog(`Error getting block height: ${result.error}`);
          }
        }
        else if (type === "createDCAPosition") {
          setIsCreatingPosition(false);
          if (result.success) {
            addLog(`Created DCA position successfully!`);
            // In a real app, you would add the new position to the list
            const newPosition: DCAPosition = {
              id: Math.random().toString(36).substring(2, 9), // Mock ID
              inputTokenId: Number(inputToken),
              inputAmount: Number(inputAmount),
              outputTokenId: Number(outputToken),
              interval: Number(interval),
              executionsRemaining: Number(executionsRemaining),
              minOutputAmount: Number(minOutputAmount),
              nextExecution: (currentBlockHeight || 0) + Number(interval)
            };
            setPositions([...positions, newPosition]);
          } else {
            addLog(`Error creating position: ${result.error}`);
          }
        }
        else if (type === "executeDCA") {
          if (result.success) {
            addLog(`Executed DCA position successfully!`);
            // Update position in a real app
          } else {
            addLog(`Error executing position: ${result.error}`);
          }
        }
        else if (type === "cancelPosition") {
          if (result.success) {
            addLog(`Cancelled position successfully!`);
            // Remove position in a real app
          } else {
            addLog(`Error cancelling position: ${result.error}`);
          }
        }
      };
      
      return () => {
        workerRef.current?.terminate();
      };
    }
  }, [inputToken, outputToken, inputAmount, interval, executionsRemaining, minOutputAmount, positions, currentBlockHeight, addLog]);

  // Poll for current block height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pollBlockHeight = () => {
        workerRef.current?.postMessage({ type: "getBlockHeight" });
      };
      
      // Poll immediately
      pollBlockHeight();
      
      // Then poll every 30 seconds
      const intervalId = setInterval(pollBlockHeight, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, []);

  // Generate an Aleo account
  const generateAccount = async () => {
    addLog("Generating new Aleo account...");
    workerRef.current?.postMessage({ type: "createAccount" });
  };

  // Create a new DCA position
  const createDCAPosition = async () => {
    if (!account) {
      addLog("Please create an account first");
      return;
    }

    if (!currentBlockHeight) {
      addLog("Waiting for block height...");
      return;
    }
    
    setIsCreatingPosition(true);
    addLog("Creating DCA position...");
    
    workerRef.current?.postMessage({ 
      type: "createDCAPosition", 
      params: {
        privateKey: account.privateKey,
        inputTokenId: Number(inputToken),
        inputAmount: Number(inputAmount),
        outputTokenId: Number(outputToken),
        interval: Number(interval),
        executionsRemaining: Number(executionsRemaining),
        minOutputAmount: Number(minOutputAmount),
        blockHeight: currentBlockHeight
      }
    });
  };

  // Format a token name with symbol
  const formatToken = (tokenId: number) => {
    const token = AVAILABLE_TOKENS.find(t => t.id === tokenId);
    return token ? `${token.name} (${token.symbol})` : `Token #${tokenId}`;
  };

  return (
    <main className={styles.main}>
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

      {/* Account Section */}
      <div className={styles.card}>
        <h2>Your Aleo Account</h2>
        {!account ? (
          <button onClick={generateAccount} className={styles.button}>
            Generate Account
          </button>
        ) : (
          <div className={styles.accountInfo}>
            <div className={styles.accountField}>
              <strong>Address:</strong> 
              <span className={styles.ellipsis}>{account.address}</span>
            </div>
            <div className={styles.accountField}>
              <strong>View Key:</strong> 
              <span className={styles.ellipsis}>{account.viewKey}</span>
            </div>
            <div className={styles.accountField}>
              <strong>Private Key:</strong> 
              <span className={styles.ellipsis}>{account.privateKey}</span>
            </div>
            <div className={styles.warning}>
              ⚠️ In a real app, NEVER display the private key! This is for demonstration only.
            </div>
          </div>
        )}
      </div>
      
      {/* Main DCA Interface */}
      <div className={styles.mainContent}>
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
        </div>
        
        {/* Create Position Form */}
        {activeTab === 'create' && (
          <div className={styles.tabContent}>
            <h2>Create DCA Position</h2>
            <p>Current Block Height: {currentBlockHeight || 'Loading...'}</p>
            
            <div className={styles.formGroup}>
              <label>Input Token:</label>
              <select 
                value={inputToken} 
                onChange={(e) => setInputToken(Number(e.target.value))}
                className={styles.select}
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
              />
            </div>
            
            <button 
              onClick={createDCAPosition} 
              disabled={!account || isCreatingPosition}
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
                      <button className={styles.actionButton}>
                        Execute Now
                      </button>
                      <button className={styles.actionButton}>
                        Cancel Position
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    </main>
  );
}
