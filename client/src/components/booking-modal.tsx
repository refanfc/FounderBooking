import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CalendarPicker from "./calendar-picker";
import type { CreatorWithUser, TimeSlot } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingModalProps {
  creator: CreatorWithUser;
  isOpen: boolean;
  onClose: () => void;
}

function BookingForm({ creator, onClose }: { creator: CreatorWithUser; onClose: () => void }) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const { toast } = useToast();
  const { isAuthenticated, user } = useDynamicContext();
  const stripe = useStripe();
  const elements = useElements();

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
      if (paymentMethod === "card" && stripe && elements) {
        handleStripePayment(booking.id);
      } else {
        // Handle crypto payment or complete booking
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully!",
        });
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStripePayment = async (bookingId: number) => {
    if (!stripe || !elements) return;

    try {
      // Create payment intent
      const paymentResponse = await apiRequest("POST", "/api/create-payment-intent", {
        amount: creator.rate,
        bookingId,
      });
      const { clientSecret } = await paymentResponse.json();

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
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
      message,
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
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-3 p-3 border-2 border-farcaster-500 bg-farcaster-50 rounded-lg">
              <RadioGroupItem value="crypto" id="crypto" />
              <Label htmlFor="crypto" className="flex items-center space-x-2 cursor-pointer">
                <span>💰</span>
                <span className="font-medium">Crypto Wallet</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                <span>💳</span>
                <span>Credit Card</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Element for Stripe */}
        {paymentMethod === "card" && (
          <div className="mb-6">
            <PaymentElement />
          </div>
        )}
        
        {/* Book Button */}
        <Button 
          onClick={handleBooking}
          disabled={!selectedTimeSlot || createBookingMutation.isPending}
          className="w-full bg-farcaster-500 hover:bg-farcaster-600"
        >
          {createBookingMutation.isPending ? (
            "Processing..."
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
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Initialize Stripe payment element
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: creator.rate 
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch(console.error);
    }
  }, [isOpen, creator.rate]);

  if (!isOpen) return null;

  const stripeOptions = clientSecret ? { clientSecret } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Book with {creator.user.displayName}
          </DialogTitle>
        </DialogHeader>
        
        {stripeOptions ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <BookingForm creator={creator} onClose={onClose} />
          </Elements>
        ) : (
          <BookingForm creator={creator} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
