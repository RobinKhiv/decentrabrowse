// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CredentialStorage {
    mapping(address => string) private userHashes;
    
    event HashUpdated(address indexed user, string ipfsHash);
    
    function updateHash(string memory ipfsHash) public {
        userHashes[msg.sender] = ipfsHash;
        emit HashUpdated(msg.sender, ipfsHash);
    }
    
    function getHash(address user) public view returns (string memory) {
        return userHashes[user];
    }
} 