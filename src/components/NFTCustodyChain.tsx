
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  User, 
  Package,
  ArrowRight,
  Eye,
  Download
} from "lucide-react";

const NFTCustodyChain = () => {
  const custodyChain = [
    {
      id: 1,
      holder: "Warehouse Alpha",
      address: "0x1234...5678",
      timestamp: "2024-01-15 09:00:00",
      status: "Verified",
      action: "Initial Custody",
      signature: "0xabcd...efgh",
      verified: true
    },
    {
      id: 2,
      holder: "SecureLogistics Inc.",
      address: "0x5678...9012",
      timestamp: "2024-01-15 10:30:00",
      status: "Verified",
      action: "Transport Started",
      signature: "0xefgh...ijkl",
      verified: true
    },
    {
      id: 3,
      holder: "Distribution Center B",
      address: "0x9012...3456",
      timestamp: "2024-01-15 14:15:00",
      status: "Verified",
      action: "Checkpoint Passed",
      signature: "0xijkl...mnop",
      verified: true
    },
    {
      id: 4,
      holder: "Local Hub C",
      address: "0x3456...7890",
      timestamp: "2024-01-15 16:45:00",
      status: "Pending",
      action: "Final Delivery",
      signature: "Pending...",
      verified: false
    }
  ];

  const nftMetadata = {
    tokenId: "NFT-SP-2024-001",
    contractAddress: "0xabcd1234...efgh5678",
    totalValue: "$15,000",
    currentHolder: "Local Hub C",
    createdAt: "2024-01-15 09:00:00",
    status: "Active"
  };

  return (
    <div className="space-y-6">
      {/* NFT Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            NFT Shipment Certificate
          </CardTitle>
          <CardDescription>
            Blockchain-based proof of ownership and custody
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token ID:</span>
                <Badge variant="outline" className="font-mono">
                  {nftMetadata.tokenId}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contract:</span>
                <span className="text-sm font-mono text-gray-600">
                  {nftMetadata.contractAddress}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Value:</span>
                <span className="text-sm font-semibold text-green-600">
                  {nftMetadata.totalValue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Holder:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {nftMetadata.currentHolder}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View on Explorer
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custody Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Chain of Custody
          </CardTitle>
          <CardDescription>
            Immutable record of all custody transfers and verifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {custodyChain.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Connector Line */}
                {index < custodyChain.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                )}
                
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {item.verified ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{item.action}</h3>
                      <Badge 
                        variant={item.verified ? "default" : "outline"}
                        className={item.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{item.holder}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Address: <span className="font-mono">{item.address}</span></div>
                      <div>Signature: <span className="font-mono">{item.signature}</span></div>
                    </div>
                  </div>
                  
                  {index < custodyChain.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3/4</div>
            <p className="text-xs text-muted-foreground">Blockchain verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">95%</div>
            <p className="text-xs text-muted-foreground">Tamper-proof record</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time in Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">7h 45m</div>
            <p className="text-xs text-muted-foreground">Within SLA</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NFTCustodyChain;
