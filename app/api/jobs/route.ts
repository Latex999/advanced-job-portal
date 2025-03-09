import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import Company from '@/models/Company';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/utils/api';
import { requireRole } from '@/utils/auth';

// Job validation schema for creation
const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  company: z.string().min(1, 'Company ID is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  isRemote: z.boolean().optional().default(false),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.string().min(2, 'Experience requirements must be specified'),
  education: z.string().min(2, 'Education requirements must be specified'),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().optional(),
  salaryCycle: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']).optional(),
  isSalaryNegotiable: z.boolean().optional().default(false),
  hideSalary: z.boolean().optional().default(false),
  benefits: z.array(z.string()).optional().default([]),
  applicationDeadline: z.string().optional(), // Will parse into Date later
  applicationLink: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'closed', 'expired']).optional().default('published'),
});

// GET: List all jobs with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const query: any = { status: 'published' };
    
    // Text search
    const keyword = searchParams.get('keyword');
    if (keyword) {
      query.$text = { $search: keyword };
    }
    
    // Location filter
    const location = searchParams.get('location');
    if (location) {
      if (location.toLowerCase() === 'remote') {
        query.isRemote = true;
      } else {
        query.location = { $regex: location, $options: 'i' };
      }
    }
    
    // Job type filter
    const type = searchParams.get('type');
    if (type) {
      query.type = type;
    }
    
    // Category filter
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }
    
    // Company filter
    const company = searchParams.get('company');
    if (company) {
      query.company = company;
    }
    
    // Salary filter
    const minSalary = Number(searchParams.get('minSalary'));
    if (!isNaN(minSalary)) {
      query.minSalary = { $gte: minSalary };
    }
    
    await dbConnect();
    
    // Execute query with populate
    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Job.countDocuments(query);
    
    return successResponse({
      jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return errorResponse(error.message || 'An error occurred while fetching jobs', 500);
  }
}

// POST: Create a new job
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has employer or admin role
    const { session, error } = await requireRole(request, ['employer', 'admin']);
    if (error) return error;
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = createJobSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        'Validation failed', 
        400, 
        validationResult.error.flatten().fieldErrors
      );
    }
    
    const jobData = validationResult.data;
    
    await dbConnect();
    
    // Verify company exists and user has access to it
    const company = await Company.findById(jobData.company);
    if (!company) {
      return notFoundResponse('Company not found');
    }
    
    // Check if user owns the company or is an admin
    if (company.owner.toString() !== session.user.id && session.user.role !== 'admin') {
      return unauthorizedResponse('You do not have permission to post jobs for this company');
    }
    
    // Convert application deadline from string to Date if provided
    let parsedData = { ...jobData };
    if (jobData.applicationDeadline) {
      parsedData.applicationDeadline = new Date(jobData.applicationDeadline);
    }
    
    // Create new job
    const job = await Job.create({
      ...parsedData,
      postedBy: session.user.id,
    });
    
    // Add job to company's jobs list
    await Company.findByIdAndUpdate(
      jobData.company,
      { $push: { jobs: job._id } }
    );
    
    return successResponse(job, 201);
  } catch (error: any) {
    console.error('Error creating job:', error);
    return errorResponse(error.message || 'An error occurred while creating the job', 500);
  }
}