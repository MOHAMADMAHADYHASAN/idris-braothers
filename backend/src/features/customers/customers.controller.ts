import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { customerService } from './customers.service';

export class CustomerController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.createCustomer(req.body);
    sendResponse(res, 201, 'Customer registered successfully', customer);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = req.query;
    const result = await customerService.getCustomers({
      search: typeof search === 'string' ? search : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Customer list retrieved successfully', result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const customer = await customerService.getCustomerById(id);
    sendResponse(res, 200, 'Customer profile retrieved', customer);
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await customerService.recordPayment(id, req.body);
    sendResponse(res, 200, 'Payment recorded and due balance updated', result);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updated = await customerService.updateCustomer(id, req.body);
    sendResponse(res, 200, 'Customer profile updated', updated);
  });
}

export const customerController = new CustomerController();
