import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Star } from "lucide-react";
import BookingModal from "@/components/booking-modal";
import { useState } from "react";
import type { CreatorWithUser } from "@shared/schema";

export default function CreatorProfile() {
  const { id } = useParams();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: creator, isLoading } = useQuery<CreatorWithUser>({
    queryKey: ["/api/creators", id],
    queryFn: () => fetch(`/api/creators/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator Not Found</h1>
          <p className="text-gray-600">The creator you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={creator.user.profileImage || '/default-avatar.png'}
                alt={creator.user.displayName}
                className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
              />
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {creator.user.displayName}
                </h1>
                <p className="text-xl text-farcaster-500 font-medium mb-2">
                  @{creator.user.username}
                </p>
                <p className="text-lg text-gray-600 mb-4">{creator.title}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatPrice(creator.rate)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{creator.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{creator.timezone}</span>
                  </div>
                </div>

                <Badge variant="secondary" className="mb-4">
                  {creator.category}
                </Badge>
                
                <Button 
                  size="lg"
                  onClick={() => setShowBookingModal(true)}
                  className="bg-farcaster-500 hover:bg-farcaster-600"
                >
                  Book Session - {formatPrice(creator.rate)}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              {creator.user.bio}
            </p>
          </CardContent>
        </Card>

        {/* What You'll Get */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll Get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-farcaster-500 rounded-full mt-2"></div>
                <span className="text-gray-600">
                  {creator.duration}-minute one-on-one video call
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-farcaster-500 rounded-full mt-2"></div>
                <span className="text-gray-600">
                  Personalized advice and insights
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-farcaster-500 rounded-full mt-2"></div>
                <span className="text-gray-600">
                  Follow-up resources and recommendations
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-farcaster-500 rounded-full mt-2"></div>
                <span className="text-gray-600">
                  Recording of the session (if requested)
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {showBookingModal && (
        <BookingModal
          creator={creator}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}
