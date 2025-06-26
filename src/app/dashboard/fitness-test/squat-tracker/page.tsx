import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import SquatTrackerWrapper from '@/components/fitness-tracker/SquatTrackerWrapper';

export default async function SquatTrackerPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Squat Tracker</h1>
      </div>
      
      <SquatTrackerWrapper />
    </div>
  );
}
