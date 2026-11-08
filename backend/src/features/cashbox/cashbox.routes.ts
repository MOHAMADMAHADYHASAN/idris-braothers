import { Router } from 'express';
import { cashboxController } from './cashbox.controller';

const router = Router();

router.get('/daily-summary', cashboxController.getDailySummary);

export const cashboxRoutes = router;
