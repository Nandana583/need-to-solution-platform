import mongoose from 'mongoose';

const needSchema = new mongoose.Schema(
  {
    requester: {
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
    needType: {
      type: String,
      enum: ['service', 'resource', 'general'],
      default: 'service',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
    },
    urgency: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    preferredSolutionType: {
      type: String,
      enum: ['ANY', 'COMMERCIAL_FIRST', 'COMMUNITY_FALLBACK_ONLY'],
      default: 'COMMERCIAL_FIRST',
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
        type: [Number],
        default: [0, 0],
      },
    },
    requiredSkill: {
      type: String,
      default: '',
      trim: true,
    },
    requiredService: {
      type: String,
      default: '',
      trim: true,
    },
    preferredTime: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: String,
      default: '',
      trim: true,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'MATCHING',
        'REQUESTED',
        'ACCEPTED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'CREATED',
      index: true,
    },
    matchedProviders: [
      {
        provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        matchScore: Number,
        matchReason: String,
      },
    ],
    matchedResources: [
      {
        resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        matchScore: Number,
        matchReason: String,
      },
    ],
    selectedSolution: {
      solutionType: { type: String, enum: ['PROVIDER_SERVICE', 'COMMUNITY_RESOURCE', 'NONE'], default: 'NONE' },
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      shareRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShareRequest' },
    },
  },
  { timestamps: true }
);

needSchema.index({ location: '2dsphere' });
needSchema.index({ title: 'text', description: 'text' });

export const Need = mongoose.model('Need', needSchema);
