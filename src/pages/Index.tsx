
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Shield, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  FileText,
  Users,
  Zap,
  Lock,
  Globe
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import TrackingDashboard from "@/components/TrackingDashboard";
import CreateShipment from "@/components/CreateShipment";
import ShipmentTracking from "@/components/ShipmentTracking";
import NFTCustodyChain from "@/components/NFTCustodyChain";
import ProtectedRoute from "@/components/ProtectedRoute";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeroSection />
      
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8" data-section="dashboard">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Create Shipment
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Track Goods
              </TabsTrigger>
              <TabsTrigger value="custody" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Custody Chain
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <TrackingDashboard />
            </TabsContent>

            <TabsContent value="create">
              <CreateShipment />
            </TabsContent>

            <TabsContent value="tracking">
              <ShipmentTracking />
            </TabsContent>

            <TabsContent value="custody">
              <NFTCustodyChain />
            </TabsContent>
          </Tabs>
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default Index;
