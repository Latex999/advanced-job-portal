'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

// Mock data for dashboard stats
const jobSeekerStats = {
  appliedJobs: 12,
  savedJobs: 24,
  viewedJobs: 48,
  interviews: 3,
};

const employerStats = {
  activeJobs: 5,
  totalApplications: 87,
  newApplications: 14,
  interviews: 8,
};

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: 'application',
    title: 'Applied to Senior Frontend Developer at TechCorp',
    date: '2 hours ago',
    status: 'pending',
  },
  {
    id: 2,
    type: 'interview',
    title: 'Interview scheduled with DataStream',
    date: 'Yesterday',
    status: 'upcoming',
  },
  {
    id: 3,
    type: 'application',
    title: 'Application for Product Designer was viewed',
    date: '3 days ago',
    status: 'viewed',
  },
  {
    id: 4,
    type: 'application',
    title: 'Application for DevOps Engineer was rejected',
    date: '1 week ago',
    status: 'rejected',
  },
  {
    id: 5,
    type: 'message',
    title: 'New message from CloudSolutions HR',
    date: '1 week ago',
    status: 'unread',
  },
];

// Mock data for recommended jobs
const recommendedJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: '$120,000 - $150,000',
    matchPercentage: 95,
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataStream',
    location: 'Remote',
    salary: '$110,000 - $140,000',
    matchPercentage: 88,
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    company: 'CloudSolutions',
    location: 'New York, NY',
    salary: '$130,000 - $160,000',
    matchPercentage: 82,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role);
    }
  }, [session]);
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          {userRole === 'employer' ? (
            <Link
              href="/dashboard/jobs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Post a Job
            </Link>
          ) : (
            <Link
              href="/jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Find Jobs
            </Link>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Overview</h2>
        
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats cards */}
          {userRole === 'jobseeker' ? (
            <>
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Applied Jobs</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{jobSeekerStats.appliedJobs}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/applications" className="font-medium text-primary-600 hover:text-primary-500">
                      View all
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BriefcaseIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Saved Jobs</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{jobSeekerStats.savedJobs}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/jobs/saved" className="font-medium text-primary-600 hover:text-primary-500">
                      View all
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <EyeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Viewed Jobs</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{jobSeekerStats.viewedJobs}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/jobs/history" className="font-medium text-primary-600 hover:text-primary-500">
                      View history
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Interviews</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{jobSeekerStats.interviews}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/interviews" className="font-medium text-primary-600 hover:text-primary-500">
                      View schedule
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BriefcaseIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Jobs</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{employerStats.activeJobs}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/jobs" className="font-medium text-primary-600 hover:text-primary-500">
                      View all
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Applications</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{employerStats.totalApplications}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/applications" className="font-medium text-primary-600 hover:text-primary-500">
                      View all
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">New Applications</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{employerStats.newApplications}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/applications?filter=new" className="font-medium text-primary-600 hover:text-primary-500">
                      Review
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Scheduled Interviews</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{employerStats.interviews}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/dashboard/interviews" className="font-medium text-primary-600 hover:text-primary-500">
                      View schedule
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivities.map((activity) => (
                <li key={activity.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary-600 truncate">{activity.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {activity.status === 'pending' && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </p>
                        )}
                        {activity.status === 'upcoming' && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Upcoming
                          </p>
                        )}
                        {activity.status === 'viewed' && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Viewed
                          </p>
                        )}
                        {activity.status === 'rejected' && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Rejected
                          </p>
                        )}
                        {activity.status === 'unread' && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            New
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {activity.type === 'application' && (
                            <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          )}
                          {activity.type === 'interview' && (
                            <ChatBubbleLeftRightIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          )}
                          {activity.type === 'message' && (
                            <ChatBubbleLeftRightIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          )}
                          {activity.type}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <p>{activity.date}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-right">
              <Link href="/dashboard/activities" className="font-medium text-primary-600 hover:text-primary-500">
                View all activity
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recommended Jobs (for job seekers) or Top Candidates (for employers) */}
        {userRole === 'jobseeker' ? (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recommended Jobs</h2>
            <div className="mt-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {recommendedJobs.map((job) => (
                  <li key={job.id}>
                    <Link href={`/jobs/${job.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">{job.title}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {job.matchPercentage}% Match
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              {job.company}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>{job.salary}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-right">
                <Link href="/jobs" className="font-medium text-primary-600 hover:text-primary-500">
                  View all jobs
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Company Performance</h2>
            <div className="mt-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Views</h3>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">1,248</p>
                  <p className="mt-1 text-sm text-green-600">↑ 12% from last month</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Rate</h3>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">8.3%</p>
                  <p className="mt-1 text-sm text-green-600">↑ 2.1% from last month</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Hire</h3>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">18 days</p>
                  <p className="mt-1 text-sm text-red-600">↑ 2 days from last month</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Rating</h3>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">4.2/5</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Based on 47 reviews</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-right">
                <Link href="/dashboard/analytics" className="font-medium text-primary-600 hover:text-primary-500">
                  View detailed analytics
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}