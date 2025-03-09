import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import User from '@/models/User';
import Application from '@/models/Application';
import Company from '@/models/Company';
import Notification from '@/models/Notification';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/utils/api';
import { requireAuth } from '@/utils/auth';
import { uploadToS3 } from '@/utils/s3';

// Application validation schema
const applicationSchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter should be at least 50 characters'),
  resumeUrl: z.string().url('Resume URL is required').optional(),
  answers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).optional(),
  additionalInfo: z.string().optional(),
});

// POST: Apply for a job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const { session, error } = await requireAuth(request);
    if (error) return error;
    
    const jobId = params.id;
    const userId = session.user.id;
    
    // In a real implementation, we would handle file uploads here
    // For simplicity, we're assuming the resume URL is already provided or we're using a pre-uploaded resume
    
    // Parse form data as JSON 
    // Note: In production, you'd use formidable or similar to handle file uploads
    const body = await request.json();
    
    // Validate request body
    const validationResult = applicationSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        'Validation failed', 
        400, 
        validationResult.error.flatten().fieldErrors
      );
    }
    
    const applicationData = validationResult.data;
    
    await dbConnect();
    
    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return notFoundResponse('Job not found');
    }
    
    // Check if job is still accepting applications
    if (job.status !== 'published') {
      return errorResponse('This job is no longer accepting applications', 400);
    }
    
    // Check if application deadline has passed
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return errorResponse('The application deadline for this job has passed', 400);
    }
    
    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    
    if (existingApplication) {
      return errorResponse('You have already applied for this job', 400);
    }
    
    // Get user to find their resume if not provided
    const user = await User.findById(userId);
    if (!user) {
      return unauthorizedResponse('User not found');
    }
    
    // Use user's resume if not provided in the request
    const resumeUrl = applicationData.resumeUrl || user.resume;
    if (!resumeUrl) {
      return errorResponse('A resume is required to apply for this job', 400);
    }
    
    // Create the application
    const application = await Application.create({
      job: jobId,
      company: job.company,
      applicant: userId,
      resume: resumeUrl,
      coverLetter: applicationData.coverLetter,
      answers: applicationData.answers || [],
      status: 'pending',
      withdrawn: false,
    });
    
    // Update job's applicants array
    await Job.findByIdAndUpdate(
      jobId,
      {
        $push: {
          applicants: {
            user: userId,
            status: 'pending',
            appliedAt: new Date(),
            resume: resumeUrl,
            coverLetter: applicationData.coverLetter,
          },
        },
      }
    );
    
    // Update user's applied jobs array
    await User.findByIdAndUpdate(
      userId,
      { $push: { appliedJobs: jobId } }
    );
    
    // Create notification for the employer
    await Notification.create({
      recipient: job.postedBy,
      type: 'new_application',
      title: 'New Job Application',
      message: `${user.name} has applied for the ${job.title} position.`,
      link: `/dashboard/applications/${application._id}`,
      read: false,
    });
    
    // Create notification for the applicant
    await Notification.create({
      recipient: userId,
      type: 'application_status',
      title: 'Application Submitted',
      message: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
      link: `/dashboard/applications/${application._id}`,
      read: false,
    });
    
    return successResponse({
      message: 'Application submitted successfully',
      applicationId: application._id,
    }, 201);
  } catch (error: any) {
    console.error('Error applying for job:', error);
    return errorResponse(error.message || 'An error occurred while submitting your application', 500);
  }
}

// GET: Check if user has already applied
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const { session, error } = await requireAuth(request);
    if (error) return error;
    
    const jobId = params.id;
    const userId = session.user.id;
    
    await dbConnect();
    
    // Check if application exists
    const application = await Application.findOne({
      job: jobId,
      applicant: userId,
    }).select('_id status createdAt');
    
    if (!application) {
      return successResponse({ applied: false });
    }
    
    return successResponse({
      applied: true,
      application,
    });
  } catch (error: any) {
    console.error('Error checking application status:', error);
    return errorResponse(error.message || 'An error occurred while checking application status', 500);
  }
}