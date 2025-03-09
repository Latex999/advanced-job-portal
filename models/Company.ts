import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview {
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  pros?: string;
  cons?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface ICompany extends Document {
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  website?: string;
  description: string;
  shortDescription?: string;
  industry: string;
  size: string;
  founded?: Date;
  headquarters: string;
  locations: string[];
  specialties: string[];
  culture: {
    values?: string[];
    benefits?: string[];
    workLifeBalance?: string;
    workEnvironment?: string;
  };
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  team?: {
    name: string;
    position: string;
    avatar?: string;
  }[];
  photos?: string[];
  videos?: string[];
  reviews: IReview[];
  rating: {
    average: number;
    count: number;
  };
  followers: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  isVerified: boolean;
  isActive: boolean;
  verificationDocuments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    website: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Please add a company description'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot be more than 200 characters'],
    },
    industry: {
      type: String,
      required: [true, 'Please add an industry'],
    },
    size: {
      type: String,
      required: [true, 'Please add company size'],
      enum: [
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '501-1000',
        '1001-5000',
        '5001-10000',
        '10000+',
      ],
    },
    founded: {
      type: Date,
    },
    headquarters: {
      type: String,
      required: [true, 'Please add headquarters location'],
    },
    locations: [
      {
        type: String,
      },
    ],
    specialties: [
      {
        type: String,
      },
    ],
    culture: {
      values: [
        {
          type: String,
        },
      ],
      benefits: [
        {
          type: String,
        },
      ],
      workLifeBalance: {
        type: String,
      },
      workEnvironment: {
        type: String,
      },
    },
    socialProfiles: {
      linkedin: {
        type: String,
      },
      twitter: {
        type: String,
      },
      facebook: {
        type: String,
      },
      instagram: {
        type: String,
      },
    },
    team: [
      {
        name: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
        },
      },
    ],
    photos: [
      {
        type: String,
      },
    ],
    videos: [
      {
        type: String,
      },
    ],
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        title: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        pros: {
          type: String,
        },
        cons: {
          type: String,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationDocuments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name before saving
CompanySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Create indexes for search
CompanySchema.index({ name: 'text', description: 'text', industry: 'text', specialties: 'text' });

// Create index for slug
CompanySchema.index({ slug: 1 });

// Virtual for jobs
CompanySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  justOne: false,
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);