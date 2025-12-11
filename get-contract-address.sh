#!/bin/bash
# Get the deployed IdentityRegistry contract address from Anvil

set -e

# Get Anvil RPC URL from environment or find it
if [ -z "$ANVIL_RPC_URL" ]; then
    # Try to find Anvil port
    ANVIL_PORT=$(lsof -i -P -n | grep LISTEN | grep anvil | awk '{print $9}' | sed 's/.*://' | head -1)
    if [ -z "$ANVIL_PORT" ]; then
        echo "❌ Anvil not running. Start it first with: make test-env"
        exit 1
    fi
    ANVIL_RPC_URL="http://localhost:$ANVIL_PORT"
fi

echo "🔍 Deploying contract to get address..."
echo "RPC URL: $ANVIL_RPC_URL"
echo ""

# Deploy and extract contract address
CONTRACT_ADDRESS=$(ANVIL_RPC_URL=$ANVIL_RPC_URL npm run deploy:anvil 2>&1 | \
    grep "Contract Address:" | \
    awk '{print $3}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Failed to deploy or extract contract address"
    exit 1
fi

echo ""
echo "✅ Contract deployed!"
echo ""
echo "📋 Export these environment variables:"
echo "   export IDENTITY_REGISTRY_ADDRESS=$CONTRACT_ADDRESS"
echo "   export CHAIN_RPC_URL=$ANVIL_RPC_URL"
echo ""
echo "💡 Or add to your .env file:"
echo "   IDENTITY_REGISTRY_ADDRESS=$CONTRACT_ADDRESS"
echo "   CHAIN_RPC_URL=$ANVIL_RPC_URL"
echo ""
echo "🔍 Verify contract code:"
cast code $CONTRACT_ADDRESS --rpc-url $ANVIL_RPC_URL | head -c 50
echo "..."
echo ""

