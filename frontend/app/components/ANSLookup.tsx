'use client';

import { useState } from 'react';
import { getAddressFromName, getPrimaryName } from '../utils/ans';
import styles from '../page.module.css';

export default function ANSLookup() {
  const [query, setQuery] = useState('');
  const [lookupType, setLookupType] = useState<'nameToAddress' | 'addressToName'>('nameToAddress');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup() {
    if (!query.trim()) {
      setError('Please enter a value to look up');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (lookupType === 'nameToAddress') {
        const address = await getAddressFromName(query);
        setResult(address || 'No address found for this name');
      } else {
        const name = await getPrimaryName(query);
        setResult(name || 'No name found for this address');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('An error occurred during lookup');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.ansLookupContainer}>
      <h3>ANS Lookup</h3>
      
      <div className={styles.lookupControls}>
        <div className={styles.lookupTypeToggle}>
          <button
            className={`${styles.lookupTypeButton} ${lookupType === 'nameToAddress' ? styles.activeButton : ''}`}
            onClick={() => setLookupType('nameToAddress')}
          >
            Name → Address
          </button>
          <button
            className={`${styles.lookupTypeButton} ${lookupType === 'addressToName' ? styles.activeButton : ''}`}
            onClick={() => setLookupType('addressToName')}
          >
            Address → Name
          </button>
        </div>
        
        <div className={styles.lookupInputGroup}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lookupType === 'nameToAddress' ? 'Enter ANS name (e.g., test.ans)' : 'Enter Aleo address'}
            className={styles.input}
          />
          <button 
            onClick={handleLookup} 
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Looking up...' : 'Lookup'}
          </button>
        </div>
        
        {error && <div className={styles.lookupError}>{error}</div>}
        
        {result && (
          <div className={styles.lookupResult}>
            <h4>Result:</h4>
            <div className={styles.resultValue}>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
} 