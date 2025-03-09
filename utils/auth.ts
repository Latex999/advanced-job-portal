import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { unauthorizedResponse, forbiddenResponse } from './api';

// Get the current session on the server side
export const getSession = async () => {
  return await getServerSession(authOptions);
};

// Check if a user is authenticated in an API route and return the session
export const requireAuth = async (req: NextRequest) => {
  const session = await getSession();

  if (!session || !session.user) {
    return { error: unauthorizedResponse('Authentication required') };
  }

  return { session };
};

// Check if a user has a specific role
export const requireRole = async (req: NextRequest, roles: string | string[]) => {
  const { session, error } = await requireAuth(req);

  if (error) {
    return { error };
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(session.user.role)) {
    return {
      error: forbiddenResponse(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
    };
  }

  return { session };
};

// Function to determine if current session user is the owner of a resource
export const isOwner = async (userId: string) => {
  const session = await getSession();
  
  if (!session || !session.user) {
    return false;
  }
  
  return session.user.id === userId;
};

// Check if a user is an admin or the owner of a resource
export const isAdminOrOwner = async (userId: string) => {
  const session = await getSession();
  
  if (!session || !session.user) {
    return false;
  }
  
  return session.user.role === 'admin' || session.user.id === userId;
};

// Types for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}