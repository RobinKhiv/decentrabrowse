import { ethers } from 'ethers';
import { BlockchainService } from '../blockchain/BlockchainService';
import { EthereumProvider, WalletInfo as BaseWalletInfo, BlockchainNetwork } from '../types';
import { ipcRenderer } from 'electron';

export type WalletInfo = BaseWalletInfo;

export class WalletService {
  private provider: EthereumProvider | null = null;
  private walletInfo: WalletInfo | null = null;
  private testWallet: ethers.HDNodeWallet | null = null;

  constructor() {
    this.initializeProvider();
    // Create a test wallet for development
    if (process.env.NODE_ENV === 'development') {
      this.testWallet = ethers.HDNodeWallet.createRandom();
      console.log('Test wallet created:', this.testWallet.address);
    }
  }

  private initializeProvider() {
    // Create a provider that uses IPC to communicate with the main process
    this.provider = {
      request: async (args: { method: string; params?: any[] }) => {
        return await ipcRenderer.invoke('ethereum-request', args);
      },
      send: async (method: string, params: any[]) => {
        return await ipcRenderer.invoke('ethereum-request', { method, params });
      },
      on: (event: string, callback: (params: any) => void) => {
        ipcRenderer.on(`ethereum-${event}`, (_, params) => callback(params));
      },
      removeListener: (event: string, callback: (params: any) => void) => {
        ipcRenderer.removeListener(`ethereum-${event}`, (_, params) => callback(params));
      }
    };
  }

  async connectWallet(): Promise<WalletInfo | null> {
    if (!this.provider) {
      throw new Error('No provider available');
    }

    try {
      // Request account access
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
      const chainId = await this.provider.request({ method: 'eth_chainId' });

      // Create network info
      const network: BlockchainNetwork = {
        name: 'Ethereum',
        chainId: chainId,
        rpcUrl: 'http://localhost:8545', // Default to local for testing
        explorerUrl: ''
      };

      this.walletInfo = {
        address: accounts[0],
        network,
        chainId
      };

      return this.walletInfo;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    return this.walletInfo;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider || !this.walletInfo) {
      throw new Error('Wallet not connected');
    }

    return await this.provider.request({
      method: 'personal_sign',
      params: [message, this.walletInfo.address]
    });
  }

  async switchNetwork(chainId: string): Promise<void> {
    if (!this.provider) {
      throw new Error('No wallet provider found');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (this.provider) {
      this.provider.on('chainChanged', callback);
    }
  }

  removeListeners(): void {
    if (this.provider) {
      this.provider.removeListener('accountsChanged', () => {});
      this.provider.removeListener('chainChanged', () => {});
    }
  }
} 