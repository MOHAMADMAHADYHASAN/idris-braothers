import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { inventoryService } from './inventory.service';

export class InventoryController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await inventoryService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', product);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, lowStockOnly, page, limit } = req.query;
    const result = await inventoryService.getProducts({
      search: typeof search === 'string' ? search : undefined,
      lowStockOnly: lowStockOnly === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Products retrieved successfully', result);
  });

  getByBarcode = asyncHandler(async (req: Request, res: Response) => {
    const barcode = req.params.barcode as string;
    const product = await inventoryService.getProductByBarcode(barcode);
    sendResponse(res, 200, 'Product retrieved by barcode', product);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await inventoryService.getProductById(id);
    sendResponse(res, 200, 'Product details retrieved', product);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updated = await inventoryService.updateProduct(id, req.body);
    sendResponse(res, 200, 'Product updated successfully', updated);
  });

  adjustStock = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updated = await inventoryService.adjustStock(id, req.body);
    sendResponse(res, 200, 'Stock adjusted successfully', updated);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await inventoryService.deleteProduct(id);
    sendResponse(res, 200, 'Product deactivated successfully');
  });
}

export const inventoryController = new InventoryController();
