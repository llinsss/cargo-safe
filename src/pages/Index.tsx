
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
import NFTCustodyChain from "@/components/NFTCustodyChain";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-8">
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
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Real-Time Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor your shipments with blockchain-verified checkpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-semibold">Shipment #SP-2024-001</p>
                          <p className="text-sm text-gray-600">High-value electronics</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        In Transit
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">Origin Warehouse - Verified</p>
                          <p className="text-sm text-gray-600">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">Distribution Center - Verified</p>
                          <p className="text-sm text-gray-600">45 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">Final Delivery Hub - Pending</p>
                          <p className="text-sm text-gray-600">Expected in 30 minutes</p>
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={75} className="w-full" />
                    <p className="text-sm text-center text-gray-600">75% Complete</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custody">
            <NFTCustodyChain />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
