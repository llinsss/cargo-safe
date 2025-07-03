
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeTracking } from "@/hooks/useRealtimeTracking";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  MapPin, 
  Plus, 
  Truck, 
  CheckCircle, 
  Clock,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";

interface ShipmentWithDetails {
  id: string;
  shipment_number: string;
  status: string;
  progress: number;
  origin_address: string;
  destination_address: string;
  description: string;
  value_usd: number;
  customer: {
    full_name: string;
    email: string;
  };
}

const CarrierDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useRealtimeTracking();
  
  const [selectedShipment, setSelectedShipment] = useState<string>("");
  const [newEvent, setNewEvent] = useState({
    event_type: "",
    description: "",
    location: ""
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    progress: 0
  });

  // Fetch shipments assigned to this carrier
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['carrier-shipments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the carrier record for this user
      const { data: carrier } = await supabase
        .from('carriers')
        .select('id')
        .eq('contact_email', user.email)
        .single();

      if (!carrier) return [];

      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email
          )
        `)
        .eq('carrier_id', carrier.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShipmentWithDetails[];
    },
    enabled: !!user
  });

  // Add tracking event mutation
  const addTrackingEventMutation = useMutation({
    mutationFn: async (eventData: typeof newEvent) => {
      const { data, error } = await supabase
        .from('tracking_events')
        .insert({
          shipment_id: selectedShipment,
          event_type: eventData.event_type,
          description: eventData.description,
          location: eventData.location || null,
          recorded_by: user?.id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Tracking event added",
        description: "The tracking event has been successfully recorded.",
      });
      setNewEvent({ event_type: "", description: "", location: "" });
      queryClient.invalidateQueries({ queryKey: ['carrier-shipments'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add tracking event. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding tracking event:', error);
    }
  });

  // Update shipment status mutation
  const updateShipmentMutation = useMutation({
    mutationFn: async (updateData: typeof statusUpdate) => {
      const { data, error } = await supabase
        .from('shipments')
        .update({
          status: updateData.status,
          progress: updateData.progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedShipment);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Shipment updated",
        description: "The shipment status has been successfully updated.",
      });
      setStatusUpdate({ status: "", progress: 0 });
      queryClient.invalidateQueries({ queryKey: ['carrier-shipments'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update shipment. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating shipment:', error);
    }
  });

  const handleAddTrackingEvent = () => {
    if (!selectedShipment || !newEvent.event_type || !newEvent.description) {
      toast({
        title: "Missing information",
        description: "Please select a shipment and fill in the required fields.",
        variant: "destructive",
      });
      return;
    }
    addTrackingEventMutation.mutate(newEvent);
  };

  const handleUpdateStatus = () => {
    if (!selectedShipment || !statusUpdate.status) {
      toast({
        title: "Missing information",
        description: "Please select a shipment and status.",
        variant: "destructive",
      });
      return;
    }
    updateShipmentMutation.mutate(statusUpdate);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading your shipments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Live updates active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Connecting to live updates...</span>
            </>
          )}
        </div>
      </div>

      {/* Assigned Shipments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Your Assigned Shipments
          </CardTitle>
          <CardDescription>
            Manage and update the shipments assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned shipments</h3>
              <p className="text-gray-500">You don't have any shipments assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div 
                  key={shipment.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedShipment === shipment.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedShipment(shipment.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{shipment.shipment_number}</h3>
                        <p className="text-sm text-gray-600">Customer: {shipment.customer?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(shipment.status)}
                      <span className="text-sm text-gray-600">{formatCurrency(shipment.value_usd)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>From: {shipment.origin_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>To: {shipment.destination_address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Shipment Status */}
      {selectedShipment && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Update Shipment Status
              </CardTitle>
              <CardDescription>
                Update the current status and progress of the selected shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={statusUpdate.progress}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter progress percentage"
                />
              </div>

              <Button 
                onClick={handleUpdateStatus} 
                disabled={updateShipmentMutation.isPending}
                className="w-full"
              >
                {updateShipmentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add Tracking Event
              </CardTitle>
              <CardDescription>
                Record a new tracking milestone for the selected shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event_type">Event Type</Label>
                <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, event_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="checkpoint_passed">Checkpoint Passed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what happened..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Current location or checkpoint"
                />
              </div>

              <Button 
                onClick={handleAddTrackingEvent} 
                disabled={addTrackingEventMutation.isPending}
                className="w-full"
              >
                {addTrackingEventMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tracking Event
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CarrierDashboard;
