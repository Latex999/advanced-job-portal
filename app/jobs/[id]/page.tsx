'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  BookmarkIcon,
  ShareIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UsersIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

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
    description: `<p>We are looking for a skilled Senior Frontend Developer to join our team at TechCorp. As a Senior Frontend Developer, you will be responsible for building and maintaining the user interfaces of our web applications.</p>
    <p>You will collaborate with designers, backend developers, and product managers to deliver high-quality, responsive web applications that meet our users' needs.</p>
    <h3>Responsibilities:</h3>
    <ul>
      <li>Develop new user-facing features using React.js and other modern JavaScript frameworks</li>
      <li>Build reusable components and front-end libraries for future use</li>
      <li>Translate designs and wireframes into high-quality code</li>
      <li>Optimize components for maximum performance across a vast array of web-capable devices and browsers</li>
      <li>Collaborate with other team members and stakeholders</li>
      <li>Mentor junior developers and review their code</li>
    </ul>
    <h3>Requirements:</h3>
    <ul>
      <li>5+ years of experience in frontend development</li>
      <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model</li>
      <li>Thorough understanding of React.js and its core principles</li>
      <li>Experience with popular React.js workflows (Redux, Hooks, etc.)</li>
      <li>Familiarity with newer specifications of ECMAScript</li>
      <li>Experience with data structure libraries (e.g., Immutable.js)</li>
      <li>Knowledge of isomorphic React is a plus</li>
      <li>Experience with TypeScript</li>
      <li>Experience with RESTful APIs and GraphQL</li>
      <li>Good understanding of asynchronous request handling, partial page updates, and AJAX</li>
      <li>Proficient understanding of cross-browser compatibility issues and ways to work around them</li>
      <li>Experience with code versioning tools such as Git</li>
    </ul>
    <h3>Benefits:</h3>
    <ul>
      <li>Competitive salary and equity package</li>
      <li>Health, dental, and vision insurance</li>
      <li>401(k) with company match</li>
      <li>Unlimited PTO</li>
      <li>Flexible work schedule</li>
      <li>Remote work option</li>
      <li>Professional development stipend</li>
      <li>Wellness program</li>
    </ul>`,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL'],
    tags: ['Senior Level', 'Frontend', 'Web Development'],
    applicants: 24,
    benefits: [
      'Health Insurance',
      'Dental & Vision',
      '401(k)',
      'Unlimited PTO',
      'Remote Work Options',
      'Professional Development Stipend',
    ],
    companyDescription: 'TechCorp is a leading technology company specializing in cloud solutions and software development.',
    companyFoundedYear: 2010,
    companySize: '501-1000',
    companyWebsite: 'https://techcorp.example.com',
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
    description: `<p>DataStream is looking for a talented Backend Engineer to join our engineering team. In this role, you will design, build, and maintain efficient, reusable, and reliable server-side code.</p>
    <p>You will work closely with other engineers, product managers, and designers to implement new features and improve existing ones.</p>
    <h3>Responsibilities:</h3>
    <ul>
      <li>Design and develop high-performance, scalable backend services and APIs</li>
      <li>Implement security and data protection measures</li>
      <li>Integrate user-facing elements with server-side logic</li>
      <li>Optimize applications for maximum speed and scalability</li>
      <li>Participate in architecture and design discussions</li>
      <li>Write clean, maintainable, and well-documented code</li>
      <li>Troubleshoot and debug applications</li>
    </ul>
    <h3>Requirements:</h3>
    <ul>
      <li>3+ years of experience in backend development</li>
      <li>Proficiency in Node.js, Express, and MongoDB</li>
      <li>Experience with RESTful APIs</li>
      <li>Knowledge of cloud services (AWS, GCP, or Azure)</li>
      <li>Familiarity with microservices architecture</li>
      <li>Understanding of serverless architecture</li>
      <li>Experience with Docker and container orchestration</li>
      <li>Solid understanding of data structures and algorithms</li>
      <li>Experience with version control systems (Git)</li>
      <li>Strong problem-solving skills</li>
    </ul>
    <h3>Benefits:</h3>
    <ul>
      <li>Competitive salary</li>
      <li>Remote work</li>
      <li>Flexible hours</li>
      <li>Health insurance</li>
      <li>401(k) plan</li>
      <li>Professional development budget</li>
      <li>Home office stipend</li>
      <li>Regular company retreats</li>
    </ul>`,
    skills: ['Node.js', 'MongoDB', 'AWS', 'Microservices', 'Docker'],
    tags: ['Mid-Level', 'Backend', 'Cloud'],
    applicants: 18,
    benefits: [
      'Remote Work',
      'Flexible Hours',
      'Health Insurance',
      '401(k)',
      'Professional Development Budget',
      'Home Office Stipend',
    ],
    companyDescription: 'DataStream is an innovative data analytics platform helping businesses make data-driven decisions.',
    companyFoundedYear: 2015,
    companySize: '51-200',
    companyWebsite: 'https://datastream.example.com',
  },
  // Add all other jobs here too
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = Number(params.id);
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  
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
  }, [jobId, router]);
  
  // Handle job saving
  const toggleSaveJob = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Job removed from saved jobs' : 'Job saved for later');
  };
  
  // Handle job sharing
  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this ${job?.title} job at ${job?.company}`,
        url: window.location.href,
      })
      .catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading job details...</p>
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
        <Link href="/jobs" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Jobs
        </Link>
        
        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16 relative">
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:truncate">
                    {job.title}
                  </h1>
                  <div className="flex items-center">
                    <Link 
                      href={`/companies/${job.companyId}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {job.company}
                    </Link>
                    <span className="mx-2 text-gray-500 dark:text-gray-400">&bull;</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Posted {formatDistanceToNow(job.postedAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                type="button"
                onClick={toggleSaveJob}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isSaved ? (
                  <BookmarkSolidIcon className="h-5 w-5 mr-2 text-primary-600" />
                ) : (
                  <BookmarkIcon className="h-5 w-5 mr-2" />
                )}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={shareJob}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Share
              </button>
              <Link
                href={`/jobs/${job.id}/apply`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Apply Now
              </Link>
            </div>
          </div>
          
          {/* Job Details */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Job Type</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{job.type}</div>
              </div>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {job.location}
                  {job.remote && ' (Remote)'}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Salary</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{job.salary}</div>
              </div>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Applications</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{job.applicants} applied</div>
              </div>
            </div>
          </div>
          
          {/* Skills/Tags */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((skill: string, idx: number) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-900 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Description */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              ></div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Company Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Company</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{job.companyDescription}</p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Founded in {job.companyFoundedYear}</span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{job.companySize} employees</span>
                </div>
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <a 
                    href={job.companyWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Visit website
                  </a>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  href={`/companies/${job.companyId}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View company profile
                </Link>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Apply for Job */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Apply for this job</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Submit your application now to join the team at {job.company}.
                </p>
                <Link
                  href={`/jobs/${job.id}/apply`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Jobs */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockJobs
              .filter(j => j.id !== job.id && j.skills.some(s => job.skills.includes(s)))
              .slice(0, 3)
              .map(relatedJob => (
                <Link 
                  key={relatedJob.id}
                  href={`/jobs/${relatedJob.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      <Image
                        src={relatedJob.logo}
                        alt={`${relatedJob.company} logo`}
                        className="rounded-md object-cover"
                        layout="fill"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(relatedJob.company)}&background=random`;
                        }}
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {relatedJob.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {relatedJob.company} • {relatedJob.location}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {relatedJob.salary}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}