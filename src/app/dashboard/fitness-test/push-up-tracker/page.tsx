import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import PushUpTracker from '@/components/fitness-tracker/PushUpTracker';

export default async function PushUpTrackerPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Push-Up Tracker</h1>
      </div>
      
      <PushUpTracker />
    </div>
  );
}
