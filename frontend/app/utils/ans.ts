/**
 * Aleo Name Service (ANS) Utility Functions
 * This file contains utility functions for interacting with the Aleo Name Service API.
 */

const ANS_API_BASE_URL = 'https://testnet-api.aleonames.id';

/**
 * Fetch the primary name of an address
 * @param address Aleo address
 * @returns The primary ANS name or null if not found
 */
export async function getPrimaryName(address: string): Promise<string | null> {
  try {
    const response = await fetch(`${ANS_API_BASE_URL}/primary_name/${address}`);
    console.log(response,"res for primary name");
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No primary name set
      }
      throw new Error(`ANS API error: ${response.status}`);
    }
    const { name } = await response.json();
    return name;
  } catch (error) {
    console.error('Error fetching primary name:', error);
    return null;
  }
}

/**
 * Convert ANS name to address
 * @param name ANS name (e.g., "test.ans")
 * @returns The Aleo address or null if not found
 */
export async function getAddressFromName(name: string): Promise<string | null> {
  try {
    const response = await fetch(`${ANS_API_BASE_URL}/address/${name}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Name not registered
      }
      throw new Error(`ANS API error: ${response.status}`);
    }
    const { address } = await response.json();
    return address;
  } catch (error) {
    console.error('Error fetching address from name:', error);
    return null;
  }
}

/**
 * Convert ANS name_hash to human-readable name
 * @param nameHash ANS name_hash
 * @returns Object containing name and balance, or null if not found
 */
export async function getNameFromHash(nameHash: string): Promise<{ name: string, balance: string } | null> {
  try {
    const response = await fetch(`${ANS_API_BASE_URL}/hash_to_name/${nameHash}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Hash not registered
      }
      throw new Error(`ANS API error: ${response.status}`);
    }
    const { name, balance } = await response.json();
    return { name, balance };
  } catch (error) {
    console.error('Error fetching name from hash:', error);
    return null;
  }
}

/**
 * Query resolver content for a given name and category
 * @param name ANS name
 * @param category Resolver category (e.g., "btc", "eth", "avatar")
 * @returns The resolver content or null if not found
 */
export async function getResolverContent(name: string, category: string): Promise<string | null> {
  try {
    const response = await fetch(`${ANS_API_BASE_URL}/resolver?name=${name}&category=${category}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Resolver not configured
      }
      throw new Error(`ANS API error: ${response.status}`);
    }
    const { content } = await response.json();
    return content;
  } catch (error) {
    console.error('Error fetching resolver content:', error);
    return null;
  }
}

/**
 * Get avatar URL for an ANS name
 * @param name ANS name
 * @returns The avatar URL or null if not found
 */
export async function getAvatar(name: string): Promise<string | null> {
  return getResolverContent(name, 'avatar');
}

/**
 * Format an address for display, using ANS name if available
 * @param address Aleo address
 * @returns Formatted address string (ANS name or truncated address)
 */
export async function formatAddressWithANS(address: string): Promise<string> {
  const ansName = await getPrimaryName(address);
  if (ansName) {
    return ansName;
  }
  
  // Truncate the address if no ANS name is available
  return address.length > 10 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : address;
} 