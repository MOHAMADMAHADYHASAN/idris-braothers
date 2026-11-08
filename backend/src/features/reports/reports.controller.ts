import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { reportsService } from './reports.service';

export class ReportsController {
  getProfitLoss = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const report = await reportsService.getProfitLossReport({
      startDate: startDate as string,
      endDate: endDate as string,
    });
    sendResponse(res, 200, 'Profit & Loss statement calculated successfully', report);
  });

  getInventoryValuation = asyncHandler(async (req: Request, res: Response) => {
    const valuation = await reportsService.getInventoryValuation();
    sendResponse(res, 200, 'Current inventory valuation retrieved successfully', valuation);
  });

  getDuesSummary = asyncHandler(async (req: Request, res: Response) => {
    const dues = await reportsService.getDuesSummary();
    sendResponse(res, 200, 'Khata dues and payables summary retrieved successfully', dues);
  });

  getTopSellingProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topProducts = await reportsService.getTopSellingProducts(limit);
    sendResponse(res, 200, 'Top selling products retrieved successfully', topProducts);
  });
}

export const reportsController = new ReportsController();
