import { ethers } from 'ethers';
import { IBlockchainService, BlockchainNetwork, WalletInfo, SUPPORTED_NETWORKS } from '../types';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        removeListener: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

export class BlockchainService implements IBlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private accountChangeCallback: ((accounts: string[]) => void) | null = null;
  private networkChangeCallback: ((network: BlockchainNetwork) => void) | null = null;

  async initialize(): Promise<void> {
    try {
      // Create a provider that connects directly to the local node
      this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
      this.signer = await this.provider.getSigner();
      
      console.log('BlockchainService initialized successfully');

      // Listen for events from the main process
      window.electron.ipcRenderer.on('accountsChanged', (_, accounts: string[]) => {
        if (this.accountChangeCallback) {
          this.accountChangeCallback(accounts);
        }
      });

      window.electron.ipcRenderer.on('chainChanged', (_, chainId: string) => {
        if (this.networkChangeCallback) {
          const network = SUPPORTED_NETWORKS.find((n: BlockchainNetwork) => n.chainId === chainId) || {
            name: '',
            chainId,
            rpcUrl: '',
            explorerUrl: ''
          };
          this.networkChangeCallback(network);
        }
      });
    } catch (error) {
      console.error('Error initializing BlockchainService:', error);
      throw error;
    }
  }

  async getSigner(): Promise<ethers.JsonRpcSigner> {
    if (!this.signer) {
      throw new Error('BlockchainService not initialized');
    }
    return this.signer;
  }

  async getProvider(): Promise<ethers.JsonRpcProvider> {
    if (!this.provider) {
      throw new Error('BlockchainService not initialized');
    }
    return this.provider;
  }

  async connect(): Promise<WalletInfo> {
    if (!this.provider) {
      throw new Error('BlockchainService not initialized');
    }

    const accounts = await this.provider.send('eth_accounts', []);
    const network = await this.provider.getNetwork();
    const signer = await this.getSigner();
    const address = await signer.getAddress();

    const networkInfo = SUPPORTED_NETWORKS.find((n: BlockchainNetwork) => n.chainId === network.chainId.toString()) || {
      name: network.name,
      chainId: network.chainId.toString(),
      rpcUrl: network.name === 'hardhat' ? 'http://localhost:8545' : '',
      explorerUrl: ''
    };

    return {
      address,
      network: networkInfo,
      chainId: network.chainId.toString()
    };
  }

  async signMessage(message: string): Promise<string> {
    const signer = await this.getSigner();
    return await signer.signMessage(message);
  }

  async switchNetwork(network: BlockchainNetwork): Promise<void> {
    if (!this.provider) {
      throw new Error('BlockchainService not initialized');
    }
    // In a local environment, we don't need to switch networks
    // as we're directly connected to the node
    console.log('Switching to network:', network.name);
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    this.accountChangeCallback = callback;
  }

  onNetworkChanged(callback: (network: BlockchainNetwork) => void): void {
    this.networkChangeCallback = callback;
  }

  removeListeners(): void {
    window.electron.ipcRenderer.removeAllListeners('accountsChanged');
    window.electron.ipcRenderer.removeAllListeners('chainChanged');
    this.accountChangeCallback = null;
    this.networkChangeCallback = null;
  }
} 