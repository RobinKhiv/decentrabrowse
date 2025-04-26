import { ethers } from 'ethers';
import { BlockchainService } from './BlockchainService';
import { BlockchainNetwork, WalletInfo, SUPPORTED_NETWORKS } from '../types';

export class EthereumService extends BlockchainService {
  private static instance: EthereumService | null = null;
  private currentNetwork: BlockchainNetwork | null = null;
  private currentAddress: string | null = null;

  protected constructor() {
    super();
    this.currentNetwork = SUPPORTED_NETWORKS[0];
    this.currentAddress = null;
  }

  public static getInstance(): EthereumService {
    if (!EthereumService.instance) {
      EthereumService.instance = new EthereumService();
    }
    return EthereumService.instance;
  }

  static async create(): Promise<EthereumService> {
    const service = new EthereumService();
    await service.initialize();
    return service;
  }

  override async connect(): Promise<WalletInfo> {
    await this.initialize();
    const provider = await this.getProvider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    
    this.currentAddress = address;
    this.currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === network.chainId.toString()) || SUPPORTED_NETWORKS[0];

    return {
      address,
      network: this.currentNetwork,
      chainId: network.chainId.toString()
    };
  }

  override async switchNetwork(network: BlockchainNetwork): Promise<void> {
    const provider = await this.getProvider();
    
    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${parseInt(network.chainId).toString(16)}` }
      ]);
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        await provider.send('wallet_addEthereumChain', [{
          chainId: network.chainId,
          chainName: network.name,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.explorerUrl],
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          }
        }]);
      } else {
        throw error;
      }
    }

    this.currentNetwork = network;
  }

  override async signMessage(message: string): Promise<string> {
    await this.initialize();
    const signer = await this.getSigner();
    return await signer.signMessage(message);
  }

  override onAccountsChanged(callback: (accounts: string[]) => void): void {
    super.onAccountsChanged((accounts) => {
      this.currentAddress = accounts[0] || null;
      callback(accounts);
    });
  }

  override onNetworkChanged(callback: (network: BlockchainNetwork) => void): void {
    super.onNetworkChanged((network) => {
      this.currentNetwork = network;
      callback(network);
    });
  }

  override removeListeners(): void {
    super.removeListeners();
  }
} 