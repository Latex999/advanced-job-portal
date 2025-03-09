import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

// Define the validation schema
const reviewSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  rating: z.number().min(1, 'Rating is required').max(5),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000),
  pros: z.string().max(500).optional(),
  cons: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  companyId: string;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ companyId, onSubmitSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      isAnonymous: false,
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      setIsSubmitting(true);
      
      // API call would go here
      const response = await fetch('/api/companies/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          companyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      reset();
      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    if (onCancel) onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Write a Review</h2>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1"
                onClick={() => setValue('rating', star, { shouldValidate: true })}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                {(hoverRating || rating) >= star ? (
                  <StarIcon className="h-8 w-8 text-yellow-400" />
                ) : (
                  <StarIconOutline className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                )}
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Summarize your experience"
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review
          </label>
          <textarea
            id="content"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="What did you like or dislike about working here?"
            {...register('content')}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-1">
              Pros (Optional)
            </label>
            <textarea
              id="pros"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="What were the best parts about working here?"
              {...register('pros')}
            />
            {errors.pros && (
              <p className="mt-1 text-sm text-red-600">{errors.pros.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-1">
              Cons (Optional)
            </label>
            <textarea
              id="cons"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="What were the downsides of working here?"
              {...register('cons')}
            />
            {errors.cons && (
              <p className="mt-1 text-sm text-red-600">{errors.cons.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="isAnonymous"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('isAnonymous')}
            />
            <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
              Post anonymously
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;