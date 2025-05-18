import { ZkDcaClient } from './zk_dca_client';

// Export the client for use in applications
export { ZkDcaClient };

// If this file is executed directly, show usage example
if (require.main === module) {
  console.log('ZK-DCA: Privacy-Preserving Dollar-Cost Averaging on Aleo');
  console.log('----------------------------------------------------------');
  console.log('To use the ZK-DCA client in your application:');
  console.log(`
  import { ZkDcaClient } from 'aleo-zk-dca';
  
  // Initialize the client with your private key
  const privateKey = 'your_private_key';
  const client = new ZkDcaClient(privateKey);
  
  // Create a new DCA position
  async function createPosition() {
    const txId = await client.createDcaPosition(
      1, // inputToken (e.g., USDC)
      100, // inputAmount (100 tokens per execution)
      2, // outputToken (e.g., ALEO)
      10, // interval (every 10 blocks)
      5, // executionsRemaining (5 executions)
      90 // minOutputAmount (accept at least 90 tokens)
    );
    console.log('Position created! Transaction ID:', txId);
  }
  
  createPosition().catch(console.error);
  `);
} 