const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CredentialManager", function () {
  let credentialManager;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const CredentialManager = await ethers.getContractFactory("CredentialManager");
    credentialManager = await CredentialManager.deploy();
    await credentialManager.waitForDeployment();
  });

  it("Should add a credential", async function () {
    await credentialManager.addCredential("example.com", "QmHash123");
    const credentials = await credentialManager.getCredentials();
    expect(credentials.length).to.equal(1);
    expect(credentials[0].website).to.equal("example.com");
    expect(credentials[0].ipfsHash).to.equal("QmHash123");
  });

  it("Should not allow duplicate credentials", async function () {
    await credentialManager.addCredential("example.com", "QmHash123");
    await expect(
      credentialManager.addCredential("example.com", "QmHash456")
    ).to.be.revertedWith("Credential already exists for this website");
  });

  it("Should remove a credential", async function () {
    await credentialManager.addCredential("example.com", "QmHash123");
    await credentialManager.removeCredential("example.com");
    const credentials = await credentialManager.getCredentials();
    expect(credentials.length).to.equal(0);
  });

  it("Should get a specific credential", async function () {
    await credentialManager.addCredential("example.com", "QmHash123");
    const credential = await credentialManager.getCredential("example.com");
    expect(credential.website).to.equal("example.com");
    expect(credential.ipfsHash).to.equal("QmHash123");
  });
}); 