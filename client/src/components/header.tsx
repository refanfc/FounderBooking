import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, Wallet } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Header() {
  const [location] = useLocation();
  const { setShowAuthFlow, isAuthenticated, user, handleLogOut } = useDynamicContext();

  const navigation = [
    { name: "Discover", href: "/" },
    { name: "My Bookings", href: "/my-bookings" },
    { name: "Become Creator", href: "/become-creator" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-farcaster-500" />
              <h1 className="text-xl font-bold text-gray-900">FarBook</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`font-medium transition-colors ${
                    location === item.href 
                      ? "text-farcaster-500" 
                      : "text-gray-700 hover:text-farcaster-500"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button 
                onClick={() => setShowAuthFlow(true)}
                className="bg-dynamic-500 hover:bg-dynamic-600 text-white"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                {user?.avatar && (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="hidden sm:block text-gray-700 font-medium">
                  {user?.username || "User"}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogOut}
                >
                  Disconnect
                </Button>
              </div>
            )}
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
