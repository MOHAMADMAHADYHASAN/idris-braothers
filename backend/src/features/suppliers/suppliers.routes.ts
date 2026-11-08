import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { supplierController } from './suppliers.controller';
import {
  createSupplierSchema,
  updateSupplierSchema,
  paySupplierSchema,
  adjustSupplierBalanceSchema,
} from './suppliers.validation';

const router = Router();

router.post('/', validate(createSupplierSchema), supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.patch('/:id', validate(updateSupplierSchema), supplierController.updateSupplier);
router.post('/:id/payments', validate(paySupplierSchema), supplierController.paySupplier);
router.post('/:id/adjustments', validate(adjustSupplierBalanceSchema), supplierController.adjustBalance);
router.get('/:id/ledger', supplierController.getSupplierLedger);

export const supplierRoutes = router;
