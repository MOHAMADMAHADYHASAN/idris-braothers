import { Prisma, Customer, CustomerLedger } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class CustomerRepository extends BaseRepository {

  async create(data: Prisma.CustomerCreateInput, tx?: Prisma.TransactionClient): Promise<Customer> {
    return await this.getDb(tx).customer.create({ data });
  }

  async findByPhone(phone: string, tx?: Prisma.TransactionClient): Promise<Customer | null> {
    return await this.getDb(tx).customer.findUnique({
      where: { phone },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<Customer | null> {
    return await this.getDb(tx).customer.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string) {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        ledger: {
          take: 30,
          orderBy: { createdAt: 'desc' },
        },
        sales: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            saleType: true,
            grandTotal: true,
            paidAmount: true,
            dueAmount: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.CustomerWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
  }): Promise<Customer[]> {
    return await prisma.customer.findMany(params);
  }

  async count(where?: Prisma.CustomerWhereInput): Promise<number> {
    return await prisma.customer.count({ where });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput, tx?: Prisma.TransactionClient): Promise<Customer> {
    return await this.getDb(tx).customer.update({
      where: { id },
      data,
    });
  }

  async updateDue(id: string, dueDelta: Prisma.Decimal, tx?: Prisma.TransactionClient): Promise<Customer> {
    return await this.getDb(tx).customer.update({
      where: { id },
      data: {
        currentDue: { increment: dueDelta },
      },
    });
  }

  async createLedgerEntry(
    data: Prisma.CustomerLedgerCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<CustomerLedger> {
    return await this.getDb(tx).customerLedger.create({ data });
  }

  async findLedgerEntries(params: {
    where: Prisma.CustomerLedgerWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.CustomerLedgerOrderByWithRelationInput;
  }): Promise<CustomerLedger[]> {
    return await prisma.customerLedger.findMany(params);
  }

  async countLedgerEntries(where: Prisma.CustomerLedgerWhereInput): Promise<number> {
    return await prisma.customerLedger.count({ where });
  }
}

export const customerRepository = new CustomerRepository();
