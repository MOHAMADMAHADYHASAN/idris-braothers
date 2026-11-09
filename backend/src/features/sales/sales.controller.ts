import { Request, Response } from 'express';
import { SaleType } from '@prisma/client';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { salesService } from './sales.service';

export class SalesController {
  createSale = asyncHandler(async (req: Request, res: Response) => {
    const sale = await salesService.createSale(req.body);
    sendResponse(res, 201, 'Sale invoice created successfully', sale);
  });

  getSales = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, saleType, invoiceNumber, startDate, endDate, page, limit } = req.query;
    const result = await salesService.getSales({
      customerId: customerId as string,
      saleType: saleType as SaleType | undefined,
      invoiceNumber: invoiceNumber as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Sales invoices retrieved successfully', result);
  });

  getSaleById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const sale = await salesService.getSaleById(id);
    sendResponse(res, 200, 'Sale details retrieved successfully', sale);
  });

  getSaleReceipt = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const receipt = await salesService.getSaleReceipt(id);
    sendResponse(res, 200, 'Sale receipt retrieved successfully', receipt);
  });
}

export const salesController = new SalesController();
