import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Company from '@/models/Company';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Schema validation for review creation
const createReviewSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title is required').max(100),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000),
  pros: z.string().max(500).optional(),
  cons: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional(),
});

// GET handler - fetch reviews for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || '-createdAt'; // Default to newest first

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find company to verify it exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    // Only fetch approved reviews by default
    const reviews = await Review.find({ 
      company: companyId,
      status: 'approved'
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'name avatar title isVerified',
      });

    // Get total count for pagination
    const total = await Review.countDocuments({ 
      company: companyId,
      status: 'approved'
    });

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { company: company._id, status: 'approved' } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    const averageRating = avgRating.length > 0 ? avgRating[0].average : 0;

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      averageRating,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST handler - create a new review
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
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { 
      companyId, 
      rating, 
      title, 
      content, 
      pros, 
      cons, 
      isAnonymous 
    } = validation.data;

    await dbConnect();

    // Find user from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this company
    const existingReview = await Review.findOne({
      company: companyId,
      user: user._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this company' },
        { status: 400 }
      );
    }

    // Auto-verify if user has been verified or has verified email
    const isVerified = user.isVerified || false;

    // Create new review
    const review = await Review.create({
      company: companyId,
      user: user._id,
      rating,
      title,
      content,
      pros,
      cons,
      isAnonymous: isAnonymous || false,
      isVerified,
      status: isVerified ? 'approved' : 'pending', // Auto-approve for verified users
    });

    // Update company rating
    await updateCompanyRating(companyId);

    return NextResponse.json({
      success: true,
      data: review,
      message: isVerified 
        ? 'Review submitted successfully' 
        : 'Review submitted and pending approval',
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

// Helper function to update company rating
async function updateCompanyRating(companyId: string) {
  const avgRating = await Review.aggregate([
    { $match: { company: companyId, status: 'approved' } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (avgRating.length > 0) {
    await Company.findByIdAndUpdate(companyId, {
      rating: {
        average: avgRating[0].average,
        count: avgRating[0].count,
      },
    });
  }
}