# Getting Contract Address After Deployment

## Quick Method

After running `npm run deploy:anvil`, the contract address is printed in the output:

```bash
cd erc-8004-contracts
ANVIL_RPC_URL=http://localhost:53389 npm run deploy:anvil
```

Look for this line in the output:
```
📋 Summary:
   Contract Address: 0x51a1ceb83f83b83f1985a81c295d1ff28afef186e02
```

## Extract Address Automatically

Use the helper script:

```bash
cd erc-8004-contracts
./get-contract-address.sh
```

This will:
1. Find your Anvil RPC URL automatically
2. Deploy the contract
3. Extract and display the contract address
4. Show you the export commands

## Manual Extraction

If you already deployed, extract from the output:

```bash
# From deployment output
npm run deploy:anvil 2>&1 | grep "Contract Address:" | awk '{print $3}'
```

## Verify Contract Address

After getting the address, verify it has code:

```bash
CONTRACT_ADDRESS=0x51a1ceb83b83f1985a81c295d1ff28afef186e02
RPC_URL=http://localhost:53389

cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL
# Should show bytecode (not "0x")
```

## Use in Agent

Once you have the address, set it in your environment:

```bash
export IDENTITY_REGISTRY_ADDRESS=0x51a1ceb83b83f1985a81c295d1ff28afef186e02
export CHAIN_RPC_URL=http://localhost:53389
export AGENT_PRIV_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export AUTO_REGISTER=true
```

Or add to your `.env` file:
```bash
IDENTITY_REGISTRY_ADDRESS=0x51a1ceb83b83f1985a81c295d1ff28afef186e02
CHAIN_RPC_URL=http://localhost:53389
```

## Note

- Each time you restart Anvil, you'll need to redeploy the contract
- The contract address will be different each deployment
- Save the address if you want to reuse it (but Anvil state resets on restart)

