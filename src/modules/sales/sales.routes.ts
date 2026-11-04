import { Router } from 'express';
import { salesController } from './sales.controller';
import { validateRequest } from '../../common/middlewares/validate';
import {
  createSaleSchema,
  getSalesQuerySchema,
  getSaleParamsSchema,
} from './sales.validation';

const router = Router();

// 1. Process Sale & Checkout (Secure $transaction)
router.post(
  '/checkout',
  validateRequest(createSaleSchema),
  salesController.checkout
);

// 2. Get Sales History (with filters: date, status, customer)
router.get(
  '/',
  validateRequest(getSalesQuerySchema),
  salesController.getAll
);

// 3. Get Invoice Details by ID or Invoice Number
router.get(
  '/:id',
  validateRequest(getSaleParamsSchema),
  salesController.getByIdOrInvoice
);

export const salesRoutes = router;
