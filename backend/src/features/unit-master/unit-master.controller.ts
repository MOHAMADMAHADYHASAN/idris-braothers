import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { unitMasterService } from './unit-master.service';

export class UnitMasterController {
  createUnit = asyncHandler(async (req: Request, res: Response) => {
    const unit = await unitMasterService.createUnit(req.body);
    sendResponse(res, 201, 'Unit created successfully', unit);
  });

  getUnits = asyncHandler(async (req: Request, res: Response) => {
    const { search, category } = req.query;
    const units = await unitMasterService.getUnits({
      search: search as string,
      category: category as string,
    });
    sendResponse(res, 200, 'Units retrieved successfully', units);
  });

  getUnitById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const unit = await unitMasterService.getUnitById(id);
    sendResponse(res, 200, 'Unit details retrieved successfully', unit);
  });

  updateUnit = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const unit = await unitMasterService.updateUnit(id, req.body);
    sendResponse(res, 200, 'Unit updated successfully', unit);
  });

  deleteUnit = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const deleted = await unitMasterService.deleteUnit(id);
    sendResponse(res, 200, 'Unit deleted successfully', deleted);
  });
}

export const unitMasterController = new UnitMasterController();
