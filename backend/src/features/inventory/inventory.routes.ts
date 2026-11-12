import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { inventoryController } from './inventory.controller';
import {
  parseCreateProduct,
  parseUpdateProduct,
  parseUpdateVariant,
  parseUpdateVariantPrices,
  parseAddProductUnit,
  parseRecordWastage,
  parseCreateCategory,
  parseCreateBrand,
} from './inventory.validation';

const router = Router();

// Products
router.post('/', validate(parseCreateProduct), inventoryController.createProduct);
router.get('/', inventoryController.getProducts);

// Fast-Create & Get Categories and Brands
router.get('/categories', inventoryController.getCategories);
router.post('/categories', validate(parseCreateCategory), inventoryController.createCategory);
router.get('/brands', inventoryController.getBrands);
router.post('/brands', validate(parseCreateBrand), inventoryController.createBrand);

// Barcode & Wastage
router.get('/barcode/:barcode', inventoryController.getProductByBarcode);
router.get('/wastages', inventoryController.getWastages);

// Variants
router.get('/variant/:variantId', inventoryController.getVariantById);
router.patch('/variant/:variantId', validate(parseUpdateVariant), inventoryController.updateVariant);
router.delete('/variant/:variantId', inventoryController.deleteVariant);

// Product Detail & Updates
router.get('/:id', inventoryController.getProductById);
router.patch('/:id', validate(parseUpdateProduct), inventoryController.updateProduct);
router.patch('/:id/prices', validate(parseUpdateVariantPrices), inventoryController.updatePrices);

// Multi-Unit Conversion
router.post('/:id/units', validate(parseAddProductUnit), inventoryController.addProductUnit);
router.delete('/units/:unitId', inventoryController.deleteProductUnit);

// Stock Wastage / Shrinkage
router.post('/:id/wastage', validate(parseRecordWastage), inventoryController.recordWastage);

export const inventoryRoutes = router;
