import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Company from '@/models/Company';
import Job from '@/models/Job';
import Review from '@/models/Review';
import { formatDistanceToNow } from 'date-fns';
import ReviewCard from '@/components/company/ReviewCard';
import ReviewForm from '@/components/company/ReviewForm';
import { Metadata, ResolvingMetadata } from 'next';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    tab?: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  await dbConnect();
  const company = await Company.findById(params.id).lean();
  
  if (!company) {
    return {
      title: 'Company Not Found',
      description: 'The requested company could not be found.',
    };
  }
  
  return {
    title: `${company.name} - Company Profile`,
    description: company.description?.substring(0, 160) || `Learn more about ${company.name}, view jobs and reviews.`,
    openGraph: {
      title: `${company.name} - Company Profile`,
      description: company.description?.substring(0, 160) || `Learn more about ${company.name}, view jobs and reviews.`,
      images: company.logo ? [company.logo] : [],
    },
  };
}

async function getCompanyDetails(id: string) {
  await dbConnect();
  
  const company = await Company.findById(id).lean();
  if (!company) return null;
  
  // Get active job count
  const jobCount = await Job.countDocuments({ 
    company: id,
    isActive: true 
  });
  
  // Get review stats
  const reviewStats = await Review.aggregate([
    { $match: { company: company._id, status: 'approved' } },
    { 
      $group: { 
        _id: null, 
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 } 
      } 
    }
  ]);
  
  const reviews = await Review.find({ 
    company: id,
    status: 'approved' 
  })
    .sort('-createdAt')
    .limit(5)
    .populate({
      path: 'user',
      select: 'name avatar title isVerified',
    })
    .lean();
  
  return {
    ...company,
    id: company._id.toString(),
    jobCount,
    reviews: reviews.map(review => ({
      ...review,
      id: review._id.toString(),
      createdAt: review.createdAt,
      author: {
        name: review.isAnonymous ? 'Anonymous User' : review.user.name,
        avatar: review.isAnonymous ? null : review.user.avatar,
        jobTitle: review.isAnonymous ? null : review.user.title,
      },
    })),
    rating: {
      average: reviewStats[0]?.avgRating || 0,
      count: reviewStats[0]?.count || 0,
    },
  };
}

async function getCompanyJobs(companyId: string) {
  await dbConnect();
  
  const jobs = await Job.find({
    company: companyId,
    isActive: true,
  })
    .sort('-createdAt')
    .limit(5)
    .lean();
  
  return jobs.map(job => ({
    ...job,
    id: job._id.toString(),
    createdAt: job.createdAt,
  }));
}

export default async function CompanyDetailsPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const activeTab = searchParams.tab || 'about';
  
  const company = await getCompanyDetails(params.id);
  if (!company) notFound();
  
  const jobs = await getCompanyJobs(params.id);
  
  // Calculate rating distribution
  const ratingStars = [
    { value: 5, label: '5 stars', percentage: '0%' },
    { value: 4, label: '4 stars', percentage: '0%' },
    { value: 3, label: '3 stars', percentage: '0%' },
    { value: 2, label: '2 stars', percentage: '0%' },
    { value: 1, label: '1 star', percentage: '0%' },
  ];
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative h-24 w-24 min-w-24 rounded-lg overflow-hidden border border-gray-200">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              {company.industry && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  {company.industry}
                </span>
              )}
              
              {company.location && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {company.location}
                </span>
              )}
              
              {company.size && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  {company.size}
                </span>
              )}
              
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Founded {company.foundedYear || 'N/A'}
              </span>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(company.rating?.average || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-gray-700">
                  {company.rating?.average?.toFixed(1) || 'No ratings'} ({company.rating?.count || 0})
                </span>
              </div>
              
              <div className="ml-6 text-sm">
                <span className="text-blue-600">{company.jobCount}</span> active jobs
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col gap-2">
            <Link
              href={`/jobs?companyId=${company.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Jobs
            </Link>
            
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href={`/companies/${params.id}?tab=about`}
            className={`${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            About
          </Link>
          <Link
            href={`/companies/${params.id}?tab=jobs`}
            className={`${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Jobs ({company.jobCount})
          </Link>
          <Link
            href={`/companies/${params.id}?tab=reviews`}
            className={`${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Reviews ({company.rating?.count || 0})
          </Link>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${activeTab !== 'about' && activeTab !== 'jobs' ? 'hidden lg:block' : ''}`}>
          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">About {company.name}</h2>
              
              <div className="prose max-w-none text-gray-700">
                {company.description ? (
                  <p>{company.description}</p>
                ) : (
                  <p>No company description available.</p>
                )}
              </div>
              
              {company.benefits && company.benefits.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Benefits & Perks</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {company.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Open Positions</h2>
                <Link
                  href={`/jobs?companyId=${company.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all jobs
                </Link>
              </div>
              
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="mt-1 text-sm text-gray-500">
                        {job.location} • {job.employmentType}
                      </div>
                      
                      <div className="mt-2">
                        {job.skills?.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills?.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                        </div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View Details
                          <svg
                            className="ml-1 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No open positions available at this time.
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={activeTab === 'reviews' ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Reviews & Ratings</h2>
              {!activeTab.includes('reviews') && (
                <Link
                  href={`/companies/${params.id}?tab=reviews`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  See all reviews
                </Link>
              )}
            </div>
            
            {company.rating?.count > 0 ? (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-5xl font-bold text-gray-900">
                      {company.rating.average.toFixed(1)}
                    </span>
                    <div className="ml-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(company.rating.average)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Based on {company.rating.count} reviews
                      </p>
                    </div>
                  </div>
                  
                  {activeTab === 'reviews' && (
                    <div className="ml-6 flex-1 space-y-2">
                      {ratingStars.map((star) => (
                        <div key={star.value} className="flex items-center text-sm">
                          <span className="w-12 text-gray-600">{star.label}</span>
                          <div className="ml-2 flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: star.percentage }}
                            ></div>
                          </div>
                          <span className="ml-2 w-8 text-gray-500 text-right">{star.percentage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 mb-6">
                No reviews yet. Be the first to review this company.
              </div>
            )}
            
            {company.reviews && company.reviews.length > 0 ? (
              <div className="space-y-4">
                {company.reviews.slice(0, activeTab === 'reviews' ? undefined : 2).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                
                {activeTab !== 'reviews' && company.reviews.length > 2 && (
                  <div className="text-center mt-4">
                    <Link
                      href={`/companies/${params.id}?tab=reviews`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View all {company.rating.count} reviews
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
            
            {activeTab === 'reviews' && session?.user && (
              <div className="mt-8">
                <ReviewForm 
                  companyId={company.id}
                  onSubmitSuccess={() => {
                    // This would trigger a refresh in a client component
                  }}
                />
              </div>
            )}
            
            {activeTab === 'reviews' && !session?.user && (
              <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Share your experience</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sign in to leave a review for {company.name}
                </p>
                <div className="mt-4">
                  <Link
                    href={`/auth/signin?callbackUrl=/companies/${company.id}?tab=reviews`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign in to Write a Review
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}