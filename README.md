# DecentraBrowse

A privacy-focused blockchain browser with decentralized identity management.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Hardhat (local blockchain)
- IPFS daemon

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd decentrabrowse
```

2. Install dependencies:
```bash
npm install
```

3. Install IPFS:
```bash
# Using Homebrew (macOS)
brew install ipfs

# Or download from https://docs.ipfs.tech/install/
```

## Development Setup

1. Start the IPFS daemon:
```bash
ipfs daemon
```

2. Start the Hardhat local network:
```bash
npx hardhat node
```

3. In a new terminal, deploy the smart contract:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

4. Start the Electron application:
```bash
npm run dev
```

## Important Notes

- The IPFS daemon must be running before starting the application
- The Hardhat node must be running before starting the application
- The smart contract must be deployed after each Hardhat node restart
- The contract will be deployed to address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## Project Structure

- `src/` - Source code
  - `main/` - Electron main process
  - `renderer/` - React application
  - `identity/` - Identity management
  - `blockchain/` - Blockchain interactions
- `contracts/` - Smart contracts
- `scripts/` - Deployment and utility scripts

## Troubleshooting

If you encounter "No contract code found at address" error:
1. Make sure Hardhat node is running
2. Deploy the contract using the deploy script
3. Restart the Electron application

If you encounter IPFS-related errors:
1. Make sure IPFS daemon is running
2. Check if IPFS is properly initialized:
   ```bash
   ipfs init
   ```
3. Verify IPFS is running by checking the API:
   ```bash
   curl http://localhost:5001/api/v0/version
   ```

## License

[Add your license here] 