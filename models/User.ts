import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface IExperience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface ISkill {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ISocialProfile {
  platform: 'LinkedIn' | 'GitHub' | 'Twitter' | 'Portfolio' | 'Other';
  url: string;
}

export interface INotificationPreference {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  messages: boolean;
  marketing: boolean;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'jobseeker' | 'employer' | 'admin';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  title?: string;
  skills?: ISkill[];
  experience?: IExperience[];
  education?: IEducation[];
  resume?: string;
  socialProfiles?: ISocialProfile[];
  savedJobs?: mongoose.Types.ObjectId[];
  appliedJobs?: mongoose.Types.ObjectId[];
  postedJobs?: mongoose.Types.ObjectId[];
  notificationPreferences: INotificationPreference;
  isVerified: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  // Add any static methods here
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please add a valid email',
      ],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker',
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    title: {
      type: String,
    },
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
        location: {
          type: String,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    education: [
      {
        institution: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        fieldOfStudy: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    resume: {
      type: String,
    },
    socialProfiles: [
      {
        platform: {
          type: String,
          enum: ['LinkedIn', 'GitHub', 'Twitter', 'Portfolio', 'Other'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    savedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    appliedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    postedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    notificationPreferences: {
      jobAlerts: {
        type: Boolean,
        default: true,
      },
      applicationUpdates: {
        type: Boolean,
        default: true,
      },
      messages: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Using function to avoid error: "Cannot overwrite model once compiled"
export default mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema);