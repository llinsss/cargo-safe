
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Shield,
  MapPin
} from "lucide-react";

const TrackingDashboard = () => {
  const shipments = [
    {
      id: "SP-2024-001",
      status: "In Transit",
      progress: 75,
      value: "$15,000",
      origin: "New York, NY",
      destination: "Los Angeles, CA",
      carrier: "SecureLogistics Inc.",
      lastUpdate: "2 hours ago",
      risk: "Low"
    },
    {
      id: "SP-2024-002", 
      status: "Delivered",
      progress: 100,
      value: "$8,500",
      origin: "Chicago, IL",
      destination: "Miami, FL",
      carrier: "FastTrack Express",
      lastUpdate: "1 day ago",
      risk: "None"
    },
    {
      id: "SP-2024-003",
      status: "Delayed",
      progress: 45,
      value: "$22,000",
      origin: "Seattle, WA",
      destination: "Boston, MA",
      carrier: "NorthWest Freight",
      lastUpdate: "6 hours ago",
      risk: "Medium"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Transit":
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "Delayed":
        return <Badge className="bg-yellow-100 text-yellow-800">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return <Badge variant="outline" className="text-green-600 border-green-200">Low Risk</Badge>;
      case "Medium":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium Risk</Badge>;
      case "High":
        return <Badge variant="outline" className="text-red-600 border-red-200">High Risk</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">No Risk</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,000</div>
            <p className="text-xs text-muted-foreground">Secured on-chain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+1.2% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5</div>
            <p className="text-xs text-muted-foreground">Blockchain verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
          <CardDescription>
            Monitor your blockchain-secured shipments in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{shipment.id}</h3>
                      <p className="text-sm text-gray-600">{shipment.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(shipment.status)}
                    {getRiskBadge(shipment.risk)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">From: {shipment.origin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">To: {shipment.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{shipment.carrier}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{shipment.progress}%</span>
                  </div>
                  <Progress value={shipment.progress} className="w-full" />
                  <p className="text-xs text-gray-500">Last update: {shipment.lastUpdate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingDashboard;
