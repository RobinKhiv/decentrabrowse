import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CredentialManager = await ethers.getContractFactory("CredentialManager");
  const credentialManager = await CredentialManager.deploy();

  await credentialManager.waitForDeployment();

  console.log("CredentialManager deployed to:", await credentialManager.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 