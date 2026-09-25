import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    owner: {
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
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
      maxlength: 2000,
    },
    resourceType: {
      type: String,
      enum: ['book', 'study_material', 'notes', 'equipment', 'tool', 'device', 'other'],
      default: 'book',
      index: true,
    },
    condition: {
      type: String,
      enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
      default: 'GOOD',
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'SHARED', 'RESERVED', 'UNAVAILABLE'],
      default: 'AVAILABLE',
      index: true,
    },
    shareType: {
      type: String,
      enum: ['LEND', 'GIVEAWAY', 'PHOTOCOPY_SHARE', 'DIGITAL_SHARE', 'HELP'],
      default: 'LEND',
    },
    metadata: {
      author: { type: String, default: '', trim: true },
      subject: { type: String, default: '', trim: true },
      edition: { type: String, default: '', trim: true },
      pagesCount: { type: Number, default: 0 },
      itemModel: { type: String, default: '', trim: true },
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

resourceSchema.index({ location: '2dsphere' });
resourceSchema.index({
  title: 'text',
  description: 'text',
  'metadata.author': 'text',
  'metadata.subject': 'text',
});

export const Resource = mongoose.model('Resource', resourceSchema);
