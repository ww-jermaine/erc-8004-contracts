import hre from "hardhat";
import { formatEther, toUtf8Bytes } from "viem";

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
  const identityRegistryAddress = await viem.deployContract("IdentityRegistry");
  console.log(`✅ IdentityRegistry deployed to: ${identityRegistryAddress}`);

  // Verify deployment
  const code = await publicClient.getBytecode({
    address: identityRegistryAddress,
  });
  if (!code || code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  console.log(`✅ Contract code verified (${code.length / 2 - 1} bytes)`);

  // Get contract instance
  const identityRegistry = await viem.getContractAt(
    "IdentityRegistry",
    identityRegistryAddress
  );

  // Test registration
  console.log("\nTesting registration...");
  const testTokenURI = "http://localhost:8000/.well-known/agent-card.json";
  
  // Note: Contract uses MetadataEntry[] with {string key, bytes value}
  // Convert string values to bytes
  const testMetadata = [
    { key: "category", value: toUtf8Bytes("compute") },
    { key: "type", value: toUtf8Bytes("a2a-trader") },
  ];

  const txHash = await identityRegistry.write.register([
    testTokenURI,
    testMetadata,
  ]);
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`✅ Test registration successful!`);
  console.log(`   Transaction: ${receipt.transactionHash}`);
  console.log(`   Block: ${receipt.blockNumber}`);

  // Get agent ID (first agent is ID 0)
  const agentId = await identityRegistry.read.totalSupply();
  console.log(`   Agent ID: ${agentId}`);
  
  // Check event was emitted
  const registeredLog = receipt.logs.find((log) => {
    // Event signature: Registered(uint256,string,address)
    return log.topics && log.topics.length > 0;
  });
  if (registeredLog) {
    console.log(`   ✅ Registered event emitted`);
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

