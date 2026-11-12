import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { salesController } from './sales.controller';
import { parseCreateSale } from './sales.validation';

const router = Router();

router.post('/', validate(parseCreateSale), salesController.createSale);
router.get('/', salesController.getSales);
router.get('/:id', salesController.getSaleById);
router.get('/:id/receipt', salesController.getSaleReceipt);
router.post('/:id/cancel', salesController.cancelSale);
router.post('/:id/return', salesController.returnSaleItems);

export const salesRoutes = router;
