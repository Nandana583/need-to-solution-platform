import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
      index: true,
    },
    shareRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShareRequest',
      required: false,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ['TEXT', 'SUGGESTION_ACTION', 'STATUS_UPDATE'],
      default: 'TEXT',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ booking: 1, createdAt: 1 });
messageSchema.index({ shareRequest: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
