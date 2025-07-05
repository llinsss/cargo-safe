import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { TRANSPORT_CONTRACT_ABI, getContractAddress, ShipmentStatus } from '@/lib/web3'
import { useChainId } from 'wagmi'
import { toast } from 'sonner'

export interface ContractShipment {
  shipmentNumber: string
  customer: string
  carrier: string
  originAddress: string
  destinationAddress: string
  description: string
  valueUSD: bigint
  expectedDelivery: bigint
  penaltyPerDay: bigint
  status: ShipmentStatus
  progress: bigint
  escrowAmount: bigint
  isCompleted: boolean
  createdAt: bigint
}

export interface ContractTrackingEvent {
  eventType: string
  description: string
  location: string
  timestamp: bigint
  recordedBy: string
}

export interface ContractCustodyRecord {
  holder: string
  holderName: string
  action: string
  location: string
  timestamp: bigint
  isVerified: boolean
}

export function useTransportContract() {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId)
  
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Create a new shipment on the blockchain
  const createShipment = async ({
    shipmentNumber,
    carrierAddress,
    originAddress,
    destinationAddress,
    description,
    valueUSD,
    expectedDelivery,
    penaltyPerDay,
    escrowAmount,
  }: {
    shipmentNumber: string
    carrierAddress: string
    originAddress: string
    destinationAddress: string
    description: string
    valueUSD: number
    expectedDelivery: Date
    penaltyPerDay: number
    escrowAmount: string
  }) => {
    try {
      const expectedDeliveryTimestamp = Math.floor(expectedDelivery.getTime() / 1000)
      
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: TRANSPORT_CONTRACT_ABI,
        functionName: 'createShipment',
        args: [
          shipmentNumber,
          carrierAddress as `0x${string}`,
          originAddress,
          destinationAddress,
          description,
          BigInt(valueUSD),
          BigInt(expectedDeliveryTimestamp),
          BigInt(penaltyPerDay),
        ],
        value: parseEther(escrowAmount),
      })
      
      toast.success('Shipment created successfully!')
      return result
    } catch (err) {
      console.error('Error creating shipment:', err)
      toast.error('Failed to create shipment')
      throw err
    }
  }

  // Update shipment status (carrier only)
  const updateShipmentStatus = async (tokenId: number, status: ShipmentStatus, progress: number) => {
    try {
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: TRANSPORT_CONTRACT_ABI,
        functionName: 'updateShipmentStatus',
        args: [BigInt(tokenId), status, BigInt(progress)],
      })
      
      toast.success('Shipment status updated!')
      return result
    } catch (err) {
      console.error('Error updating shipment status:', err)
      toast.error('Failed to update shipment status')
      throw err
    }
  }

  // Add tracking event (carrier only)
  const addTrackingEvent = async (
    tokenId: number,
    eventType: string,
    description: string,
    location: string
  ) => {
    try {
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: TRANSPORT_CONTRACT_ABI,
        functionName: 'addTrackingEvent',
        args: [BigInt(tokenId), eventType, description, location],
      })
      
      toast.success('Tracking event added!')
      return result
    } catch (err) {
      console.error('Error adding tracking event:', err)
      toast.error('Failed to add tracking event')
      throw err
    }
  }

  // Complete shipment (carrier only)
  const completeShipment = async (tokenId: number) => {
    try {
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: TRANSPORT_CONTRACT_ABI,
        functionName: 'completeShipment',
        args: [BigInt(tokenId)],
      })
      
      toast.success('Shipment completed!')
      return result
    } catch (err) {
      console.error('Error completing shipment:', err)
      toast.error('Failed to complete shipment')
      throw err
    }
  }

  return {
    createShipment,
    updateShipmentStatus,
    addTrackingEvent,
    completeShipment,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}

// Hook to read shipment data
export function useShipment(tokenId: number | undefined) {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId)

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TRANSPORT_CONTRACT_ABI,
    functionName: 'getShipment',
    args: tokenId ? [BigInt(tokenId)] : undefined,
  })
}

// Hook to read tracking events
export function useTrackingEvents(tokenId: number | undefined) {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId)

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TRANSPORT_CONTRACT_ABI,
    functionName: 'getTrackingEvents',
    args: tokenId ? [BigInt(tokenId)] : undefined,
  })
}

// Hook to read custody chain
export function useCustodyChain(tokenId: number | undefined) {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId)

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TRANSPORT_CONTRACT_ABI,
    functionName: 'getCustodyChain',
    args: tokenId ? [BigInt(tokenId)] : undefined,
  })
}

// Hook to get token ID by shipment number
export function useTokenIdByShipmentNumber(shipmentNumber: string | undefined) {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId)

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TRANSPORT_CONTRACT_ABI,
    functionName: 'getTokenIdByShipmentNumber',
    args: shipmentNumber ? [shipmentNumber] : undefined,
  })
}