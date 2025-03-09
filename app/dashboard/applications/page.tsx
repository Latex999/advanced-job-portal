'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Mock applications data
const mockJobseekerApplications = [
  {
    id: 1,
    job: {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      logo: '/images/companies/techcorp.svg',
      location: 'San Francisco, CA',
      type: 'Full-time',
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    interviews: [],
  },
  {
    id: 2,
    job: {
      id: 2,
      title: 'Backend Engineer',
      company: 'DataStream',
      logo: '/images/companies/datastream.svg',
      location: 'Remote',
      type: 'Full-time',
    },
    status: 'reviewed',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    interviews: [],
  },
  {
    id: 3,
    job: {
      id: 3,
      title: 'Product Designer',
      company: 'DesignHub',
      logo: '/images/companies/designhub.svg',
      location: 'New York, NY',
      type: 'Full-time',
    },
    status: 'shortlisted',
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    interviews: [
      {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'video',
        status: 'scheduled',
      },
    ],
  }
];

const mockEmployerApplications = [
  {
    id: 1,
    job: {
      id: 1,
      title: 'Senior Frontend Developer',
    },
    applicant: {
      id: 1,
      name: 'John Smith',
      avatar: '/images/avatars/john.jpg',
    },
    status: 'pending',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    resumeUrl: '#',
    coverLetter: 'I am writing to express my interest in the Senior Frontend Developer position at TechCorp...',
  },
  {
    id: 2,
    job: {
      id: 1,
      title: 'Senior Frontend Developer',
    },
    applicant: {
      id: 2,
      name: 'Sarah Johnson',
      avatar: '/images/avatars/sarah.jpg',
    },
    status: 'reviewed',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resumeUrl: '#',
    coverLetter: 'I am excited to apply for the Senior Frontend Developer position at TechCorp...',
  }
];

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch applications data based on user role
  useEffect(() => {
    if (status === 'authenticated') {
      // In a real application, this would be an API call
      setTimeout(() => {
        const userRole = session?.user?.role;
        if (userRole === 'jobseeker') {
          setApplications(mockJobseekerApplications);
        } else if (userRole === 'employer') {
          setApplications(mockEmployerApplications);
        } else {
          // Admin can see all applications
          setApplications([...mockJobseekerApplications, ...mockEmployerApplications]);
        }
        setLoading(false);
      }, 1000);
    }
  }, [status, session]);
  
  // Filter applications based on search query and status
  const filteredApplications = applications.filter(app => {
    const isJobseeker = session?.user?.role === 'jobseeker';
    
    // Search logic differs between jobseeker and employer view
    const matchesSearch = isJobseeker
      ? app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job.company?.toLowerCase().includes(searchQuery.toLowerCase())
      : app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicant?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle withdraw application (for job seekers)
  const handleWithdrawApplication = (applicationId: number) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      // In a real application, this would be an API call
      setApplications(prevApps => prevApps.filter(app => app.id !== applicationId));
      toast.success('Application withdrawn successfully');
    }
  };
  
  // Handle application status update (for employers)
  const handleUpdateStatus = (applicationId: number, newStatus: string) => {
    // In a real application, this would be an API call
    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, lastUpdated: new Date() } 
          : app
      )
    );
    
    toast.success(`Application status updated to ${newStatus}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading applications...</p>
        </div>
      </div>
    );
  }
  
  const isJobseeker = session?.user?.role === 'jobseeker';
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isJobseeker ? 'My Applications' : 'Manage Applications'}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {isJobseeker 
            ? 'Track the status of your job applications' 
            : 'Review and manage applications for your job postings'}
        </p>
        
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
                placeholder={isJobseeker 
                  ? "Search by job title or company" 
                  : "Search by job title or applicant name"}
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
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
        </div>
        
        {/* Applications List */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm overflow-hidden sm:rounded-md">
          {filteredApplications.length > 0 ? (
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-6 sm:px-6">
                    {/* Application header - different view for jobseeker vs employer */}
                    {isJobseeker ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 relative">
                            <Image
                              src={application.job.logo}
                              alt={`${application.job.company} logo`}
                              className="rounded-md object-cover"
                              layout="fill"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.job.company)}&background=random`;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                              <Link href={`/jobs/${application.job.id}`} className="hover:text-primary-600">
                                {application.job.title}
                              </Link>
                            </h2>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <span>{application.job.company}</span>
                              <span className="mx-2">&bull;</span>
                              <span>{application.job.location}</span>
                              <span className="mx-2">&bull;</span>
                              <span>{application.job.type}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 relative">
                            <Image
                              src={application.applicant.avatar}
                              alt={`${application.applicant.name} avatar`}
                              className="rounded-full object-cover"
                              layout="fill"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.applicant.name)}&background=random`;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                              <Link href={`/dashboard/applicants/${application.applicant.id}`} className="hover:text-primary-600">
                                {application.applicant.name}
                              </Link>
                            </h2>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <span>Applied for {application.job.title}</span>
                              <span className="mx-2">&bull;</span>
                              <span>
                                {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Application details */}
                    <div className="mt-4 sm:flex sm:items-center sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>Applied {format(new Date(application.appliedAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>Last updated {formatDistanceToNow(new Date(application.lastUpdated), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      {/* Action buttons - different for jobseeker vs employer */}
                      <div className="mt-4 flex sm:mt-0">
                        {isJobseeker ? (
                          <>
                            <Link
                              href={`/dashboard/applications/${application.id}`}
                              className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                            >
                              <EyeIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                              View Details
                            </Link>
                            {/* Only show withdraw option if not hired or rejected */}
                            {application.status !== 'hired' && application.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleWithdrawApplication(application.id)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:text-red-500 dark:hover:text-red-300 focus:outline-none focus:border-red-300 focus:ring focus:ring-red-200 transition ease-in-out duration-150"
                              >
                                Withdraw
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/dashboard/applications/${application.id}`}
                              className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                            >
                              <EyeIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                              View Application
                            </Link>
                            <Link
                              href={application.resumeUrl}
                              className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                            >
                              <DocumentTextIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                              View Resume
                            </Link>
                            <Link
                              href={`/dashboard/messages/new?recipient=${application.applicant.id}`}
                              className="mr-3 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                            >
                              <ChatBubbleLeftRightIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                              Message
                            </Link>
                            {/* Status update dropdown for employers */}
                            <select
                              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200"
                              value={application.status}
                              onChange={(e) => handleUpdateStatus(application.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Interview information if any */}
                    {application.interviews && application.interviews.length > 0 && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Upcoming Interview
                        </h3>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            {format(new Date(application.interviews[0].date), 'MMMM d, yyyy \'at\' h:mm a')} 
                            {' • '}
                            {application.interviews[0].type.charAt(0).toUpperCase() + application.interviews[0].type.slice(1)} Interview
                          </p>
                        </div>
                        <div className="mt-2">
                          <Link
                            href={`/dashboard/interviews/${application.id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    )}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : isJobseeker 
                    ? 'You haven\'t applied to any jobs yet.'
                    : 'No applications have been received for your job postings.'}
              </p>
              {!searchQuery && statusFilter === 'all' && isJobseeker && (
                <div className="mt-6">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}