'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface WorkoutHistoryItem {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: {
    id: string;
    name: string;
    trackingKey: string;
    sets: {
      id: string;
      reps: number;
      formScore?: number;
    }[];
  }[];
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/workouts');
        if (response.ok) {
          const data = await response.json();
          setWorkouts(data.workouts.slice(0, 5)); // Get the 5 most recent workouts
        }
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [session?.user?.id]);

  // Function to get total reps from a workout
  const getTotalReps = (workout: WorkoutHistoryItem): number => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => setTotal + set.reps, 0);
    }, 0);
  };

  // Function to get exercise types as a comma-separated string
  const getExerciseTypes = (workout: WorkoutHistoryItem): string => {
    const exerciseNames = workout.exercises.map(ex => ex.name);
    return exerciseNames.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{workout.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString()} • {Math.round(workout.duration / 60)} min
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {getExerciseTypes(workout)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {getTotalReps(workout)} reps
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-2">
              <Link 
                href="/dashboard/fitness-test" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Workouts →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No workout history found.</p>
            <p className="mt-2">
              <Link 
                href="/dashboard/fitness-test" 
                className="text-blue-600 hover:text-blue-800"
              >
                Try a fitness test to get started!
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
