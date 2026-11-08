import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { salesController } from './sales.controller';
import { createSaleSchema } from './sales.validation';

const router = Router();

router.post('/', validate(createSaleSchema), salesController.createSale);
router.get('/', salesController.getSales);
router.get('/:id', salesController.getSaleById);
router.get('/:id/receipt', salesController.getSaleReceipt);

export const salesRoutes = router;
