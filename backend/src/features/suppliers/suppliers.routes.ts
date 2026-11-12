import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { supplierController } from './suppliers.controller';
import {
  parseCreateSupplier,
  parseUpdateSupplier,
  parsePaySupplier,
  parseAdjustSupplierBalance,
} from './suppliers.validation';

const router = Router();

router.post('/', validate(parseCreateSupplier), supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.patch('/:id', validate(parseUpdateSupplier), supplierController.updateSupplier);
router.post('/:id/payments', validate(parsePaySupplier), supplierController.paySupplier);
router.post('/:id/adjustments', validate(parseAdjustSupplierBalance), supplierController.adjustBalance);
router.get('/:id/ledger', supplierController.getSupplierLedger);

export const supplierRoutes = router;
