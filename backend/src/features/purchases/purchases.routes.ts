import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { purchasesController } from './purchases.controller';
import { parseCreatePurchase } from './purchases.validation';

const router = Router();

router.post('/', validate(parseCreatePurchase), purchasesController.createPurchase);
router.get('/', purchasesController.getPurchases);
router.get('/:id', purchasesController.getPurchaseById);

export const purchaseRoutes = router;
