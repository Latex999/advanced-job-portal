'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  AdjustmentsHorizontalIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

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
    remote: false,
    salary: '$120,000 - $150,000',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    description: 'We are looking for a skilled Frontend Developer to join our team...',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL'],
    tags: ['Senior Level', 'Frontend', 'Web Development'],
    applicants: 24,
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataStream',
    companyId: 2,
    logo: '/images/companies/datastream.svg',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    salary: '$110,000 - $140,000',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    description: 'Join our engineering team to build scalable backend systems...',
    skills: ['Node.js', 'MongoDB', 'AWS', 'Microservices', 'Docker'],
    tags: ['Mid-Level', 'Backend', 'Cloud'],
    applicants: 18,
  },
  {
    id: 3,
    title: 'Product Designer',
    company: 'DesignHub',
    companyId: 3,
    logo: '/images/companies/designhub.svg',
    location: 'New York, NY',
    type: 'Full-time',
    remote: false,
    salary: '$90,000 - $120,000',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    description: 'We\'re seeking a talented Product Designer to create amazing user experiences...',
    skills: ['UI/UX', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
    tags: ['Mid-Level', 'Design', 'Creative'],
    applicants: 32,
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudSolutions',
    companyId: 4,
    logo: '/images/companies/cloudsolutions.svg',
    location: 'Chicago, IL',
    type: 'Full-time',
    remote: false,
    salary: '$130,000 - $160,000',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    description: 'Looking for a DevOps Engineer to improve our infrastructure and deployment processes...',
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'AWS'],
    tags: ['Senior Level', 'DevOps', 'Infrastructure'],
    applicants: 15,
  },
  {
    id: 5,
    title: 'Mobile Developer',
    company: 'AppWorks',
    companyId: 5,
    logo: '/images/companies/appworks.svg',
    location: 'Seattle, WA',
    type: 'Contract',
    remote: false,
    salary: '$80 - $100 / hour',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    description: 'We need a skilled Mobile Developer to work on our cross-platform applications...',
    skills: ['React Native', 'iOS', 'Android', 'Firebase', 'Redux'],
    tags: ['Mid-Level', 'Mobile', 'App Development'],
    applicants: 21,
  },
  {
    id: 6,
    title: 'Data Scientist',
    company: 'AnalyticsPro',
    companyId: 6,
    logo: '/images/companies/analyticspro.svg',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    salary: '$125,000 - $155,000',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    description: 'Join our data team to analyze complex data sets and build predictive models...',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization', 'Statistics'],
    tags: ['Senior Level', 'Data Science', 'Analytics'],
    applicants: 28,
  },
  {
    id: 7,
    title: 'Full Stack JavaScript Developer',
    company: 'TechCorp',
    companyId: 1,
    logo: '/images/companies/techcorp.svg',
    location: 'Austin, TX',
    type: 'Full-time',
    remote: true,
    salary: '$100,000 - $130,000',
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    description: 'Seeking a Full Stack Developer proficient in JavaScript technologies...',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    tags: ['Mid-Level', 'Full Stack', 'Web Development'],
    applicants: 42,
  },
  {
    id: 8,
    title: 'UI/UX Designer',
    company: 'DesignHub',
    companyId: 3,
    logo: '/images/companies/designhub.svg',
    location: 'Remote',
    type: 'Part-time',
    remote: true,
    salary: '$50 - $70 / hour',
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    description: 'Looking for a part-time UI/UX Designer to help with our product design...',
    skills: ['UI Design', 'UX Research', 'Figma', 'Sketch', 'Adobe XD'],
    tags: ['Mid-Level', 'Design', 'Part-time'],
    applicants: 19,
  },
];

// Filter types
type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
type ExperienceLevel = 'Entry Level' | 'Mid-Level' | 'Senior Level';
type SalaryRange = 'Under $50k' | '$50k-$100k' | '$100k-$150k' | '$150k+';

interface Filters {
  jobType: JobType[];
  remote: boolean | null;
  experienceLevel: ExperienceLevel[];
  salaryRange: SalaryRange[];
}

export default function JobsPage() {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('keyword') || '';
  const locationParam = searchParams.get('location') || '';
  
  const [keyword, setKeyword] = useState(keywordParam);
  const [location, setLocation] = useState(locationParam);
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    jobType: [],
    remote: null,
    experienceLevel: [],
    salaryRange: [],
  });
  
  // Function to toggle saving a job
  const toggleSaveJob = (jobId: number) => {
    setSavedJobs((prev) => 
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };
  
  // Apply filters
  useEffect(() => {
    let result = [...mockJobs];
    
    // Keyword search
    if (keyword) {
      const searchTerms = keyword.toLowerCase().split(' ');
      result = result.filter(job => 
        searchTerms.some(term => 
          job.title.toLowerCase().includes(term) || 
          job.company.toLowerCase().includes(term) || 
          job.description.toLowerCase().includes(term) ||
          job.skills.some(skill => skill.toLowerCase().includes(term))
        )
      );
    }
    
    // Location search
    if (location) {
      const locationTerms = location.toLowerCase().split(' ');
      result = result.filter(job => 
        locationTerms.some(term => 
          job.location.toLowerCase().includes(term)
        )
      );
    }
    
    // Job type filter
    if (filters.jobType.length > 0) {
      result = result.filter(job => filters.jobType.includes(job.type as JobType));
    }
    
    // Remote filter
    if (filters.remote !== null) {
      result = result.filter(job => job.remote === filters.remote);
    }
    
    // Experience level filter
    if (filters.experienceLevel.length > 0) {
      result = result.filter(job => 
        job.tags.some(tag => filters.experienceLevel.includes(tag as ExperienceLevel))
      );
    }
    
    // Salary range filter
    if (filters.salaryRange.length > 0) {
      result = result.filter(job => {
        // Extract minimum salary value
        const salaryString = job.salary;
        const minSalary = parseInt(salaryString.replace(/[^0-9]/g, ''));
        
        return filters.salaryRange.some(range => {
          if (range === 'Under $50k') return minSalary < 50000;
          if (range === '$50k-$100k') return minSalary >= 50000 && minSalary < 100000;
          if (range === '$100k-$150k') return minSalary >= 100000 && minSalary < 150000;
          if (range === '$150k+') return minSalary >= 150000;
          return false;
        });
      });
    }
    
    setFilteredJobs(result);
  }, [keyword, location, filters]);
  
  // Handle filter change
  const handleFilterChange = (filterType: keyof Filters, value: any) => {
    setFilters(prev => {
      if (filterType === 'remote') {
        return { ...prev, remote: value };
      }
      
      if (Array.isArray(prev[filterType])) {
        const currentValues = prev[filterType] as any[];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [filterType]: currentValues.filter(v => v !== value),
          };
        } else {
          return {
            ...prev, 
            [filterType]: [...currentValues, value],
          };
        }
      }
      
      return prev;
    });
  };
  
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
              <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Search Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Find Your Dream Job</h1>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <form className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                  placeholder="Job title, keywords, or company"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                  placeholder="City, state, or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-md px-6 py-3 text-sm font-medium flex-shrink-0"
              >
                Search Jobs
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 lg:pr-8 lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
              
              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</h3>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        id={`job-type-${type}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={filters.jobType.includes(type as JobType)}
                        onChange={() => handleFilterChange('jobType', type)}
                      />
                      <label htmlFor={`job-type-${type}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Remote */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Remote Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="remote-yes"
                      type="radio"
                      name="remote"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={filters.remote === true}
                      onChange={() => handleFilterChange('remote', true)}
                    />
                    <label htmlFor="remote-yes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Remote Only
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="remote-no"
                      type="radio"
                      name="remote"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={filters.remote === false}
                      onChange={() => handleFilterChange('remote', false)}
                    />
                    <label htmlFor="remote-no" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      On-site Only
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="remote-both"
                      type="radio"
                      name="remote"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={filters.remote === null}
                      onChange={() => handleFilterChange('remote', null)}
                    />
                    <label htmlFor="remote-both" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Both
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</h3>
                <div className="space-y-2">
                  {['Entry Level', 'Mid-Level', 'Senior Level'].map((level) => (
                    <div key={level} className="flex items-center">
                      <input
                        id={`exp-${level}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={filters.experienceLevel.includes(level as ExperienceLevel)}
                        onChange={() => handleFilterChange('experienceLevel', level)}
                      />
                      <label htmlFor={`exp-${level}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Salary Range */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Range</h3>
                <div className="space-y-2">
                  {['Under $50k', '$50k-$100k', '$100k-$150k', '$150k+'].map((range) => (
                    <div key={range} className="flex items-center">
                      <input
                        id={`salary-${range}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={filters.salaryRange.includes(range as SalaryRange)}
                        onChange={() => handleFilterChange('salaryRange', range)}
                      />
                      <label htmlFor={`salary-${range}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {range}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Clear Filters */}
              <button
                type="button"
                className="mt-4 w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setFilters({
                  jobType: [],
                  remote: null,
                  experienceLevel: [],
                  salaryRange: [],
                })}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredJobs.length} Jobs Found
              </h2>
              <button
                type="button"
                className="lg:hidden inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowFilters(!showFilters)}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <div 
                    key={job.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between">
                      <div className="flex">
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
                          <h3 className="text-lg font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-200">
                            <Link href={`/jobs/${job.id}`}>
                              {job.title}
                            </Link>
                          </h3>
                          <Link 
                            href={`/companies/${job.companyId}`}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          >
                            {job.company}
                          </Link>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                        className="text-gray-400 hover:text-primary-600 focus:outline-none h-10 w-10 flex items-center justify-center"
                      >
                        {savedJobs.includes(job.id) ? (
                          <BookmarkSolidIcon className="h-6 w-6 text-primary-600" />
                        ) : (
                          <BookmarkIcon className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-900 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 ring-1 ring-inset ring-primary-600/10">
                        {job.type}
                      </span>
                      {job.remote && (
                        <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/10">
                          Remote
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/10">
                        {job.salary}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="badge badge-secondary">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="badge badge-secondary">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-5 w-5 mr-1" />
                        {job.location}
                        <span className="mx-2">&bull;</span>
                        Posted {formatDistanceToNow(job.postedAt, { addSuffix: true })}
                        <span className="mx-2">&bull;</span>
                        {job.applicants} applicants
                      </div>
                      <Link
                        href={`/jobs/${job.id}/apply`}
                        className="btn-primary text-sm"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria or browse our latest jobs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}