'use client';

import { SessionProvider } from 'next-auth/react';
import SquatTracker from './SquatTracker';

export default function SquatTrackerWrapper() {
  return (
    <SessionProvider>
      <SquatTracker />
    </SessionProvider>
  );
}
