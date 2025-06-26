'use client';

import { format, isSameDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface Slot {
  id: string;
  poolId: string;
  poolName: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  capacity: number;
  bookingsCount?: number;
  trainerId?: string | null;
  trainerName?: string | null;
}

interface AvailableSlotsProps {
  slots: Slot[];
  selectedDate: Date;
  onBookSlot: (slotId: string) => void;
}

export function AvailableSlots({ slots, selectedDate, onBookSlot }: AvailableSlotsProps) {
  // Filter slots for the selected date
  const filteredSlots = slots.filter(slot => 
    isSameDay(new Date(slot.date), selectedDate)
  );

  if (filteredSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No available slots for this date.</p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredSlots.map((slot) => {
        const availableSpots = slot.capacity - (slot.bookingsCount || 0);
        const isFullyBooked = availableSpots <= 0;
        
        return (
          <Card key={slot.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{slot.poolName}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${
                  isFullyBooked 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isFullyBooked ? 'Fully Booked' : 'Available'}
                </span>
              </div>
              
              <p className="text-sm text-gray-500">
                {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
              </p>
              
              {slot.trainerName && (
                <p className="mt-1 text-sm text-gray-500">
                  Trainer: {slot.trainerName}
                </p>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                {isFullyBooked 
                  ? 'No spots available' 
                  : `${availableSpots} ${availableSpots === 1 ? 'spot' : 'spots'} available`
                }
              </p>
              
              <div className="mt-4">
                <Button 
                  size="sm" 
                  disabled={isFullyBooked}
                  onClick={() => onBookSlot(slot.id)}
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
