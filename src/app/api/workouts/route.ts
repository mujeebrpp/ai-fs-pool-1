import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { workoutId, workoutName, type, duration, exercises } = data;
    
    if (!workoutId || !workoutName || !type || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json({ error: 'Invalid workout data' }, { status: 400 });
    }
    
    // Create workout record
    const workout = await prisma.workout.create({
      data: {
        name: workoutName,
        type,
        duration,
        userId: session.user.id,
        exercises: {
          create: exercises.map(exercise => ({
            name: exercise.exercise,
            trackingKey: exercise.exercise.toLowerCase().replace(/\s+/g, ''),
            sets: {
              create: {
                reps: exercise.actualCount,
                formScore: exercise.formScore
              }
            }
          }))
        }
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });
    
    return NextResponse.json({ success: true, workout });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's workouts
    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}
