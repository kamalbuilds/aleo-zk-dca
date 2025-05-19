#!/bin/bash

# Testing script for the ZK-DCA project

echo "=== ZK-DCA Testing ==="

# Check if Leo is installed
if ! command -v leo &> /dev/null
then
    echo "Error: Leo is not installed. Please install Leo first."
    echo "Visit: https://developer.aleo.org/leo/installation"
    exit 1
fi

# Navigate to project root (assuming script is in scripts/ directory)
cd "$(dirname "$0")/.."

# Ensure environment variables are set
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "NETWORK=testnet" > .env
    echo "PRIVATE_KEY=APrivateKey1zkpGKaJY47BXb6knSqmT3JZnBUEGBDFAWz2nMVSsjwYpJmm" >> .env
    echo "ENDPOINT=https://api.explorer.aleo.org/v1/testnet" >> .env
fi

# Build the program
echo "Building the program..."
leo build || { echo "Build failed"; exit 1; }

# Run tests
echo "Creating a DCA position..."
# Use the current block height as 1000 for testing purposes
leo run create_position 1u64 100u64 2u64 10u32 5u32 90u64 1000u32 || { echo "Test create_position failed"; exit 1; }

echo "Creating a token record for testing..."
# Create a test token record in a variable
TOKEN_RECORD="{
  owner: aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,
  token_id: 1u64.private,
  amount: 500u64.private,
  _nonce: 0group.public
}"

echo "Executing a DCA swap..."
# We'll use the position output from the previous command
# For a real test, you would copy the actual output from the create_position command
POSITION_RECORD="{
  owner: aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,
  position_id: 4487510576131640784950922987461291312238286062158418867996030038776754581879field.private,
  input_token_id: 1u64.private,
  input_amount: 100u64.private,
  output_token_id: 2u64.private,
  interval: 10u32.private,
  next_execution: 1010u32.private,
  executions_remaining: 5u32.private,
  min_output_amount: 90u64.private,
  _nonce: 8372022249924354266527083223749287818234626372041025715784634105618924314384group.public
}"

# Current block height is 1020, which is after the next_execution (1010)
leo run execute_dca "$POSITION_RECORD" "$TOKEN_RECORD" 1020u32 || { echo "Test execute_dca failed"; exit 1; }

echo "Cancelling a DCA position..."
# We'll use the updated position record from the execute_dca output
UPDATED_POSITION="{
  owner: aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,
  position_id: 4487510576131640784950922987461291312238286062158418867996030038776754581879field.private,
  input_token_id: 1u64.private,
  input_amount: 100u64.private,
  output_token_id: 2u64.private,
  interval: 10u32.private,
  next_execution: 1030u32.private,
  executions_remaining: 4u32.private,
  min_output_amount: 90u64.private,
  _nonce: 6023749505689150981658604691148303091174516114336277988104458324522013797887group.public
}"

leo run cancel_position "$UPDATED_POSITION" || { echo "Test cancel_position failed"; exit 1; }

echo "Testing complete." 