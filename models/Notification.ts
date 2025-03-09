import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 
    | 'application_status' 
    | 'new_application' 
    | 'interview_invitation' 
    | 'job_match' 
    | 'message' 
    | 'company_follow' 
    | 'profile_view' 
    | 'reminder'
    | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'application_status',
        'new_application',
        'interview_invitation',
        'job_match',
        'message',
        'company_follow',
        'profile_view',
        'reminder',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);