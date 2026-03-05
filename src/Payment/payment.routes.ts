import { Router } from 'express';
import { createCheckoutSession, confirmPayment } from './payment.controller.js';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/confirm-payment', confirmPayment);

export { router as paymentRouter };
