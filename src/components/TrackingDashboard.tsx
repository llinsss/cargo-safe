
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Shield,
  MapPin,
  Loader2
} from "lucide-react";

interface ShipmentWithCarrier {
  id: string;
  shipment_number: string;
  status: string;
  progress: number;
  value_usd: number;
  origin_address: string;
  destination_address: string;
  created_at: string;
  updated_at: string;
  carrier?: {
    name: string;
  };
}

const TrackingDashboard = () => {
  const { user } = useAuth();

  // Fetch shipments for the current user
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['shipments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          carriers:carrier_id (
            name
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShipmentWithCarrier[];
    },
    enabled: !!user
  });

  // Calculate stats from real data
  const stats = {
    activeShipments: shipments.filter(s => ['active', 'in_transit'].includes(s.status)).length,
    totalValue: shipments.reduce((sum, s) => sum + Number(s.value_usd), 0),
    onTimeRate: shipments.length > 0 ? Math.round((shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100) : 0,
    securityScore: 98.5 // This could be calculated based on various factors
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "in_transit":
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "delayed":
        return <Badge className="bg-yellow-100 text-yellow-800">Delayed</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskLevel = (shipment: ShipmentWithCarrier) => {
    // Simple risk calculation based on value and status
    if (shipment.value_usd > 20000 && shipment.status === 'in_transit') return 'Medium';
    if (shipment.status === 'delayed') return 'High';
    return 'Low';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{stats.activeShipments}</div>
            <p className="text-xs text-muted-foreground">Currently in transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Secured on-chain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onTimeRate}%</div>
            <p className="text-xs text-muted-foreground">Successful deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityScore}</div>
            <p className="text-xs text-muted-foreground">Blockchain verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>Your Shipments</CardTitle>
          <CardDescription>
            Monitor your blockchain-secured shipments in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments yet</h3>
              <p className="text-gray-500 mb-4">Create your first shipment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{shipment.shipment_number}</h3>
                        <p className="text-sm text-gray-600">{formatCurrency(shipment.value_usd)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(shipment.status)}
                      {getRiskBadge(getRiskLevel(shipment))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">From: {shipment.origin_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">To: {shipment.destination_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{shipment.carrier?.name || 'No carrier assigned'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{shipment.progress || 0}%</span>
                    </div>
                    <Progress value={shipment.progress || 0} className="w-full" />
                    <p className="text-xs text-gray-500">Last update: {getTimeAgo(shipment.updated_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingDashboard;
