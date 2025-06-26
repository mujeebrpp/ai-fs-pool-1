import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import WorkoutHistoryWrapper from '@/components/dashboard/WorkoutHistoryWrapper';
import UpcomingBookingsCount from '@/components/dashboard/UpcomingBookingsCount';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>
          <span className="mr-4">Welcome, {session.user.name || 'User'}</span>
          <form action="/api/auth/signout" method="post">
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Stats</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <UpcomingBookingsCount />
          
          <Card>
            <CardHeader>
              <CardTitle>Fitness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">N/A</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Take Test</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Manage Family</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Button className="h-24">Book a Pool Session</Button>
          <Button className="h-24" variant="secondary">Take Fitness Test</Button>
          <Button className="h-24" variant="secondary">Manage Family</Button>
          <Button className="h-24" variant="secondary">View Schedule</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p>No recent activity to display.</p>
                <p className="mt-2">Start by booking a pool session or taking a fitness test!</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="mb-4 text-xl font-semibold">Workout History</h2>
          <WorkoutHistoryWrapper />
        </div>
      </div>
    </div>
  );
}
