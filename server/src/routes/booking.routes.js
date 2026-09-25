import express from 'express';
import {
  createBooking,
  getRequesterBookings,
  getProviderBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createBooking);
router.get('/my-requests', getRequesterBookings);
router.get('/incoming-provider', getProviderBookings);
router.get('/:id', getBookingById);
router.put('/:id/accept', acceptBooking);
router.put('/:id/reject', rejectBooking);
router.put('/:id/complete', completeBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
