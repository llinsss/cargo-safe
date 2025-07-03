
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Loader2,
  Package
} from "lucide-react";

interface TrackingEvent {
  id: string;
  event_type: string;
  description: string;
  location: string | null;
  created_at: string;
}

interface ShipmentDetails {
  id: string;
  shipment_number: string;
  status: string;
  progress: number;
  origin_address: string;
  destination_address: string;
  description: string;
  value_usd: number;
  tracking_events: TrackingEvent[];
  carriers?: {
    name: string;
  };
}

const ShipmentTracking = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);

  // Fetch user's shipments for search
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['user-shipments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('shipments')
        .select('id, shipment_number, status')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch detailed shipment info when one is selected
  const { data: shipmentDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['shipment-details', selectedShipment],
    queryFn: async () => {
      if (!selectedShipment) return null;
      
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          carriers:carrier_id (name),
          tracking_events (
            id,
            event_type,
            description,
            location,
            created_at
          )
        `)
        .eq('id', selectedShipment)
        .single();

      if (error) throw error;
      return data as ShipmentDetails;
    },
    enabled: !!selectedShipment
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Find shipment by number
    const shipment = shipments.find(s => 
      s.shipment_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (shipment) {
      setSelectedShipment(shipment.id);
    }
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

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "shipment_created":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "picked_up":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_transit":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "delayed":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Track Your Shipment
          </CardTitle>
          <CardDescription>
            Enter your shipment number to view real-time tracking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter shipment number (e.g., SP-2024-001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {shipments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Your recent shipments:</p>
              <div className="flex flex-wrap gap-2">
                {shipments.slice(0, 5).map((shipment) => (
                  <Button
                    key={shipment.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedShipment(shipment.id)}
                    className="text-xs"
                  >
                    {shipment.shipment_number}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipment Details */}
      {selectedShipment && (
        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading shipment details...</span>
              </div>
            ) : shipmentDetails ? (
              <div className="space-y-6">
                {/* Shipment Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">{shipmentDetails.shipment_number}</h3>
                    <p className="text-gray-600">{shipmentDetails.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Value: {formatCurrency(shipmentDetails.value_usd)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(shipmentDetails.status)}
                    <div className="text-right">
                      <p className="text-sm font-medium">{shipmentDetails.progress || 0}% Complete</p>
                      <Progress value={shipmentDetails.progress || 0} className="w-24 mt-1" />
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Origin</p>
                      <p className="text-sm text-gray-600">{shipmentDetails.origin_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Destination</p>
                      <p className="text-sm text-gray-600">{shipmentDetails.destination_address}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div>
                  <h4 className="font-semibold mb-4">Tracking Timeline</h4>
                  {shipmentDetails.tracking_events && shipmentDetails.tracking_events.length > 0 ? (
                    <div className="space-y-4">
                      {shipmentDetails.tracking_events
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((event, index) => (
                        <div key={event.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                          {getEventIcon(event.event_type)}
                          <div className="flex-1">
                            <p className="font-medium">{event.description}</p>
                            {event.location && (
                              <p className="text-sm text-gray-600">Location: {event.location}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{formatDate(event.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No tracking events available yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Shipment not found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShipmentTracking;
