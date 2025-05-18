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

# Build the program
echo "Building the program..."
leo build || { echo "Build failed"; exit 1; }

# Run tests

echo "Creating a DCA position..."
leo run create_position 1u64 100u64 2u64 10u32 5u32 90u64 || { echo "Test create_position failed"; exit 1; }

echo "Testing complete." 