'use client';

import Link from 'next/link';
import Image from 'next/image';

// Mock data for top companies
const topCompanies = [
  {
    id: 1,
    name: 'TechCorp',
    logo: '/images/companies/techcorp.svg',
    industry: 'Technology',
    location: 'San Francisco, CA',
    openJobs: 15,
    description: 'Leading technology company specializing in cloud solutions and software development.',
    followers: 12500,
  },
  {
    id: 2,
    name: 'DataStream',
    logo: '/images/companies/datastream.svg',
    industry: 'Data Analytics',
    location: 'Remote',
    openJobs: 8,
    description: 'Innovative data analytics platform helping businesses make data-driven decisions.',
    followers: 8300,
  },
  {
    id: 3,
    name: 'DesignHub',
    logo: '/images/companies/designhub.svg',
    industry: 'Design Services',
    location: 'New York, NY',
    openJobs: 6,
    description: 'Creative agency offering cutting-edge design solutions for global brands.',
    followers: 9200,
  },
  {
    id: 4,
    name: 'CloudSolutions',
    logo: '/images/companies/cloudsolutions.svg',
    industry: 'Cloud Computing',
    location: 'Chicago, IL',
    openJobs: 12,
    description: 'Enterprise cloud solutions provider with a focus on security and scalability.',
    followers: 11000,
  },
  {
    id: 5,
    name: 'AppWorks',
    logo: '/images/companies/appworks.svg',
    industry: 'Mobile Development',
    location: 'Seattle, WA',
    openJobs: 10,
    description: 'Mobile app development studio creating innovative solutions for iOS and Android.',
    followers: 7800,
  },
  {
    id: 6,
    name: 'AnalyticsPro',
    logo: '/images/companies/analyticspro.svg',
    industry: 'Data Science',
    location: 'Austin, TX',
    openJobs: 9,
    description: 'Data science company specializing in machine learning and artificial intelligence.',
    followers: 9600,
  },
];

export default function TopCompanies() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topCompanies.map((company) => (
        <Link key={company.id} href={`/companies/${company.id}`} className="card hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-start">
              <div className="mr-4 flex-shrink-0">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={60}
                  height={60}
                  className="rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/60?text=' + company.name[0];
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {company.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{company.industry}</p>
                
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {company.location}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {company.description}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="text-sm text-primary-600 font-medium">
                {company.openJobs} open positions
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {company.followers.toLocaleString()} followers
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}