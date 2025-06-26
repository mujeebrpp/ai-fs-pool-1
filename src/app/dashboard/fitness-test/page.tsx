import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import FitnessTrackerClient from '@/components/fitness-tracker/FitnessTrackerClient';
import WeeklyWorkoutPlan from '@/components/fitness-tracker/WeeklyWorkoutPlan';

export default async function FitnessTestPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fitness Test</h1>
      </div>
      
      <WeeklyWorkoutPlan />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Fitness Trackers</h2>
        <FitnessTrackerClient />
      </div>
    </div>
  );
}
