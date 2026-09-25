import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: 2000,
    },
    serviceType: {
      type: String,
      enum: ['ON_SITE', 'REMOTE', 'BOTH'],
      default: 'ON_SITE',
    },
    rateType: {
      type: String,
      enum: ['FIXED', 'HOURLY', 'CUSTOM', 'FREE_COMMUNITY'],
      default: 'FIXED',
    },
    rateAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    availability: {
      type: String,
      default: 'Standard Working Hours',
    },
    locationLabel: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ title: 'text', description: 'text' });

export const Service = mongoose.model('Service', serviceSchema);
