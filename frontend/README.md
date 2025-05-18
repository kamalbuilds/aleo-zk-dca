# ZK-DCA Frontend

A privacy-preserving Dollar-Cost Averaging (DCA) application built on Aleo's zero-knowledge blockchain technology.

## Overview

This frontend application allows users to interact with the `zk_dca_arcane_finance.aleo` contract deployed on the Aleo blockchain. It provides a user-friendly interface for creating and managing DCA positions in a privacy-preserving manner.

## Features

- **Account Management**: Create and manage Aleo accounts
- **DCA Position Creation**: Set up recurring, private investments with configurable parameters
- **Position Management**: View, execute, and cancel existing DCA positions
- **Privacy-Preserving**: All transactions are performed with zero-knowledge proofs
- **Real-time Monitoring**: Track blockchain status and execution schedules

## Technology Stack

- **Next.js**: React framework for building the user interface
- **TypeScript**: Type-safe JavaScript for robust development
- **Provable SDK**: Aleo's official SDK for interacting with the blockchain
- **Web Workers**: Background processing for compute-intensive operations

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Bun (recommended) or npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
   or
   ```
   npm install
   ```

### Running the Application

Development server:
```
bun run dev
```

Build for production:
```
bun run build
```

## Usage Guide

1. **Generate Account**: Create a new Aleo account to interact with the blockchain
2. **Create DCA Position**: Configure your automated investment strategy with:
   - Input Token (source token)
   - Output Token (target token)
   - Amount per execution
   - Execution interval
   - Number of executions
   - Minimum acceptable output amount
3. **Manage Positions**: View, execute manually, or cancel your positions
4. **Monitor Activity**: Check the logs for transaction status and history

## Project Structure

- `app/page.tsx`: Main application component
- `app/worker.ts`: Web worker for blockchain operations
- `app/page.module.css`: Styling for the application
- `public/`: Static assets including Aleo logo

## Integration with Aleo Blockchain

This frontend integrates with the `zk_dca_arcane_finance.aleo` smart contract which implements the core DCA functionality. The contract has these key functions:

- `create_position`: Set up a new DCA strategy
- `execute_dca`: Perform a DCA swap at the scheduled time
- `cancel_position`: Terminate an existing DCA position

## Security Considerations

- Private keys are managed client-side and never sent to any server
- All operations are performed with zero-knowledge proofs for privacy
- For demonstration purposes, this app displays the private key - in a production environment, this would never be shown to the user

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.