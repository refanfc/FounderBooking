import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import BookingModal from "./booking-modal";
import type { CreatorWithUser } from "@shared/schema";

interface CreatorCardProps {
  creator: CreatorWithUser;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <img 
              src={creator.user.profileImage || '/default-avatar.png'} 
              alt={creator.user.displayName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {creator.user.displayName}
              </h3>
              <p className="text-farcaster-500 font-medium">
                @{creator.user.username}
              </p>
              <p className="text-gray-600 text-sm">{creator.title}</p>
            </div>
          </div>
          
          <p className="text-gray-600 mt-4 text-sm leading-relaxed line-clamp-3">
            {creator.user.bio}
          </p>
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(creator.rate)}
              </span>
              <span className="text-gray-500">/{creator.duration}min</span>
            </div>
            <Button 
              onClick={() => setShowBookingModal(true)}
              className="bg-farcaster-500 hover:bg-farcaster-600"
            >
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {showBookingModal && (
        <BookingModal
          creator={creator}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
