import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a protected route
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/employer') || 
    pathname.startsWith('/admin');
  
  // Check if the path is an auth route
  const isAuthRoute = 
    pathname.startsWith('/auth/login') || 
    pathname.startsWith('/auth/register');
  
  // Get the token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If the user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Check role-based access
  if (token && token.role) {
    // Admin routes are only accessible by admins
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Employer routes are only accessible by employers and admins
    if (pathname.startsWith('/employer') && !['employer', 'admin'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};