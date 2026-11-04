import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { supplierService } from './suppliers.service';

export class SupplierController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.createSupplier(req.body);
    sendResponse(res, 201, 'Supplier profile created successfully', supplier);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = req.query;
    const result = await supplierService.getSuppliers({
      search: typeof search === 'string' ? search : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Supplier directory retrieved successfully', result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const supplier = await supplierService.getSupplierById(id);
    sendResponse(res, 200, 'Supplier profile retrieved', supplier);
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await supplierService.recordPayment(id, req.body);
    sendResponse(res, 200, 'Payment recorded and payable balance updated', result);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updated = await supplierService.updateSupplier(id, req.body);
    sendResponse(res, 200, 'Supplier details updated successfully', updated);
  });
}

export const supplierController = new SupplierController();
