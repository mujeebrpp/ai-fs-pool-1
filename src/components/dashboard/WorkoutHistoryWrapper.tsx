'use client';

import { SessionProvider } from 'next-auth/react';
import WorkoutHistory from './WorkoutHistory';

export default function WorkoutHistoryWrapper() {
  return (
    <SessionProvider>
      <WorkoutHistory />
    </SessionProvider>
  );
}
