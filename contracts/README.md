# Transport Smart Contract

A Solidity smart contract for managing transport and logistics operations with NFT certificates and escrow functionality.

## Features

- **NFT Certificates**: Each shipment gets a unique NFT representing ownership
- **Escrow System**: Automated payment release based on delivery performance
- **Penalty Clauses**: Automatic penalty calculation for late deliveries
- **Custody Chain**: Immutable record of shipment custody transfers
- **Tracking Events**: Real-time tracking milestone recording
- **Carrier Verification**: Verified carrier system

## Contract Functions

### Core Functions

- `createShipment()`: Create a new shipment with escrow deposit
- `updateShipmentStatus()`: Update shipment status and progress (carrier only)
- `addTrackingEvent()`: Add tracking milestones (carrier only)
- `transferCustody()`: Record custody transfers
- `completeShipment()`: Complete delivery and release escrow

### View Functions

- `getShipment()`: Get shipment details
- `getTrackingEvents()`: Get all tracking events for a shipment
- `getCustodyChain()`: Get complete custody chain
- `getTokenIdByShipmentNumber()`: Find token ID by shipment number

## Deployment Instructions

### Prerequisites

1. Install Node.js and npm
2. Install Hardhat: `npm install --save-dev hardhat`
3. Install dependencies: `npm install`

### Local Deployment

1. Start local Hardhat network:
   ```bash
   npx hardhat node
   ```

2. Deploy contract:
   ```bash
   npx hardhat run deploy.js --network localhost
   ```

### Testnet Deployment (Goerli)

1. Set environment variables:
   ```bash
   export GOERLI_URL="https://goerli.infura.io/v3/YOUR_PROJECT_ID"
   export PRIVATE_KEY="your_private_key"
   export ETHERSCAN_API_KEY="your_etherscan_api_key"
   ```

2. Deploy:
   ```bash
   npx hardhat run deploy.js --network goerli
   ```

### Integration with Frontend

To integrate this contract with your existing Lovable app, you'll need to:

1. **Install Web3 libraries**:
   ```bash
   npm install ethers wagmi @rainbow-me/rainbowkit
   ```

2. **Add contract ABI and address** to your app configuration

3. **Create Web3 integration hooks** to interact with the contract

4. **Update your database** to store contract addresses and transaction hashes

## Security Considerations

- The contract uses OpenZeppelin's audited contracts
- ReentrancyGuard prevents reentrancy attacks
- Access control ensures only authorized parties can modify shipments
- NFTs are non-transferable to prevent unauthorized ownership changes
- Emergency functions allow contract owner to resolve disputes

## Gas Optimization

- Struct packing for storage efficiency
- Batch operations where possible
- Optimized compiler settings enabled

## Testing

Run the test suite:
```bash
npx hardhat test
```

## License

MIT License