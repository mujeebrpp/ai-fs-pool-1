'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function UpcomingBookingsCount() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookingCount() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/bookings/count');
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking count');
        }
        
        const data = await response.json();
        setCount(data.count);
      } catch (error) {
        console.error('Error fetching booking count:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBookingCount();
  }, []);

  const handleViewAll = () => {
    router.push('/dashboard/bookings');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <p className="text-3xl font-bold">{count}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleViewAll}>View All</Button>
      </CardFooter>
    </Card>
  );
}
