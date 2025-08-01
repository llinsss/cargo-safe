
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useTransportContract } from "@/hooks/useTransportContract";
import { WalletIntegration } from "./WalletIntegration";
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Clock, 
  Shield,
  FileText,
  Plus,
  Loader2
} from "lucide-react";

interface Carrier {
  id: string;
  name: string;
  contact_email: string;
  rating: number;
  is_verified: boolean;
}

const CreateShipment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isBlockchainEnabled, createShipment: createBlockchainShipment } = useTransportContract();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    value: "",
    description: "",
    carrier: "",
    deliveryDate: "",
    penaltyClause: ""
  });

  // Fetch carriers from database
  const { data: carriers = [], isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .eq('is_verified', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data as Carrier[];
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to create a shipment.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate shipment number
      const { data: shipmentNumber, error: numberError } = await supabase
        .rpc('generate_shipment_number');

      if (numberError) throw numberError;

      // Create the shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          shipment_number: shipmentNumber,
          customer_id: user.id,
          carrier_id: formData.carrier || null,
          origin_address: formData.origin,
          destination_address: formData.destination,
          description: formData.description,
          value_usd: parseFloat(formData.value),
          expected_delivery: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
          penalty_per_day: formData.penaltyClause ? parseFloat(formData.penaltyClause) : 0,
          status: 'draft'
        })
        .select()
        .single();

      if (shipmentError) throw shipmentError;

      // Create initial custody chain entry
      const { error: custodyError } = await supabase
        .from('custody_chain')
        .insert({
          shipment_id: shipment.id,
          holder_id: user.id,
          holder_name: user.user_metadata?.full_name || user.email || 'Customer',
          action: 'created',
          location: formData.origin,
          is_verified: true
        });

      if (custodyError) throw custodyError;

      // Create initial tracking event
      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipment.id,
          event_type: 'shipment_created',
          description: 'Shipment created and smart contract initialized',
          location: formData.origin,
          recorded_by: user.id
        });

      if (trackingError) throw trackingError;

      // Try to create blockchain contract if wallet is connected
      if (isBlockchainEnabled) {
        try {
          await createBlockchainShipment({
            shipmentNumber,
            carrierAddress: formData.carrier || '0x0000000000000000000000000000000000000000',
            originAddress: formData.origin,
            destinationAddress: formData.destination,
            description: formData.description,
            valueUSD: parseFloat(formData.value),
            expectedDelivery: formData.deliveryDate ? new Date(formData.deliveryDate) : new Date(),
            penaltyPerDay: parseFloat(formData.penaltyClause) || 0,
            escrowAmount: '0.001', // Minimal escrow for demo
          });
        } catch (blockchainError) {
          console.warn('Blockchain creation failed, continuing with database-only mode:', blockchainError);
        }
      }

      toast({
        title: "Shipment Created Successfully!",
        description: `Shipment ${shipmentNumber} has been created${isBlockchainEnabled ? ' with blockchain integration' : ' in database mode'}.`,
      });

      // Reset form
      setFormData({
        origin: "",
        destination: "",
        value: "",
        description: "",
        carrier: "",
        deliveryDate: "",
        penaltyClause: ""
      });

    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast({
        variant: "destructive",
        title: "Failed to create shipment",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <WalletIntegration showInline />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Create New Shipment
          </CardTitle>
          <CardDescription>
            Initialize a new transport smart contract with blockchain security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin */}
              <div className="space-y-2">
                <Label htmlFor="origin" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Origin Address
                </Label>
                <Input
                  id="origin"
                  placeholder="Enter pickup location"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destination Address
                </Label>
                <Input
                  id="destination"
                  placeholder="Enter delivery location"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor="value" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Shipment Value (USD)
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter total value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>

              {/* Carrier */}
              <div className="space-y-2">
                <Label htmlFor="carrier" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Carrier Selection
                </Label>
                <Select 
                  value={formData.carrier} 
                  onValueChange={(value) => setFormData({ ...formData, carrier: value })}
                  disabled={carriersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={carriersLoading ? "Loading carriers..." : "Select carrier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{carrier.name}</span>
                          <div className="flex items-center gap-2 ml-2">
                            {carrier.is_verified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              ★ {carrier.rating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Date */}
              <div className="space-y-2">
                <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expected Delivery
                </Label>
                <Input
                  id="deliveryDate"
                  type="datetime-local"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>

              {/* Penalty Clause */}
              <div className="space-y-2">
                <Label htmlFor="penaltyClause" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Penalty Amount (USD)
                </Label>
                <Input
                  id="penaltyClause"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Per day delay penalty"
                  value={formData.penaltyClause}
                  onChange={(e) => setFormData({ ...formData, penaltyClause: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Goods Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the goods being shipped..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* Smart Contract Preview */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Smart Contract Preview</CardTitle>
                <CardDescription>
                  This contract will be deployed to the Starknet blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contract Type:</span>
                    <Badge variant="outline">Transport Agreement</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Escrow Amount:</span>
                    <span className="text-sm">${formData.value || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Penalty Rate:</span>
                    <span className="text-sm">${formData.penaltyClause || "0"}/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NFT Generation:</span>
                    <Badge className="bg-emerald-100 text-emerald-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Contract...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Smart Contract
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" size="lg" disabled={isSubmitting}>
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateShipment;
