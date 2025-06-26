import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import HandRotationTracker from '@/components/fitness-tracker/HandRotationTracker';

export default async function HandRotationTrackerPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hand Rotation Tracker</h1>
      </div>
      
      <HandRotationTracker />
    </div>
  );
}
