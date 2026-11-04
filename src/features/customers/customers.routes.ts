import { Router } from 'express';
import { customerController } from './customers.controller';
import { validateRequest } from '../../common/middlewares/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  recordPaymentSchema,
} from './customers.validation';

const router = Router();

// 1. Add new customer
router.post(
  '/',
  validateRequest(createCustomerSchema),
  customerController.create
);

// 2. Get all customers (sorted by highest due first, with search)
router.get('/', customerController.getAll);

// 3. Get customer profile & transaction history (Khata)
router.get('/:id', customerController.getById);

// 4. Record Due Repayment (Baki Porishod)
router.post(
  '/:id/payments',
  validateRequest(recordPaymentSchema),
  customerController.recordPayment
);

// 5. Update customer profile
router.patch(
  '/:id',
  validateRequest(updateCustomerSchema),
  customerController.update
);

export const customerRoutes = router;
