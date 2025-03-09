import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Schema validation for vote action
const voteSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  action: z.enum(['helpful', 'report']),
});

// POST handler - toggle helpful vote or report a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input data
    const validation = voteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { reviewId, action } = validation.data;

    await dbConnect();

    // Find user from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Prevent users from voting on their own reviews
    if (review.user.toString() === user._id.toString()) {
      return NextResponse.json(
        { error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    let result;
    
    if (action === 'helpful') {
      // Toggle helpful vote
      result = await review.toggleHelpfulVote(user._id);
      
      return NextResponse.json({
        success: true,
        data: {
          helpfulCount: review.helpfulVotes.length,
          isHelpful: result, // true if added, false if removed
        },
        message: result 
          ? 'Marked review as helpful' 
          : 'Removed helpful mark',
      });
    } 
    else if (action === 'report') {
      // Check if user has already reported this review
      const isReported = await checkIfAlreadyReported(user._id, reviewId);
      
      if (isReported) {
        return NextResponse.json(
          { error: 'You have already reported this review' },
          { status: 400 }
        );
      }
      
      // Report the review
      const reportCount = await review.report();
      
      // Store report action to prevent multiple reports
      await storeReportAction(user._id, reviewId);
      
      return NextResponse.json({
        success: true,
        data: {
          reportCount,
          status: review.status,
        },
        message: 'Review reported successfully',
      });
    }

  } catch (error: any) {
    console.error('Error processing review vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process vote' },
      { status: 500 }
    );
  }
}

// Helper functions

// Store report actions in a separate collection to prevent multiple reports
async function storeReportAction(userId: string, reviewId: string) {
  // This would typically be a separate model/collection
  // For simplicity, we're just using a field on the user model
  
  await User.findByIdAndUpdate(
    userId,
    { 
      $addToSet: { 
        reportedReviews: reviewId 
      } 
    }
  );
}

// Check if a user has already reported a review
async function checkIfAlreadyReported(userId: string, reviewId: string) {
  // This would check against the stored report actions
  // For simplicity, we're checking a field on the user model
  
  const user = await User.findById(userId);
  if (!user.reportedReviews) return false;
  
  return user.reportedReviews.includes(reviewId);
}