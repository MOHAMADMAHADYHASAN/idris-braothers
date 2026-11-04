import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { validateRequest } from '../../common/middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
  barcodeQuerySchema,
} from './inventory.validation';

const router = Router();

// 1. Create a product
router.post(
  '/',
  validateRequest(createProductSchema),
  inventoryController.create
);

// 2. Get list of products (search, filter, pagination)
router.get('/', inventoryController.getAll);

// 3. Fast Barcode lookup (Cashier Scanner)
router.get(
  '/barcode/:barcode',
  validateRequest(barcodeQuerySchema),
  inventoryController.getByBarcode
);

// 4. Get product by ID
router.get('/:id', inventoryController.getById);

// 5. Update product
router.patch(
  '/:id',
  validateRequest(updateProductSchema),
  inventoryController.update
);

// 6. Manual Stock Adjustment (Stock-in / Damage)
router.patch(
  '/:id/stock',
  validateRequest(adjustStockSchema),
  inventoryController.adjustStock
);

// 7. Soft Delete (Deactivate)
router.delete('/:id', inventoryController.delete);

export const inventoryRoutes = router;
