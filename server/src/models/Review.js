import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
    },
    shareRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShareRequest',
      required: false,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewer: 1, booking: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewer: 1, shareRequest: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model('Review', reviewSchema);
