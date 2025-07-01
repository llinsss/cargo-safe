
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Clock, 
  Shield,
  FileText,
  Plus
} from "lucide-react";

const CreateShipment = () => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    value: "",
    description: "",
    carrier: "",
    deliveryDate: "",
    penaltyClause: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating shipment with data:", formData);
    // Here you would integrate with the smart contract
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="securelog">SecureLogistics Inc.</SelectItem>
                    <SelectItem value="fasttrack">FastTrack Express</SelectItem>
                    <SelectItem value="northwest">NorthWest Freight</SelectItem>
                    <SelectItem value="global">Global Transport Co.</SelectItem>
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
                  required
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
              <Button type="submit" className="flex-1" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Smart Contract
              </Button>
              <Button type="button" variant="outline" size="lg">
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
