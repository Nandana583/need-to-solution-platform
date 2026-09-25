import mongoose from 'mongoose';

const shareRequestSchema = new mongoose.Schema(
  {
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Need',
      required: false,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: ['BORROW', 'PHOTOCOPY_SHARE', 'NOTES_SHARE', 'HELP', 'GIVEAWAY'],
      default: 'BORROW',
    },
    durationDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 180,
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'SHARED',
        'RETURNED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    returnDeadline: {
      type: Date,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ShareRequest = mongoose.model('ShareRequest', shareRequestSchema);
