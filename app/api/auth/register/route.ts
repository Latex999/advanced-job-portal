import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/utils/api';

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['jobseeker', 'employer']),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse('Validation failed', 400, validationResult.error.flatten().fieldErrors);
    }
    
    const { name, email, password, role } = validationResult.data;
    
    // Connect to database
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save hook in the User model
      role,
      isVerified: false, // User needs to verify email
      notificationPreferences: {
        jobAlerts: true,
        applicationUpdates: true,
        messages: true,
        marketing: false,
      },
    });
    
    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    // TODO: Send verification email
    
    return successResponse(userResponse, 201);
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(error.message || 'An error occurred during registration', 500);
  }
}