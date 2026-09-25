import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Need',
      required: false,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date/time is required'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    locationLabel: {
      type: String,
      default: '',
      trim: true,
    },
    agreedPrice: {
      type: Number,
      default: 0,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
