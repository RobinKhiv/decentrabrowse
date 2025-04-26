import { ethers } from 'ethers';

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (params: any) => void) => void;
  removeListener: (event: string, callback: (params: any) => void) => void;
  send: (method: string, params: any[]) => Promise<any>;
}

export interface BlockchainNetwork {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface WalletInfo {
  address: string;
  network: BlockchainNetwork;
  chainId: string;
}

export interface IBlockchainService {
  initialize(): Promise<void>;
  getSigner(): Promise<ethers.JsonRpcSigner>;
  getProvider(): Promise<ethers.JsonRpcProvider>;
  connect(): Promise<WalletInfo>;
  signMessage(message: string): Promise<string>;
  switchNetwork(network: BlockchainNetwork): Promise<void>;
  onAccountsChanged(callback: (accounts: string[]) => void): void;
  onNetworkChanged(callback: (network: BlockchainNetwork) => void): void;
  removeListeners(): void;
}

export type { BlockchainNetwork as BlockchainNetworkType };
export type { IBlockchainService as IBlockchainServiceType };

export const SUPPORTED_NETWORKS: BlockchainNetwork[] = [
  {
    name: 'Ethereum Mainnet',
    chainId: '1',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io/'
  },
  {
    name: 'Goerli Testnet',
    chainId: '5',
    rpcUrl: 'https://goerli.infura.io/v3/',
    explorerUrl: 'https://goerli.etherscan.io/'
  },
  {
    name: 'Sepolia Testnet',
    chainId: '11155111',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io/'
  },
  {
    name: 'Hardhat Network',
    chainId: '31337',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: ''
  }
]; 