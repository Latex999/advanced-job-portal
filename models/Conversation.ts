import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'direct' | 'group';
  title?: string;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  unreadCount: {
    user: mongoose.Types.ObjectId;
    count: number;
  }[];
  job?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  application?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
    },
    title: {
      type: String,
    },
    lastMessage: {
      content: {
        type: String,
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: {
        type: Date,
      },
    },
    unreadCount: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ job: 1 });
ConversationSchema.index({ application: 1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);