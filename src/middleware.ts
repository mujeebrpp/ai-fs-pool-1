import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthenticated = !!session;
  const role = session?.user?.role || 'PUBLIC';
  
  const path = request.nextUrl.pathname;
  
  // Public routes accessible to all
  if (path === '/' || path === '/login' || path === '/register' || path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Authentication check
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based route protection
  if (path.startsWith('/dashboard/admin') && !['ADMIN', 'SUPERADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (path.startsWith('/dashboard/trainer') && role !== 'TRAINER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (path.startsWith('/dashboard/reports') && !['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};