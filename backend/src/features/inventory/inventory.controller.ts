import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { inventoryService } from './inventory.service';

export class InventoryController {
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await inventoryService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', product);
  });

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { search, categoryId, brandId, lowStockOnly, page, limit } = req.query;
    const result = await inventoryService.getProducts({
      search: search as string,
      categoryId: categoryId as string,
      brandId: brandId as string,
      lowStockOnly: lowStockOnly === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Products retrieved successfully', result);
  });

  getProductByBarcode = asyncHandler(async (req: Request, res: Response) => {
    const barcode = String(req.params.barcode);
    const result = await inventoryService.getProductByBarcode(barcode);
    sendResponse(res, 200, 'Product retrieved successfully', result);
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const product = await inventoryService.getProductById(id);
    sendResponse(res, 200, 'Product details retrieved successfully', product);
  });

  getVariantById = asyncHandler(async (req: Request, res: Response) => {
    const variantId = String(req.params.variantId);
    const variant = await inventoryService.getVariantById(variantId);
    sendResponse(res, 200, 'Variant details retrieved successfully', variant);
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const product = await inventoryService.updateProduct(id, req.body);
    sendResponse(res, 200, 'Product updated successfully', product);
  });

  updateVariant = asyncHandler(async (req: Request, res: Response) => {
    const variantId = String(req.params.variantId);
    const variant = await inventoryService.updateVariant(variantId, req.body);
    sendResponse(res, 200, 'Variant updated successfully', variant);
  });

  deleteVariant = asyncHandler(async (req: Request, res: Response) => {
    const variantId = String(req.params.variantId);
    const result = await inventoryService.deleteVariant(variantId);
    sendResponse(res, 200, 'Variant removed or deactivated successfully', result);
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
    const { variantId, productId, page, limit } = req.query;
    const result = await inventoryService.getWastageHistory({
      variantId: variantId as string,
      productId: productId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Wastage records retrieved successfully', result);
  });

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { children: true },
    });
    sendResponse(res, 200, 'Categories retrieved successfully', categories);
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, banglaName, parentId, presetConfig } = req.body;
    const cleanSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSlug = `${cleanSlug || 'category'}-${Date.now().toString().slice(-4)}`;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        banglaName: banglaName?.trim() || null,
        slug: uniqueSlug,
        parentId: parentId || null,
        presetConfig: (presetConfig && typeof presetConfig === 'object') ? presetConfig : {},
      },
    });
    sendResponse(res, 201, 'Category created successfully', category);
  });

  getBrands = asyncHandler(async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    sendResponse(res, 200, 'Brands retrieved successfully', brands);
  });

  createBrand = asyncHandler(async (req: Request, res: Response) => {
    const { name, banglaName } = req.body;
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        banglaName: banglaName?.trim() || null,
      },
    });
    sendResponse(res, 201, 'Brand created successfully', brand);
  });
}

export const inventoryController = new InventoryController();
