'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar } from '@/components/bookings/Calendar';
import { AvailableSlots, Slot } from '@/components/bookings/AvailableSlots';

interface Booking {
  id: string;
  poolName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NOT_ATTENDED';
}

interface BookingWithDetails {
  id: string;
  userId: string;
  slotId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NOT_ATTENDED';
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    pool: {
      id: string;
      name: string;
    };
  };
}

export function BookingsClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshBookings, setRefreshBookings] = useState(0);

  // Fetch available slots when the selected date changes
  useEffect(() => {
    async function fetchSlots() {
      setIsLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/slots?date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch slots');
        }
        
        const data = await response.json();
        setAvailableSlots(data);
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSlots();
  }, [selectedDate]);
  
  // Fetch user bookings
  useEffect(() => {
    async function fetchUserBookings() {
      try {
        const response = await fetch('/api/bookings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data: BookingWithDetails[] = await response.json();
        
        // Transform the data for the frontend
        const formattedBookings = data.map(booking => ({
          id: booking.id,
          poolName: booking.slot.pool.name,
          date: format(new Date(booking.slot.date), 'dd MMM yyyy'),
          startTime: format(new Date(booking.slot.startTime), 'h:mm a'),
          endTime: format(new Date(booking.slot.endTime), 'h:mm a'),
          status: booking.status,
        }));
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    }
    
    fetchUserBookings();
  }, [refreshBookings]); // Refresh when refreshBookings changes
  
  // Handle cancelling a booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setIsBookingLoading(true);
    setBookingError(null);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Refresh the user's bookings by incrementing the refresh counter
      setRefreshBookings(prev => prev + 1);
      
      // Show success message
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to cancel booking');
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to cancel booking'}`);
    } finally {
      setIsBookingLoading(false);
    }
  };
  
  // Handle booking a slot
  const handleBookSlot = async (slotId: string) => {
    setIsBookingLoading(true);
    setBookingError(null);
    
    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to book slot');
      }
      
      // Refresh the available slots
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const slotsResponse = await fetch(`/api/slots?date=${formattedDate}`);
      const slotsData = await slotsResponse.json();
      setAvailableSlots(slotsData);
      
      // Refresh the user's bookings by incrementing the refresh counter
      setRefreshBookings(prev => prev + 1);
      
      // Show success message
      alert('Slot booked successfully!');
    } catch (error) {
      console.error('Error booking slot:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to book slot');
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to book slot'}`);
    } finally {
      setIsBookingLoading(false);
    }
  };
  
  // Filter bookings based on the active filter
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Upcoming') return booking.status === 'CONFIRMED';
    if (activeFilter === 'Completed') return booking.status === 'COMPLETED';
    if (activeFilter === 'Cancelled') return booking.status === 'CANCELLED';
    return true;
  });
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <div className="flex items-center gap-4">
          {isBookingLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          {bookingError && (
            <div className="text-red-500 text-sm">{bookingError}</div>
          )}
          <Button>Book New Session</Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(filter => (
            <Button 
              key={filter}
              variant={activeFilter === filter ? 'primary' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{booking.poolName}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${
                  booking.status === 'CONFIRMED' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : booking.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {booking.date}
              </p>
              <p className="text-sm text-gray-500">
                {booking.startTime} - {booking.endTime}
              </p>
              {booking.status === 'CONFIRMED' && (
                <div className="mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium">No bookings found</h3>
              <p className="mb-4 text-center text-gray-500">
                You haven&apos;t made any bookings yet. Book a pool session to get started.
              </p>
              <Button>Book a Session</Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Available Slots</h2>
        
        {/* Calendar component for date selection */}
        <Calendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
        />
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AvailableSlots 
            slots={availableSlots} 
            selectedDate={selectedDate}
            onBookSlot={handleBookSlot}
          />
        )}
      </div>
    </div>
  );
}
