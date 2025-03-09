import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import Company from '@/models/Company';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/utils/api';
import { requireAuth, requireRole, isAdminOrOwner } from '@/utils/auth';

// Schema for updating a job
const updateJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  isRemote: z.boolean().optional(),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']).optional(),
  category: z.string().min(2, 'Category is required').optional(),
  tags: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().min(2, 'Experience requirements must be specified').optional(),
  education: z.string().min(2, 'Education requirements must be specified').optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().optional(),
  salaryCycle: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']).optional(),
  isSalaryNegotiable: z.boolean().optional(),
  hideSalary: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(), // Will parse into Date later
  applicationLink: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'closed', 'expired']).optional(),
});

// GET: Get a specific job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    await dbConnect();
    
    // Find job and increment view count
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('company', 'name logo location website description')
      .populate('postedBy', 'name')
      .lean();
    
    if (!job) {
      return notFoundResponse('Job not found');
    }
    
    return successResponse(job);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    return errorResponse(error.message || 'An error occurred while fetching the job', 500);
  }
}

// PUT: Update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const { session, error } = await requireAuth(request);
    if (error) return error;
    
    const jobId = params.id;
    const body = await request.json();
    
    // Validate request body
    const validationResult = updateJobSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        'Validation failed', 
        400, 
        validationResult.error.flatten().fieldErrors
      );
    }
    
    const updateData = validationResult.data;
    
    await dbConnect();
    
    // Find existing job
    const job = await Job.findById(jobId);
    if (!job) {
      return notFoundResponse('Job not found');
    }
    
    // Check if user has permission (job owner, company owner, or admin)
    if (
      job.postedBy.toString() !== session.user.id &&
      !(await isAdminOrOwner(job.postedBy.toString()))
    ) {
      return unauthorizedResponse('You do not have permission to update this job');
    }
    
    // Convert application deadline from string to Date if provided
    if (updateData.applicationDeadline) {
      updateData.applicationDeadline = new Date(updateData.applicationDeadline);
    }
    
    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('company', 'name logo')
      .populate('postedBy', 'name')
      .lean();
    
    return successResponse(updatedJob);
  } catch (error: any) {
    console.error('Error updating job:', error);
    return errorResponse(error.message || 'An error occurred while updating the job', 500);
  }
}

// DELETE: Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const { session, error } = await requireAuth(request);
    if (error) return error;
    
    const jobId = params.id;
    
    await dbConnect();
    
    // Find existing job
    const job = await Job.findById(jobId);
    if (!job) {
      return notFoundResponse('Job not found');
    }
    
    // Check if user has permission (job owner, company owner, or admin)
    if (
      job.postedBy.toString() !== session.user.id &&
      !(await isAdminOrOwner(job.postedBy.toString()))
    ) {
      return unauthorizedResponse('You do not have permission to delete this job');
    }
    
    // Delete job
    await job.deleteOne();
    
    // Remove job from company's jobs list
    await Company.findByIdAndUpdate(
      job.company,
      { $pull: { jobs: jobId } }
    );
    
    return successResponse({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return errorResponse(error.message || 'An error occurred while deleting the job', 500);
  }
}