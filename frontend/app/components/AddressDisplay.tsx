'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPrimaryName, getAvatar } from '../utils/ans';
import styles from '../page.module.css';

interface AddressDisplayProps {
  address: string;
  showAvatar?: boolean;
  className?: string;
}

export default function AddressDisplay({ 
  address, 
  showAvatar = false,
  className = ''
}: AddressDisplayProps) {
  const [ansName, setAnsName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnsData() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Fetch ANS name for the address
        const name = await getPrimaryName(address);
        setAnsName(name);
        
        // If showAvatar is true and we found an ANS name, fetch the avatar
        if (showAvatar && name) {
          const avatarUrl = await getAvatar(name);
          setAvatar(avatarUrl);
        }
      } catch (error) {
        console.error('Error fetching ANS data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnsData();
  }, [address, showAvatar]);

  // Format address for display when no ANS name is available
  const formattedAddress = address && address.length > 10
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : address;

  return (
    <div className={`${styles.addressDisplay} ${className}`}>
      {isLoading ? (
        <span className={styles.loading}>Loading...</span>
      ) : (
        <>
          {showAvatar && avatar && (
            <div className={styles.avatarContainer}>
              <Image 
                src={avatar} 
                alt={ansName || 'Avatar'} 
                width={24} 
                height={24} 
                className={styles.avatar}
              />
            </div>
          )}
          <span className={styles.addressText}>
            {ansName ? (
              <span className={styles.ansName}>{ansName}</span>
            ) : (
              <span className={styles.addressValue}>{formattedAddress}</span>
            )}
          </span>
        </>
      )}
    </div>
  );
} 