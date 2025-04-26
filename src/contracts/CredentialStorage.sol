// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialStorage {
    // Mapping from user address to their latest IPFS hash
    mapping(address => string) private userHashes;
    
    // Event emitted when a user updates their IPFS hash
    event HashUpdated(address indexed user, string ipfsHash);
    
    /**
     * @dev Updates the IPFS hash for the calling user
     * @param ipfsHash The new IPFS hash containing encrypted credentials
     */
    function updateHash(string memory ipfsHash) public {
        userHashes[msg.sender] = ipfsHash;
        emit HashUpdated(msg.sender, ipfsHash);
    }
    
    /**
     * @dev Retrieves the IPFS hash for a given user
     * @param user The address of the user
     * @return The IPFS hash associated with the user
     */
    function getHash(address user) public view returns (string memory) {
        return userHashes[user];
    }
} 