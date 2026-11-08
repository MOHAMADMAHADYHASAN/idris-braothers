import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { customerService } from './customers.service';

export class CustomerController {
  createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.createCustomer(req.body);
    sendResponse(res, 201, 'Customer created successfully', customer);
  });

  getCustomers = asyncHandler(async (req: Request, res: Response) => {
    const { search, customerType, dueFilter, page, limit } = req.query;
    const result = await customerService.getCustomers({
      search: search as string,
      customerType: customerType as string,
      dueFilter: dueFilter as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Customers retrieved successfully', result);
  });

  getCustomerById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const customer = await customerService.getCustomerById(id);
    sendResponse(res, 200, 'Customer details retrieved successfully', customer);
  });

  updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const customer = await customerService.updateCustomer(id, req.body);
    sendResponse(res, 200, 'Customer updated successfully', customer);
  });

  receivePayment = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await customerService.receivePayment(id, req.body);
    sendResponse(res, 200, 'Customer payment received and ledger updated', result);
  });

  adjustBalance = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await customerService.adjustBalance(id, req.body);
    sendResponse(res, 200, 'Customer balance adjusted successfully', result);
  });

  getCustomerLedger = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { page, limit } = req.query;
    const result = await customerService.getCustomerLedger(id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Customer ledger statements retrieved successfully', result);
  });
}

export const customerController = new CustomerController();
