'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TagsInput } from 'react-tag-input-component';

// Mock company data (would come from API in a real application)
const mockCompanies = [
  { id: '1', name: 'TechCorp' },
  { id: '2', name: 'DataStream' },
  { id: '3', name: 'DesignHub' },
  { id: '4', name: 'CloudSolutions' },
  { id: '5', name: 'AppWorks' },
  { id: '6', name: 'AnalyticsPro' },
];

// Job categories
const jobCategories = [
  'Software Development',
  'Data Science & Analytics',
  'Design',
  'Marketing',
  'Sales',
  'Customer Service',
  'Human Resources',
  'Finance & Accounting',
  'Engineering',
  'Product Management',
  'Project Management',
  'Operations',
  'Legal',
  'Healthcare',
  'Education',
  'Other',
];

// Job form schema
const jobFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  company: z.string().min(1, 'Please select a company'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  isRemote: z.boolean().default(false),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  category: z.string().min(1, 'Please select a category'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.string().min(2, 'Experience requirements must be specified'),
  education: z.string().min(2, 'Education requirements must be specified'),
  minSalary: z.number().min(0, 'Minimum salary cannot be negative').optional(),
  maxSalary: z.number().min(0, 'Maximum salary cannot be negative')
    .refine(val => !val || val > 0, 'Please enter a valid salary amount')
    .optional(),
  currency: z.string().optional(),
  salaryCycle: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']).optional(),
  isSalaryNegotiable: z.boolean().default(false),
  hideSalary: z.boolean().default(false),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.date().optional(),
  applicationLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('published'),
});

type JobFormData = z.infer<typeof jobFormSchema>;

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCompanies, setUserCompanies] = useState<typeof mockCompanies>([]);
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      company: '',
      description: '',
      location: '',
      isRemote: false,
      type: 'Full-time',
      category: '',
      skills: [],
      experience: '',
      education: '',
      minSalary: undefined,
      maxSalary: undefined,
      currency: 'USD',
      salaryCycle: 'Yearly',
      isSalaryNegotiable: false,
      hideSalary: false,
      benefits: [],
      applicationDeadline: undefined,
      applicationLink: '',
      status: 'published',
    },
  });
  
  const watchHideSalary = watch('hideSalary');
  
  // Check authentication and role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/jobs/create');
    } else if (status === 'authenticated' && session?.user?.role !== 'employer' && session?.user?.role !== 'admin') {
      toast.error('You do not have permission to create job listings');
      router.push('/dashboard');
    }
  }, [status, session, router]);
  
  // Fetch user's companies (using mock data for now)
  useEffect(() => {
    if (status === 'authenticated') {
      // In a real app, this would be an API call to get companies owned by the user
      setUserCompanies(mockCompanies);
    }
  }, [status]);
  
  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to create the job
      console.log('Job data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Job posted successfully!');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If not authenticated yet or not an employer
  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'employer' && session?.user?.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a New Job</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Fill out the form below to create a new job listing.
        </p>
        
        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="e.g. Senior Frontend Developer"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="company"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      {...register('company')}
                    >
                      <option value="">Select a company</option>
                      {userCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      {...register('category')}
                    >
                      <option value="">Select a category</option>
                      {jobCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="type"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      {...register('type')}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="location"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="e.g. New York, NY"
                      {...register('location')}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center h-full">
                  <div className="flex items-center">
                    <input
                      id="isRemote"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('isRemote')}
                    />
                    <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      This is a remote position
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Job Description */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Job Description</h2>
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={10}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Enter a detailed job description. HTML formatting is supported."
                    {...register('description')}
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Include responsibilities, requirements, and any other important information about the position.
                </p>
              </div>
            </div>
            
            {/* Requirements */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Requirements</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <Controller
                      name="skills"
                      control={control}
                      render={({ field }) => (
                        <TagsInput
                          value={field.value}
                          onChange={field.onChange}
                          name="skills"
                          placeHolder="Add skills (press enter after each skill)"
                        />
                      )}
                    />
                    {errors.skills && (
                      <p className="mt-1 text-sm text-red-600">{errors.skills.message?.toString()}</p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Add relevant skills required for the position.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="experience"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="e.g. 3+ years of experience in web development"
                      {...register('experience')}
                    />
                    {errors.experience && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="education"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="e.g. Bachelor's degree in Computer Science or equivalent"
                      {...register('education')}
                    />
                    {errors.education && (
                      <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Compensation */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Compensation</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="hideSalary"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('hideSalary')}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="hideSalary" className="font-medium text-gray-700 dark:text-gray-300">
                      Hide salary from job listing
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      The salary information will still be used for search and filter purposes.
                    </p>
                  </div>
                </div>
                
                {!watchHideSalary && (
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                    <div>
                      <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Minimum Salary
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="minSalary"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="e.g. 50000"
                          min="0"
                          step="1000"
                          {...register('minSalary', { valueAsNumber: true })}
                        />
                        {errors.minSalary && (
                          <p className="mt-1 text-sm text-red-600">{errors.minSalary.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maximum Salary
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="maxSalary"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="e.g. 80000"
                          min="0"
                          step="1000"
                          {...register('maxSalary', { valueAsNumber: true })}
                        />
                        {errors.maxSalary && (
                          <p className="mt-1 text-sm text-red-600">{errors.maxSalary.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Currency
                      </label>
                      <div className="mt-1">
                        <select
                          id="currency"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          {...register('currency')}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="salaryCycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Salary Period
                      </label>
                      <div className="mt-1">
                        <select
                          id="salaryCycle"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          {...register('salaryCycle')}
                        >
                          <option value="Hourly">Hourly</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="isSalaryNegotiable"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            {...register('isSalaryNegotiable')}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="isSalaryNegotiable" className="font-medium text-gray-700 dark:text-gray-300">
                            Salary is negotiable
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Benefits
                  </label>
                  <div className="mt-1">
                    <Controller
                      name="benefits"
                      control={control}
                      render={({ field }) => (
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          name="benefits"
                          placeHolder="Add benefits (press enter after each benefit)"
                        />
                      )}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    E.g. Health insurance, 401(k), Remote work option, etc.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Application Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Application Settings</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Application Deadline
                  </label>
                  <div className="mt-1">
                    <Controller
                      control={control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          minDate={new Date()}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholderText="Select a deadline (optional)"
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="applicationLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    External Application URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="applicationLink"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="e.g. https://company.com/careers/job123"
                      {...register('applicationLink')}
                    />
                    {errors.applicationLink && (
                      <p className="mt-1 text-sm text-red-600">{errors.applicationLink.message}</p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Leave this empty to use the platform's application system.
                  </p>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      {...register('status')}
                    >
                      <option value="published">Published - Visible to all users</option>
                      <option value="draft">Draft - Save now, publish later</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit */}
            <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => router.push('/dashboard/jobs')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}