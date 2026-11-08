import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { purchasesService } from './purchases.service';

export class PurchasesController {
  createPurchase = asyncHandler(async (req: Request, res: Response) => {
    const purchase = await purchasesService.createPurchase(req.body);
    sendResponse(res, 201, 'Purchase chalan recorded successfully', purchase);
  });

  getPurchases = asyncHandler(async (req: Request, res: Response) => {
    const { supplierId, purchaseNumber, startDate, endDate, page, limit } = req.query;
    const result = await purchasesService.getPurchases({
      supplierId: supplierId as string,
      purchaseNumber: purchaseNumber as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Purchases retrieved successfully', result);
  });

  getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const purchase = await purchasesService.getPurchaseById(id);
    sendResponse(res, 200, 'Purchase details retrieved successfully', purchase);
  });
}

export const purchasesController = new PurchasesController();
