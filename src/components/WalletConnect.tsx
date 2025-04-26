import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { BlockchainService } from '../blockchain/BlockchainService';
import { IdentityService } from '../identity/IdentityService';
import { WalletInfo, SUPPORTED_NETWORKS } from '../types';
import { ipcRenderer } from 'electron';

interface WalletConnectProps {
    onConnect: (service: IdentityService) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
    const [account, setAccount] = useState<string>('');
    const [error, setError] = useState<string>('');

    const connectWallet = async () => {
        try {
            const blockchainService = new BlockchainService();
            await blockchainService.initialize();

            // Connect and get wallet info
            const walletInfo = await blockchainService.connect();
            setAccount(walletInfo.address);

            // Switch to Hardhat network if needed
            const hardhatNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === '31337');
            if (!hardhatNetwork) {
                throw new Error('Hardhat network configuration not found');
            }
            
            if (walletInfo.chainId !== hardhatNetwork.chainId) {
                await blockchainService.switchNetwork(hardhatNetwork);
                // Update wallet info after network switch
                const updatedWalletInfo = await blockchainService.connect();
                setAccount(updatedWalletInfo.address);
            }

            // Create JsonRpcProvider that uses IPC
            const provider = new ethers.JsonRpcProvider('http://localhost:8545');
            
            // Initialize IdentityService with the provider
            const identityService = new IdentityService(walletInfo, provider);
            await identityService.initialize();

            onConnect(identityService);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            console.error('Error connecting wallet:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {!account ? (
                <Button variant="contained" onClick={connectWallet}>
                    Connect Wallet
                </Button>
            ) : (
                <Typography variant="body1">
                    Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </Typography>
            )}
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
        </Box>
    );
}; 