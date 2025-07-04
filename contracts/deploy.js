// Deployment script for Hardhat
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TransportContract...");

  // Get the ContractFactory and Signers here.
  const TransportContract = await ethers.getContractFactory("TransportContract");
  
  // Deploy the contract
  const transportContract = await TransportContract.deploy();
  
  await transportContract.deployed();
  
  console.log("TransportContract deployed to:", transportContract.address);
  
  // Verify some basic functionality
  console.log("Contract owner:", await transportContract.owner());
  console.log("Contract name:", await transportContract.name());
  console.log("Contract symbol:", await transportContract.symbol());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });