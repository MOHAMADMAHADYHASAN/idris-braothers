import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { inventoryService } from './inventory.service';

export class InventoryController {
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await inventoryService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', product);
  });

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { search, category, lowStockOnly, page, limit } = req.query;
    const result = await inventoryService.getProducts({
      search: search as string,
      category: category as string,
      lowStockOnly: lowStockOnly === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Products retrieved successfully', result);
  });

  getProductByBarcode = asyncHandler(async (req: Request, res: Response) => {
    const barcode = String(req.params.barcode);
    const product = await inventoryService.getProductByBarcode(barcode);
    sendResponse(res, 200, 'Product retrieved successfully', product);
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const product = await inventoryService.getProductById(id);
    sendResponse(res, 200, 'Product details retrieved successfully', product);
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const product = await inventoryService.updateProduct(id, req.body);
    sendResponse(res, 200, 'Product updated successfully', product);
  });

  updatePrices = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const product = await inventoryService.updateProductPrices(id, req.body);
    sendResponse(res, 200, 'Product rates updated successfully', product);
  });

  addProductUnit = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const unit = await inventoryService.addProductUnit(id, req.body);
    sendResponse(res, 201, 'Custom unit added successfully', unit);
  });

  deleteProductUnit = asyncHandler(async (req: Request, res: Response) => {
    const unitId = String(req.params.unitId);
    const deleted = await inventoryService.deleteProductUnit(unitId);
    sendResponse(res, 200, 'Custom unit deleted successfully', deleted);
  });

  recordWastage = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const wastage = await inventoryService.recordWastage(id, req.body);
    sendResponse(res, 201, 'Stock wastage recorded successfully', wastage);
  });

  getWastages = asyncHandler(async (req: Request, res: Response) => {
    const { productId, page, limit } = req.query;
    const result = await inventoryService.getWastageHistory({
      productId: productId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Wastage records retrieved successfully', result);
  });
}

export const inventoryController = new InventoryController();
