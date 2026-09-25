import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
      max: 60,
    },
    serviceArea: {
      type: String,
      default: '',
      trim: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE_NOW', 'BUSY', 'UNAVAILABLE', 'WEEKENDS_ONLY'],
      default: 'AVAILABLE_NOW',
    },
    workingHours: {
      type: String,
      default: '9:00 AM - 6:00 PM',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedBookingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
