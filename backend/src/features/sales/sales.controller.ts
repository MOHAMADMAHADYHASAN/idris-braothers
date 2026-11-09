import { Request, Response } from 'express';
import { SaleType } from '@prisma/client';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { salesService } from './sales.service';

export class SalesController {
  createSale = asyncHandler(async (req: Request, res: Response) => {
    const result = await salesService.createSale(req.body);
    const responsePayload = {
      ...result.sale,
      sale: result.sale,
      customerDue: result.customerDue,
    };
    sendResponse(res, 201, 'Sale invoice created successfully', responsePayload);
  });

  getSales = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, saleType, invoiceNumber, filter, startDate, endDate, page, limit } = req.query;
    const result = await salesService.getSales({
      customerId: customerId as string,
      saleType: saleType as SaleType | undefined,
      invoiceNumber: invoiceNumber as string,
      filter: filter as string,
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

  cancelSale = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { reason } = req.body || {};
    const result = await salesService.cancelSale(id, reason);
    sendResponse(res, 200, 'Sale invoice cancelled successfully and inventory restored', result);
  });

  returnSaleItems = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { items, refundMethod, reason } = req.body || {};
    const result = await salesService.returnSaleItems({
      saleId: id,
      items: items || [],
      refundMethod: refundMethod || 'CASH',
      reason,
    });
    sendResponse(res, 200, 'Sale items returned successfully and inventory restocked', result);
  });
}

export const salesController = new SalesController();
