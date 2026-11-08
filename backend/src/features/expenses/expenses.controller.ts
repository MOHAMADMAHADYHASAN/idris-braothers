import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendResponse } from '../../common/utils/apiResponse';
import { expensesService } from './expenses.service';

export class ExpensesController {
  createExpense = asyncHandler(async (req: Request, res: Response) => {
    const expense = await expensesService.createExpense(req.body);
    sendResponse(res, 201, 'Expense recorded successfully', expense);
  });

  getExpenses = asyncHandler(async (req: Request, res: Response) => {
    const { category, startDate, endDate, page, limit } = req.query;
    const result = await expensesService.getExpenses({
      category: category as any,
      startDate: startDate as string,
      endDate: endDate as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendResponse(res, 200, 'Expenses retrieved successfully', result);
  });

  getExpenseById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const expense = await expensesService.getExpenseById(id);
    sendResponse(res, 200, 'Expense details retrieved successfully', expense);
  });

  updateExpense = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const expense = await expensesService.updateExpense(id, req.body);
    sendResponse(res, 200, 'Expense updated successfully', expense);
  });

  deleteExpense = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const deleted = await expensesService.deleteExpense(id);
    sendResponse(res, 200, 'Expense deleted successfully', deleted);
  });
}

export const expensesController = new ExpensesController();
