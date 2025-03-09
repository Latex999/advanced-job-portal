import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  isAnonymous: boolean;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpfulVotes: mongoose.Types.ObjectId[];
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IReviewModel extends Model<IReview> {
  // Add any static methods here
}

const ReviewSchema = new Schema<IReview>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      trim: true,
      minlength: [10, 'Review content must be at least 10 characters'],
      maxlength: [2000, 'Review content cannot be more than 2000 characters'],
    },
    pros: {
      type: String,
      trim: true,
      maxlength: [500, 'Pros cannot be more than 500 characters'],
    },
    cons: {
      type: String,
      trim: true,
      maxlength: [500, 'Cons cannot be more than 500 characters'],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    helpfulVotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only review a company once
ReviewSchema.index({ company: 1, user: 1 }, { unique: true });

// Virtual field for helpful votes count
ReviewSchema.virtual('helpfulCount').get(function (this: IReview) {
  return this.helpfulVotes.length;
});

// Method to toggle helpful vote
ReviewSchema.methods.toggleHelpfulVote = async function (userId: mongoose.Types.ObjectId) {
  const isVoted = this.helpfulVotes.includes(userId);
  
  if (isVoted) {
    // Remove vote
    this.helpfulVotes = this.helpfulVotes.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(userId)
    );
  } else {
    // Add vote
    this.helpfulVotes.push(userId);
  }
  
  await this.save();
  return !isVoted; // Return true if vote was added, false if removed
};

// Method to report a review
ReviewSchema.methods.report = async function () {
  this.reportCount += 1;
  
  // Auto-reject reviews with high report counts
  if (this.reportCount >= 5) {
    this.status = 'rejected';
  }
  
  await this.save();
  return this.reportCount;
};

// Using function to avoid error: "Cannot overwrite model once compiled"
export default mongoose.models.Review || mongoose.model<IReview, IReviewModel>('Review', ReviewSchema);