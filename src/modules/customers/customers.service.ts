import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  RecordPaymentInput,
} from './customers.validation';

export class CustomerService {
  /**
   * Add a new customer
   */
  async createCustomer(data: CreateCustomerInput) {
    const existing = await prisma.customer.findUnique({
      where: { phone: data.phone },
    });

    if (existing) {
      throw new AppError(`Customer with phone number ${data.phone} already exists`, 409);
    }

    return await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  /**
   * Get all customers (Shows highest due on top)
   */
  async getCustomers(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { currentDue: 'desc' }, // Shopkeeper sees highest debtors first
      }),
    ]);

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get customer details along with recent transaction history (Baki Khata)
   */
  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        ledger: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        sales: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            paidAmount: true,
            dueAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  /**
   * Record Due Repayment (Baki Porishod)
   * Deducts from currentDue and writes a CREDIT ledger entry atomically
   */
  async recordPayment(customerId: string, data: RecordPaymentInput) {
    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new AppError('Customer profile not found', 404);
      }

      const paymentAmount = new Prisma.Decimal(data.amount);
      const newTotalDue = customer.currentDue.sub(paymentAmount);

      // Update customer running due
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          currentDue: newTotalDue,
        },
      });

      // Add Credit entry into ledger
      const ledgerEntry = await tx.customerLedger.create({
        data: {
          customerId,
          type: 'CREDIT',
          amount: paymentAmount,
          balanceAfter: newTotalDue,
          note: data.note || 'Baki porishod (Payment received)',
          paymentMethod: data.paymentMethod,
        },
      });

      return {
        customer: updatedCustomer,
        payment: ledgerEntry,
      };
    });
  }

  /**
   * Update customer profile
   */
  async updateCustomer(id: string, data: UpdateCustomerInput) {
    await this.getCustomerById(id);

    return await prisma.customer.update({
      where: { id },
      data,
    });
  }
}

export const customerService = new CustomerService();
