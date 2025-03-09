import mongoose, { Schema, Document, Model } from 'mongoose';

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
  foundedYear?: number;
  location: string;
  locations?: string[];
  specialties?: string[];
  benefits?: string[];
  culture?: {
    values?: string[];
    workLifeBalance?: string;
    workEnvironment?: string;
  };
  socialProfiles?: {
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
  rating: {
    average: number;
    count: number;
    distribution?: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
    };
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
    foundedYear: {
      type: Number,
    },
    location: {
      type: String,
      required: [true, 'Please add a primary location'],
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
    benefits: [
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
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        '1': {
          type: Number,
          default: 0,
        },
        '2': {
          type: Number,
          default: 0,
        },
        '3': {
          type: Number,
          default: 0,
        },
        '4': {
          type: Number,
          default: 0,
        },
        '5': {
          type: Number,
          default: 0,
        },
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

// Virtual for reviews
CompanySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'company',
  justOne: false,
  options: { sort: { createdAt: -1 } },
});

// Method to update rating based on reviews
CompanySchema.methods.updateRating = async function () {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { company: this._id, status: 'approved' } },
    { 
      $group: { 
        _id: null, 
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        distribution: {
          $push: '$rating'
        }
      } 
    }
  ]);
  
  if (stats.length > 0) {
    // Calculate distribution
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    stats[0].distribution.forEach((rating: number) => {
      distribution[rating.toString() as keyof typeof distribution]++;
    });
    
    this.rating = {
      average: stats[0].average,
      count: stats[0].count,
      distribution
    };
    
    await this.save();
  }
  
  return this.rating;
};

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);