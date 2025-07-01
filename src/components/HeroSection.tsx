
import { Button } from "@/components/ui/button";
import { Shield, Package, Globe, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Blockchain-Secured Transport</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            SuiSecureTrack
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Decentralized Goods Transport & Security Protocol
          </p>
          
          <p className="text-lg mb-8 text-blue-200 max-w-2xl mx-auto">
            Secure, transparent, and tamper-proof logistics powered by blockchain technology. 
            Track, verify, and protect your shipments with smart contracts and NFT-based custody chains.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Start Tracking
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Package className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold mb-2">Smart Contracts</h3>
              <p className="text-sm text-blue-200 text-center">Automated transport agreements with built-in penalties</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Shield className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold mb-2">NFT Custody</h3>
              <p className="text-sm text-blue-200 text-center">Immutable proof of ownership and transfer</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Globe className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-sm text-blue-200 text-center">Blockchain-verified checkpoints and milestones</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Zap className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold mb-2">Dispute Resolution</h3>
              <p className="text-sm text-blue-200 text-center">Decentralized arbitration and penalty enforcement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
