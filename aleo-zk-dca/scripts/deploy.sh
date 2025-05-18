#!/bin/bash

# Deployment script for the ZK-DCA project

echo "=== ZK-DCA Deployment ==="
echo "Building the program..."

# Check if Leo is installed
if ! command -v leo &> /dev/null
then
    echo "Error: Leo is not installed. Please install Leo first."
    echo "Visit: https://developer.aleo.org/leo/installation"
    exit 1
fi

# Navigate to project root (assuming script is in scripts/ directory)
cd "$(dirname "$0")/.."

# Build the program
leo build || { echo "Build failed"; exit 1; }

# Check if program files exist
if [ ! -f "./build/main.aleo" ]; then
    echo "Error: Program build not found."
    exit 1
fi

# Get the network parameter (default to testnet)
NETWORK=${1:-testnet}

echo "Deploying to $NETWORK..."

# Load private key from environment or fallback to program.json
PRIVATE_KEY=${ALEO_PRIVATE_KEY:-$(grep -o '"private_key": "[^"]*' program.json | cut -d '"' -f 4)}

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: No private key found. Set ALEO_PRIVATE_KEY environment variable or check program.json."
    exit 1
fi

# Deploy program to network
if [ "$NETWORK" = "testnet" ]; then
    echo "Deploying to Aleo testnet..."
    snarkos developer deploy zk_dca.aleo --private-key "$PRIVATE_KEY" --query "https://testnet.aleo.network/v1" --path "./build/" --broadcast "https://testnet.aleo.network/v1/transaction/broadcast" --fee 50000000
elif [ "$NETWORK" = "mainnet" ]; then
    echo "Deploying to Aleo mainnet..."
    snarkos developer deploy zk_dca.aleo --private-key "$PRIVATE_KEY" --query "https://mainnet.aleo.network/v1" --path "./build/" --broadcast "https://mainnet.aleo.network/v1/transaction/broadcast" --fee 50000000
else
    echo "Error: Unsupported network. Use 'testnet' or 'mainnet'."
    exit 1
fi

echo "Deployment completed." 