import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Company from '@/models/Company';
import Job from '@/models/Job';
import { Metadata } from 'next';

interface CompanyWithStats {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  location?: string;
  description?: string;
  rating: {
    average: number;
    count: number;
  };
  jobCount: number;
}

interface PageProps {
  searchParams: {
    industry?: string;
    location?: string;
    sort?: string;
    page?: string;
  };
}

export const metadata: Metadata = {
  title: 'Companies | Advanced Job Portal',
  description: 'Explore companies hiring on Advanced Job Portal. Find information, reviews, and job opportunities from top employers.',
};

async function getCompanies(filters: {
  industry?: string;
  location?: string;
  sort?: string;
  page?: string;
}): Promise<{
  companies: CompanyWithStats[];
  total: number;
  page: number;
  limit: number;
}> {
  await dbConnect();

  const page = parseInt(filters.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build filter query
  const query: any = {};
  if (filters.industry) {
    query.industry = filters.industry;
  }
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }

  // Determine sort order
  let sortOrder = { 'rating.average': -1 };
  if (filters.sort === 'name') {
    sortOrder = { name: 1 };
  } else if (filters.sort === 'jobs') {
    // We'll handle this after getting results
  }

  const companies = await Company.find(query)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Company.countDocuments(query);

  // Get job counts for each company
  const companiesWithStats = await Promise.all(
    companies.map(async (company) => {
      const jobCount = await Job.countDocuments({
        company: company._id,
        isActive: true,
      });

      return {
        ...company,
        id: company._id.toString(),
        jobCount,
      };
    })
  );

  // Sort by job count if requested
  if (filters.sort === 'jobs') {
    companiesWithStats.sort((a, b) => b.jobCount - a.jobCount);
  }

  return {
    companies: companiesWithStats,
    total,
    page,
    limit,
  };
}

async function getIndustries() {
  await dbConnect();
  const industries = await Company.distinct('industry');
  return industries.filter(Boolean);
}

async function getLocations() {
  await dbConnect();
  const locations = await Company.distinct('location');
  return locations.filter(Boolean);
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const { companies, total, page, limit } = await getCompanies(searchParams);
  const industries = await getIndustries();
  const locations = await getLocations();

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Discover companies that are hiring and find your next career opportunity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-5 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>

            <form>
              <div className="mb-4">
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  defaultValue={searchParams.industry || ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  defaultValue={searchParams.location || ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={searchParams.sort || 'rating'}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="rating">Top Rated</option>
                  <option value="name">Alphabetical</option>
                  <option value="jobs">Most Jobs</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Company Listings */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{companies.length}</span> of{' '}
                <span className="font-medium">{total}</span> companies
              </p>
            </div>

            <div className="space-y-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-col sm:flex-row border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xl">
                          {company.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 sm:ml-4 mt-3 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <Link href={`/companies/${company.id}`}>
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {company.name}
                          </h3>
                        </Link>

                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          {company.industry && <span>{company.industry}</span>}
                          {company.location && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>{company.location}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center mt-2 sm:mt-0">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
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
                        </div>
                        <span className="ml-1 text-sm text-gray-500">
                          {company.rating?.average?.toFixed(1) || 'N/A'} ({company.rating?.count || 0})
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {company.description || 'No description available.'}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/companies/${company.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Company Profile
                      </Link>
                      <Link
                        href={`/jobs?companyId=${company.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        {company.jobCount} {company.jobCount === 1 ? 'Job' : 'Jobs'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-md">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, total)}
                    </span>{' '}
                    of <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Link
                      href={{
                        pathname: '/companies',
                        query: { ...searchParams, page: Math.max(1, page - 1).toString() },
                      }}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        page <= 1 ? 'pointer-events-none opacity-50' : ''
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.min(
                        Math.max(1, page - 2) + i,
                        totalPages
                      );
                      if (pageNumber <= 0 || pageNumber > totalPages) return null;

                      return (
                        <Link
                          key={pageNumber}
                          href={{
                            pathname: '/companies',
                            query: { ...searchParams, page: pageNumber.toString() },
                          }}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === pageNumber
                              ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      );
                    })}

                    <Link
                      href={{
                        pathname: '/companies',
                        query: { ...searchParams, page: Math.min(totalPages, page + 1).toString() },
                      }}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        page >= totalPages ? 'pointer-events-none opacity-50' : ''
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}