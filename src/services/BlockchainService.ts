import { ethers } from 'ethers';

export class BlockchainService {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    async initialize() {
        console.log('Initializing BlockchainService');
        console.log('window.ethereum:', window.ethereum);
        
        // In Electron, we can use the window.ethereum object injected by the preload script
        if (!window.ethereum) {
            console.error('Ethereum provider not found');
            throw new Error('Ethereum provider not found');
        }

        // Create a wrapper that matches the expected interface
        const providerWrapper = {
            request: async (args: { method: string; params?: any[] }) => {
                console.log('Provider wrapper request:', args);
                return await window.ethereum!.request(args);
            },
            on: (eventName: string, callback: (...args: any[]) => void) => {
                console.log('Provider wrapper on:', eventName);
                window.ethereum!.on(eventName, callback);
            },
            removeListener: (eventName: string, callback: (...args: any[]) => void) => {
                console.log('Provider wrapper removeListener:', eventName);
                window.ethereum!.removeListener(eventName, callback);
            }
        };

        console.log('Creating BrowserProvider');
        this.provider = new ethers.BrowserProvider(providerWrapper);
        console.log('Getting signer');
        this.signer = await this.provider.getSigner();
        console.log('BlockchainService initialized');
    }

    async getAccounts(): Promise<string[]> {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        return this.provider.send('eth_accounts', []);
    }

    async getNetwork() {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        return this.provider.getNetwork();
    }

    async switchNetwork(chainId: number) {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        await this.provider.send('wallet_switchEthereumChain', [{ chainId: `0x${chainId.toString(16)}` }]);
    }

    getProvider() {
        if (!window.ethereum) {
            throw new Error('Ethereum provider not found');
        }
        return window.ethereum;
    }

    getSigner() {
        if (!this.signer) {
            throw new Error('Signer not initialized');
        }
        return this.signer;
    }
} 