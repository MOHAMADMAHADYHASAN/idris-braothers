import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { cashboxService } from './cashbox.service';

export class CashboxController {
  getDailySummary = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;
    const summary = await cashboxService.getDailySummary(date as string);
    sendResponse(res, 200, 'Daily cashbox summary calculated successfully', summary);
  });
}

export const cashboxController = new CashboxController();
