import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WalletConnect } from "./WalletConnect"
import { useAccount } from "wagmi"
import { Wallet, Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface WalletIntegrationProps {
  showInline?: boolean
}

export const WalletIntegration = ({ showInline = false }: WalletIntegrationProps) => {
  const { address, isConnected } = useAccount()

  if (showInline) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        {isConnected ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Wallet Connected</p>
              <p className="text-xs text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Blockchain Ready</Badge>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Database Mode</p>
              <p className="text-xs text-gray-600">Connect wallet for blockchain features</p>
            </div>
            <WalletConnect />
          </>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Blockchain Integration
        </CardTitle>
        <CardDescription>
          {isConnected 
            ? "Your wallet is connected and blockchain features are available"
            : "Connect your wallet to enable blockchain features"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-800">Wallet Connected</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Features:</span>
                <span className="text-green-600">Smart Contracts, NFTs, Escrow</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-yellow-800">Database Mode</span>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                Limited Features
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Basic shipment tracking available</p>
              <p>• Connect wallet to unlock:</p>
              <div className="ml-4 space-y-1">
                <p>- Smart contract escrow</p>
                <p>- NFT custody chains</p>
                <p>- Blockchain verification</p>
                <p>- Decentralized dispute resolution</p>
              </div>
            </div>
            
            <WalletConnect />
          </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your data is secure and works with or without blockchain</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}