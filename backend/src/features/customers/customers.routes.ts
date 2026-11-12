import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { customerController } from './customers.controller';
import {
  parseCreateCustomer,
  parseUpdateCustomer,
  parseReceivePayment,
  parseAdjustBalance,
} from './customers.validation';

const router = Router();

router.post('/', validate(parseCreateCustomer), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', validate(parseUpdateCustomer), customerController.updateCustomer);
router.post('/:id/payments', validate(parseReceivePayment), customerController.receivePayment);
router.post('/:id/adjustments', validate(parseAdjustBalance), customerController.adjustBalance);
router.get('/:id/ledger', customerController.getCustomerLedger);

export const customerRoutes = router;
