import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ReviewAuthor {
  name: string;
  avatar?: string;
  jobTitle?: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  author: ReviewAuthor;
  isVerified: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  helpfulVotes: string[];
  helpfulCount: number;
  isHelpful?: boolean; // For the current user
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  ratingDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

interface UseCompanyReviewsProps {
  companyId: string;
  initialData?: ReviewsData;
}

interface VoteData {
  reviewId: string;
  action: 'helpful' | 'report';
}

export function useCompanyReviews({ companyId, initialData }: UseCompanyReviewsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewsData | null>(initialData || null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('recent');

  const fetchReviews = useCallback(
    async (page: number = 1, sort: string = 'recent') => {
      if (!companyId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Determine sort parameter for API
        const sortParam = sort === 'recent' ? '-createdAt' : 
                         sort === 'helpful' ? '-helpfulCount' : 
                         sort === 'highest' ? '-rating' : 
                         sort === 'lowest' ? 'rating' : '-createdAt';

        const response = await axios.get(`/api/companies/reviews`, {
          params: {
            companyId,
            page,
            limit: 10,
            sort: sortParam,
          },
        });

        // Transform data to match our interface
        const reviewsData: ReviewsData = {
          reviews: response.data.data.map((review: any) => ({
            id: review._id,
            rating: review.rating,
            title: review.title,
            content: review.content,
            pros: review.pros,
            cons: review.cons,
            author: {
              name: review.isAnonymous ? 'Anonymous User' : review.user.name,
              avatar: review.isAnonymous ? null : review.user.avatar,
              jobTitle: review.isAnonymous ? null : review.user.title,
            },
            isVerified: review.isVerified,
            isAnonymous: review.isAnonymous,
            createdAt: new Date(review.createdAt),
            helpfulVotes: review.helpfulVotes || [],
            helpfulCount: review.helpfulVotes?.length || 0,
            isHelpful: review.helpfulVotes?.includes(response.data.currentUserId),
          })),
          averageRating: response.data.averageRating,
          totalReviews: response.data.pagination.total,
          pagination: response.data.pagination,
          ratingDistribution: response.data.ratingDistribution || {
            '5': 0,
            '4': 0,
            '3': 0,
            '2': 0,
            '1': 0,
          },
        };

        setData(reviewsData);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [companyId]
  );

  const submitReview = async (reviewData: any) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/companies/reviews', {
        ...reviewData,
        companyId,
      });
      
      toast.success(response.data.message || 'Review submitted successfully');
      
      // Re-fetch reviews to get updated data
      fetchReviews(currentPage, sortBy);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to submit review';
      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Error submitting review:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const voteOnReview = async ({ reviewId, action }: VoteData) => {
    try {
      const response = await axios.post('/api/companies/reviews/vote', {
        reviewId,
        action,
      });
      
      // Update the review in our local state
      if (data && data.reviews) {
        const updatedReviews = data.reviews.map(review => {
          if (review.id === reviewId) {
            if (action === 'helpful') {
              return {
                ...review,
                helpfulCount: response.data.data.helpfulCount,
                isHelpful: response.data.data.isHelpful,
              };
            }
            return review;
          }
          return review;
        });
        
        setData({
          ...data,
          reviews: updatedReviews,
        });
      }
      
      toast.success(response.data.message);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || `Failed to ${action === 'helpful' ? 'mark as helpful' : 'report'} review`;
      toast.error(errorMessage);
      console.error(`Error ${action} review:`, err);
      return false;
    }
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
    fetchReviews(page, sortBy);
  };

  const changeSort = (sort: string) => {
    setSortBy(sort);
    fetchReviews(1, sort);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!initialData) {
      fetchReviews(currentPage, sortBy);
    }
  }, [fetchReviews, currentPage, sortBy, initialData]);

  return {
    isLoading,
    error,
    data,
    currentPage,
    sortBy,
    fetchReviews,
    submitReview,
    voteOnReview,
    changePage,
    changeSort,
  };
}