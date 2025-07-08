
import { Button } from "@/components/ui/button";
import { Shield, Package, Globe, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      // User is already logged in, scroll to dashboard or navigate to a specific section
      const dashboardElement = document.querySelector('[data-section="dashboard"]');
      if (dashboardElement) {
        dashboardElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // User is not logged in, navigate to auth page
      navigate('/auth');
    }
  };

  return (
    <div className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRGMEI0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      {/* User Menu in top right */}
      {user && (
        <div className="absolute top-4 right-4 z-10">
          <UserMenu />
        </div>
      )}
      
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
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleGetStarted}>
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
              const featuresElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
              if (featuresElement) {
                featuresElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
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
