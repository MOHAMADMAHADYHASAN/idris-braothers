import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { salesService } from './sales.service';

export class SalesController {
  checkout = asyncHandler(async (req: Request, res: Response) => {
    const sale = await salesService.processSale(req.body);
    sendResponse(res, 201, 'Sale completed and invoice generated successfully', sale);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await salesService.getSales(req.query as any);
    sendResponse(res, 200, 'Sales records retrieved successfully', result);
  });

  getByIdOrInvoice = asyncHandler(async (req: Request, res: Response) => {
    const identifier = req.params.id as string;
    const sale = await salesService.getSaleByIdOrInvoice(identifier);
    sendResponse(res, 200, 'Invoice details retrieved successfully', sale);
  });
}

export const salesController = new SalesController();
