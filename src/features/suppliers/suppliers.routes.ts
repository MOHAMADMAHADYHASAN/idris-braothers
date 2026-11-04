import { Router } from 'express';
import { supplierController } from './suppliers.controller';
import { validateRequest } from '../../common/middlewares/validate';
import {
  createSupplierSchema,
  updateSupplierSchema,
  recordSupplierPaymentSchema,
} from './suppliers.validation';

const router = Router();

// 1. Add supplier
router.post(
  '/',
  validateRequest(createSupplierSchema),
  supplierController.create
);

// 2. Get suppliers (sorted by highest debt)
router.get('/', supplierController.getAll);

// 3. Get supplier details & ledger
router.get('/:id', supplierController.getById);

// 4. Pay money to supplier (মহাজন দেনা পরিশোধ)
router.post(
  '/:id/payments',
  validateRequest(recordSupplierPaymentSchema),
  supplierController.recordPayment
);

// 5. Update supplier
router.patch(
  '/:id',
  validateRequest(updateSupplierSchema),
  supplierController.update
);

export const supplierRoutes = router;
