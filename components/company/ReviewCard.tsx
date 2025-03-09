import React from 'react';
import { format } from 'date-fns';
import { StarIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    content: string;
    pros?: string;
    cons?: string;
    author: {
      name: string;
      avatar?: string;
      jobTitle?: string;
    };
    isVerified: boolean;
    createdAt: Date;
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        aria-hidden="true"
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {review.author.avatar ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={review.author.avatar}
                alt={review.author.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {review.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{review.author.name}</p>
            {review.author.jobTitle && (
              <p className="text-sm text-gray-600">{review.author.jobTitle}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(review.createdAt), 'MMM d, yyyy')}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center mb-1">
          <div className="flex mr-2">{renderStars(review.rating)}</div>
          <span className="text-gray-700 font-medium">{review.rating.toFixed(1)}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
      </div>

      <div className="mb-4 text-gray-700">{review.content}</div>

      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {review.pros && (
            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-1">Pros</h4>
              <p className="text-sm text-gray-700">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-1">Cons</h4>
              <p className="text-sm text-gray-700">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {review.isVerified && (
        <div className="flex items-center text-green-600 text-sm mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Verified Review
        </div>
      )}
    </div>
  );
};

export default ReviewCard;