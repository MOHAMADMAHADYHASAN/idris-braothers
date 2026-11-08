import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { inventoryController } from './inventory.controller';
import {
  createProductSchema,
  updateProductSchema,
  updateProductPricesSchema,
  addProductUnitSchema,
  recordWastageSchema,
} from './inventory.validation';

const router = Router();

// Products
router.post('/', validate(createProductSchema), inventoryController.createProduct);
router.get('/', inventoryController.getProducts);
router.get('/barcode/:barcode', inventoryController.getProductByBarcode);
router.get('/wastages', inventoryController.getWastages);
router.get('/:id', inventoryController.getProductById);
router.patch('/:id', validate(updateProductSchema), inventoryController.updateProduct);
router.patch('/:id/prices', validate(updateProductPricesSchema), inventoryController.updatePrices);

// Multi-Unit Conversion
router.post('/:id/units', validate(addProductUnitSchema), inventoryController.addProductUnit);
router.delete('/units/:unitId', inventoryController.deleteProductUnit);

// Stock Wastage / Shrinkage
router.post('/:id/wastage', validate(recordWastageSchema), inventoryController.recordWastage);

export const inventoryRoutes = router;
