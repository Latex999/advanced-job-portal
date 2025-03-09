'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    companyId: 1,
    logo: '/images/companies/techcorp.svg',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'published',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    applicants: 24,
    views: 347,
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataStream',
    companyId: 2,
    logo: '/images/companies/datastream.svg',
    location: 'Remote',
    type: 'Full-time',
    status: 'published',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    applicants: 18,
    views: 256,
  },
  {
    id: 3,
    title: 'Product Designer',
    company: 'DesignHub',
    companyId: 3,
    logo: '/images/companies/designhub.svg',
    location: 'New York, NY',
    type: 'Full-time',
    status: 'published',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    applicants: 32,
    views: 489,
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudSolutions',
    companyId: 4,
    logo: '/images/companies/cloudsolutions.svg',
    location: 'Chicago, IL',
    type: 'Full-time',
    status: 'draft',
    postedAt: null, // Not posted yet
    applicants: 0,
    views: 0,
  },
  {
    id: 5,
    title: 'Mobile Developer',
    company: 'AppWorks',
    companyId: 5,
    logo: '/images/companies/appworks.svg',
    location: 'Seattle, WA',
    type: 'Contract',
    status: 'closed',
    postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    applicants: 21,
    views: 312,
  },
];

export default function JobsPage() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch jobs data
  useEffect(() => {
    if (status === 'authenticated') {
      // In a real application, this would be an API call
      setTimeout(() => {
        setJobs(mockJobs);
        setLoading(false);
      }, 1000);
    }
  }, [status]);
  
  // Filter jobs based on search query and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle job deletion
  const handleDeleteJob = (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      // In a real application, this would be an API call
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    }
  };
  
  // Handle job status change
  const handleStatusChange = (jobId: number, newStatus: string) => {
    // In a real application, this would be an API call
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    
    toast.success(`Job status updated to ${newStatus}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading jobs...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Jobs</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View, edit, and manage your job listings.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/jobs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Post New Job
            </Link>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="mt-6 sm:flex sm:items-center">
          <div className="sm:flex-grow">
            <div className="relative rounded-md shadow-sm max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search jobs by title, company, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        
        {/* Jobs List */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm overflow-hidden sm:rounded-md">
          {filteredJobs.length > 0 ? (
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job) => (
                <li key={job.id}>
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
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
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            <Link href={`/jobs/${job.id}`} className="hover:text-primary-600">
                              {job.title}
                            </Link>
                          </h2>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>{job.company}</span>
                            <span className="mx-2">&bull;</span>
                            <span>{job.location}</span>
                            <span className="mx-2">&bull;</span>
                            <span>{job.type}</span>
                            {job.postedAt && (
                              <>
                                <span className="mx-2">&bull;</span>
                                <span>Posted {formatDistanceToNow(job.postedAt, { addSuffix: true })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'published' ? 'bg-green-100 text-green-800' :
                          job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          job.status === 'closed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:flex sm:items-center sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <EyeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{job.views} views</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                          <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>
                            {job.applicants} applicant{job.applicants !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex sm:mt-0">
                        {job.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(job.id, 'closed')}
                            className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                          >
                            <XCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                            Close
                          </button>
                        )}
                        {job.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(job.id, 'published')}
                            className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                          >
                            <CheckCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                            Publish
                          </button>
                        )}
                        {job.status === 'closed' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(job.id, 'published')}
                            className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                          >
                            <CheckCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                            Reopen
                          </button>
                        )}
                        <Link
                          href={`/dashboard/jobs/${job.id}/applicants`}
                          className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                          <UserGroupIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                          Applicants
                        </Link>
                        <Link
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                          <PencilIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:text-red-500 dark:hover:text-red-300 focus:outline-none focus:border-red-300 focus:ring focus:ring-red-200 active:text-red-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                          <TrashIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new job.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    href="/dashboard/jobs/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create Your First Job
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Job Posting Tips */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Job Posting Tips</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Maximize the effectiveness of your job listings with these tips.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 py-5 px-4 sm:px-6">
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Use a clear and specific job title that candidates are likely to search for.</li>
              <li>Include salary information to attract more qualified candidates.</li>
              <li>Be clear about required skills and experience to reduce unqualified applications.</li>
              <li>Highlight your company culture and benefits to stand out from competitors.</li>
              <li>Keep your job descriptions up-to-date and close positions when they're filled.</li>
              <li>Respond to applications promptly to maintain candidate interest.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}