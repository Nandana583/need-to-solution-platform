import mongoose from 'mongoose';

/**
 * AbuseReport — records a report filed by one user against another.
 * Also used to track blocks (mutual communication blacklist).
 */
const abuseReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'FRAUD', 'OTHER'],
      required: true,
    },
    details: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    // Optional reference to the booking or share request where abuse occurred
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    shareRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShareRequest',
      default: null,
    },
    // Whether the reporter also wants to block this user
    isBlock: {
      type: Boolean,
      default: false,
    },
    // Admin review state
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN'],
      default: 'PENDING',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from filing duplicate reports against the same user in the same booking
abuseReportSchema.index(
  { reporter: 1, reportedUser: 1, bookingId: 1 },
  { unique: true, sparse: true }
);

export const AbuseReport = mongoose.model('AbuseReport', abuseReportSchema);
