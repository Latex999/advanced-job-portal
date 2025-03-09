import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: mongoose.Types.ObjectId;
  description: string;
  location: string;
  isRemote: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  category: string;
  tags: string[];
  skills: string[];
  experience: string;
  education: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryCycle?: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  isSalaryNegotiable: boolean;
  hideSalary: boolean;
  benefits: string[];
  applicationDeadline?: Date;
  applicationLink?: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applicants: {
    user: mongoose.Types.ObjectId;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    appliedAt: Date;
    resume?: string;
    coverLetter?: string;
  }[];
  views: number;
  postedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
      required: [true, 'Please add a job type'],
    },
    category: {
      type: String,
      required: [true, 'Please add a job category'],
    },
    tags: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
        required: [true, 'Please add at least one required skill'],
      },
    ],
    experience: {
      type: String,
      required: [true, 'Please specify required experience'],
    },
    education: {
      type: String,
      required: [true, 'Please specify required education'],
    },
    minSalary: {
      type: Number,
    },
    maxSalary: {
      type: Number,
    },
    currency: {
      type: String,
    },
    salaryCycle: {
      type: String,
      enum: ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
    },
    isSalaryNegotiable: {
      type: Boolean,
      default: false,
    },
    hideSalary: {
      type: Boolean,
      default: false,
    },
    benefits: [
      {
        type: String,
      },
    ],
    applicationDeadline: {
      type: Date,
    },
    applicationLink: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'expired'],
      default: 'published',
    },
    applicants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
          default: 'pending',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        resume: {
          type: String,
        },
        coverLetter: {
          type: String,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for search
JobSchema.index({ title: 'text', description: 'text', skills: 'text', tags: 'text' });

// Create indexes for filtering
JobSchema.index({ location: 1 });
JobSchema.index({ type: 1 });
JobSchema.index({ category: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);