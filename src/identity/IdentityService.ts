import { ethers } from 'ethers';
import { WalletInfo } from '../types';
import { create } from 'ipfs-http-client';

export interface Credential {
    id: string;
    website: string;
    username: string;
    password: string;
    createdAt: Date;
}

interface CredentialManagerContract extends ethers.BaseContract {
    addCredential(website: string, ipfsHash: string): Promise<ethers.ContractTransactionResponse>;
    removeCredential(website: string): Promise<ethers.ContractTransactionResponse>;
    getCredentials(): Promise<{ website: string; ipfsHash: string; timestamp: bigint }[]>;
    getCredential(website: string): Promise<{ website: string; ipfsHash: string; timestamp: bigint }>;
}

// Contract ABI in ethers v6 format
const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "website",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "name": "addCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "website",
                "type": "string"
            }
        ],
        "name": "removeCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCredentials",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "website",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "ipfsHash",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CredentialManager.Credential[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "website",
                "type": "string"
            }
        ],
        "name": "getCredential",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "website",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "ipfsHash",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CredentialManager.Credential",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Network configurations
const NETWORKS = {
    sepolia: {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/',
        contractAddress: '0x...' // Replace with your deployed contract address
    },
    localhost: {
        chainId: 31337,
        name: 'Localhost',
        rpcUrl: 'http://localhost:8545',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    },
    hardhat: {
        chainId: 31337,
        name: 'Hardhat',
        rpcUrl: 'http://localhost:8545',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
};

export class IdentityService {
    private contract: CredentialManagerContract | null = null;
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.JsonRpcSigner | null = null;
    private encryptionKey: CryptoKey | null = null;
    private ipfs: any;
    private walletInfo: WalletInfo;
    private credentials: Credential[] = [];
    private initialized: boolean = false;

    constructor(walletInfo: WalletInfo, provider: ethers.JsonRpcProvider) {
        this.walletInfo = walletInfo;
        this.provider = provider;
        this.signer = null;
        this.ipfs = create({ url: 'http://localhost:5001' });
    }

    async initialize() {
        if (this.initialized) return;
        await this.initializeContract();
        await this.initializeEncryption();
        this.initialized = true;
    }

    private async initializeContract() {
        // Get the current network
        const network = await this.provider.getNetwork();
        console.log('Current network:', network);
        
        const networkConfig = Object.values(NETWORKS).find(n => n.chainId === Number(network.chainId));
        console.log('Network config:', networkConfig);
        
        if (!networkConfig) {
            throw new Error(`Unsupported network: ${network.name} (${network.chainId})`);
        }

        // Get the signer for the current account
        this.signer = await this.provider.getSigner();
        console.log('Signer address:', await this.signer.getAddress());
        
        // Create the contract with the signer
        this.contract = new ethers.Contract(
            networkConfig.contractAddress,
            CONTRACT_ABI,
            this.signer
        ) as unknown as CredentialManagerContract;
        
        console.log('Contract address:', networkConfig.contractAddress);
        
        // Verify contract code
        const code = await this.provider.getCode(networkConfig.contractAddress);
        console.log('Contract code length:', code.length);
        if (code === '0x') {
            throw new Error('No contract code found at address');
        }
    }

    private async initializeEncryption() {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(this.walletInfo.address),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        this.encryptionKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new TextEncoder().encode('decentrabrowse'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async addCredential(credential: Omit<Credential, 'id' | 'createdAt'>) {
        if (!this.contract || !this.encryptionKey || !this.signer) {
            throw new Error('Service not initialized');
        }

        const encryptedData = await this.encrypt(JSON.stringify(credential));
        const ipfsHash = await this.uploadToIPFS(encryptedData);
        
        try {
            const tx = await this.contract.addCredential(credential.website, ipfsHash);
            await tx.wait(); // Wait for transaction to be mined
        } catch (error) {
            console.error('Error adding credential:', error);
            throw error;
        }
    }

    async removeCredential(website: string) {
        if (!this.contract || !this.signer) {
            throw new Error('Service not initialized');
        }

        try {
            const tx = await this.contract.removeCredential(website);
            await tx.wait(); // Wait for transaction to be mined
        } catch (error) {
            console.error('Error removing credential:', error);
            throw error;
        }
    }

    async getCredentials(): Promise<Credential[]> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            console.log('Calling getCredentials on contract...');
            const rawCredentials = await this.contract.getCredentials();
            console.log('Raw credentials response:', rawCredentials);
            
            // Convert Proxy to array and handle each credential
            const credentialsArray = Array.isArray(rawCredentials) ? rawCredentials : [rawCredentials];
            
            return await Promise.all(credentialsArray.map(async (cred: { website: string; ipfsHash: string; timestamp: bigint }) => {
                console.log('Processing credential:', cred);
                
                const decryptedData = await this.decrypt(cred.ipfsHash);
                const data = JSON.parse(decryptedData);
                return {
                    id: cred.website,
                    website: cred.website,
                    username: data.username,
                    password: data.password,
                    createdAt: new Date(Number(cred.timestamp) * 1000)
                };
            }));
        } catch (error) {
            console.error('Error getting credentials:', error);
            throw error;
        }
    }

    private async encrypt(data: string): Promise<string> {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            new TextEncoder().encode(data)
        );

        return JSON.stringify({
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedData))
        });
    }

    private async decrypt(ipfsHash: string): Promise<string> {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }

        try {
            // If it's an IPFS URL, extract the hash
            const hash = ipfsHash.startsWith('ipfs://') ? ipfsHash.slice(7) : ipfsHash;
            
            // Decode the base64 string
            const decodedData = atob(hash);
            
            // Parse the JSON data
            const { iv, data } = JSON.parse(decodedData);
            
            // Convert arrays to Uint8Array
            const ivArray = new Uint8Array(iv);
            const dataArray = new Uint8Array(data);
            
            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivArray },
                this.encryptionKey,
                dataArray
            );

            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error('Error decrypting data:', error);
            throw error;
        }
    }

    private async uploadToIPFS(data: string): Promise<string> {
        // Mock implementation - replace with actual IPFS upload
        return `ipfs://${Buffer.from(data).toString('base64')}`;
    }

    private async downloadFromIPFS(ipfsHash: string): Promise<string> {
        // Mock implementation - replace with actual IPFS download
        return Buffer.from(ipfsHash.replace('ipfs://', ''), 'base64').toString();
    }
} 