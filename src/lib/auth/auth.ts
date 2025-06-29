import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { baseAuthConfig } from './auth.base';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...baseAuthConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...baseAuthConfig.providers.filter(provider => provider.id !== 'credentials'),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // In a real application, you would have a password field in the User model
        // and compare the hashed password with the provided password
        // For now, we'll just return the user for demonstration purposes
        
        // const isPasswordValid = await compare(credentials.password, user.password);
        // if (!isPasswordValid) {
        //   return null;
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});