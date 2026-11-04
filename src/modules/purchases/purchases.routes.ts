import { Router } from 'express';
import { purchaseController } from './purchases.controller';
import { validateRequest } from '../../common/middlewares/validate';
import {
  createPurchaseSchema,
  getPurchasesQuerySchema,
} from './purchases.validation';

const router = Router();

// 1. Record stock-in purchase (Atomic $transaction)
router.post(
  '/',
  validateRequest(createPurchaseSchema),
  purchaseController.create
);

// 2. Get purchase history
router.get(
  '/',
  validateRequest(getPurchasesQuerySchema),
  purchaseController.getAll
);

// 3. Get specific purchase chalan
router.get('/:id', purchaseController.getByIdOrNumber);

export const purchaseRoutes = router;
