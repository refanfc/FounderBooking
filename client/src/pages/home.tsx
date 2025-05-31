import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CreatorCard from "@/components/creator-card";
import { Search, Rocket, Code, Palette, TrendingUp, Shield, Users, Calendar } from "lucide-react";
import type { CreatorWithUser } from "@shared/schema";

const categories = [
  { id: "founders", name: "Founders", icon: Rocket, color: "bg-farcaster-100 text-farcaster-500" },
  { id: "developers", name: "Developers", icon: Code, color: "bg-blue-100 text-blue-500" },
  { id: "designers", name: "Designers", icon: Palette, color: "bg-green-100 text-green-500" },
  { id: "investors", name: "Investors", icon: TrendingUp, color: "bg-amber-100 text-amber-500" },
];

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Dynamic.xyz integration ensures secure crypto payments with your connected wallet",
    color: "bg-farcaster-100 text-farcaster-500"
  },
  {
    icon: Users,
    title: "Farcaster Native",
    description: "Discover creators through Frames, book directly from your favorite Farcaster client",
    color: "bg-blue-100 text-blue-500"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated booking confirmations, calendar integration, and reminder notifications",
    color: "bg-green-100 text-green-500"
  }
];

export default function Home() {
  const { data: creators = [], isLoading } = useQuery<CreatorWithUser[]>({
    queryKey: ["/api/creators"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-farcaster-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Book Time with Your Favorite <span className="text-farcaster-500">Creators</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect directly with founders, creators, and thought leaders on Farcaster. 
            Schedule paid consultations, mentorship sessions, or casual chats.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-farcaster-500 hover:bg-farcaster-600">
              <Search className="mr-2 h-4 w-4" />
              Discover Creators
            </Button>
            <Button variant="outline" size="lg" className="border-farcaster-500 text-farcaster-500 hover:bg-farcaster-50">
              Become a Creator
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Creators</h2>
            <p className="text-gray-600">Book time with top founders and creators in the Farcaster ecosystem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find creators across different expertise areas</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Available</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Farcaster</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrated with your Farcaster experience, powered by Dynamic.xyz for secure payments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
