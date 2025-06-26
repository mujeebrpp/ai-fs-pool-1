'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import FitnessTracker from './FitnessTracker';

export default function FitnessTrackerClient() {
  const [showTracker, setShowTracker] = useState(false);
  
  if (showTracker) {
    return <FitnessTracker />;
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">AI-Powered Fitness Tracker</h2>
            <p className="mb-4 text-gray-600">
              Our advanced fitness tracker uses computer vision to analyze your movements in real-time, providing form feedback and accurate rep counting.
            </p>
            <ul className="mb-6 space-y-2 text-gray-600">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Real-time pose detection and form feedback
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Beginner and expert workout programs
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Automatic rep counting and set tracking
              </li>
            </ul>
            <Button className="w-full" onClick={() => setShowTracker(true)}>Start Workout</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">How It Works</h2>
            <ol className="mb-4 list-decimal space-y-4 pl-5 text-gray-600">
              <li>
                <strong>Choose your level:</strong> Select from beginner or expert workout programs.
              </li>
              <li>
                <strong>Select a workout:</strong> Pick from various workout types targeting different fitness goals.
              </li>
              <li>
                <strong>Follow along:</strong> The system guides you through each exercise with real-time feedback.
              </li>
              <li>
                <strong>Track progress:</strong> Review your performance and see improvements over time.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Specialized Trackers</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Push-Up Tracker</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Dedicated tracker for push-ups with real-time form feedback and rep counting.
                </p>
                <Link href="/dashboard/fitness-test/push-up-tracker" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Try Push-Up Tracker →
                </Link>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Squat Tracker</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Track squats with real-time form feedback on depth and knee alignment.
                </p>
                <Link href="/dashboard/fitness-test/squat-tracker" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Try Squat Tracker →
                </Link>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Hand Rotation Tracker</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Track wrist rotations to improve mobility and strengthen forearm muscles.
                </p>
                <Link href="/dashboard/fitness-test/hand-rotation-tracker" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Try Hand Rotation Tracker →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Featured Workouts</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Beginner: Foundational Strength Circuit</h3>
                <p className="text-sm text-gray-600 mb-2">A full-body workout focusing on fundamental movement patterns.</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>30 minutes</span>
                  <span>3 exercises</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Expert: Hypertrophy Split</h3>
                <p className="text-sm text-gray-600 mb-2">A high-volume workout designed to maximize muscle growth.</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>45 minutes</span>
                  <span>3 exercises</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Benefits</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-1 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Improved Form:</strong> Real-time feedback helps correct exercise technique.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-1 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Structured Progression:</strong> Follow proven workout programs for optimal results.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-1 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Injury Prevention:</strong> Form feedback helps reduce risk of exercise-related injuries.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 mt-1 h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Motivation:</strong> Track your progress and see improvements over time.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
