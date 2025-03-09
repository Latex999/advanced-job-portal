import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  resume: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  answers?: {
    question: string;
    answer: string;
  }[];
  notes?: {
    content: string;
    addedBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  interviews?: {
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    location?: string;
    meetingLink?: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    feedback?: string;
    rating?: number;
  }[];
  rating?: number;
  withdrawn: boolean;
  withdrawnReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String,
      required: [true, 'Please provide a resume'],
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    answers: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    notes: [
      {
        content: {
          type: String,
          required: true,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    interviews: [
      {
        date: {
          type: Date,
          required: true,
        },
        type: {
          type: String,
          enum: ['phone', 'video', 'in-person'],
          required: true,
        },
        location: {
          type: String,
        },
        meetingLink: {
          type: String,
        },
        notes: {
          type: String,
        },
        status: {
          type: String,
          enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
          default: 'scheduled',
        },
        feedback: {
          type: String,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    withdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawnReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ company: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);