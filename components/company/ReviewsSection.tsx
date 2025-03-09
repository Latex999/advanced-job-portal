'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { useCompanyReviews, Review } from '@/utils/hooks/useCompanyReviews';

interface ReviewsSectionProps {
  companyId: string;
  companyName: string;
  initialData?: any;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  companyId,
  companyName,
  initialData,
}) => {
  const { data: session } = useSession();
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  const {
    isLoading,
    error,
    data,
    currentPage,
    sortBy,
    voteOnReview,
    submitReview,
    changePage,
    changeSort,
  } = useCompanyReviews({
    companyId,
    initialData,
  });

  const handleHelpfulClick = async (reviewId: string) => {
    if (!session) {
      // Redirect to sign in or show a message
      return;
    }
    await voteOnReview({ reviewId, action: 'helpful' });
  };

  const handleReportClick = async (reviewId: string) => {
    if (!session) {
      // Redirect to sign in or show a message
      return;
    }
    await voteOnReview({ reviewId, action: 'report' });
  };

  const handleSubmitReview = async (reviewData: any) => {
    const success = await submitReview(reviewData);
    if (success) {
      setShowReviewForm(false);
    }
    return success;
  };

  // Calculate rating distribution percentages
  const getRatingDistribution = () => {
    if (!data) return null;

    const { totalReviews } = data;
    if (totalReviews === 0) return null;

    const distribution = data.ratingDistribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    
    return Object.entries(distribution)
      .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort by rating (5 to 1)
      .map(([rating, count]) => ({
        rating: Number(rating),
        count: Number(count),
        percentage: totalReviews > 0 ? Math.round((Number(count) / totalReviews) * 100) : 0,
      }));
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
        {session && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm
            companyId={companyId}
            onSubmitSuccess={() => setShowReviewForm(false)}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {!isLoading && data && data.totalReviews > 0 ? (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="flex-shrink-0 flex items-center mb-4 md:mb-0">
                <span className="text-5xl font-bold text-gray-900">
                  {data.averageRating.toFixed(1)}
                </span>
                <div className="ml-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(data.averageRating)
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
                    Based on {data.totalReviews} reviews
                  </p>
                </div>
              </div>

              {ratingDistribution && (
                <div className="md:ml-10 flex-1 space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.rating} className="flex items-center text-sm">
                      <span className="w-12 text-gray-600">{item.rating} stars</span>
                      <div className="ml-2 flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 w-8 text-gray-500 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{data.reviews.length}</span> of{' '}
              <span className="font-medium">{data.totalReviews}</span> reviews
            </p>
            <div>
              <label htmlFor="sort" className="text-sm text-gray-700 mr-2">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => changeSort(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {data.reviews.map((review: Review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                <ReviewCard review={review} />
                
                {session && (
                  <div className="mt-3 flex space-x-4 text-sm">
                    <button
                      onClick={() => handleHelpfulClick(review.id)}
                      className={`flex items-center ${
                        review.isHelpful ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {review.isHelpful ? 'Helpful' : 'Mark as Helpful'} ({review.helpfulCount})
                    </button>
                    <button
                      onClick={() => handleReportClick(review.id)}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => changePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                  const pageNumber = Math.min(
                    Math.max(1, currentPage - 2) + i,
                    data.pagination.pages
                  );
                  if (pageNumber <= 0 || pageNumber > data.pagination.pages) return null;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => changePage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => changePage(Math.min(data.pagination.pages, currentPage + 1))}
                  disabled={currentPage === data.pagination.pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === data.pagination.pages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full loader border-t-blue-600 animate-spin"></div>
            </div>
          ) : (
            <>
              <p className="text-gray-500 mb-4">
                No reviews yet for {companyName}. Be the first to share your experience!
              </p>

              {session ? (
                !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Write a Review
                  </button>
                )
              ) : (
                <Link
                  href={`/auth/signin?callbackUrl=/companies/${companyId}?tab=reviews`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign in to Write a Review
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;