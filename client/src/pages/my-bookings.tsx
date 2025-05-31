import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MessageSquare } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { BookingWithDetails } from "@shared/schema";

export default function MyBookings() {
  const { isAuthenticated, user } = useDynamicContext();
  
  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings/user", 1], // This should use actual user ID
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to view your bookings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your upcoming and past sessions</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't booked any sessions yet. Discover amazing creators and book your first session!
              </p>
              <Button className="bg-farcaster-500 hover:bg-farcaster-600">
                Discover Creators
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Creator Info */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={booking.creator.user.profileImage || '/default-avatar.png'}
                        alt={booking.creator.user.displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.creator.user.displayName}
                        </h3>
                        <p className="text-farcaster-500 font-medium">
                          @{booking.creator.user.username}
                        </p>
                        <p className="text-gray-600 text-sm">{booking.creator.title}</p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(booking.totalAmount)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(booking.timeSlot.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{booking.creator.duration} minutes</span>
                        </div>
                        {booking.message && (
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 mt-0.5" />
                            <span className="italic">"{booking.message}"</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 mt-4">
                        {booking.status === "confirmed" && (
                          <Button size="sm" className="bg-farcaster-500 hover:bg-farcaster-600">
                            <Video className="h-4 w-4 mr-2" />
                            Join Call
                          </Button>
                        )}
                        {booking.status === "pending" && (
                          <Button variant="outline" size="sm">
                            Cancel Booking
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
