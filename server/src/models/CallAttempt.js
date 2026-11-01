import mongoose from 'mongoose';

/**
 * CallAttempt — records attempted and confirmed phone/video calls between users.
 * This is an honest-tracking model: no actual call is made through the platform.
 * Users confirm or log calls that happened outside the platform.
 */
const callAttemptSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    callee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Optional context references
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    shareRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShareRequest',
      default: null,
    },
    // Call outcome as reported by the caller
    outcome: {
      type: String,
      enum: ['ATTEMPTED', 'ANSWERED', 'NO_ANSWER', 'DECLINED', 'COMPLETED'],
      default: 'ATTEMPTED',
    },
    // Duration in seconds if the call was completed (user-reported)
    durationSeconds: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const CallAttempt = mongoose.model('CallAttempt', callAttemptSchema);
