import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { purchasesController } from './purchases.controller';
import { createPurchaseSchema } from './purchases.validation';

const router = Router();

router.post('/', validate(createPurchaseSchema), purchasesController.createPurchase);
router.get('/', purchasesController.getPurchases);
router.get('/:id', purchasesController.getPurchaseById);

export const purchaseRoutes = router;
