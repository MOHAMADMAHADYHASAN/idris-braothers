import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { inventoryController } from './inventory.controller';
import {
  createProductSchema,
  updateProductSchema,
  updateVariantSchema,
  updateVariantPricesSchema,
  addProductUnitSchema,
  recordWastageSchema,
  createCategorySchema,
  createBrandSchema,
} from './inventory.validation';

const router = Router();

// Products
router.post('/', validate(createProductSchema), inventoryController.createProduct);
router.get('/', inventoryController.getProducts);

// Fast-Create & Get Categories and Brands
router.get('/categories', inventoryController.getCategories);
router.post('/categories', validate(createCategorySchema), inventoryController.createCategory);
router.get('/brands', inventoryController.getBrands);
router.post('/brands', validate(createBrandSchema), inventoryController.createBrand);

// Barcode & Wastage
router.get('/barcode/:barcode', inventoryController.getProductByBarcode);
router.get('/wastages', inventoryController.getWastages);

// Variants
router.get('/variant/:variantId', inventoryController.getVariantById);
router.patch('/variant/:variantId', validate(updateVariantSchema), inventoryController.updateVariant);
router.delete('/variant/:variantId', inventoryController.deleteVariant);

// Product Detail & Updates
router.get('/:id', inventoryController.getProductById);
router.patch('/:id', validate(updateProductSchema), inventoryController.updateProduct);
router.patch('/:id/prices', validate(updateVariantPricesSchema), inventoryController.updatePrices);

// Multi-Unit Conversion
router.post('/:id/units', validate(addProductUnitSchema), inventoryController.addProductUnit);
router.delete('/units/:unitId', inventoryController.deleteProductUnit);

// Stock Wastage / Shrinkage
router.post('/:id/wastage', validate(recordWastageSchema), inventoryController.recordWastage);

export const inventoryRoutes = router;
