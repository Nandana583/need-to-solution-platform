import { AbuseReport } from '../models/AbuseReport.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

/**
 * POST /api/v1/abuse/report
 * File a report/block against another user.
 * Reporter cannot report themselves.
 * Duplicate reports (same reporter + reportedUser + booking) are rejected.
 */
export const fileReport = asyncHandler(async (req, res) => {
  const { reportedUserId, reason, details, bookingId, shareRequestId, isBlock } = req.body;

  if (!reportedUserId) {
    throw new AppError('reportedUserId is required', 400, 'MISSING_FIELD');
  }

  if (reportedUserId === req.user._id.toString()) {
    throw new AppError('You cannot report yourself', 400, 'SELF_REPORT');
  }

  const validReasons = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'FRAUD', 'OTHER'];
  if (!reason || !validReasons.includes(reason)) {
    throw new AppError(`Reason must be one of: ${validReasons.join(', ')}`, 400, 'INVALID_REASON');
  }

  const reportedUser = await User.findById(reportedUserId).select('_id name');
  if (!reportedUser) {
    throw new AppError('Reported user not found', 404, 'USER_NOT_FOUND');
  }

  const report = await AbuseReport.create({
    reporter: req.user._id,
    reportedUser: reportedUserId,
    reason,
    details: (details || '').slice(0, 1000),
    bookingId: bookingId || null,
    shareRequestId: shareRequestId || null,
    isBlock: Boolean(isBlock),
  });

  return sendSuccess(res, 201, isBlock ? 'User blocked and report filed' : 'Report filed successfully', {
    reportId: report._id,
    isBlock: report.isBlock,
  });
});

/**
 * GET /api/v1/abuse/blocks
 * Get the list of users the current user has blocked.
 */
export const getMyBlocks = asyncHandler(async (req, res) => {
  const blocks = await AbuseReport.find({
    reporter: req.user._id,
    isBlock: true,
  })
    .sort({ createdAt: -1 })
    .populate('reportedUser', 'name email profileImage');

  const blockedUsers = blocks.map((b) => ({
    userId: b.reportedUser?._id,
    name: b.reportedUser?.name,
    blockedAt: b.createdAt,
    reportId: b._id,
  }));

  return sendSuccess(res, 200, 'Blocked users retrieved', { blocks: blockedUsers });
});

/**
 * DELETE /api/v1/abuse/blocks/:userId
 * Unblock a user (remove the block flag from the report).
 */
export const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const updated = await AbuseReport.findOneAndUpdate(
    { reporter: req.user._id, reportedUser: userId, isBlock: true },
    { isBlock: false },
    { new: true }
  );

  if (!updated) {
    throw new AppError('Block not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, 200, 'User unblocked successfully');
});

/**
 * GET /api/v1/abuse/admin (admin only)
 * Get all pending reports for admin review.
 */
export const getAdminReports = asyncHandler(async (req, res) => {
  const { status = 'PENDING', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reports = await AbuseReport.find({ status })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email');

  const total = await AbuseReport.countDocuments({ status });

  return sendSuccess(res, 200, 'Reports retrieved', {
    reports,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

/**
 * PUT /api/v1/abuse/admin/:reportId (admin only)
 * Update a report's status and add admin notes.
 */
export const reviewReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, adminNotes } = req.body;

  const validStatuses = ['REVIEWED', 'DISMISSED', 'ACTION_TAKEN'];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError(`status must be one of: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS');
  }

  const report = await AbuseReport.findByIdAndUpdate(
    reportId,
    { status, adminNotes: (adminNotes || '').slice(0, 500) },
    { new: true }
  ).populate('reporter', 'name email').populate('reportedUser', 'name email');

  if (!report) throw new AppError('Report not found', 404, 'NOT_FOUND');

  return sendSuccess(res, 200, 'Report updated', { report });
});
