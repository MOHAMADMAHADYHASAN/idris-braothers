import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { purchaseService } from './purchases.service';

export class PurchaseController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const purchase = await purchaseService.processPurchase(req.body);
    sendResponse(res, 201, 'Purchase recorded and stock incremented successfully', purchase);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await purchaseService.getPurchases(req.query as any);
    sendResponse(res, 200, 'Purchase history retrieved successfully', result);
  });

  getByIdOrNumber = asyncHandler(async (req: Request, res: Response) => {
    const identifier = req.params.id as string;
    const purchase = await purchaseService.getPurchaseByIdOrNumber(identifier);
    sendResponse(res, 200, 'Purchase chalan details retrieved', purchase);
  });
}

export const purchaseController = new PurchaseController();
