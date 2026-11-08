import { Prisma, DailyExpense } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class ExpensesRepository extends BaseRepository {

  async create(data: Prisma.DailyExpenseCreateInput, tx?: Prisma.TransactionClient): Promise<DailyExpense> {
    return await this.getDb(tx).dailyExpense.create({ data });
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<DailyExpense | null> {
    return await this.getDb(tx).dailyExpense.findUnique({
      where: { id },
    });
  }

  async findMany(params: {
    where?: Prisma.DailyExpenseWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.DailyExpenseOrderByWithRelationInput;
  }): Promise<DailyExpense[]> {
    return await prisma.dailyExpense.findMany(params);
  }

  async count(where?: Prisma.DailyExpenseWhereInput): Promise<number> {
    return await prisma.dailyExpense.count({ where });
  }

  async update(id: string, data: Prisma.DailyExpenseUpdateInput, tx?: Prisma.TransactionClient): Promise<DailyExpense> {
    return await this.getDb(tx).dailyExpense.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<DailyExpense> {
    return await this.getDb(tx).dailyExpense.delete({
      where: { id },
    });
  }

  async sumExpenses(where?: Prisma.DailyExpenseWhereInput): Promise<Prisma.Decimal> {
    const aggregate = await prisma.dailyExpense.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });
    return aggregate._sum.amount || new Prisma.Decimal(0);
  }
}

export const expensesRepository = new ExpensesRepository();
