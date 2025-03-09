'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

// Mock data for featured jobs
const featuredJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    logo: '/images/companies/techcorp.svg',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataStream',
    location: 'Remote',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    logo: '/images/companies/datastream.svg',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    tags: ['Node.js', 'MongoDB', 'AWS'],
  },
  {
    id: 3,
    title: 'Product Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    logo: '/images/companies/designhub.svg',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    tags: ['UI/UX', 'Figma', 'Adobe Creative Suite'],
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudSolutions',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$130,000 - $160,000',
    logo: '/images/companies/cloudsolutions.svg',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    tags: ['Kubernetes', 'Docker', 'CI/CD'],
  },
  {
    id: 5,
    title: 'Mobile Developer',
    company: 'AppWorks',
    location: 'Seattle, WA',
    type: 'Contract',
    salary: '$80 - $100 / hour',
    logo: '/images/companies/appworks.svg',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    tags: ['React Native', 'iOS', 'Android'],
  },
  {
    id: 6,
    title: 'Data Scientist',
    company: 'AnalyticsPro',
    location: 'Remote',
    type: 'Full-time',
    salary: '$125,000 - $155,000',
    logo: '/images/companies/analyticspro.svg',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    tags: ['Python', 'Machine Learning', 'SQL'],
  },
];

export default function FeaturedJobs() {
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredJobs.map((job) => (
        <div key={job.id} className="card hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0">
                  <Image
                    src={job.logo}
                    alt={`${job.company} logo`}
                    width={50}
                    height={50}
                    className="rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/50?text=' + job.company[0];
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    <Link 
                      href={`/jobs/${job.id}`}
                      className="hover:text-primary-600 transition-colors duration-150"
                    >
                      {job.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSaveJob(job.id)}
                className="text-gray-400 hover:text-primary-600 focus:outline-none"
                aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
              >
                {savedJobs.includes(job.id) ? (
                  <BookmarkSolidIcon className="h-6 w-6 text-primary-600" />
                ) : (
                  <BookmarkIcon className="h-6 w-6" />
                )}
              </button>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/10">
                {job.type}
              </span>
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {job.salary}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Posted {formatDistanceToNow(job.postedAt, { addSuffix: true })}
              </span>
              <Link href={`/jobs/${job.id}/apply`} className="btn-primary text-sm">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}