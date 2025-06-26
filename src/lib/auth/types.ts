import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: Role;
    id: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    id: string;
  }
}
