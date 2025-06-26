import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get count of upcoming (CONFIRMED) bookings for the current user
    const upcomingBookingsCount = await prisma.booking.count({
      where: {
        userId,
        status: 'CONFIRMED',
        slot: {
          date: {
            gte: new Date(), // Only future bookings
          },
        },
      },
    });
    
    return NextResponse.json({ count: upcomingBookingsCount });
  } catch (error) {
    console.error('Error fetching booking count:', error);
    return NextResponse.json({ error: 'Failed to fetch booking count' }, { status: 500 });
  }
}
