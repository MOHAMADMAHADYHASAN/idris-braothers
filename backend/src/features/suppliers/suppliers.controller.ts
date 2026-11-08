import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { supplierService } from './suppliers.service';

export class SupplierController {
  createSupplier = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.createSupplier(req.body);
    sendResponse(res, 201, 'Supplier created successfully', supplier);
  });

  getSuppliers = asyncHandler(async (req: Request, res: Response) => {
    const { search, payableFilter, page, limit } = req.query;
    const result = await supplierService.getSuppliers({
      search: search as string,
      payableFilter: payableFilter as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Suppliers retrieved successfully', result);
  });

  getSupplierById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const supplier = await supplierService.getSupplierById(id);
    sendResponse(res, 200, 'Supplier details retrieved successfully', supplier);
  });

  updateSupplier = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const supplier = await supplierService.updateSupplier(id, req.body);
    sendResponse(res, 200, 'Supplier updated successfully', supplier);
  });

  paySupplier = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await supplierService.paySupplier(id, req.body);
    sendResponse(res, 200, 'Payment to supplier recorded successfully', result);
  });

  adjustBalance = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await supplierService.adjustBalance(id, req.body);
    sendResponse(res, 200, 'Supplier balance adjusted successfully', result);
  });

  getSupplierLedger = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { page, limit } = req.query;
    const result = await supplierService.getSupplierLedger(id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Supplier ledger statements retrieved successfully', result);
  });
}

export const supplierController = new SupplierController();
