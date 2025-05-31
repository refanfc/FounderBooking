import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import CalendarPicker from "./calendar-picker";
import type { CreatorWithUser, TimeSlot } from "@shared/schema";

interface BookingModalProps {
  creator: CreatorWithUser;
  isOpen: boolean;
  onClose: () => void;
}

function BookingForm({ creator, onClose }: { creator: CreatorWithUser; onClose: () => void }) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user, primaryWallet } = useDynamicContext();

  const { data: timeSlots = [] } = useQuery<TimeSlot[]>({
    queryKey: ["/api/creators", creator.id, "timeslots"],
    queryFn: () => apiRequest("GET", `/api/creators/${creator.id}/timeslots`).then(res => res.json()),
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (booking) => {
      handleCryptoPayment(booking.id);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCryptoPayment = async (bookingId: number) => {
    if (!primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to complete payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Convert price from cents to ETH (simplified conversion)
      const amountInEth = (creator.rate / 100) / 2000; // Rough ETH conversion
      const amountInWei = (amountInEth * 1e18).toString();

      // In a real implementation, you would:
      // 1. Get the creator's wallet address
      // 2. Send payment to their address
      // 3. Wait for transaction confirmation
      
      // For demo purposes, we'll simulate a transaction
      const simulatedTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      
      // Confirm payment on backend
      await apiRequest("POST", "/api/confirm-crypto-payment", {
        bookingId,
        transactionHash: simulatedTxHash,
        walletAddress: primaryWallet.address,
      });

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed! You'll receive a confirmation email shortly.",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBooking = () => {
    if (!primaryWallet) {
      toast({
        title: "Please Connect Wallet",
        description: "You need to connect your wallet to make a booking.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Select Time Slot",
        description: "Please select an available time slot.",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      userId: 1, // This should come from authenticated user
      creatorId: creator.id,
      timeSlotId: selectedTimeSlot.id,
      message: message || null,
      totalAmount: creator.rate,
      status: "pending",
    });
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Calendar and Time Slots */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h4>
        <CalendarPicker
          timeSlots={timeSlots}
          selectedTimeSlot={selectedTimeSlot}
          onSelectTimeSlot={setSelectedTimeSlot}
        />
      </div>

      {/* Booking Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
        
        {/* Session Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={creator.user.profileImage || '/default-avatar.png'} 
              alt={creator.user.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-medium text-gray-900">{creator.user.displayName}</div>
              <div className="text-sm text-gray-600">{creator.title}</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {selectedTimeSlot && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{formatDateTime(selectedTimeSlot.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{creator.duration} minutes</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-900 font-medium">Total:</span>
              <span className="font-bold text-lg">{formatPrice(creator.rate)}</span>
            </div>
          </div>
        </div>
        
        {/* Message */}
        <div className="mb-6">
          <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2">
            Your Message (Optional)
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Let ${creator.user.displayName} know what you'd like to discuss...`}
            rows={3}
          />
        </div>
        
        {/* Payment Method */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3">Payment Method</Label>
          <div className="p-4 border-2 border-farcaster-500 bg-farcaster-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-medium text-farcaster-700">Crypto Wallet Payment</div>
                <div className="text-sm text-farcaster-600">Pay securely with your connected wallet</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Book Button */}
        <Button 
          onClick={handleBooking}
          disabled={!selectedTimeSlot || createBookingMutation.isPending || isProcessingPayment}
          className="w-full bg-farcaster-500 hover:bg-farcaster-600"
        >
          {isProcessingPayment ? (
            "Processing Payment..."
          ) : createBookingMutation.isPending ? (
            "Creating Booking..."
          ) : (
            `Confirm & Pay ${formatPrice(creator.rate)}`
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Secure payment powered by Dynamic.xyz. Your booking will be confirmed instantly.
        </p>
      </div>
    </div>
  );
}

export default function BookingModal({ creator, isOpen, onClose }: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Book with {creator.user.displayName}
          </DialogTitle>
        </DialogHeader>
        
        <BookingForm creator={creator} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
