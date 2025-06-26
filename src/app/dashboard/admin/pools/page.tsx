import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function AdminPoolsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  // Check if user has admin role
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }
  
  // In a real application, we would fetch pools from the database
  interface Pool {
    id: string;
    name: string;
    location: string;
    capacity: number;
    images: string[];
  }
  
  const pools: Pool[] = [
    {
      id: '1',
      name: 'Main Pool',
      location: '123 Pool Street, City',
      capacity: 50,
      images: [],
    },
    {
      id: '2',
      name: 'Training Pool',
      location: '123 Pool Street, City',
      capacity: 30,
      images: [],
    },
    {
      id: '3',
      name: 'Family Pool',
      location: '123 Pool Street, City',
      capacity: 40,
      images: [],
    },
  ];
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pool Management</h1>
        <Button>Add New Pool</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pools.map((pool) => (
          <Card key={pool.id}>
            <CardHeader className="pb-2">
              <CardTitle>{pool.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 aspect-video rounded-md bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Pool Image</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <span className="text-sm">{pool.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Capacity:</span>
                  <span className="text-sm">{pool.capacity} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    Active
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Slots
                </Button>
                <Button variant="danger" size="sm" className="flex-1">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium">Add New Pool</h3>
            <p className="mb-4 text-center text-sm text-gray-500">
              Create a new pool for users to book sessions
            </p>
            <Button>Add Pool</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Pool Management Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-0.5 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Pool Capacity:</strong> Set realistic capacity limits based on pool size and safety regulations.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-0.5 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Images:</strong> Upload high-quality images of the pool to help users make informed decisions.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-0.5 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Slot Management:</strong> Create time slots with appropriate durations and buffer times between sessions.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-0.5 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Caretaker Assignment:</strong> Ensure each pool has caretakers assigned during operational hours.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
