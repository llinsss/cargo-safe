import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Smart contract ABI (from the Solidity contract)
export const TRANSPORT_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_eventType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      }
    ],
    "name": "addTrackingEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "completeShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentNumber",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_carrier",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_originAddress",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_destinationAddress",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_valueUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_expectedDelivery",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_penaltyPerDay",
        "type": "uint256"
      }
    ],
    "name": "createShipment",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getCustodyChain",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "holderName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "action",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isVerified",
            "type": "bool"
          }
        ],
        "internalType": "struct TransportContract.CustodyRecord[]",
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
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getShipment",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "shipmentNumber",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "customer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "carrier",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "originAddress",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "destinationAddress",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "valueUSD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "expectedDelivery",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "penaltyPerDay",
            "type": "uint256"
          },
          {
            "internalType": "enum TransportContract.ShipmentStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "progress",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "escrowAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct TransportContract.Shipment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentNumber",
        "type": "string"
      }
    ],
    "name": "getTokenIdByShipmentNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getTrackingEvents",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "eventType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recordedBy",
            "type": "address"
          }
        ],
        "internalType": "struct TransportContract.TrackingEvent[]",
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
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "enum TransportContract.ShipmentStatus",
        "name": "_status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_progress",
        "type": "uint256"
      }
    ],
    "name": "updateShipmentStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// Contract addresses (update these with your deployed contract addresses)
export const CONTRACT_ADDRESSES = {
  [hardhat.id]: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat localhost address
  [sepolia.id]: '', // Add your Sepolia testnet address here
  [mainnet.id]: '', // Add your mainnet address here (when ready)
} as const

// Wagmi configuration
export const config = getDefaultConfig({
  appName: 'Transport DApp',
  projectId: 'transport-dapp', // Replace with your WalletConnect project ID
  chains: [hardhat, sepolia, mainnet],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

// Helper function to get contract address for current chain
export function getContractAddress(chainId: number): string {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[hardhat.id]
}

// Shipment status enum mapping
export enum ShipmentStatus {
  Draft = 0,
  Active = 1,
  InTransit = 2,
  Delivered = 3,
  Delayed = 4,
  Cancelled = 5,
}

export const SHIPMENT_STATUS_LABELS = {
  [ShipmentStatus.Draft]: 'Draft',
  [ShipmentStatus.Active]: 'Active',
  [ShipmentStatus.InTransit]: 'In Transit',
  [ShipmentStatus.Delivered]: 'Delivered',
  [ShipmentStatus.Delayed]: 'Delayed',
  [ShipmentStatus.Cancelled]: 'Cancelled',
}