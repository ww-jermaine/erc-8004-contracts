import hre from "hardhat";
import { formatEther, toHex } from "viem";

/**
 * Deploy IdentityRegistry to Anvil for local testing
 * 
 * Usage:
 *   ANVIL_RPC_URL=http://localhost:51983 npx hardhat run scripts/deploy-anvil.ts --network anvil
 */
async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();
  
  const network = await publicClient.getChainId();
  console.log(`Deploying to network: anvil (chainId: ${network})`);

  const deployerAddress = deployer.account.address;
  console.log(`Deploying from: ${deployerAddress}`);

  // Check balance
  const balance = await publicClient.getBalance({
    address: deployerAddress,
  });
  console.log(`Balance: ${formatEther(balance)} ETH`);

  // Deploy IdentityRegistry
  console.log("\nDeploying IdentityRegistry...");
  const identityRegistry = await viem.deployContract("IdentityRegistry");
  const identityRegistryAddress = identityRegistry.address;
  console.log(`✅ IdentityRegistry deployed to: ${identityRegistryAddress}`);

  // Verify deployment
  const code = await publicClient.getBytecode({
    address: identityRegistryAddress as `0x${string}`,
  });
  if (!code || code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  console.log(`✅ Contract code verified (${code.length / 2 - 1} bytes)`);

  // Test registration
  console.log("\nTesting registration...");
  const testTokenURI = "http://localhost:8000/.well-known/agent-card.json";
  
  // Note: Contract uses MetadataEntry[] with {string key, bytes value}
  // Convert string values to bytes using toHex (as done in tests)
  const testMetadata = [
    { key: "category", value: toHex("compute") },
    { key: "type", value: toHex("a2a-trader") },
  ];

  const txHash = await identityRegistry.write.register([
    testTokenURI,
    testMetadata,
  ]);
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`✅ Test registration successful!`);
  console.log(`   Transaction: ${receipt.transactionHash}`);
  console.log(`   Block: ${receipt.blockNumber}`);

  // Extract agent ID from event logs
  const registeredLog = receipt.logs.find((log) => {
    // Event signature: Registered(uint256,string,address)
    return log.topics && log.topics.length > 0;
  });
  
  if (registeredLog && registeredLog.topics[1]) {
    // Agent ID is in topics[1] (indexed uint256)
    const agentId = BigInt(registeredLog.topics[1]);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   ✅ Registered event emitted`);
  } else {
    console.log(`   ⚠️  Could not extract agent ID from event logs`);
  }

  console.log("\n📋 Summary:");
  console.log(`   Contract Address: ${identityRegistryAddress}`);
  console.log(`   Network: anvil (${network})`);
  console.log(`   RPC URL: ${process.env.ANVIL_RPC_URL || "http://localhost:8545"}`);
  console.log(`\n💡 Update your agent config:`);
  console.log(`   export IDENTITY_REGISTRY_ADDRESS=${identityRegistryAddress}`);
  console.log(`   export CHAIN_RPC_URL=${process.env.ANVIL_RPC_URL || "http://localhost:8545"}`);
  console.log(`\n⚠️  Note: Agent code expects different contract interface. See CONTRACT_COMPATIBILITY.md`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

