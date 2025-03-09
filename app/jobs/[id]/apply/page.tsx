'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Mock job data import (same as in job detail page)
// ... (assume we have the same mockJobs array here)
const mockJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    companyId: 1,
    logo: '/images/companies/techcorp.svg',
    location: 'San Francisco, CA',
    // ... (other fields)
  },
  // ... other jobs
];

// Application form schema
const applicationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(5, 'Please enter a valid phone number'),
  coverLetter: z.string().min(50, 'Cover letter should be at least 50 characters'),
  resume: z.any()
    .refine((file) => file?.length === 1, 'Resume is required')
    .refine(
      (file) => {
        if (!file?.[0]) return false;
        const fileType = file[0].type;
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType);
      },
      'File must be a PDF or Word document (.pdf, .doc, .docx)'
    ),
  linkedinProfile: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const jobId = Number(params.id);
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      linkedinProfile: '',
      portfolioUrl: '',
      additionalInfo: '',
      terms: false,
    },
  });
  
  // Find the job from the mock data
  useEffect(() => {
    const selectedJob = mockJobs.find(j => j.id === jobId);
    
    if (selectedJob) {
      setJob(selectedJob);
    } else {
      // Handle job not found
      router.push('/jobs');
    }
    
    setLoading(false);
    
    // Pre-fill form with user data if logged in
    if (session?.user) {
      reset({
        fullName: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        coverLetter: '',
        linkedinProfile: '',
        portfolioUrl: '',
        additionalInfo: '',
        terms: false,
      });
    }
  }, [jobId, router, session, reset]);
  
  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, we would upload the resume file and submit the form data to the server
      // Here we're simulating a successful submission
      console.log('Application data:', data);
      console.log('Resume file:', resumeFile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
      toast.success('Application submitted successfully!');
      
      // In a real app, redirect after a delay or upon user action
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resume file selection
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading application form...</p>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300">Job not found</p>
          <Link href="/jobs" className="mt-4 inline-block text-primary-600 hover:underline">
            Browse all jobs
          </Link>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to apply for this job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/auth/login?callbackUrl=${encodeURIComponent(`/jobs/${jobId}/apply`)}`}
              className="btn-primary"
            >
              Login
            </Link>
            <Link
              href={`/auth/register?callbackUrl=${encodeURIComponent(`/jobs/${jobId}/apply`)}`}
              className="btn-secondary"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Success message after submission
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your application for <span className="font-medium">{job.title}</span> at <span className="font-medium">{job.company}</span> has been received. You can track your application status in your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/applications"
              className="btn-primary"
            >
              Go to Applications
            </Link>
            <Link
              href="/jobs"
              className="btn-secondary"
            >
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation - Simplified version */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  JobPortal
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {session ? (
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/auth/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/jobs/${jobId}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Job Details
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main form section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Apply for {job.title} at {job.company}
              </h1>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        {...register('fullName')}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Resume Upload */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resume/CV Upload</h2>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6">
                    <div className="flex justify-center">
                      <Controller
                        name="resume"
                        control={control}
                        render={({ field: { onChange, value, ...field } }) => (
                          <label className="block text-center cursor-pointer">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {resumeFile ? resumeFile.name : 'Upload your resume (PDF or Word)'}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                              Max file size: 5MB
                            </span>
                            <input
                              id="resume"
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => {
                                handleResumeChange(e);
                                onChange(e.target.files);
                              }}
                              {...field}
                            />
                            <button
                              type="button"
                              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                              Browse files
                            </button>
                          </label>
                        )}
                      />
                    </div>
                    {errors.resume && (
                      <p className="mt-2 text-center text-sm text-red-600">{errors.resume.message?.toString()}</p>
                    )}
                  </div>
                </div>
                
                {/* Cover Letter */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cover Letter</h2>
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Explain why you're a good fit for this role <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="coverLetter"
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the position of..."
                      {...register('coverLetter')}
                    ></textarea>
                    {errors.coverLetter && (
                      <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Professional Profiles */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Professional Profiles</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="linkedinProfile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        id="linkedinProfile"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...register('linkedinProfile')}
                      />
                      {errors.linkedinProfile && (
                        <p className="mt-1 text-sm text-red-600">{errors.linkedinProfile.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Portfolio/Personal Website URL
                      </label>
                      <input
                        type="url"
                        id="portfolioUrl"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="https://yourportfolio.com"
                        {...register('portfolioUrl')}
                      />
                      {errors.portfolioUrl && (
                        <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h2>
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Is there anything else you'd like to share with the hiring team?
                    </label>
                    <textarea
                      id="additionalInfo"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      {...register('additionalInfo')}
                    ></textarea>
                  </div>
                </div>
                
                {/* Terms and Submit */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...register('terms')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                        I agree to the <Link href="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link href="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
                      </label>
                      {errors.terms && (
                        <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Link
                      href={`/jobs/${jobId}`}
                      className="mr-4 py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Job Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Job Summary</h2>
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 h-12 w-12 relative">
                  <Image
                    src={job.logo}
                    alt={`${job.company} logo`}
                    className="rounded-md object-cover"
                    layout="fill"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random`;
                    }}
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {job.company} • {job.location}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {job.type} {job.remote && '(Remote)'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {job.salary}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Application Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Application Tips</h2>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tailor your resume and cover letter to the job description
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Highlight specific skills and experiences relevant to the role
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Use concrete examples and achievements
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Proofread carefully before submitting
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Follow up after submitting your application
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}