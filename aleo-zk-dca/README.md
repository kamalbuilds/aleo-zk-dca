# ZK-DCA: Privacy-Preserving Dollar-Cost Averaging on Aleo

## Project Overview

ZK-DCA is a privacy-preserving Automated Dollar-Cost Averaging protocol built on Arcane Finance's DEX platform. It allows users to set up recurring, private investments into crypto assets while leveraging Arcane's liquidity pools, all with the privacy guarantees of Aleo's zero-knowledge technology.

## Key Features

- **Private Recurring Investments**: Schedule regular investments without revealing your strategy or amounts
- **Integrated with Arcane DEX**: Utilize Arcane's arcn_pool_v2_2_4.aleo program for liquidity and swaps
- **Flexible Parameters**: Configure investment frequency, amounts, and target assets privately
- **Withdrawal Privacy**: Extract funds without leaking your investment history
- **Composable Design**: Can be integrated with other Aleo programs for extended functionality

## Technical Implementation

### Core Architecture

ZK-DCA consists of several interconnected components:

1. **DCA Core Contract**: Manages DCA positions and schedules
2. **Arcane DEX Integration**: Interfaces with Arcane's pooling functions
3. **Schedule Execution Module**: Handles the timing and triggering of scheduled swaps
4. **Privacy Layer**: Ensures all operations maintain zero-knowledge properties

### DCA Records and State

The system uses the following key data structures:

- `DCAPosition`: Record representing a user's DCA strategy
- `Execution`: Record of each executed swap in a DCA schedule
- `Mappings`: On-chain state for tracking eligible execution times

### Workflow

1. **Position Creation**: Users create a DCA position specifying token pair, amount, frequency
2. **Schedule Management**: The protocol manages pending executions based on timestamps
3. **Execution**: At the scheduled time, swaps are executed through Arcane's DEX
4. **Withdrawal**: Users can withdraw acquired assets privately

## Development Roadmap

### Phase 1: Core Contract Development
- Implement DCA position records and state management
- Build integration with arcn_pool_v2_2_4.aleo program
- Develop basic scheduling functionality

### Phase 2: Advanced Features
- Add multi-asset DCA strategies
- Implement variable amount DCA
- Develop event-based triggers (not just time-based)

### Phase 3: User Interface & Testing
- Build interface for creating and managing DCA positions
- Comprehensive testing against Arcane's testnet
- Security audits and optimizations

## Why This Matters

ZK-DCA brings several innovations to the Aleo ecosystem:

1. **First Private DCA Protocol**: Enables investment strategies that remain completely private
2. **Leverages Arcane's DEX**: Demonstrates composability with existing Aleo infrastructure
3. **User-Friendly DeFi**: Makes privacy-preserving DeFi accessible to average users
4. **Novel Privacy-Preserving Mechanics**: Introduces new patterns for recurring financial interactions

## Usage and Integration

The protocol will be usable via:

- Direct contract interaction
- Web interface
- SDK for developers
- Command-line tools for advanced users

## Security Considerations

- All positions are stored as private records
- Execution timing is the only public information
- Amounts, assets, and ownership remain private
- Arcane DEX's privacy features are preserved and extended 