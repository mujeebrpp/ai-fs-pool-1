import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { Slot, Pool, Trainer, User } from '@prisma/client';

interface SlotWithRelations extends Slot {
  pool: Pool;
  trainer: (Trainer & { user: User }) | null;
  bookings: { id: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { slotId } = await request.json();
    
    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }
    
    // Check if the slot exists and has available capacity
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        bookings: true,
      },
    });
    
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    
    // Check if the user has already booked this slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        slotId,
      },
    });
    
    if (existingBooking) {
      return NextResponse.json({ error: 'You have already booked this slot' }, { status: 400 });
    }
    
    // Check if the slot is fully booked
    if (slot.bookings.length >= slot.capacity) {
      return NextResponse.json({ error: 'This slot is fully booked' }, { status: 400 });
    }
    
    // Create a new booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        slotId,
        status: 'CONFIRMED',
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Slot booked successfully',
      booking 
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    return NextResponse.json({ error: 'Failed to book slot' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get date from query params or use today
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    let date: Date;
    if (dateParam) {
      date = new Date(dateParam);
    } else {
      date = new Date();
    }
    
    // Format date to match database format (YYYY-MM-DD)
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Get slots for the specified date
    const slots = await prisma.slot.findMany({
      where: {
        date: {
          gte: new Date(`${formattedDate}T00:00:00`),
          lt: new Date(`${formattedDate}T23:59:59`),
        },
      },
      include: {
        pool: true,
        trainer: {
          include: {
            user: true,
          },
        },
        bookings: {
          select: {
            id: true,
          },
        },
      },
    });
    
    // Transform the data for the frontend
    const formattedSlots = slots.map((slot: SlotWithRelations) => ({
      id: slot.id,
      poolId: slot.poolId,
      poolName: slot.pool.name,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookingsCount: slot.bookings.length,
      trainerId: slot.trainerId,
      trainerName: slot.trainer?.user.name || null,
    }));
    
    // If no slots found, add mock data for demonstration
    if (formattedSlots.length === 0) {
      // Use the date from the request
      const mockDate = date;
      const formattedMockDate = format(mockDate, 'dd-MM-yyyy');
      
      // Create morning slot
      const morningStart = new Date(mockDate);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(mockDate);
      morningEnd.setHours(10, 0, 0, 0);
      
      // Create afternoon slot
      const afternoonStart = new Date(mockDate);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(mockDate);
      afternoonEnd.setHours(15, 0, 0, 0);
      
      // Create evening slot
      const eveningStart = new Date(mockDate);
      eveningStart.setHours(18, 0, 0, 0);
      const eveningEnd = new Date(mockDate);
      eveningEnd.setHours(19, 0, 0, 0);
      
      const mockSlots = [
        {
          id: `main-${formattedMockDate}-0900`,
          poolId: 'pool1',
          poolName: 'Main Pool',
          date: mockDate,
          startTime: morningStart,
          endTime: morningEnd,
          capacity: 10,
          bookingsCount: 3,
          trainerId: 'trainer1',
          trainerName: 'John Doe',
        },
        {
          id: `training-${formattedMockDate}-1400`,
          poolId: 'pool2',
          poolName: 'Training Pool',
          date: mockDate,
          startTime: afternoonStart,
          endTime: afternoonEnd,
          capacity: 8,
          bookingsCount: 8, // Fully booked
          trainerId: 'trainer2',
          trainerName: 'Jane Smith',
        },
        {
          id: `family-${formattedMockDate}-1800`,
          poolId: 'pool3',
          poolName: 'Family Pool',
          date: mockDate,
          startTime: eveningStart,
          endTime: eveningEnd,
          capacity: 12,
          bookingsCount: 5,
          trainerId: null,
          trainerName: null,
        },
      ];
      
      return NextResponse.json(mockSlots);
    }
    
    return NextResponse.json(formattedSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
