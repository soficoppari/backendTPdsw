import { Router } from 'express';
import { createCheckoutSession, confirmPayment } from './payment.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

const router = Router();

router.post(
  '/create-checkout-session',
  authenticateToken,
  authorizeRoles('usuario'),
  createCheckoutSession
);
router.post(
  '/confirm-payment',
  authenticateToken,
  authorizeRoles('usuario'),
  confirmPayment
);

export { router as paymentRouter };
