import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { customerController } from './customers.controller';
import {
  createCustomerSchema,
  updateCustomerSchema,
  receivePaymentSchema,
  adjustBalanceSchema,
} from './customers.validation';

const router = Router();

router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', validate(updateCustomerSchema), customerController.updateCustomer);
router.post('/:id/payments', validate(receivePaymentSchema), customerController.receivePayment);
router.post('/:id/adjustments', validate(adjustBalanceSchema), customerController.adjustBalance);
router.get('/:id/ledger', customerController.getCustomerLedger);

export const customerRoutes = router;
