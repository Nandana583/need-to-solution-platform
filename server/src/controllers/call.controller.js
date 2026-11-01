import { CallAttempt } from '../models/CallAttempt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

/**
 * POST /api/v1/calls
 * Log a call attempt. The platform does not initiate calls —
 * this endpoint records calls that happened via phone/external means.
 */
export const logCall = asyncHandler(async (req, res) => {
  const { calleeId, bookingId, shareRequestId, outcome, durationSeconds, notes } = req.body;

  if (!calleeId) throw new AppError('calleeId is required', 400, 'MISSING_FIELD');
  if (calleeId === req.user._id.toString()) {
    throw new AppError('You cannot log a call to yourself', 400, 'INVALID_CALLEE');
  }

  const validOutcomes = ['ATTEMPTED', 'ANSWERED', 'NO_ANSWER', 'DECLINED', 'COMPLETED'];
  const callOutcome = outcome && validOutcomes.includes(outcome) ? outcome : 'ATTEMPTED';

  const call = await CallAttempt.create({
    caller: req.user._id,
    callee: calleeId,
    bookingId: bookingId || null,
    shareRequestId: shareRequestId || null,
    outcome: callOutcome,
    durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
    notes: (notes || '').slice(0, 500),
  });

  return sendSuccess(res, 201, 'Call logged successfully', { call });
});

/**
 * GET /api/v1/calls
 * Get call history for a specific booking (caller or callee).
 */
export const getCallHistory = asyncHandler(async (req, res) => {
  const { bookingId, shareRequestId } = req.query;

  if (!bookingId && !shareRequestId) {
    throw new AppError('bookingId or shareRequestId is required', 400, 'MISSING_FILTER');
  }

  const query = {
    $or: [{ caller: req.user._id }, { callee: req.user._id }],
  };

  if (bookingId) query.bookingId = bookingId;
  if (shareRequestId) query.shareRequestId = shareRequestId;

  const calls = await CallAttempt.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('caller', 'name profileImage')
    .populate('callee', 'name profileImage');

  return sendSuccess(res, 200, 'Call history retrieved', { calls });
});

/**
 * PUT /api/v1/calls/:id
 * Update call outcome (e.g., after a call was answered).
 * Only the caller can update their own call log.
 */
export const updateCall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { outcome, durationSeconds, notes } = req.body;

  const validOutcomes = ['ATTEMPTED', 'ANSWERED', 'NO_ANSWER', 'DECLINED', 'COMPLETED'];
  if (outcome && !validOutcomes.includes(outcome)) {
    throw new AppError(`outcome must be one of: ${validOutcomes.join(', ')}`, 400, 'INVALID_OUTCOME');
  }

  const call = await CallAttempt.findOneAndUpdate(
    { _id: id, caller: req.user._id },
    {
      ...(outcome ? { outcome } : {}),
      ...(durationSeconds !== undefined ? { durationSeconds: parseInt(durationSeconds, 10) } : {}),
      ...(notes !== undefined ? { notes: notes.slice(0, 500) } : {}),
    },
    { new: true }
  );

  if (!call) throw new AppError('Call record not found or not authorized', 404, 'NOT_FOUND');

  return sendSuccess(res, 200, 'Call updated', { call });
});
