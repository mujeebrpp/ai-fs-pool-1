import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { BookingsClient } from '@/components/bookings/BookingsClient';

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <BookingsClient />;
}
