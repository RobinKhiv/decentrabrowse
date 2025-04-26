// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialManager {
    struct Credential {
        string website;
        string ipfsHash;
        uint256 timestamp;
    }

    mapping(address => Credential[]) private userCredentials;
    mapping(address => mapping(string => uint256)) private websiteIndex;

    event CredentialAdded(address indexed user, string website, string ipfsHash);
    event CredentialRemoved(address indexed user, string website);

    function addCredential(string memory website, string memory ipfsHash) public {
        require(bytes(website).length > 0, "Website cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(websiteIndex[msg.sender][website] == 0, "Credential already exists");

        Credential memory newCredential = Credential({
            website: website,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });

        userCredentials[msg.sender].push(newCredential);
        websiteIndex[msg.sender][website] = userCredentials[msg.sender].length;

        emit CredentialAdded(msg.sender, website, ipfsHash);
    }

    function removeCredential(string memory website) public {
        require(websiteIndex[msg.sender][website] > 0, "Credential does not exist");
        
        uint256 index = websiteIndex[msg.sender][website] - 1;
        uint256 lastIndex = userCredentials[msg.sender].length - 1;

        if (index != lastIndex) {
            userCredentials[msg.sender][index] = userCredentials[msg.sender][lastIndex];
            websiteIndex[msg.sender][userCredentials[msg.sender][index].website] = index + 1;
        }

        userCredentials[msg.sender].pop();
        delete websiteIndex[msg.sender][website];

        emit CredentialRemoved(msg.sender, website);
    }

    function getCredentials() public view returns (Credential[] memory) {
        return userCredentials[msg.sender];
    }

    function getCredential(string memory website) public view returns (Credential memory) {
        require(websiteIndex[msg.sender][website] > 0, "Credential does not exist");
        return userCredentials[msg.sender][websiteIndex[msg.sender][website] - 1];
    }
} 