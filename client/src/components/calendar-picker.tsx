import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TimeSlot } from "@shared/schema";

interface CalendarPickerProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
}

export default function CalendarPicker({ timeSlots, selectedTimeSlot, onSelectTimeSlot }: CalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Group time slots by date
  const timeSlotsByDate = timeSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Get next 7 days with available slots
  const availableDates = Object.keys(timeSlotsByDate)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, 7);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const selectedDateSlots = timeSlotsByDate[selectedDate.toDateString()] || [];

  return (
    <div>
      {/* Date Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h5 className="text-lg font-medium text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h5>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Date Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {availableDates.map((date) => (
            <Button
              key={date.toDateString()}
              variant={selectedDate.toDateString() === date.toDateString() ? "default" : "outline"}
              className={`p-3 text-center ${
                selectedDate.toDateString() === date.toDateString()
                  ? "border-2 border-farcaster-500 bg-farcaster-50 text-farcaster-600"
                  : "border border-gray-200 hover:border-farcaster-500 hover:bg-farcaster-50"
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-sm text-gray-500">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="font-medium">
                {date.getDate()}
              </div>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Time Slots */}
      <div>
        <h6 className="font-medium text-gray-900 mb-3">
          {formatDate(selectedDate)}
        </h6>
        
        {selectedDateSlots.length === 0 ? (
          <p className="text-gray-500 text-sm">No available slots for this date</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {selectedDateSlots.map((slot) => (
              <Button
                key={slot.id}
                variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                className={`p-3 text-sm text-center ${
                  selectedTimeSlot?.id === slot.id
                    ? "border-2 border-farcaster-500 bg-farcaster-50 text-farcaster-600"
                    : "border border-gray-200 hover:border-farcaster-500 hover:bg-farcaster-50"
                }`}
                onClick={() => onSelectTimeSlot(slot)}
              >
                {formatTime(slot.startTime)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
