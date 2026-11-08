import { Prisma, ExpenseCategory } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { expensesRepository } from './expenses.repository';
import { CreateExpenseInput, UpdateExpenseInput } from './expenses.validation';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import { buildDateRangeFilter } from '../../common/utils/dateUtils';

export class ExpensesService {
  /**
   * Record a new daily expense
   */
  async createExpense(data: CreateExpenseInput) {
    return await expensesRepository.create({
      category: data.category,
      amount: new Prisma.Decimal(data.amount),
      description: data.description,
      note: data.note,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
    });
  }

  /**
   * Get list of expenses with filters and pagination
   */
  async getExpenses(query: {
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.DailyExpenseWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    const dateFilter = buildDateRangeFilter(query.startDate, query.endDate);
    if (dateFilter) {
      where.recordedAt = dateFilter;
    }

    const [total, totalAmount, expenses] = await Promise.all([
      expensesRepository.count(where),
      expensesRepository.sumExpenses(where),
      expensesRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
    ]);

    return {
      expenses,
      summary: {
        totalAmount,
      },
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string) {
    const expense = await expensesRepository.findById(id);
    if (!expense) {
      throw new AppError('Expense record not found', 404);
    }
    return expense;
  }

  /**
   * Update expense
   */
  async updateExpense(id: string, data: UpdateExpenseInput) {
    await this.getExpenseById(id);

    return await expensesRepository.update(id, {
      ...(data.category && { category: data.category }),
      ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
      ...(data.description && { description: data.description }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.recordedAt && { recordedAt: new Date(data.recordedAt) }),
    });
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string) {
    await this.getExpenseById(id);
    return await expensesRepository.delete(id);
  }
}

export const expensesService = new ExpensesService();
