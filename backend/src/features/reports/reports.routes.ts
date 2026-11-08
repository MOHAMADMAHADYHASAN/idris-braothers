import { Router } from 'express';
import { reportsController } from './reports.controller';

const router = Router();

router.get('/profit-loss', reportsController.getProfitLoss);
router.get('/inventory-valuation', reportsController.getInventoryValuation);
router.get('/dues-summary', reportsController.getDuesSummary);
router.get('/top-selling', reportsController.getTopSellingProducts);

export const reportsRoutes = router;
